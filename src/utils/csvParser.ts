export interface SurveyResponse {
  name: string;
  takingMedication: string;
  hasSideEffects: string;
  symptoms: string;
  prescriptionDuration: string;
  activityDays: number;
  firstTime: string;
  currentWeight: string;
  height: string;
  submittedAt: string;
  token: string;
}

export interface MemberProfile {
  id: string;
  name: string;
  height: string;
  totalSurveys: number;
  lastSurveyDate: string;
  surveyCompliance: number;
  currentWeight: number;
  initialWeight: number;
  weightChange: number;
  riskLevel: "High" | "Medium" | "Low";
  lastMedicationCompliance: string;
  lastSideEffects: string;
  averageActivity: number;
  prescriptionDuration: string;
}

export function parseCSV(csvContent: string): SurveyResponse[] {
  const lines = csvContent.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  
  return lines.slice(1).map(line => {
    const values = parseCSVLine(line);
    return {
      name: values[0]?.trim() || '',
      takingMedication: values[1]?.trim() || '',
      hasSideEffects: values[2]?.trim() || '',
      symptoms: values[3]?.trim() || '',
      prescriptionDuration: values[4]?.trim() || '',
      activityDays: parseInt(values[5]) || 0,
      firstTime: values[6]?.trim() || '',
      currentWeight: values[7]?.trim() || '',
      height: values[8]?.trim() || '',
      submittedAt: values[9]?.trim() || '',
      token: values[10]?.trim() || '',
    };
  });
}

function parseCSVLine(line: string): string[] {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current);
  return result;
}

export function aggregateMemberData(surveys: SurveyResponse[]): MemberProfile[] {
  const memberMap = new Map<string, SurveyResponse[]>();
  
  // Group surveys by member name
  surveys.forEach(survey => {
    if (!memberMap.has(survey.name)) {
      memberMap.set(survey.name, []);
    }
    memberMap.get(survey.name)!.push(survey);
  });
  
  // Process each member's data
  return Array.from(memberMap.entries()).map(([name, memberSurveys]) => {
    // Sort surveys by date
    memberSurveys.sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime());
    
    const firstSurvey = memberSurveys[0];
    const lastSurvey = memberSurveys[memberSurveys.length - 1];
    
    const initialWeight = parseWeight(firstSurvey.currentWeight);
    const currentWeight = parseWeight(lastSurvey.currentWeight);
    const weightChange = initialWeight - currentWeight; // Positive = weight loss
    
    // Calculate compliance based on recent surveys
    const recentSurveys = memberSurveys.slice(-3); // Last 3 surveys
    const complianceRate = recentSurveys.filter(s => s.takingMedication === 'Yes').length / recentSurveys.length * 100;
    
    // Calculate average activity
    const avgActivity = memberSurveys.reduce((acc, s) => acc + s.activityDays, 0) / memberSurveys.length;
    
    // Calculate risk level
    const riskLevel = calculateRiskLevel(complianceRate, weightChange, lastSurvey.hasSideEffects, avgActivity);
    
    return {
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      height: lastSurvey.height,
      totalSurveys: memberSurveys.length,
      lastSurveyDate: formatDate(lastSurvey.submittedAt),
      surveyCompliance: Math.round(complianceRate),
      currentWeight,
      initialWeight,
      weightChange: Math.round(weightChange * 10) / 10,
      riskLevel,
      lastMedicationCompliance: lastSurvey.takingMedication,
      lastSideEffects: lastSurvey.hasSideEffects,
      averageActivity: Math.round(avgActivity * 10) / 10,
      prescriptionDuration: lastSurvey.prescriptionDuration,
    };
  });
}

function parseWeight(weightStr: string): number {
  const match = weightStr.match(/(\d+)/);
  return match ? parseInt(match[1]) : 0;
}

function calculateRiskLevel(compliance: number, weightChange: number, hasSideEffects: string, activity: number): "High" | "Medium" | "Low" {
  let riskScore = 0;
  
  // Compliance risk (40% weight)
  if (compliance < 60) riskScore += 4;
  else if (compliance < 80) riskScore += 2;
  
  // Weight change risk (30% weight)  
  if (weightChange < -2) riskScore += 3; // Weight gain
  else if (weightChange < 5) riskScore += 1; // Minimal loss
  
  // Side effects risk (20% weight)
  if (hasSideEffects === 'Yes') riskScore += 2;
  
  // Activity risk (10% weight)
  if (activity < 2) riskScore += 1;
  
  if (riskScore >= 6) return "High";
  if (riskScore >= 3) return "Medium";
  return "Low";
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
}