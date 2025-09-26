import { Card, Tabs, Button, Tooltip } from "antd";
import { DownloadOutlined, FilterOutlined } from "@ant-design/icons";
import { OutcomesCharts } from "./trends/OutcomesCharts";
import { MedicationCharts } from "./trends/MedicationCharts";
import { EngagementCharts } from "./trends/EngagementCharts";
import { SafetyCharts } from "./trends/SafetyCharts";
import styles from "./TrendsSection.module.css";

const { TabPane } = Tabs;

export const TrendsSection = () => {
  const handleExport = (format: 'png' | 'csv') => {
    // Export functionality to be implemented
    console.log(`Exporting as ${format}`);
  };

  const handleFilterClick = () => {
    // Filter functionality to be implemented
    console.log('Opening filters');
  };

  return (
    <div className={styles.trendsSection}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Member Trends & Analytics</h2>
          <p className={styles.subtitle}>Identify patterns and areas for improvement</p>
        </div>
        <div className={styles.actions}>
          <Tooltip title="Filter data">
            <Button icon={<FilterOutlined />} onClick={handleFilterClick}>
              Filters
            </Button>
          </Tooltip>
          <Tooltip title="Export as PNG">
            <Button icon={<DownloadOutlined />} onClick={() => handleExport('png')}>
              PNG
            </Button>
          </Tooltip>
          <Tooltip title="Export as CSV">
            <Button icon={<DownloadOutlined />} onClick={() => handleExport('csv')}>
              CSV
            </Button>
          </Tooltip>
        </div>
      </div>

      <Card className={styles.chartsContainer}>
        <Tabs 
          defaultActiveKey="outcomes" 
          className={styles.chartTabs}
          tabBarStyle={{ marginBottom: 24 }}
        >
          <TabPane tab="Outcomes" key="outcomes">
            <OutcomesCharts />
          </TabPane>
          <TabPane tab="Medication" key="medication">
            <MedicationCharts />
          </TabPane>
          <TabPane tab="Engagement" key="engagement">
            <EngagementCharts />
          </TabPane>
          <TabPane tab="Safety" key="safety">
            <SafetyCharts />
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};