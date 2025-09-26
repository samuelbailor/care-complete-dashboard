import { useState, useEffect } from "react";
import { Card, Select, Button, Tag, Modal, Spin } from "antd";
import { 
  UserOutlined, 
  ThunderboltOutlined, 
  ExclamationCircleOutlined,
  FallOutlined,
  ExportOutlined,
  FileTextOutlined
} from "@ant-design/icons";
import { MembersTable } from "@/components/MembersTable";
import { programData } from "@/data/surveyMembers";
import { MemberProfile } from "@/utils/csvParser";
import { supabase } from "@/integrations/supabase/client";
import styles from "./Dashboard.module.css";

const { Option } = Select;

export default function Dashboard() {
  const [selectedProgram, setSelectedProgram] = useState<keyof typeof programData>("GLP-1 Weight Management Program");
  const [sortBy, setSortBy] = useState<"risk" | "compliance" | "weightLoss">("risk");
  const [filterRisk, setFilterRisk] = useState<"All" | "High" | "Medium" | "Low">("All");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const [riskAssessmentData, setRiskAssessmentData] = useState<{members: Array<{name: string, risk: string, compliance: string}>} | null>(null);
  const [isLoadingRiskData, setIsLoadingRiskData] = useState(false);

  const currentMembers = programData[selectedProgram].members;

  // Merge risk assessment data with current members
  const membersWithRiskData = currentMembers.map(member => {
    const riskData = riskAssessmentData?.members.find(rd => rd.name === member.name);
    const newRiskLevel = riskData ? (riskData.risk.charAt(0).toUpperCase() + riskData.risk.slice(1)) : member.riskLevel;
    // Ensure risk level is valid
    const validatedRiskLevel = (newRiskLevel === "High" || newRiskLevel === "Medium" || newRiskLevel === "Low") 
      ? newRiskLevel as "High" | "Medium" | "Low"
      : member.riskLevel;
    
    return {
      ...member,
      riskLevel: validatedRiskLevel,
      programCompliance: riskData ? parseInt(riskData.compliance.replace('%', '')) : member.programCompliance,
    };
  });

  const sortedMembers = [...membersWithRiskData]
    .filter(member => filterRisk === "All" || member.riskLevel === filterRisk)
    .sort((a, b) => {
      if (sortBy === "risk") {
        const riskOrder = { "High": 3, "Medium": 2, "Low": 1 };
        return riskOrder[b.riskLevel] - riskOrder[a.riskLevel];
      } else if (sortBy === "compliance") {
        return a.programCompliance - b.programCompliance;
      } else {
        return a.weightChange - b.weightChange;
      }
    });


  // Fetch risk assessment data when program changes
  useEffect(() => {
    const fetchRiskAssessment = async () => {
      setIsLoadingRiskData(true);
      try {
        const csvText = programData[selectedProgram].csvData;
        
        const { data, error } = await supabase.functions.invoke('overall-risk-assessment', {
          body: { csvData: csvText }
        });

        if (error) throw error;
        
        setRiskAssessmentData(data);
      } catch (error) {
        console.error('Error fetching risk assessment:', error);
        // Keep using original data if API fails
      } finally {
        setIsLoadingRiskData(false);
      }
    };

    fetchRiskAssessment();
  }, [selectedProgram]);

  const handleSummarizeCSV = async () => {
    setIsModalVisible(true);
    setIsLoading(true);
    setSummary('');

    try {
      // Use the CSV data for the selected program
      const csvText = programData[selectedProgram].csvData;

      // Call the edge function
      const { data, error } = await supabase.functions.invoke('csv-summarizer', {
        body: { csvData: csvText }
      });

      if (error) throw error;

      setSummary(data.summary || 'No summary received');
    } catch (error) {
      console.error('Error calling CSV summarizer:', error);
      setSummary('Error generating summary. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSummary('');
  };

  const handleExportData = () => {
    const csvHeaders = [
      'Name', 'Risk Level', 'Program Compliance (%)', 'Weight Change (lbs)', 
      'BMI', 'Activity (days/week)', 'Total Surveys', 'Last Survey Date', 'Duration'
    ];
    
    const csvData = sortedMembers.map(member => [
      member.name,
      member.riskLevel,
      member.programCompliance,
      member.weightChange,
      member.bmi,
      member.averageActivity,
      member.totalSurveys,
      member.lastSurveyDate,
      member.prescriptionDuration
    ]);
    
    const csvContent = [
      csvHeaders.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `care-complete-members-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const stats = {
    totalMembers: membersWithRiskData.length,
    highRisk: membersWithRiskData.filter(m => m.riskLevel === "High").length,
    avgCompliance: Math.round(membersWithRiskData.reduce((acc, m) => acc + m.programCompliance, 0) / membersWithRiskData.length),
    avgWeightLoss: Math.round(membersWithRiskData.reduce((acc, m) => acc + m.weightChange, 0) / membersWithRiskData.length * 10) / 10,
  };

  return (
    <div className={styles.dashboard}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div>
            <h1 className={styles.headerTitle}>Care Complete</h1>
            <p className={styles.headerSubtitle}>{selectedProgram}</p>
          </div>
          <div className={styles.headerActions}>
            <Select
              value={selectedProgram}
              onChange={(value) => setSelectedProgram(value)}
              style={{ width: 280, marginRight: 16 }}
              placeholder="Select Program"
            >
              <Option value="GLP-1 Weight Management Program">GLP-1 Weight Management Program</Option>
              <Option value="Diabetes Management Program">Diabetes Management Program</Option>
            </Select>
            <Button 
              type="primary" 
              icon={<FileTextOutlined />}
              onClick={handleSummarizeCSV}
            >
              Summarize Data
            </Button>
            <Tag color="blue">Dashboard</Tag>
            <Button 
              type="primary" 
              icon={<ExportOutlined />}
              onClick={handleExportData}
            >
              Export Data
            </Button>
          </div>
        </div>
      </header>

      <div className={styles.mainContent}>
        {/* Diabetes Program Disclaimer */}
        {selectedProgram === "Diabetes Management Program" && (
          <Card className={styles.disclaimerCard} style={{ marginBottom: '24px', backgroundColor: '#fff7e6', borderColor: '#ffec3d' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <ExclamationCircleOutlined style={{ color: '#faad14', fontSize: '18px' }} />
              <div>
                <strong>Note:</strong> The Diabetes Management Program is currently showing weight management data for demonstration purposes. 
                In the full implementation, this program would track diabetes-specific metrics including A1C levels, blood sugar readings, 
                and diabetes medications rather than weight loss data.
              </div>
            </div>
          </Card>
        )}

        {/* Stats Cards */}
        <div className={styles.statsGrid}>
          <Card className={styles.statCard}>
            <div className={styles.statTitle}>
              <UserOutlined />
              Total Members
            </div>
            <div className={styles.statValue}>{stats.totalMembers}</div>
          </Card>

          <Card className={`${styles.statCard} ${styles.highRisk}`}>
            <div className={styles.statTitle}>
              <ExclamationCircleOutlined />
              High Risk Members
            </div>
            <div className={`${styles.statValue} ${styles.error}`}>{stats.highRisk}</div>
          </Card>

          <Card className={`${styles.statCard} ${styles.compliance}`}>
            <div className={styles.statTitle}>
              <ThunderboltOutlined />
              Avg. Compliance
            </div>
            <div className={styles.statValue}>{stats.avgCompliance}%</div>
          </Card>

          <Card className={`${styles.statCard} ${styles.weightLoss}`}>
            <div className={styles.statTitle}>
              <FallOutlined />
              Avg. Weight Loss
            </div>
            <div className={`${styles.statValue} ${styles.success}`}>{stats.avgWeightLoss} lbs</div>
          </Card>
        </div>

        {/* Filters and Controls */}
        <div className={styles.controls}>
          <Select
            value={sortBy}
            onChange={(value) => setSortBy(value)}
            style={{ width: 200 }}
            placeholder="Sort by..."
          >
            <Option value="risk">Sort by Risk Level</Option>
            <Option value="compliance">Sort by Compliance</Option>
            <Option value="weightLoss">Sort by Weight Progress</Option>
          </Select>

          <Select
            value={filterRisk}
            onChange={(value) => setFilterRisk(value)}
            style={{ width: 200 }}
            placeholder="Filter by risk..."
          >
            <Option value="All">All Risk Levels</Option>
            <Option value="High">High Risk Only</Option>
            <Option value="Medium">Medium Risk Only</Option>
            <Option value="Low">Low Risk Only</Option>
          </Select>
        </div>

        {/* Members Table */}
        <MembersTable 
          members={sortedMembers}
          isLoadingRiskData={isLoadingRiskData}
        />
      </div>

      {/* CSV Summary Modal */}
      <Modal
        title="CSV Data Summary"
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={[
          <Button key="close" onClick={handleModalClose}>
            Close
          </Button>
        ]}
        width={700}
      >
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin size="large" />
            <p style={{ marginTop: '16px' }}>Analyzing CSV data...</p>
          </div>
        ) : (
          <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
            {summary}
          </div>
        )}
      </Modal>
    </div>
  );
}