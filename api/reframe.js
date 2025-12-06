export const config = {
  runtime: 'edge',
};

const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { negative_thought, context } = await req.json();
    const perplexityApiKey = process.env.PERPLEXITY_API_KEY;

    if (!perplexityApiKey) {
      return new Response(JSON.stringify({ error: 'PERPLEXITY_API_KEY is not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!negative_thought) {
      return new Response(JSON.stringify({ error: 'Missing required field: negative_thought' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
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
      const errorData = await response.text();
      console.error('Perplexity API error:', errorData);
      return new Response(JSON.stringify({ error: `Perplexity API error: ${response.status}` }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content;

    if (!aiResponse) {
      return new Response(JSON.stringify({ error: 'No response from Perplexity AI' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let jsonString = aiResponse.trim();
    const jsonMatch = jsonString.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonString = jsonMatch[1].trim();
    }
    const jsonObjectMatch = jsonString.match(/\{[\s\S]*\}/);
    if (jsonObjectMatch) {
      jsonString = jsonObjectMatch[0];
    }

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('JSON parse error. Raw response:', aiResponse);
      return new Response(JSON.stringify({ error: 'AI response was not valid JSON. Please try again.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!parsedResponse.balanced_reframe) {
      return new Response(JSON.stringify({ error: 'AI response missing required fields' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(parsedResponse), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Error in /api/reframe:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
