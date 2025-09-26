import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { csvData } = await req.json();
    console.log(`Received csvData for member risk assessment, length: ${csvData.length}`);

    const prompt = `
You are a healthcare AI analyzing patient data for a GLP-1 weight management program. 
Analyze the provided CSV data for a single member and provide a comprehensive risk assessment.

CSV Data:
${csvData}

Provide a detailed analysis in the following JSON format:
{
  "patientName": "Patient's name from the data",
  "overallRiskLevel": "low/medium/high based on overall assessment",
  "medicationAdherence": {
    "pattern": "Description of adherence pattern over time",
    "concerns": "Any adherence-related concerns identified",
    "recommendations": "Specific recommendations for improving adherence"
  },
  "sideEffects": {
    "severityTrend": "Trend of side effect severity over time",
    "progression": "How side effects have progressed",
    "recommendations": "Recommendations for managing side effects"
  },
  "weightTrends": {
    "baselineWeight": "Starting weight from data",
    "currentWeight": "Most recent weight from data", 
    "totalChange": "Total weight change calculation",
    "pattern": "Pattern of weight change over time",
    "recommendations": "Weight management recommendations"
  },
  "activityLevels": {
    "pattern": "Pattern of physical activity over time",
    "correlation": "Correlation between activity and other metrics",
    "recommendations": "Activity-related recommendations"
  },
  "symptomEvolution": {
    "initial": "Initial symptoms/status",
    "deterioration": "Any periods of deterioration",
    "improvement": "Any periods of improvement",
    "recommendations": "Symptom management recommendations"
  },
  "outreachUrgency": "IMMEDIATE/MODERATE/LOW based on risk level and concerning patterns"
}

Base the overall risk level and outreach urgency on:
- High: Severe side effects, poor adherence, concerning symptoms, weight gain
- Medium: Moderate side effects, occasional missed doses, stable progress
- Low: Good adherence, minimal side effects, positive progress

Provide specific, actionable recommendations based on the actual data patterns.
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are a healthcare AI assistant specializing in GLP-1 medication management and patient risk assessment. Provide detailed, clinical-grade analysis.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    console.log(`AI Response: ${aiResponse}`);

    // Parse the JSON response from AI
    let assessmentData;
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        assessmentData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No valid JSON found in AI response');
      }
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      throw new Error('Failed to parse AI response as JSON');
    }

    console.log(`Processed assessment data: ${JSON.stringify(assessmentData, null, 2)}`);

    return new Response(JSON.stringify(assessmentData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error in member-risk-assessment function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});