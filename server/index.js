import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

app.post('/api/reframe', async (req, res) => {
  try {
    const { negative_thought, context } = req.body;
    const perplexityApiKey = process.env.PERPLEXITY_API_KEY;

    if (!perplexityApiKey) {
      return res.status(500).json({ error: 'PERPLEXITY_API_KEY is not set' });
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

    res.json(parsedResponse);
  } catch (error) {
    console.error('Error in /api/reframe:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/guide-chat', async (req, res) => {
  try {
    const { systemPrompt, userContext, messageHistory } = req.body;
    const perplexityApiKey = process.env.PERPLEXITY_API_KEY;

    if (!perplexityApiKey) {
      return res.status(500).json({ error: 'PERPLEXITY_API_KEY is not set' });
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

    res.json({
      response: aiResponse,
      model: data.model,
      usage: data.usage
    });
  } catch (error) {
    console.error('Error in /api/guide-chat:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', hasApiKey: !!process.env.PERPLEXITY_API_KEY });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`API server running on port ${PORT}`);
});
