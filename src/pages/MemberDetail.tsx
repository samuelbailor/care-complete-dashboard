import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Card, Row, Col, Tag, Timeline, Table, Progress, Input, Button, Spin, Collapse } from "antd";
import { 
  UserOutlined, 
  MedicineBoxOutlined, 
  LineChartOutlined,
  CalendarOutlined,
  PhoneOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  PlusOutlined,
  ArrowLeftOutlined,
  ExclamationCircleOutlined,
  DownOutlined
} from "@ant-design/icons";
import { surveyMembers, programData } from "@/data/surveyMembers";
import { MemberProfile } from "@/utils/csvParser";
import { supabase } from "@/integrations/supabase/client";
import styles from "./MemberDetail.module.css";

const { Panel } = Collapse;

// Risk assessment interface
interface RiskAssessment {
  patientName: string;
  overallRiskLevel: string;
  medicationAdherence: {
    pattern: string;
    concerns: string;
    recommendations: string;
  };
  sideEffects: {
    severityTrend: string;
    progression: string;
    recommendations: string;
  };
  weightTrends: {
    baselineWeight: string;
    currentWeight: string;
    totalChange: string;
    pattern: string;
    recommendations: string;
  };
  activityLevels: {
    pattern: string;
    correlation: string;
    recommendations: string;
  };
  symptomEvolution: {
    initial: string;
    deterioration: string;
    improvement: string;
    recommendations: string;
  };
  outreachUrgency: string;
}

