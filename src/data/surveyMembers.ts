import { parseCSV, aggregateMemberData } from "@/utils/csvParser";

// GLP-1 Weight Management Program data
const glp1CsvData = `Name,Have you been taking your GLP-1 medication as prescribed,Have you experienced any side effects from your GLP-1 medication,Please describe your symptoms so we can help you manage them.,How long have you had a prescription for a GLP-1 medication?,How many days per week have you engaged in physical activity,Is this your first time receiving a GLP-1 prescription,What is your current weight as of today?,What is your height?,Submitted At,Token
Alex Johnson,Yes,No,Energy up; tolerating medication well.,1 months,3,Yes,232 lbs,"5'9""",2024-01-15,TOKEN_0001
Alex Johnson,"No, missed a few doses.",Yes,Heart palpitations with nausea; considering stopping.,2 months,0,Yes,233 lbs,"5'9""",2024-02-14,TOKEN_0002
Alex Johnson,Yes,No,"Feeling good, appetite under control, sleeping better.",3 months,3,Yes,230 lbs,"5'9""",2024-03-15,TOKEN_0003
Alex Johnson,Yes,Yes,Heart palpitations with nausea; considering stopping.,4 months,2,Yes,232 lbs,"5'9""",2024-04-14,TOKEN_0004
Alex Johnson,Yes,No,Energy up; tolerating medication well.,5 months,6,Yes,225 lbs,"5'9""",2024-05-14,TOKEN_0005
Maria Lopez,Yes,No,Minor constipation but manageable.,1 months,3,Yes,194 lbs,"5'4""",2024-01-15,TOKEN_0006
Maria Lopez,"No, missed a few doses.",Yes,Persistent nausea and occasional vomiting; hard to keep food down.,2 months,1,Yes,195 lbs,"5'4""",2024-02-14,TOKEN_0007
Maria Lopez,Yes,Yes,Persistent nausea and occasional vomiting; hard to keep food down.,3 months,1,Yes,195 lbs,"5'4""",2024-03-15,TOKEN_0008
Maria Lopez,Yes,No,No major side effects; mild nausea in week 1 resolved.,4 months,3,Yes,189 lbs,"5'4""",2024-04-14,TOKEN_0009
Maria Lopez,Yes,No,"Feeling good, appetite under control, sleeping better.",5 months,5,Yes,182 lbs,"5'4""",2024-05-14,TOKEN_0010
Maria Lopez,Yes,No,"Feeling good, appetite under control, sleeping better.",6 months,3,Yes,174 lbs,"5'4""",2024-06-13,TOKEN_0011
Ethan Kim,Yes,Yes,Severe fatigue; struggling to exercise.,1 months,0,Yes,266 lbs,"5'10""",2024-01-15,TOKEN_0012
Ethan Kim,Yes,No,Energy up; tolerating medication well.,2 months,5,Yes,262 lbs,"5'10""",2024-02-14,TOKEN_0013
Ethan Kim,Yes,No,No major side effects; mild nausea in week 1 resolved.,3 months,5,Yes,254 lbs,"5'10""",2024-03-15,TOKEN_0014
Ethan Kim,"No, missed a few doses.",Yes,Dizziness and headaches after injections.,4 months,2,Yes,256 lbs,"5'10""",2024-04-14,TOKEN_0015
Ethan Kim,"No, missed a few doses.",Yes,Stomach cramps and diarrhea several times per week.,5 months,2,Yes,258 lbs,"5'10""",2024-05-14,TOKEN_0016
Nora Williams,Yes,Yes,Stomach cramps and diarrhea several times per week.,1 months,0,Yes,206 lbs,"5'3""",2024-01-15,TOKEN_0017
Nora Williams,Yes,No,No issues; steady progress.,2 months,3,Yes,202 lbs,"5'3""",2024-02-14,TOKEN_0018
Nora Williams,"No, missed a few doses.",Yes,Severe fatigue; struggling to exercise.,3 months,2,Yes,201 lbs,"5'3""",2024-03-15,TOKEN_0019
Nora Williams,Yes,Yes,Dizziness and headaches after injections.,4 months,0,Yes,201 lbs,"5'3""",2024-04-14,TOKEN_0020
Nora Williams,Yes,No,No issues; steady progress.,5 months,5,Yes,193 lbs,"5'3""",2024-05-14,TOKEN_0021
Nora Williams,Yes,Yes,Dizziness and headaches after injections.,6 months,1,Yes,195 lbs,"5'3""",2024-06-13,TOKEN_0022
James Carter,Yes,No,No major side effects; mild nausea in week 1 resolved.,1 months,3,Yes,257 lbs,"6'0""",2024-01-15,TOKEN_0023
James Carter,"No, missed a few doses.",Yes,Heart palpitations with nausea; considering stopping.,2 months,2,Yes,256 lbs,"6'0""",2024-02-14,TOKEN_0024
James Carter,Yes,Yes,Heart palpitations with nausea; considering stopping.,3 months,1,Yes,256 lbs,"6'0""",2024-03-15,TOKEN_0025
James Carter,Yes,No,No major side effects; mild nausea in week 1 resolved.,4 months,3,Yes,248 lbs,"6'0""",2024-04-14,TOKEN_0026
James Carter,Yes,No,Energy up; tolerating medication well.,5 months,5,Yes,240 lbs,"6'0""",2024-05-14,TOKEN_0027
James Carter,Yes,Yes,Stomach cramps and diarrhea several times per week.,6 months,1,Yes,241 lbs,"6'0""",2024-06-13,TOKEN_0028
James Carter,Yes,No,No major side effects; mild nausea in week 1 resolved.,7 months,4,Yes,234 lbs,"6'0""",2024-07-13,TOKEN_0029
James Carter,Yes,No,No issues; steady progress.,8 months,5,Yes,226 lbs,"6'0""",2024-08-12,TOKEN_0030
Sophia Patel,Yes,No,"Feeling good, appetite under control, sleeping better.",1 months,4,Yes,205 lbs,"5'6""",2024-01-15,TOKEN_0031
Sophia Patel,Yes,No,Energy up; tolerating medication well.,2 months,3,Yes,198 lbs,"5'6""",2024-02-14,TOKEN_0032
Sophia Patel,"No, missed a few doses.",Yes,Dizziness and headaches after injections.,3 months,1,Yes,198 lbs,"5'6""",2024-03-15,TOKEN_0033
Sophia Patel,Yes,Yes,Severe fatigue; struggling to exercise.,4 months,0,Yes,199 lbs,"5'6""",2024-04-14,TOKEN_0034
Sophia Patel,Yes,No,Minor constipation but manageable.,5 months,4,Yes,195 lbs,"5'6""",2024-05-14,TOKEN_0035
Sophia Patel,Yes,No,No issues; steady progress.,6 months,4,Yes,190 lbs,"5'6""",2024-06-13,TOKEN_0036
Sophia Patel,Yes,No,No issues; steady progress.,7 months,6,Yes,186 lbs,"5'6""",2024-07-13,TOKEN_0037`;

