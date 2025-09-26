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
    
    console.log('Received csvData for risk assessment, length:', csvData?.length);

    if (!csvData) {
      throw new Error('No CSV data provided');
    }

    const prompt = `
You are a medical data analyst tasked with assessing patient risk levels and program compliance based on survey data.

Analyze the following CSV data and provide a risk assessment and compliance calculation for each member:

${csvData}

For each member in the data, calculate:
1. Risk Level: "high", "medium", or "low" based on:
   - Weight changes (lack of progress or weight gain = higher risk)
   - BMI levels (higher BMI = higher risk)
   - Activity levels (lower activity = higher risk)
   - Medication adherence patterns
   - Survey response frequency

2. Compliance Percentage: Calculate as a percentage (0-100%) based on:
   - Survey completion rate
   - Medication adherence
   - Activity level consistency
   - Follow-up engagement

Return ONLY a JSON object in this exact format (no additional text):
{
  "members": [
    {"name": "Member Name", "risk": "high|medium|low", "compliance": "XX%"},
    ...
  ]
}

Ensure the member names exactly match those in the CSV data.
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
          { role: 'system', content: 'You are a medical data analyst. Return only valid JSON responses.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    console.log('AI Response:', aiResponse);

    // Parse the AI response as JSON
    let assessmentData;
    try {
      assessmentData = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      // Fallback: try to extract JSON from the response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        assessmentData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Invalid JSON response from AI');
      }
    }

    // Validate the response structure
    if (!assessmentData.members || !Array.isArray(assessmentData.members)) {
      throw new Error('Invalid response structure from AI');
    }

    console.log('Processed assessment data:', assessmentData);

    return new Response(JSON.stringify(assessmentData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in overall-risk-assessment function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});