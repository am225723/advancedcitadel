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
    const { systemPrompt, userContext, messageHistory } = req.body;
    const perplexityApiKey = process.env.PERPLEXITY_API_KEY;

    if (!perplexityApiKey) {
      return res.status(500).json({ error: 'PERPLEXITY_API_KEY is not configured' });
    }

    if (!systemPrompt || !messageHistory || !Array.isArray(messageHistory) || messageHistory.length === 0) {
      return res.status(400).json({ error: 'Missing required fields: systemPrompt and messageHistory (non-empty array)' });
    }

    const messages = [
      { role: 'system', content: systemPrompt },
      ...messageHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    ];

    if (userContext && messageHistory.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'user') {
        lastMessage.content += `\n\n[User Context: Level ${userContext.level || 1}, ${userContext.completedExercises || 0} exercises completed]`;
      }
    }

    const response = await fetch(PERPLEXITY_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar-pro',
        messages: messages,
        temperature: 0.7,
        max_tokens: 2000,
        top_p: 0.9,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Perplexity API error:', errorData);
      return res.status(response.status).json({ error: `Perplexity API error: ${response.status}` });
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;

    if (!aiResponse) {
      return res.status(500).json({ error: 'No response from Perplexity AI' });
    }

    return res.status(200).json({
      response: aiResponse,
      model: data.model,
      usage: data.usage
    });
  } catch (error) {
    console.error('Error in /api/guide-chat:', error);
    return res.status(500).json({ error: error.message });
  }
}
