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
  programCompliance: number;
  currentWeight: number;
  initialWeight: number;
  weightChange: number;
  bmi: number;
  riskLevel: "High" | "Medium" | "Low";
  lastMedicationCompliance: string;
  lastSideEffects: string;
  averageActivity: number;
  prescriptionDuration: string;
  // Additional detailed information
  age: number;
  gender: string;
  glp1Medication: string;
  fillHistory: Array<{date: string; medication: string; quantity: string}>;
  otherMedications: string[];
  paExpirationDate: string;
  memberGoals: string[];
  staffInteractions: Array<{date: string; type: string; notes: string}>;
  surveyResponses: SurveyResponse[];
  weightHistory: Array<{date: string; weight: number}>;
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
    
    // Calculate BMI
    const heightInInches = parseHeight(lastSurvey.height);
    const bmi = calculateBMI(currentWeight, heightInInches);
    
    // Calculate risk level
    const riskLevel = calculateRiskLevel(complianceRate, weightChange, lastSurvey.hasSideEffects, avgActivity);
    
    // Generate weight history from surveys
    const weightHistory = memberSurveys.map(survey => ({
      date: formatDate(survey.submittedAt),
      weight: parseWeight(survey.currentWeight)
    }));

    // Mock additional data for detailed view
    const glp1Medications = ['Semaglutide', 'Liraglutide', 'Dulaglutide', 'Exenatide'];
    const genders = ['Male', 'Female'];
    const goalOptions = ['Lose 20 lbs', 'Improve energy', 'Better glucose control', 'Reduce medication side effects'];
    
    return {
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      height: lastSurvey.height,
      totalSurveys: memberSurveys.length,
      lastSurveyDate: formatDate(lastSurvey.submittedAt),
      programCompliance: Math.round(complianceRate),
      currentWeight,
      initialWeight,
      weightChange: Math.round(weightChange * 10) / 10,
      bmi: Math.round(bmi * 10) / 10,
      riskLevel,
      lastMedicationCompliance: lastSurvey.takingMedication,
      lastSideEffects: lastSurvey.hasSideEffects,
      averageActivity: Math.round(avgActivity * 10) / 10,
      prescriptionDuration: lastSurvey.prescriptionDuration,
      // Additional detailed information
      age: Math.floor(Math.random() * 30) + 30, // Random age between 30-60
      gender: genders[Math.floor(Math.random() * genders.length)],
      glp1Medication: glp1Medications[Math.floor(Math.random() * glp1Medications.length)],
      fillHistory: [
        { date: formatDate(firstSurvey.submittedAt), medication: 'Semaglutide', quantity: '30 day supply' },
        { date: formatDate(lastSurvey.submittedAt), medication: 'Semaglutide', quantity: '30 day supply' }
      ],
      otherMedications: ['Metformin', 'Lisinopril'].slice(0, Math.floor(Math.random() * 3)),
      paExpirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US'),
      memberGoals: goalOptions.slice(0, Math.floor(Math.random() * 3) + 1),
      staffInteractions: [
        { date: formatDate(lastSurvey.submittedAt), type: 'Check-in Call', notes: 'Patient reports feeling well, no new side effects' },
        { date: formatDate(firstSurvey.submittedAt), type: 'Initial Consultation', notes: 'Started GLP-1 therapy, discussed expectations' }
      ],
      surveyResponses: memberSurveys,
      weightHistory
    };
  });
}

function parseWeight(weightStr: string): number {
  // Parse weight like "232 lbs" - extract number before "lbs"
  const match = weightStr.match(/(\d+(?:\.\d+)?)\s*lbs?/i);
  return match ? parseFloat(match[1]) : 0;
}

function parseHeight(heightStr: string): number {
  // Parse height like "5'9"" - extract feet and inches
  const match = heightStr.match(/(\d+)'(\d+)"/);
  if (match) {
    const feet = parseInt(match[1]);
    const inches = parseInt(match[2]);
    return feet * 12 + inches;
  }
  return 0;
}

function calculateBMI(weightInPounds: number, heightInInches: number): number {
  if (heightInInches === 0) return 0;
  return (weightInPounds / (heightInInches * heightInInches)) * 703;
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