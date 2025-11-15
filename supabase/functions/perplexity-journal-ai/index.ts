// Supabase Edge Function: perplexity-journal-ai
// Provides AI-powered analysis of journal entries

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
    const { content, mode } = await req.json();
    const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');

    if (!perplexityApiKey) {
      throw new Error('PERPLEXITY_API_KEY is not set');
    }

    if (!content || !mode) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: content and mode' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Build prompt based on mode
    let systemPrompt = '';
    let userPrompt = '';

    if (mode === 'feelings') {
      systemPrompt = `You are a therapeutic AI assistant specialized in emotional analysis. Analyze the journal entry and identify emotions with precision.

Return ONLY valid JSON in this exact format:
{
  "primary_emotions": ["emotion1", "emotion2"],
  "secondary_emotions": ["emotion3", "emotion4"],
  "intensity": 7,
  "themes": ["theme1", "theme2"],
  "somatic_cues": ["cue1", "cue2"]
}

Rules:
- primary_emotions: 2-3 main emotions (e.g., "anxiety", "sadness", "hope")
- secondary_emotions: 2-3 underlying emotions
- intensity: number from 1-10
- themes: 2-3 recurring themes or patterns
- somatic_cues: 2-3 physical sensations mentioned
- Return ONLY the JSON object, no additional text`;

      userPrompt = `Analyze this journal entry for emotional content:\n\n${content}`;

    } else if (mode === 'insights') {
      systemPrompt = `You are a therapeutic AI assistant. Provide 3-5 key insights about this journal entry.

Return ONLY valid JSON: { "insights": ["insight1", "insight2", ...] }`;
      userPrompt = content;

    } else if (mode === 'next_steps') {
      systemPrompt = `You are a therapeutic AI assistant. Suggest 3-5 actionable next steps based on this journal entry.

Return ONLY valid JSON: { "actions": ["action1", "action2", ...] }`;
      userPrompt = content;

    } else if (mode === 'summarize') {
      systemPrompt = `You are a therapeutic AI assistant. Provide a concise 2-3 sentence summary.

Return ONLY valid JSON: { "summary": "your summary here" }`;
      userPrompt = content;

    } else {
      throw new Error(`Invalid mode: ${mode}`);
    }

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
        temperature: 0.3,
        max_tokens: 1000,
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
    console.error('Error in perplexity-journal-ai:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
