import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, FunnelChart, Funnel, Cell } from "recharts";
import { Select, Row, Col } from "antd";
import { outcomesData, cohortData, milestoneData } from "@/data/trendsData";
import styles from "../TrendsSection.module.css";

const { Option } = Select;

export const OutcomesCharts = () => {
  const [selectedCohort, setSelectedCohort] = useState<string>("all");

  const handlePointClick = (data: any) => {
    console.log("Opening member list for:", data);
    // Implementation for opening filtered member list
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ 
          background: 'var(--card-background)', 
          border: '1px solid var(--border-color)', 
          borderRadius: '4px', 
          padding: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <p>{`Week: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}%`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={styles.chartGrid}>
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>
              Average Weight Change Progress
              <Select 
                defaultValue="all" 
                style={{ marginLeft: 'auto', width: 150 }}
                onChange={setSelectedCohort}
              >
                <Option value="all">All Cohorts</Option>
                <Option value="2024-01">Jan 2024</Option>
                <Option value="2024-02">Feb 2024</Option>
                <Option value="2024-03">Mar 2024</Option>
              </Select>
            </h3>
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={outcomesData} onClick={handlePointClick}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis 
                    dataKey="week" 
                    stroke="var(--text-secondary)"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="var(--text-secondary)"
                    fontSize={12}
                    label={{ value: '% Weight Change', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="avgWeightChange" 
                    stroke="var(--primary-color)" 
                    strokeWidth={2}
                    name="Average"
                    dot={{ fill: 'var(--primary-color)', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: 'var(--primary-color)' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="sevenDayMean" 
                    stroke="var(--success-color)" 
                    strokeWidth={1.5}
                    strokeDasharray="5 5"
                    name="7-day Rolling Mean"
                    dot={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="twentyEightDayMean" 
                    stroke="var(--warning-color)" 
                    strokeWidth={1.5}
                    strokeDasharray="10 5"
                    name="28-day Rolling Mean"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className={styles.chartDescription}>
              Click on data points to view member details for that week
            </p>
          </div>
        </Col>

        <Col span={12}>
          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>Cohort Performance Curves</h3>
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={cohortData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis 
                    dataKey="week" 
                    stroke="var(--text-secondary)"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="var(--text-secondary)"
                    fontSize={12}
                    label={{ value: '% Weight Change', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="jan2024" stroke="#1890ff" strokeWidth={2} name="Jan 2024" />
                  <Line type="monotone" dataKey="feb2024" stroke="#52c41a" strokeWidth={2} name="Feb 2024" />
                  <Line type="monotone" dataKey="mar2024" stroke="#faad14" strokeWidth={2} name="Mar 2024" />
                  <Line type="monotone" dataKey="apr2024" stroke="#f5222d" strokeWidth={2} name="Apr 2024" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className={styles.chartDescription}>
              Weight loss progress by enrollment month
            </p>
          </div>
        </Col>

        <Col span={12}>
          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>Weight Loss Milestones</h3>
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <FunnelChart>
                  <Funnel
                    data={milestoneData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                  >
                    {milestoneData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Funnel>
                  <Tooltip 
                    formatter={(value: any, name: any) => [`${value} members`, name]}
                  />
                </FunnelChart>
              </ResponsiveContainer>
            </div>
            <p className={styles.chartDescription}>
              Members achieving ≥5% and ≥10% weight loss milestones
            </p>
          </div>
        </Col>
      </Row>
    </div>
  );
};