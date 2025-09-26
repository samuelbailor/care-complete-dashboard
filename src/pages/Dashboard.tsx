import { useState } from "react";
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
import { MemberDetailView } from "@/components/MemberDetailView";
import { TrendsSection } from "@/components/TrendsSection";
import { surveyMembers } from "@/data/surveyMembers";
import { MemberProfile } from "@/utils/csvParser";
import { supabase } from "@/integrations/supabase/client";
import styles from "./Dashboard.module.css";

const { Option } = Select;

export default function Dashboard() {
  const [sortBy, setSortBy] = useState<"risk" | "compliance" | "weightLoss">("risk");
  const [filterRisk, setFilterRisk] = useState<"All" | "High" | "Medium" | "Low">("All");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const [selectedMember, setSelectedMember] = useState<MemberProfile | null>(null);
  const [isDetailViewVisible, setIsDetailViewVisible] = useState(false);

  const sortedMembers = [...surveyMembers]
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

  const handleMemberClick = (member: MemberProfile) => {
    setSelectedMember(member);
    setIsDetailViewVisible(true);
  };

  const handleDetailViewClose = () => {
    setIsDetailViewVisible(false);
    setSelectedMember(null);
  };

  const handleSummarizeCSV = async () => {
    setIsModalVisible(true);
    setIsLoading(true);
    setSummary('');

    try {
      // Read the CSV file content
      const response = await fetch('/src/data/survey-data.csv');
      const csvText = await response.text();

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

  const stats = {
    totalMembers: surveyMembers.length,
    highRisk: surveyMembers.filter(m => m.riskLevel === "High").length,
    avgCompliance: Math.round(surveyMembers.reduce((acc, m) => acc + m.programCompliance, 0) / surveyMembers.length),
    avgWeightLoss: Math.round(surveyMembers.reduce((acc, m) => acc + m.weightChange, 0) / surveyMembers.length * 10) / 10,
  };

  return (
    <div className={styles.dashboard}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div>
            <h1 className={styles.headerTitle}>Care Complete</h1>
            <p className={styles.headerSubtitle}>GLP-1 Weight Management Program</p>
          </div>
          <div className={styles.headerActions}>
            <Button 
              type="primary" 
              icon={<FileTextOutlined />}
              onClick={handleSummarizeCSV}
            >
              Summarize Data
            </Button>
            <Tag color="blue">Dashboard</Tag>
            <Button type="primary" icon={<ExportOutlined />}>
              Export Data
            </Button>
          </div>
        </div>
      </header>

      <div className={styles.mainContent}>
        {/* Trends Section */}
        <TrendsSection />

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
          onMemberClick={handleMemberClick}
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

      {/* Member Detail View */}
      <MemberDetailView
        member={selectedMember}
        visible={isDetailViewVisible}
        onClose={handleDetailViewClose}
      />
    </div>
  );
}