// Diabetes Management Program data
const diabetesCsvData = `Name,How well have you been managing your blood sugar levels,Have you experienced any diabetic complications,Please describe any symptoms you've been experiencing,How long have you been on your current diabetes medication regimen?,How many days per week have you engaged in physical activity,Is this your first time with this medication regimen,What is your current weight as of today?,What is your height?,Submitted At,Token
Robert Chen,Well controlled,No,Blood sugar stable; feeling energetic.,6 months,4,No,198 lbs,"5'11""",2024-01-15,TOKEN_1001
Robert Chen,Poorly controlled,Yes,Frequent urination and increased thirst.,7 months,2,No,201 lbs,"5'11""",2024-02-14,TOKEN_1002
Robert Chen,Well controlled,No,Energy levels improved; sleeping better.,8 months,5,No,196 lbs,"5'11""",2024-03-15,TOKEN_1003
Robert Chen,Moderately controlled,Yes,Occasional dizziness and fatigue.,9 months,3,No,199 lbs,"5'11""",2024-04-14,TOKEN_1004
Sarah Martinez,Well controlled,No,No major issues; maintaining target levels.,3 months,6,Yes,165 lbs,"5'5""",2024-01-15,TOKEN_1005
Sarah Martinez,Moderately controlled,Yes,Some episodes of low blood sugar.,4 months,4,Yes,162 lbs,"5'5""",2024-02-14,TOKEN_1006
Sarah Martinez,Well controlled,No,Feeling great; diet and exercise routine working well.,5 months,6,Yes,158 lbs,"5'5""",2024-03-15,TOKEN_1007
Sarah Martinez,Well controlled,No,Stable glucose readings; increased energy.,6 months,5,Yes,155 lbs,"5'5""",2024-04-14,TOKEN_1008
David Thompson,Poorly controlled,Yes,Blurred vision and numbness in feet.,12 months,1,No,245 lbs,"6'2""",2024-01-15,TOKEN_1009
David Thompson,Moderately controlled,Yes,Still experiencing peripheral neuropathy symptoms.,13 months,2,No,248 lbs,"6'2""",2024-02-14,TOKEN_1010
David Thompson,Moderately controlled,No,Symptoms improving with new medication adjustment.,14 months,3,No,242 lbs,"6'2""",2024-03-15,TOKEN_1011
David Thompson,Well controlled,No,Much better control; symptoms largely resolved.,15 months,4,No,238 lbs,"6'2""",2024-04-14,TOKEN_1012
Lisa Wang,Well controlled,No,Excellent control; very satisfied with progress.,2 months,5,Yes,142 lbs,"5'3""",2024-01-15,TOKEN_1013
Lisa Wang,Well controlled,No,Maintaining excellent glucose levels.,3 months,6,Yes,139 lbs,"5'3""",2024-02-14,TOKEN_1014
Lisa Wang,Moderately controlled,Yes,Had a few high glucose episodes after meals.,4 months,4,Yes,141 lbs,"5'3""",2024-03-15,TOKEN_1015
Lisa Wang,Well controlled,No,Back on track; adjusted meal timing.,5 months,5,Yes,138 lbs,"5'3""",2024-04-14,TOKEN_1016
Michael Rodriguez,Moderately controlled,Yes,Frequent low blood sugar episodes.,8 months,3,No,189 lbs,"5'8""",2024-01-15,TOKEN_1017
Michael Rodriguez,Poorly controlled,Yes,Severe fatigue and mood swings.,9 months,1,No,192 lbs,"5'8""",2024-02-14,TOKEN_1018
Michael Rodriguez,Well controlled,No,Much improved with medication adjustment.,10 months,4,No,186 lbs,"5'8""",2024-03-15,TOKEN_1019
Michael Rodriguez,Well controlled,No,Feeling much better; energy levels up.,11 months,5,No,183 lbs,"5'8""",2024-04-14,TOKEN_1020`;

const glp1Surveys = parseCSV(glp1CsvData);
const diabetesSurveys = parseCSV(diabetesCsvData);

export const glp1Members = aggregateMemberData(glp1Surveys);
export const diabetesMembers = aggregateMemberData(diabetesSurveys);

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