import { parseCSV, aggregateMemberData } from "@/utils/csvParser";
import { GLP1_MOCK_DATA } from "./constants";

// Import CSV data
import diabetesCsvRaw from "@/data/diabetes-survey-data.csv?raw";

// GLP-1 Weight Management Program data (using mock data from constants)
const glp1CsvData = GLP1_MOCK_DATA;

// Use the imported CSV data for diabetes program
const diabetesCsvData = diabetesCsvRaw;

console.log("Diabetes CSV data preview:", diabetesCsvData.substring(0, 200));

const glp1Surveys = parseCSV(glp1CsvData);
const diabetesSurveys = parseCSV(diabetesCsvData);

console.log("GLP-1 parsed surveys:", glp1Surveys.length);
console.log("Diabetes parsed surveys:", diabetesSurveys.length);

export const glp1Members = aggregateMemberData(glp1Surveys);
export const diabetesMembers = aggregateMemberData(diabetesSurveys);

console.log("GLP-1 members:", glp1Members.length);
console.log("Diabetes members:", diabetesMembers.length);

// For backwards compatibility
export const surveyMembers = glp1Members;

export const programData = {
  "GLP-1 Weight Management Program": {
    members: glp1Members,
    csvData: glp1CsvData
  },
  "Diabetes Management Program": {
    members: diabetesMembers,
    csvData: diabetesCsvData
  }
};