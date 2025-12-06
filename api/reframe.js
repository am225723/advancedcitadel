const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { negative_thought, context } = req.body;
    const perplexityApiKey = process.env.PERPLEXITY_API_KEY;

    if (!perplexityApiKey) {
      return res.status(500).json({ error: 'PERPLEXITY_API_KEY is not configured' });
    }

    if (!negative_thought) {
      return res.status(400).json({ error: 'Missing required field: negative_thought' });
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
      return res.status(response.status).json({ error: `Perplexity API error: ${response.status}` });
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content;

    if (!aiResponse) {
      return res.status(500).json({ error: 'No response from Perplexity AI' });
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
      return res.status(500).json({ error: 'AI response was not valid JSON. Please try again.' });
    }

    if (!parsedResponse.balanced_reframe) {
      return res.status(500).json({ error: 'AI response missing required fields' });
    }

    return res.status(200).json(parsedResponse);
  } catch (error) {
    console.error('Error in /api/reframe:', error);
    return res.status(500).json({ error: error.message });
  }
}
