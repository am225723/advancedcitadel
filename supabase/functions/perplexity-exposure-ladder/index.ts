// Supabase Edge Function: perplexity-exposure-ladder
// Generates exposure therapy ladders for facing fears

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { fear, goal, constraints } = await req.json();
    const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');

    if (!perplexityApiKey) {
      throw new Error('PERPLEXITY_API_KEY is not set');
    }

    if (!fear || !goal) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: fear and goal' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const systemPrompt = `You are an exposure therapy specialist. Create a gradual exposure ladder to help overcome fears.

Return ONLY valid JSON in this exact format:
{
  "ladder": [
    {
      "step": 1,
      "description": "Description of the step",
      "anxiety_level": 2
    },
    ...repeat for 7-10 steps total
  ]
}

Guidelines:
- Create 7-10 progressive steps from easiest to hardest
- Start with anxiety_level 1-2 (very low anxiety)
- End with anxiety_level 9-10 (facing the actual fear/goal)
- Each step should be specific and actionable
- Steps should gradually increase in difficulty
- Steps should be realistic and achievable

Return ONLY the JSON object, no additional text.`;

    const userPrompt = `Fear: ${fear}\nGoal: ${goal}${constraints ? `\nConstraints: ${constraints}` : ''}`;

    // Call Perplexity API
    const response = await fetch(PERPLEXITY_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.5,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `Perplexity API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content;

    if (!aiResponse) {
      throw new Error('No response from Perplexity AI');
    }

    // Parse JSON response
    const parsedResponse = JSON.parse(aiResponse.trim());

    return new Response(
      JSON.stringify(parsedResponse),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in perplexity-exposure-ladder:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
