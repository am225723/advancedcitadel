// Supabase Edge Function: perplexity-reframe-forge
// Provides AI-powered cognitive reframing using CBT techniques

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
    const { negative_thought, context } = await req.json();
    const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');

    if (!perplexityApiKey) {
      throw new Error('PERPLEXITY_API_KEY is not set');
    }

    if (!negative_thought) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: negative_thought' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const systemPrompt = `You are a CBT (Cognitive Behavioral Therapy) specialist. Analyze the negative thought and provide cognitive reframing.

Return ONLY valid JSON in this exact format:
{
  "balanced_reframe": "A more balanced perspective on the thought",
  "evidence_for": ["point1", "point2"],
  "evidence_against": ["point1", "point2"],
  "cognitive_distortions": ["distortion1", "distortion2"],
  "tiny_action": "One small actionable step"
}

Common cognitive distortions to identify:
- All-or-nothing thinking
- Overgeneralization
- Mental filter
- Discounting the positive
- Jumping to conclusions
- Catastrophizing
- Emotional reasoning
- Should statements
- Labeling
- Personalization

Return ONLY the JSON object, no additional text.`;

    const userPrompt = `Negative thought: "${negative_thought}"\n${context ? `\nContext: ${context}` : ''}`;

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
        temperature: 0.4,
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
    console.error('Error in perplexity-reframe-forge:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