// Function to consistently assign org based on member name
const getRandomOrg = (memberName: string): string => {
  const orgs = ["ABCLogistics", "XYZ Sciences", "RWY Data"];
  // Use member name to create consistent hash for org assignment
  let hash = 0;
  for (let i = 0; i < memberName.length; i++) {
    const char = memberName.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return orgs[Math.abs(hash) % orgs.length];
};

export default function MemberDetail() {
  const { memberId } = useParams<{ memberId: string }>();
  const navigate = useNavigate();
  const [member, setMember] = useState<MemberProfile | null>(null);
  const [newGoal, setNewGoal] = useState("");
  const [additionalGoals, setAdditionalGoals] = useState<string[]>([]);
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessment | null>(null);
  const [isLoadingRiskAssessment, setIsLoadingRiskAssessment] = useState(false);

  useEffect(() => {
    if (memberId) {
      const foundMember = surveyMembers.find(m => m.id === memberId);
      setMember(foundMember || null);
      
      // Fetch risk assessment for GLP-1 members (all members in surveyMembers are GLP-1)
      if (foundMember) {
        fetchRiskAssessment(foundMember);
      }
    }
  }, [memberId]);

  const fetchRiskAssessment = async (memberProfile: MemberProfile) => {
    setIsLoadingRiskAssessment(true);
    try {
      // Find the program this member belongs to
      let csvData = '';
      for (const [programName, program] of Object.entries(programData)) {
        if (program.members.some(m => m.id === memberProfile.id)) {
          // Filter CSV data to include only header and this member's rows
          const lines = program.csvData.split('\n');
          const header = lines[0];
          const memberRows = lines.slice(1).filter(line => 
            line.includes(memberProfile.name)
          );
          csvData = [header, ...memberRows].join('\n');
          break;
        }
      }

      if (!csvData) {
        console.error('No CSV data found for member');
        return;
      }

      const { data, error } = await supabase.functions.invoke('member-risk-assessment', {
        body: { csvData }
      });

      if (error) throw error;
      
      setRiskAssessment(data);
    } catch (error) {
      console.error('Error fetching risk assessment:', error);
    } finally {
      setIsLoadingRiskAssessment(false);
    }
  };

  if (!member) {
    return (
      <div className={styles.container}>
        <div className={styles.errorState}>
          <h2>Member not found</h2>
          <p>The member you're looking for doesn't exist or has been removed.</p>
          <Link to="/">
            <Button type="primary" icon={<ArrowLeftOutlined />}>
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

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

  const extractWeightGoal = (goal: string): number | null => {
    const match = goal.match(/lose\s+(\d+)\s*lbs?/i);
    return match ? parseInt(match[1]) : null;
  };

  const calculateWeightProgress = (goal: string) => {
    const targetLoss = extractWeightGoal(goal);
    if (!targetLoss) return null;
    
    const actualLoss = member.initialWeight - member.currentWeight;
    const targetWeight = member.initialWeight - targetLoss;
    const progressPercent = Math.min((actualLoss / targetLoss) * 100, 100);
    
    return {
      startWeight: member.initialWeight,
      targetWeight,
      currentWeight: member.currentWeight,
      targetLoss,
      actualLoss,
      progressPercent: Math.max(0, progressPercent)
    };
  };

  const getProgramStartDate = () => {
    if (!member.surveyResponses.length) return 'N/A';
    const sortedResponses = [...member.surveyResponses].sort((a, b) => 
      new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime()
    );
    return new Date(sortedResponses[0].submittedAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric', 
      year: 'numeric'
    });
  };

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
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <Link to="/">
          <Button type="text" icon={<ArrowLeftOutlined />} size="large">
            Back to Dashboard
          </Button>
        </Link>
        <div className={styles.memberHeader}>
          <UserOutlined className={styles.headerIcon} />
          <h1 className={styles.memberName}>{member.name}</h1>
          <Tag color={getRiskTagColor(member.riskLevel)} className={styles.riskTag}>
            {member.riskLevel} Risk
          </Tag>
        </div>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {/* Diabetes Program Disclaimer */}
        {member.memberGoals.some(goal => goal.toLowerCase().includes('diabetes') || goal.toLowerCase().includes('a1c') || goal.toLowerCase().includes('blood sugar')) && (
          <Card style={{ marginBottom: '24px', backgroundColor: '#fff7e6', borderColor: '#ffec3d' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <ExclamationCircleOutlined style={{ color: '#faad14', fontSize: '18px' }} />
              <div>
                <strong>Diabetes Program Note:</strong> This member is part of the Diabetes Management Program. 
                In the full implementation, this view would display diabetes-specific data including A1C trends, 
                blood glucose monitoring, and diabetes medication management instead of weight-focused metrics.
              </div>
            </div>
          </Card>
        )}
        
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
                  <span className={styles.label}>Starting Weight:</span>
                  <span className={styles.value}>{member.initialWeight} lbs</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.label}>Current Weight:</span>
                  <span className={styles.value}>{member.currentWeight} lbs</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.label}>Org:</span>
                  <span className={styles.value}>{getRandomOrg(member.name)}</span>
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
                  <span className={styles.label}>Program Start Date:</span>
                  <span className={styles.value}>{getProgramStartDate()}</span>
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
                  <span className={styles.label}>Program Compliance:</span>
                  <Progress 
                    percent={member.programCompliance} 
                    size="small"
                    strokeColor={member.programCompliance >= 80 ? '#52c41a' : member.programCompliance >= 60 ? '#faad14' : '#ff4d4f'}
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
                {allGoals.map((goal, index) => {
                  const weightProgress = calculateWeightProgress(goal);
                  
                  return (
                    <div key={index} className={styles.goalItem}>
                      <CheckCircleOutlined className={styles.goalIcon} />
                      <div className={styles.goalContent}>
                        <span className={styles.goalText}>{goal}</span>
                        {weightProgress && (
                          <div className={styles.weightProgressContainer}>
                            <div className={styles.weightProgressLabels}>
                              <span className={styles.startWeight}>
                                Start: {weightProgress.startWeight} lbs
                              </span>
                              <span className={styles.currentProgress}>
                                Current: {weightProgress.currentWeight} lbs 
                                ({weightProgress.actualLoss.toFixed(1)} lbs lost)
                              </span>
                              <span className={styles.targetWeight}>
                                Goal: {weightProgress.targetWeight} lbs
                              </span>
                            </div>
                            <Progress 
                              percent={weightProgress.progressPercent}
                              size="small"
                              strokeColor={
                                weightProgress.progressPercent >= 100 ? '#52c41a' : 
                                weightProgress.progressPercent >= 75 ? '#1890ff' : 
                                weightProgress.progressPercent >= 50 ? '#faad14' : '#ff7a45'
                              }
                              showInfo={true}
                              format={(percent) => `${percent?.toFixed(0)}%`}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
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

          {/* AI Risk Assessment - Collapsible */}
          <Col span={24}>
            <Collapse 
              style={{ 
                marginTop: '24px',
                backgroundColor: '#fff',
                border: '1px solid #d9d9d9',
                borderRadius: '6px'
              }}
              expandIcon={({ isActive }) => <DownOutlined rotate={isActive ? 180 : 0} />}
            >
              <Panel 
                header={
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <ExclamationCircleOutlined style={{ color: '#1890ff' }} />
                    <span style={{ fontSize: '16px', fontWeight: '600' }}>AI Risk Assessment</span>
                    {riskAssessment && (
                      <Tag 
                        color={
                          riskAssessment.overallRiskLevel.toLowerCase() === 'high' ? 'red' :
                          riskAssessment.overallRiskLevel.toLowerCase() === 'medium' ? 'orange' : 'green'
                        }
                      >
                        {riskAssessment.overallRiskLevel.toUpperCase()} RISK
                      </Tag>
                    )}
                    {riskAssessment && (
                      <Tag 
                        color={
                          riskAssessment.outreachUrgency === 'IMMEDIATE' ? 'red' :
                          riskAssessment.outreachUrgency === 'MODERATE' ? 'orange' : 'blue'
                        }
                      >
                        {riskAssessment.outreachUrgency} OUTREACH
                      </Tag>
                    )}
                  </div>
                } 
                key="1"
                style={{ 
                  backgroundColor: '#fafafa',
                  border: 'none'
                }}
              >
                {isLoadingRiskAssessment ? (
                  <div style={{ textAlign: 'center', padding: '40px' }}>
                    <Spin size="large" />
                    <p style={{ marginTop: '16px', color: '#666' }}>Analyzing member data...</p>
                  </div>
                ) : riskAssessment ? (
                  <Row gutter={[16, 16]} style={{ padding: '16px 0' }}>
                    {/* Medication Adherence */}
                    <Col span={12}>
                      <Card 
                        type="inner" 
                        title="Medication Adherence"
                        style={{ height: '100%' }}
                      >
                        <div style={{ marginBottom: '12px' }}>
                          <strong>Pattern:</strong>
                          <p style={{ marginTop: '4px', color: '#666', lineHeight: '1.5' }}>{riskAssessment.medicationAdherence.pattern}</p>
                        </div>
                        {riskAssessment.medicationAdherence.concerns && (
                          <div style={{ marginBottom: '12px' }}>
                            <strong>Concerns:</strong>
                            <p style={{ marginTop: '4px', color: '#d32f2f', lineHeight: '1.5' }}>{riskAssessment.medicationAdherence.concerns}</p>
                          </div>
                        )}
                        <div>
                          <strong>Recommendations:</strong>
                          <p style={{ marginTop: '4px', color: '#1976d2', lineHeight: '1.5' }}>{riskAssessment.medicationAdherence.recommendations}</p>
                        </div>
                      </Card>
                    </Col>

                    {/* Side Effects */}
                    <Col span={12}>
                      <Card 
                        type="inner" 
                        title="Side Effects Analysis"
                        style={{ height: '100%' }}
                      >
                        <div style={{ marginBottom: '12px' }}>
                          <strong>Severity Trend:</strong>
                          <p style={{ marginTop: '4px', color: '#666', lineHeight: '1.5' }}>{riskAssessment.sideEffects.severityTrend}</p>
                        </div>
                        <div style={{ marginBottom: '12px' }}>
                          <strong>Progression:</strong>
                          <p style={{ marginTop: '4px', color: '#666', lineHeight: '1.5' }}>{riskAssessment.sideEffects.progression}</p>
                        </div>
                        <div>
                          <strong>Recommendations:</strong>
                          <p style={{ marginTop: '4px', color: '#1976d2', lineHeight: '1.5' }}>{riskAssessment.sideEffects.recommendations}</p>
                        </div>
                      </Card>
                    </Col>

                    {/* Weight Trends */}
                    <Col span={12}>
                      <Card 
                        type="inner" 
                        title="Weight Analysis"
                        style={{ height: '100%' }}
                      >
                        <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                          <strong>Baseline:</strong> 
                          <span>{riskAssessment.weightTrends.baselineWeight}</span>
                        </div>
                        <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                          <strong>Current:</strong> 
                          <span>{riskAssessment.weightTrends.currentWeight}</span>
                        </div>
                        <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                          <strong>Total Change:</strong> 
                          <span style={{ color: '#2e7d32', fontWeight: '500' }}>{riskAssessment.weightTrends.totalChange}</span>
                        </div>
                        <div style={{ marginBottom: '12px' }}>
                          <strong>Pattern:</strong>
                          <p style={{ marginTop: '4px', color: '#666', lineHeight: '1.5' }}>{riskAssessment.weightTrends.pattern}</p>
                        </div>
                        <div>
                          <strong>Recommendations:</strong>
                          <p style={{ marginTop: '4px', color: '#1976d2', lineHeight: '1.5' }}>{riskAssessment.weightTrends.recommendations}</p>
                        </div>
                      </Card>
                    </Col>

                    {/* Activity Levels */}
                    <Col span={12}>
                      <Card 
                        type="inner" 
                        title="Activity Analysis"
                        style={{ height: '100%' }}
                      >
                        <div style={{ marginBottom: '12px' }}>
                          <strong>Pattern:</strong>
                          <p style={{ marginTop: '4px', color: '#666', lineHeight: '1.5' }}>{riskAssessment.activityLevels.pattern}</p>
                        </div>
                        <div style={{ marginBottom: '12px' }}>
                          <strong>Correlation:</strong>
                          <p style={{ marginTop: '4px', color: '#666', lineHeight: '1.5' }}>{riskAssessment.activityLevels.correlation}</p>
                        </div>
                        <div>
                          <strong>Recommendations:</strong>
                          <p style={{ marginTop: '4px', color: '#1976d2', lineHeight: '1.5' }}>{riskAssessment.activityLevels.recommendations}</p>
                        </div>
                      </Card>
                    </Col>

                    {/* Symptom Evolution */}
                    <Col span={24}>
                      <Card type="inner" title="Symptom Evolution Timeline">
                        <Row gutter={16}>
                          {riskAssessment.symptomEvolution.initial && (
                            <Col span={8}>
                              <div>
                                <strong>Initial State:</strong>
                                <p style={{ marginTop: '4px', color: '#2e7d32', lineHeight: '1.5' }}>{riskAssessment.symptomEvolution.initial}</p>
                              </div>
                            </Col>
                          )}
                          {riskAssessment.symptomEvolution.deterioration && (
                            <Col span={8}>
                              <div>
                                <strong>Deterioration:</strong>
                                <p style={{ marginTop: '4px', color: '#d32f2f', lineHeight: '1.5' }}>{riskAssessment.symptomEvolution.deterioration}</p>
                              </div>
                            </Col>
                          )}
                          {riskAssessment.symptomEvolution.improvement && (
                            <Col span={8}>
                              <div>
                                <strong>Improvement:</strong>
                                <p style={{ marginTop: '4px', color: '#2e7d32', lineHeight: '1.5' }}>{riskAssessment.symptomEvolution.improvement}</p>
                              </div>
                            </Col>
                          )}
                        </Row>
                        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f0f0f0' }}>
                          <strong>Clinical Recommendations:</strong>
                          <p style={{ marginTop: '4px', color: '#1976d2', fontWeight: '500', lineHeight: '1.5' }}>{riskAssessment.symptomEvolution.recommendations}</p>
                        </div>
                      </Card>
                    </Col>
                  </Row>
                ) : (
                  <p style={{ textAlign: 'center', color: '#666', fontStyle: 'italic', padding: '40px' }}>
                    No risk assessment data available
                  </p>
                )}
              </Panel>
            </Collapse>
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
      </div>
    </div>
  );
}