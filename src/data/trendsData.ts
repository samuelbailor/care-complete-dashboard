// Mock data for trends charts

// Outcomes data
export const outcomesData = [
  { week: 1, avgWeightChange: -0.5, sevenDayMean: -0.5, twentyEightDayMean: -0.5 },
  { week: 2, avgWeightChange: -1.2, sevenDayMean: -0.85, twentyEightDayMean: -0.5 },
  { week: 3, avgWeightChange: -2.1, sevenDayMean: -1.27, twentyEightDayMean: -0.5 },
  { week: 4, avgWeightChange: -3.4, sevenDayMean: -2.23, twentyEightDayMean: -1.8 },
  { week: 5, avgWeightChange: -4.2, sevenDayMean: -3.08, twentyEightDayMean: -2.28 },
  { week: 6, avgWeightChange: -5.1, sevenDayMean: -3.95, twentyEightDayMean: -2.88 },
  { week: 7, avgWeightChange: -6.3, sevenDayMean: -4.83, twentyEightDayMean: -3.63 },
  { week: 8, avgWeightChange: -7.2, sevenDayMean: -5.7, twentyEightDayMean: -4.55 },
  { week: 9, avgWeightChange: -8.1, sevenDayMean: -6.58, twentyEightDayMean: -5.53 },
  { week: 10, avgWeightChange: -8.9, sevenDayMean: -7.45, twentyEightDayMean: -6.63 },
  { week: 11, avgWeightChange: -9.6, sevenDayMean: -8.25, twentyEightDayMean: -7.78 },
  { week: 12, avgWeightChange: -10.2, sevenDayMean: -8.95, twentyEightDayMean: -8.88 },
];

export const cohortData = [
  { week: 1, jan2024: -0.8, feb2024: -0.6, mar2024: -0.4, apr2024: -0.3 },
  { week: 2, jan2024: -1.5, feb2024: -1.1, mar2024: -0.9, apr2024: -0.7 },
  { week: 3, jan2024: -2.8, feb2024: -2.2, mar2024: -1.8, apr2024: -1.4 },
  { week: 4, jan2024: -4.1, feb2024: -3.5, mar2024: -2.9, apr2024: -2.3 },
  { week: 5, jan2024: -5.2, feb2024: -4.3, mar2024: -3.8, apr2024: -3.1 },
  { week: 6, jan2024: -6.4, feb2024: -5.1, mar2024: -4.6, apr2024: -3.9 },
  { week: 7, jan2024: -7.8, feb2024: -6.2, mar2024: -5.7, apr2024: -4.8 },
  { week: 8, jan2024: -8.9, feb2024: -7.1, mar2024: -6.5, apr2024: -5.6 },
  { week: 9, jan2024: -9.8, feb2024: -8.0, mar2024: -7.3, apr2024: -6.4 },
  { week: 10, jan2024: -10.5, feb2024: -8.7, mar2024: -8.0, apr2024: -7.1 },
  { week: 11, jan2024: -11.1, feb2024: -9.3, mar2024: -8.6, apr2024: -7.7 },
  { week: 12, jan2024: -11.6, feb2024: -9.8, mar2024: -9.1, apr2024: -8.2 },
];

export const milestoneData = [
  { name: "Started Program", value: 450, color: "#1890ff" },
  { name: "≥5% Weight Loss", value: 315, color: "#52c41a" },
  { name: "≥10% Weight Loss", value: 187, color: "#faad14" },
];

// Medication data
export const pdcData = [
  { month: "Jan", poor: 15, suboptimal: 32, good: 78, excellent: 125 },
  { month: "Feb", poor: 12, suboptimal: 28, good: 82, excellent: 134 },
  { month: "Mar", poor: 18, suboptimal: 35, good: 75, excellent: 128 },
  { month: "Apr", poor: 14, suboptimal: 30, good: 81, excellent: 142 },
  { month: "May", poor: 11, suboptimal: 26, good: 85, excellent: 148 },
  { month: "Jun", poor: 13, suboptimal: 29, good: 79, excellent: 151 },
];

export const refillGapData = [
  { month: "Jan", avgGapDays: 5.2 },
  { month: "Feb", avgGapDays: 4.8 },
  { month: "Mar", avgGapDays: 6.1 },
  { month: "Apr", avgGapDays: 5.5 },
  { month: "May", avgGapDays: 4.3 },
  { month: "Jun", avgGapDays: 4.9 },
];

