import { useState } from "react";
import { Input, Table, Card, Button, Tag } from "antd";
import { 
  SearchOutlined,
  FallOutlined,
  RiseOutlined,
  CalendarOutlined,
  ThunderboltOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  ExportOutlined
} from "@ant-design/icons";
import { MemberProfile } from "@/utils/csvParser";
import styles from "./MembersTable.module.css";

interface MembersTableProps {
  members: MemberProfile[];
  onMemberClick?: (member: MemberProfile) => void;
}

export function MembersTable({ members, onMemberClick }: MembersTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  
  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRiskTagColor = (risk: string) => {
    switch (risk) {
      case "High": return "red";
      case "Medium": return "orange";
      default: return "green";
    }
  };

  const getWeightChangeIcon = (change: number) => {
    if (change > 0) {
      return <FallOutlined className={styles.iconSuccess} />;
    } else if (change < 0) {
      return <RiseOutlined className={styles.iconError} />;
    }
    return null;
  };

  const getComplianceIcon = (compliance: number) => {
    if (compliance >= 80) {
      return <CheckCircleOutlined className={styles.iconSuccess} />;
    } else if (compliance >= 60) {
      return <ExclamationCircleOutlined className={styles.iconWarning} />;
    }
    return <ExclamationCircleOutlined className={styles.iconError} />;
  };

  const columns = [
    {
      title: 'Member',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: MemberProfile) => (
        <div className={styles.memberInfo}>
          <div className={styles.memberName}>{name}</div>
          <div className={styles.memberDetails}>
            {record.height} • {record.totalSurveys} surveys completed
          </div>
        </div>
      ),
    },
    {
      title: 'Risk Level',
      dataIndex: 'riskLevel',
      key: 'riskLevel',
      render: (risk: string) => (
        <Tag 
          color={getRiskTagColor(risk)}
          className={`${styles.riskBadge} ${
            risk === 'High' ? styles.riskHigh : 
            risk === 'Medium' ? styles.riskMedium : 
            styles.riskLow
          }`}
        >
          {risk}
        </Tag>
      ),
    },
    {
      title: 'Program Compliance',
      dataIndex: 'programCompliance',
      key: 'programCompliance',
      render: (compliance: number, record: MemberProfile) => (
        <div>
          <div className={styles.complianceContainer}>
            {getComplianceIcon(compliance)}
            <span className={styles.complianceValue}>{compliance}%</span>
          </div>
          <div className={styles.medicationInfo}>
            Medication: {record.lastMedicationCompliance}
          </div>
        </div>
      ),
    },
    {
      title: 'Weight Progress',
      dataIndex: 'weightChange',
      key: 'weightChange',
      render: (change: number, record: MemberProfile) => (
        <div>
          <div className={styles.weightContainer}>
            {getWeightChangeIcon(change)}
            <span className={`${styles.weightValue} ${
              change > 0 ? styles.weightSuccess : styles.weightError
            }`}>
              {change > 0 ? `-${change}` : `+${Math.abs(change)}`} lbs
            </span>
          </div>
          <div className={styles.weightDetails}>
            {record.initialWeight} → {record.currentWeight} lbs
          </div>
        </div>
      ),
    },
    {
      title: 'Last Survey',
      dataIndex: 'lastSurveyDate',
      key: 'lastSurveyDate',
      render: (date: string, record: MemberProfile) => (
        <div>
          <div className={styles.dateContainer}>
            <CalendarOutlined className={styles.iconSecondary} />
            <span className={styles.dateValue}>{date}</span>
          </div>
          <div className={styles.sideEffects}>
            Side effects: {record.lastSideEffects}
          </div>
        </div>
      ),
    },
    {
      title: 'Activity Level',
      dataIndex: 'averageActivity',
      key: 'averageActivity',
      render: (activity: number) => (
          <div className={styles.activityContainer}>
            <ThunderboltOutlined className={styles.iconSecondary} />
            <span className={styles.activityValue}>{activity} days/week</span>
          </div>
      ),
    },
    {
      title: 'BMI',
      dataIndex: 'bmi',
      key: 'bmi',
      render: (bmi: number) => (
        <div className={styles.bmiContainer}>
          <span className={`${styles.bmiValue} ${
            bmi < 18.5 ? styles.bmiUnderweight :
            bmi < 25 ? styles.bmiNormal :
            bmi < 30 ? styles.bmiOverweight :
            styles.bmiObese
          }`}>
            {bmi}
          </span>
          <div className={styles.bmiCategory}>
            {bmi < 18.5 ? 'Underweight' :
             bmi < 25 ? 'Normal' :
             bmi < 30 ? 'Overweight' :
             'Obese'}
          </div>
        </div>
      ),
    },
    {
      title: 'Duration',
      dataIndex: 'prescriptionDuration',
      key: 'prescriptionDuration',
      render: (duration: string) => (
        <span className={styles.durationValue}>{duration}</span>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      {/* Search Bar */}
      <Card className={styles.searchCard}>
        <div className={styles.searchContainer}>
          <SearchOutlined className={styles.searchIcon} />
          <Input
            placeholder="Search members by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
            size="large"
          />
        </div>
      </Card>

      {/* Results Summary */}
      <div className={styles.resultsHeader}>
        <p className={styles.resultsText}>
          Showing {filteredMembers.length} of {members.length} members
          {searchQuery && (
            <span> for "{searchQuery}"</span>
          )}
        </p>
        <Button icon={<ExportOutlined />} size="small">
          Export Results
        </Button>
      </div>

      {/* Members Table */}
      <Card className={styles.tableCard}>
        <Table
          columns={columns}
          dataSource={filteredMembers}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} members`,
          }}
          onRow={(record) => ({
            onClick: () => onMemberClick?.(record),
            className: styles.memberRow,
          })}
          locale={{
            emptyText: (
              <div className={styles.emptyState}>
                {searchQuery ? `No members found matching "${searchQuery}"` : "No members found"}
              </div>
            ),
          }}
        />
      </Card>
    </div>
  );
}