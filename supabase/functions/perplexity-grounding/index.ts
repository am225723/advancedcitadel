// Supabase Edge Function: perplexity-grounding
// Generates personalized grounding mantras

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
    const { context } = await req.json();
    const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');

    if (!perplexityApiKey) {
      throw new Error('PERPLEXITY_API_KEY is not set');
    }

    const systemPrompt = `You are a mindfulness and grounding expert. Generate 5 personalized grounding mantras based on the user's context.

Return ONLY valid JSON in this exact format:
{
  "mantras": [
    "Mantra 1",
    "Mantra 2",
    "Mantra 3",
    "Mantra 4",
    "Mantra 5"
  ]
}

Guidelines for mantras:
- Keep them short (5-10 words)
- Make them present-tense and affirmative
- Make them personal and relatable to the context
- Focus on safety, presence, and calm
- Examples: "I am safe in this moment", "My breath anchors me to now"

Return ONLY the JSON object, no additional text.`;

    const userPrompt = context ? `Generate grounding mantras for: ${context}` : 'Generate general grounding mantras';

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
        temperature: 0.7,
        max_tokens: 500,
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
    console.error('Error in perplexity-grounding:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
