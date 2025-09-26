import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { csvData } = await req.json();
    console.log('Received csvData for summarization, length:', csvData?.length);

    if (!csvData) {
      throw new Error('csvData is required');
    }

    // Call OpenAI API to summarize the CSV data
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a healthcare data analyst. Analyze the provided CSV data and create a comprehensive summary that includes:

1. Program Overview (total participants, data collection period)
2. Key Demographics and Baseline Characteristics
3. Medication Adherence Patterns
4. Side Effects Analysis (frequency, severity, trends)
5. Weight Loss Outcomes
6. Physical Activity Trends
7. Key Insights and Clinical Observations
8. Risk Factors and Recommendations

Provide specific statistics, percentages, and actionable insights. Format your response in clear sections with bullet points for easy reading.`
          },
          {
            role: 'user',
            content: `Please analyze this healthcare survey data and provide a comprehensive summary:\n\n${csvData}`
          }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${openAIResponse.status} ${errorText}`);
    }

    const openAIResult = await openAIResponse.json();
    const summary = openAIResult.choices[0]?.message?.content;

    if (!summary) {
      throw new Error('No summary generated from OpenAI API');
    }

    console.log('Generated summary, length:', summary.length);

    return new Response(JSON.stringify({ summary }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('Error in csv-summarizer function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
};

serve(handler);