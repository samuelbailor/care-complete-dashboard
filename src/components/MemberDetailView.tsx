import { useState } from "react";
import { Modal, Card, Row, Col, Tag, Timeline, Table, Progress, Input, Button } from "antd";
import { 
  UserOutlined, 
  MedicineBoxOutlined, 
  LineChartOutlined,
  CalendarOutlined,
  PhoneOutlined,
  FileTextOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  PlusOutlined
} from "@ant-design/icons";
import { MemberProfile } from "@/utils/csvParser";
import styles from "./MemberDetailView.module.css";

interface MemberDetailViewProps {
  member: MemberProfile | null;
  visible: boolean;
  onClose: () => void;
}

export function MemberDetailView({ member, visible, onClose }: MemberDetailViewProps) {
  const [newGoal, setNewGoal] = useState("");
  const [additionalGoals, setAdditionalGoals] = useState<string[]>([]);

  if (!member) return null;

  const handleAddGoal = () => {
    if (newGoal.trim()) {
      setAdditionalGoals([...additionalGoals, newGoal.trim()]);
      setNewGoal("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddGoal();
    }
  };

  const allGoals = [...member.memberGoals, ...additionalGoals];

  const getRiskTagColor = (risk: string) => {
    switch (risk) {
      case "High": return "red";
      case "Medium": return "orange";
      default: return "green";
    }
  };

  const surveyColumns = [
    {
      title: 'Date',
      dataIndex: 'submittedAt',
      key: 'submittedAt',
      render: (date: string) => new Date(date).toLocaleDateString('en-US'),
    },
    {
      title: 'Weight',
      dataIndex: 'currentWeight',
      key: 'currentWeight',
    },
    {
      title: 'Taking Medication',
      dataIndex: 'takingMedication',
      key: 'takingMedication',
      render: (value: string) => (
        <Tag color={value === 'Yes' ? 'green' : 'red'}>
          {value}
        </Tag>
      ),
    },
    {
      title: 'Side Effects',
      dataIndex: 'hasSideEffects',
      key: 'hasSideEffects',
      render: (value: string) => (
        <Tag color={value === 'Yes' ? 'orange' : 'green'}>
          {value}
        </Tag>
      ),
    },
    {
      title: 'Activity Days',
      dataIndex: 'activityDays',
      key: 'activityDays',
      render: (days: number) => `${days} days/week`,
    },
  ];

  return (
    <Modal
      title={
        <div className={styles.modalHeader}>
          <UserOutlined className={styles.headerIcon} />
          <span className={styles.memberName}>{member.name}</span>
          <Tag color={getRiskTagColor(member.riskLevel)} className={styles.riskTag}>
            {member.riskLevel} Risk
          </Tag>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={1200}
      className={styles.memberModal}
    >
      <Row gutter={[24, 24]}>
        {/* Demographics */}
        <Col span={8}>
          <Card title={<><UserOutlined /> Demographics</>} className={styles.detailCard}>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.label}>Age:</span>
                <span className={styles.value}>{member.age} years</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Gender:</span>
                <span className={styles.value}>{member.gender}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Height:</span>
                <span className={styles.value}>{member.height}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Current Weight:</span>
                <span className={styles.value}>{member.currentWeight} lbs</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>BMI:</span>
                <span className={styles.value}>{member.bmi}</span>
              </div>
            </div>
          </Card>
        </Col>

        {/* Medications */}
        <Col span={8}>
          <Card title={<><MedicineBoxOutlined /> Medications</>} className={styles.detailCard}>
            <div className={styles.medicationSection}>
              <div className={styles.primaryMedication}>
                <span className={styles.label}>Primary GLP-1:</span>
                <span className={styles.value}>{member.glp1Medication}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Duration:</span>
                <span className={styles.value}>{member.prescriptionDuration}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>PA Expires:</span>
                <span className={styles.value}>{member.paExpirationDate}</span>
              </div>
              {member.otherMedications.length > 0 && (
                <div className={styles.otherMedications}>
                  <span className={styles.label}>Other Medications:</span>
                  <div className={styles.medicationTags}>
                    {member.otherMedications.map((med, index) => (
                      <Tag key={index} color="blue">{med}</Tag>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </Col>

        {/* Progress Overview */}
        <Col span={8}>
          <Card title={<><LineChartOutlined /> Progress Overview</>} className={styles.detailCard}>
            <div className={styles.progressSection}>
              <div className={styles.weightProgress}>
                <span className={styles.label}>Weight Change:</span>
                <span className={`${styles.value} ${
                  member.weightChange > 0 ? styles.weightLoss : styles.weightGain
                }`}>
                  {member.weightChange > 0 ? `-${member.weightChange}` : `+${Math.abs(member.weightChange)}`} lbs
                </span>
              </div>
              <div className={styles.complianceProgress}>
                <span className={styles.label}>Medication Compliance:</span>
                <Progress 
                  percent={member.surveyCompliance} 
                  size="small"
                  strokeColor={member.surveyCompliance >= 80 ? '#52c41a' : member.surveyCompliance >= 60 ? '#faad14' : '#ff4d4f'}
                />
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Activity Level:</span>
                <span className={styles.value}>{member.averageActivity} days/week</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Total Surveys:</span>
                <span className={styles.value}>{member.totalSurveys}</span>
              </div>
            </div>
          </Card>
        </Col>

        {/* Member Goals */}
        <Col span={12}>
          <Card title={<><FileTextOutlined /> Member Goals</>} className={styles.detailCard}>
            <div className={styles.goalsList}>
              {allGoals.map((goal, index) => (
                <div key={index} className={styles.goalItem}>
                  <CheckCircleOutlined className={styles.goalIcon} />
                  <span>{goal}</span>
                </div>
              ))}
            </div>
            <div className={styles.addGoalSection}>
              <Input.Group compact>
                <Input
                  style={{ width: 'calc(100% - 32px)' }}
                  placeholder="Add new member goal..."
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  onPressEnter={handleKeyPress}
                />
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />} 
                  onClick={handleAddGoal}
                  disabled={!newGoal.trim()}
                />
              </Input.Group>
            </div>
          </Card>
        </Col>

        {/* Fill History */}
        <Col span={12}>
          <Card title={<><CalendarOutlined /> Fill History</>} className={styles.detailCard}>
            <div className={styles.fillHistory}>
              {member.fillHistory.map((fill, index) => (
                <div key={index} className={styles.fillItem}>
                  <div className={styles.fillDate}>{fill.date}</div>
                  <div className={styles.fillDetails}>
                    <span className={styles.medication}>{fill.medication}</span>
                    <span className={styles.quantity}>{fill.quantity}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Col>

        {/* Staff Interactions */}
        <Col span={12}>
          <Card title={<><PhoneOutlined /> Staff Interactions</>} className={styles.detailCard}>
            <Timeline>
              {member.staffInteractions.map((interaction, index) => (
                <Timeline.Item 
                  key={index}
                  dot={<PhoneOutlined />}
                  color="blue"
                >
                  <div className={styles.interactionItem}>
                    <div className={styles.interactionHeader}>
                      <span className={styles.interactionType}>{interaction.type}</span>
                      <span className={styles.interactionDate}>{interaction.date}</span>
                    </div>
                    <div className={styles.interactionNotes}>{interaction.notes}</div>
                  </div>
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>
        </Col>

        {/* Survey Responses */}
        <Col span={12}>
          <Card title={<><FileTextOutlined /> Recent Survey Responses</>} className={styles.detailCard}>
            <Table
              columns={surveyColumns}
              dataSource={member.surveyResponses.slice(-5)}
              rowKey={(record, index) => `${record.submittedAt}-${index}`}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </Modal>
  );
}