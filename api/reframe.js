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
      console.error('PERPLEXITY_API_KEY is not configured');
      return res.status(500).json({ error: 'API key not configured. Please add PERPLEXITY_API_KEY in Vercel Environment Variables.' });
    }

    if (!negative_thought) {
      return res.status(400).json({ error: 'Missing required field: negative_thought' });
    }

    const systemPrompt = `You are a CBT (Cognitive Behavioral Therapy) specialist. Analyze the negative thought and provide cognitive reframing.

You MUST respond with ONLY a valid JSON object. No explanations, no markdown, no extra text.

Required JSON structure:
{"balanced_reframe":"A more balanced perspective","evidence_for":["point1","point2"],"evidence_against":["point1","point2"],"cognitive_distortions":["distortion1"],"tiny_action":"One small step"}

Common cognitive distortions: All-or-nothing thinking, Overgeneralization, Mental filter, Discounting the positive, Jumping to conclusions, Catastrophizing, Emotional reasoning, Should statements, Labeling, Personalization.

IMPORTANT: Output ONLY the JSON object. No other text.`;

    const userPrompt = `Analyze and reframe this thought: "${negative_thought}"${context ? ` Context: ${context}` : ''}`;

    console.log('Calling Perplexity API...');
    
    const response = await fetch(PERPLEXITY_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Perplexity API error:', response.status, errorText);
      return res.status(response.status).json({ 
        error: `Perplexity API error (${response.status}): ${errorText.substring(0, 200)}` 
      });
    }

    const data = await response.json();
    console.log('Perplexity response received');
    
    const aiResponse = data.choices?.[0]?.message?.content;

    if (!aiResponse) {
      console.error('Empty AI response:', JSON.stringify(data));
      return res.status(500).json({ error: 'No response from AI service' });
    }

    console.log('Raw AI response:', aiResponse.substring(0, 200));

    // Try to extract JSON from various formats
    let jsonString = aiResponse.trim();
    
    // Remove markdown code blocks
    jsonString = jsonString.replace(/```json\s*/gi, '').replace(/```\s*/g, '');
    
    // Find JSON object
    const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonString = jsonMatch[0];
    }

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('JSON parse failed. Cleaned string:', jsonString.substring(0, 300));
      
      // Fallback: create a basic response from the text
      return res.status(200).json({
        balanced_reframe: aiResponse.substring(0, 500),
        evidence_for: ["The AI provided a text response instead of structured data"],
        evidence_against: ["Consider the alternative perspectives in the response"],
        cognitive_distortions: ["Review the response for identified patterns"],
        tiny_action: "Re-read the balanced perspective above"
      });
    }

    // Ensure required fields exist
    const result = {
      balanced_reframe: parsedResponse.balanced_reframe || "A more balanced view of this situation",
      evidence_for: Array.isArray(parsedResponse.evidence_for) ? parsedResponse.evidence_for : [],
      evidence_against: Array.isArray(parsedResponse.evidence_against) ? parsedResponse.evidence_against : [],
      cognitive_distortions: Array.isArray(parsedResponse.cognitive_distortions) ? parsedResponse.cognitive_distortions : [],
      tiny_action: parsedResponse.tiny_action || "Take a moment to reflect on this new perspective"
    };

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error in /api/reframe:', error);
    return res.status(500).json({ error: `Server error: ${error.message}` });
  }
}
