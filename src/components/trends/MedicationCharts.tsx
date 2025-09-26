import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { Row, Col } from "antd";
import { pdcData, refillGapData, titrationData } from "@/data/trendsData";
import styles from "../TrendsSection.module.css";

export const MedicationCharts = () => {
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
          <p>{`Month: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}${entry.name.includes('%') ? '%' : entry.name.includes('Days') ? ' days' : ' members'}`}
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
            <h3 className={styles.chartTitle}>Medication Adherence (PDC Buckets)</h3>
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pdcData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis 
                    dataKey="month" 
                    stroke="var(--text-secondary)"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="var(--text-secondary)"
                    fontSize={12}
                    label={{ value: 'Number of Members', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="poor" stackId="a" fill="#ff4d4f" name="Poor (<60%)" />
                  <Bar dataKey="suboptimal" stackId="a" fill="#faad14" name="Suboptimal (60-79%)" />
                  <Bar dataKey="good" stackId="a" fill="#52c41a" name="Good (80-94%)" />
                  <Bar dataKey="excellent" stackId="a" fill="#1890ff" name="Excellent (≥95%)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className={styles.chartDescription}>
              Distribution of members across medication adherence categories
            </p>
          </div>
        </Col>

        <Col span={12}>
          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>Average Refill Gap Days</h3>
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={refillGapData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis 
                    dataKey="month" 
                    stroke="var(--text-secondary)"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="var(--text-secondary)"
                    fontSize={12}
                    label={{ value: 'Gap Days', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="avgGapDays" 
                    stroke="var(--warning-color)" 
                    strokeWidth={3}
                    name="Avg Gap Days"
                    dot={{ fill: 'var(--warning-color)', strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 7, fill: 'var(--warning-color)' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className={styles.chartDescription}>
              Average days between medication refills
            </p>
          </div>
        </Col>

        <Col span={12}>
          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>Titration Pace vs Label</h3>
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={titrationData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis 
                    dataKey="week" 
                    stroke="var(--text-secondary)"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="var(--text-secondary)"
                    fontSize={12}
                    label={{ value: 'Dose (mg)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="stepAfter" 
                    dataKey="actualDose" 
                    stroke="var(--primary-color)" 
                    strokeWidth={3}
                    name="Actual Dose"
                    dot={{ fill: 'var(--primary-color)', strokeWidth: 2, r: 4 }}
                  />
                  <Line 
                    type="stepAfter" 
                    dataKey="labelDose" 
                    stroke="var(--success-color)" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Label Recommended"
                    dot={{ fill: 'var(--success-color)', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className={styles.chartDescription}>
              Actual titration pace compared to medication label recommendations
            </p>
          </div>
        </Col>
      </Row>
    </div>
  );
};