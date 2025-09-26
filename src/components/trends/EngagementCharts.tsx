import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from "recharts";
import { Row, Col } from "antd";
import { engagementHeatmapData, noTouchData } from "@/data/trendsData";
import styles from "../TrendsSection.module.css";

export const EngagementCharts = () => {
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
              {`${entry.name}: ${entry.value}${entry.name.includes('%') ? '%' : ' touches'}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const HeatmapCell = ({ x, y, width, height, value }: any) => {
    const intensity = Math.min(value / 10, 1); // Normalize to 0-1
    const color = `hsl(210, 100%, ${100 - intensity * 50}%)`; // Blue gradient
    
    return (
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={color}
        stroke="var(--border-color)"
        strokeWidth={0.5}
      />
    );
  };

  const renderHeatmap = () => {
    const cellWidth = 40;
    const cellHeight = 30;
    const weeks = Array.from({length: 12}, (_, i) => i + 1);
    const cohorts = ['Jan 2024', 'Feb 2024', 'Mar 2024', 'Apr 2024'];
    
    return (
      <svg width="100%" height="200" viewBox="0 0 520 150">
        {/* Headers */}
        <text x="20" y="25" fontSize="12" fill="var(--text-secondary)">Cohort</text>
        {weeks.map((week, i) => (
          <text key={week} x={60 + i * cellWidth} y="25" fontSize="12" fill="var(--text-secondary)" textAnchor="middle">
            W{week}
          </text>
        ))}
        
        {/* Heatmap cells */}
        {cohorts.map((cohort, cohortIndex) => (
          <g key={cohort}>
            <text x="20" y={50 + cohortIndex * cellHeight} fontSize="12" fill="var(--text-secondary)">{cohort}</text>
            {weeks.map((week, weekIndex) => {
              const value = engagementHeatmapData[cohortIndex * weeks.length + weekIndex]?.touches || 0;
              const intensity = Math.min(value / 10, 1);
              const color = `hsl(210, 100%, ${100 - intensity * 50}%)`;
              
              return (
                <rect
                  key={`${cohort}-${week}`}
                  x={40 + weekIndex * cellWidth}
                  y={35 + cohortIndex * cellHeight}
                  width={cellWidth - 2}
                  height={cellHeight - 2}
                  fill={color}
                  stroke="var(--border-color)"
                  strokeWidth={0.5}
                />
              );
            })}
          </g>
        ))}
        
        {/* Legend */}
        <text x="20" y="170" fontSize="10" fill="var(--text-secondary)">Touches per member per week</text>
        <text x="200" y="170" fontSize="10" fill="var(--text-secondary)">Low</text>
        <rect x="220" y="160" width="20" height="10" fill="hsl(210, 100%, 100%)" stroke="var(--border-color)" />
        <rect x="240" y="160" width="20" height="10" fill="hsl(210, 100%, 75%)" stroke="var(--border-color)" />
        <rect x="260" y="160" width="20" height="10" fill="hsl(210, 100%, 50%)" stroke="var(--border-color)" />
        <text x="285" y="170" fontSize="10" fill="var(--text-secondary)">High</text>
      </svg>
    );
  };

  return (
    <div className={styles.chartGrid}>
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>Member Touch Frequency Heatmap</h3>
            <div className={styles.chartContainer}>
              {renderHeatmap()}
            </div>
            <p className={styles.chartDescription}>
              Staff interactions per member per week by enrollment cohort
            </p>
          </div>
        </Col>

        <Col span={24}>
          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>Members with No Touch ≥14 Days</h3>
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={noTouchData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis 
                    dataKey="week" 
                    stroke="var(--text-secondary)"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="var(--text-secondary)"
                    fontSize={12}
                    label={{ value: '% of Members', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="noTouchPercent" 
                    stroke="var(--error-color)" 
                    strokeWidth={3}
                    name="No Touch ≥14 Days %"
                    dot={{ fill: 'var(--error-color)', strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 7, fill: 'var(--error-color)' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className={styles.chartDescription}>
              Percentage of members with no staff contact for 14+ days
            </p>
          </div>
        </Col>
      </Row>
    </div>
  );
};