export const titrationData = [
  { week: 1, actualDose: 0.25, labelDose: 0.25 },
  { week: 2, actualDose: 0.25, labelDose: 0.25 },
  { week: 3, actualDose: 0.25, labelDose: 0.25 },
  { week: 4, actualDose: 0.25, labelDose: 0.25 },
  { week: 5, actualDose: 0.5, labelDose: 0.5 },
  { week: 6, actualDose: 0.5, labelDose: 0.5 },
  { week: 7, actualDose: 0.5, labelDose: 0.5 },
  { week: 8, actualDose: 0.5, labelDose: 0.5 },
  { week: 9, actualDose: 0.75, labelDose: 1.0 },
  { week: 10, actualDose: 1.0, labelDose: 1.0 },
  { week: 11, actualDose: 1.0, labelDose: 1.0 },
  { week: 12, actualDose: 1.0, labelDose: 1.0 },
];

// Engagement data
export const engagementHeatmapData = Array.from({ length: 48 }, (_, i) => ({
  cohort: Math.floor(i / 12),
  week: (i % 12) + 1,
  touches: Math.floor(Math.random() * 8) + 2, // 2-10 touches
}));

export const noTouchData = [
  { week: 1, noTouchPercent: 5 },
  { week: 2, noTouchPercent: 8 },
  { week: 3, noTouchPercent: 12 },
  { week: 4, noTouchPercent: 15 },
  { week: 5, noTouchPercent: 18 },
  { week: 6, noTouchPercent: 14 },
  { week: 7, noTouchPercent: 11 },
  { week: 8, noTouchPercent: 16 },
  { week: 9, noTouchPercent: 13 },
  { week: 10, noTouchPercent: 19 },
  { week: 11, noTouchPercent: 22 },
  { week: 12, noTouchPercent: 17 },
];

// Safety data
export const giEventsData = [
  { week: 1, nausea: 8, vomiting: 3, diarrhea: 5, totalEvents: 16 },
  { week: 2, nausea: 12, vomiting: 5, diarrhea: 7, totalEvents: 24 },
  { week: 3, nausea: 15, vomiting: 8, diarrhea: 9, totalEvents: 32 },
  { week: 4, nausea: 18, vomiting: 6, diarrhea: 11, totalEvents: 35 },
  { week: 5, nausea: 14, vomiting: 4, diarrhea: 8, totalEvents: 26 },
  { week: 6, nausea: 16, vomiting: 7, diarrhea: 10, totalEvents: 33 },
  { week: 7, nausea: 11, vomiting: 3, diarrhea: 6, totalEvents: 20 },
  { week: 8, nausea: 13, vomiting: 5, diarrhea: 9, totalEvents: 27 },
  { week: 9, nausea: 17, vomiting: 8, diarrhea: 12, totalEvents: 37 },
  { week: 10, nausea: 19, vomiting: 9, diarrhea: 14, totalEvents: 42 },
  { week: 11, nausea: 15, vomiting: 6, diarrhea: 10, totalEvents: 31 },
  { week: 12, nausea: 12, vomiting: 4, diarrhea: 8, totalEvents: 24 },
];

export const discontinuationData = [
  { week: 1, totalDiscontinuation: 2.1, giRelatedDiscontinuation: 1.3 },
  { week: 2, totalDiscontinuation: 3.8, giRelatedDiscontinuation: 2.1 },
  { week: 3, totalDiscontinuation: 5.2, giRelatedDiscontinuation: 3.4 },
  { week: 4, totalDiscontinuation: 6.7, giRelatedDiscontinuation: 4.2 },
  { week: 5, totalDiscontinuation: 7.9, giRelatedDiscontinuation: 4.8 },
  { week: 6, totalDiscontinuation: 8.8, giRelatedDiscontinuation: 5.1 },
  { week: 7, totalDiscontinuation: 9.5, giRelatedDiscontinuation: 5.6 },
  { week: 8, totalDiscontinuation: 10.1, giRelatedDiscontinuation: 5.9 },
  { week: 9, totalDiscontinuation: 10.8, giRelatedDiscontinuation: 6.3 },
  { week: 10, totalDiscontinuation: 11.3, giRelatedDiscontinuation: 6.7 },
  { week: 11, totalDiscontinuation: 11.7, giRelatedDiscontinuation: 7.0 },
  { week: 12, totalDiscontinuation: 12.2, giRelatedDiscontinuation: 7.2 },
];