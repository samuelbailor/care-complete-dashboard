import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { Row, Col } from "antd";
import { giEventsData, discontinuationData } from "@/data/trendsData";
import styles from "../TrendsSection.module.css";

export const SafetyCharts = () => {
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
              {`${entry.name}: ${entry.value}${entry.name.includes('Rate') ? '%' : ' events'}`}
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
        <Col span={12}>
          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>GI Events per 100 Members</h3>
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={giEventsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis 
                    dataKey="week" 
                    stroke="var(--text-secondary)"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="var(--text-secondary)"
                    fontSize={12}
                    label={{ value: 'Events per 100 Members', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="nausea" 
                    fill="#faad14" 
                    name="Nausea"
                    radius={[2, 2, 0, 0]}
                  />
                  <Bar 
                    dataKey="vomiting" 
                    fill="#ff4d4f" 
                    name="Vomiting"
                    radius={[2, 2, 0, 0]}
                  />
                  <Bar 
                    dataKey="diarrhea" 
                    fill="#fa8c16" 
                    name="Diarrhea"
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className={styles.chartDescription}>
              Gastrointestinal adverse events reported per week
            </p>
          </div>
        </Col>

        <Col span={12}>
          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>Treatment Discontinuation Rate</h3>
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={discontinuationData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis 
                    dataKey="week" 
                    stroke="var(--text-secondary)"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="var(--text-secondary)"
                    fontSize={12}
                    label={{ value: 'Discontinuation Rate (%)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="totalDiscontinuation" 
                    stroke="var(--error-color)" 
                    strokeWidth={3}
                    name="Total Discontinuation Rate"
                    dot={{ fill: 'var(--error-color)', strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 7, fill: 'var(--error-color)' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="giRelatedDiscontinuation" 
                    stroke="var(--warning-color)" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="GI-Related Discontinuation"
                    dot={{ fill: 'var(--warning-color)', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className={styles.chartDescription}>
              Treatment discontinuation rates over time
            </p>
          </div>
        </Col>

        <Col span={24}>
          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>Safety Event Timeline</h3>
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={giEventsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis 
                    dataKey="week" 
                    stroke="var(--text-secondary)"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="var(--text-secondary)"
                    fontSize={12}
                    label={{ value: 'Total Events', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="totalEvents" 
                    stroke="var(--primary-color)" 
                    strokeWidth={3}
                    name="Total GI Events"
                    dot={{ fill: 'var(--primary-color)', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: 'var(--primary-color)' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className={styles.chartDescription}>
              Combined view of all gastrointestinal safety events
            </p>
          </div>
        </Col>
      </Row>
    </div>
  );
};