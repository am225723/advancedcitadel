// Supabase Edge Function: perplexity-journal-ai
// This function uses Perplexity AI to analyze journal entries and provide insights

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get Perplexity API key from environment
    const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY')
    if (!PERPLEXITY_API_KEY) {
      throw new Error('PERPLEXITY_API_KEY is not set')
    }

    // Parse request body
    const { content, mode } = await req.json()

    if (!content || typeof content !== 'string' || !content.trim()) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: content (must be a non-empty string)' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const validModes = ['summarize', 'insights', 'next_steps', 'feelings', 'mechanic_question']
    if (!mode || !validModes.includes(mode)) {
      return new Response(
        JSON.stringify({ error: `Invalid mode. Must be one of: ${validModes.join(', ')}` }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Build the system prompt based on the mode
    let systemPrompt = ''
    let expectedFormat = ''

    switch (mode) {
      case 'summarize':
        systemPrompt = `You are a thoughtful journal analyst. Summarize the user's journal entry in a concise, compassionate way that captures the main themes and emotions.

Respond with ONLY a valid JSON object (no markdown, no code blocks):
{
  "summary": "A concise 2-3 sentence summary of the entry"
}`
        expectedFormat = 'summary'
        break

      case 'insights':
        systemPrompt = `You are a perceptive journal analyst. Identify 3-5 key insights, patterns, or observations from the user's journal entry. Focus on emotional patterns, recurring themes, growth opportunities, or important realizations.

Respond with ONLY a valid JSON object (no markdown, no code blocks):
{
  "insights": ["Insight 1", "Insight 2", "Insight 3"]
}`
        expectedFormat = 'insights'
        break

      case 'next_steps':
        systemPrompt = `You are a practical life coach. Based on the user's journal entry, suggest 3-5 specific, actionable next steps they could take. Make suggestions realistic, achievable, and directly related to what they've written about.

Respond with ONLY a valid JSON object (no markdown, no code blocks):
{
  "actions": ["Action 1", "Action 2", "Action 3"]
}`
        expectedFormat = 'actions'
        break

      case 'feelings':
        systemPrompt = `You are an emotionally intelligent therapist. Analyze the user's journal entry to identify emotions, their intensity, themes, and any somatic (body-based) cues mentioned.

Respond with ONLY a valid JSON object (no markdown, no code blocks):
{
  "primary_emotions": ["Main emotion 1", "Main emotion 2"],
  "secondary_emotions": ["Secondary emotion 1", "Secondary emotion 2"],
  "intensity": 7,
  "themes": ["Theme 1", "Theme 2"],
  "somatic_cues": ["Body sensation 1", "Body sensation 2"]
}

Notes:
- primary_emotions: The main emotions expressed (2-3 max)
- secondary_emotions: Underlying or subtle emotions (2-3 max)
- intensity: A number from 1-10 representing overall emotional intensity
- themes: Recurring emotional or situational themes
- somatic_cues: Any mentioned physical sensations, body feelings, or tension`
        expectedFormat = 'feelings'
        break

      case 'mechanic_question':
        systemPrompt = `You are a skilled therapist helping someone explore their thoughts more deeply. Based on the user's journal entry, identify 3-5 key insights or thought-provoking observations that could help them understand themselves better.

Respond with ONLY a valid JSON object (no markdown, no code blocks):
{
  "insights": ["Insight 1", "Insight 2", "Insight 3"]
}`
        expectedFormat = 'mechanic_insights'
        break
    }

    // Call Perplexity API
    const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-large-128k-online',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: `Journal entry:\n\n${content.trim()}`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        top_p: 0.9,
        stream: false,
      }),
    })

    if (!perplexityResponse.ok) {
      const errorData = await perplexityResponse.text()
      console.error('Perplexity API error:', errorData)
      throw new Error(`Perplexity API error: ${perplexityResponse.status} - ${errorData}`)
    }

    const data = await perplexityResponse.json()
    
    // Extract the response
    const aiResponse = data.choices?.[0]?.message?.content

    if (!aiResponse) {
      throw new Error('No response from Perplexity AI')
    }

    // Parse the JSON response
    let analysisResult
    try {
      // Try to parse the response directly
      analysisResult = JSON.parse(aiResponse)
    } catch (parseError) {
      // If parsing fails, try to extract JSON from markdown code blocks
      const jsonMatch = aiResponse.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/)
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[1])
      } else {
        // Try to find JSON object in the response
        const jsonObjectMatch = aiResponse.match(/\{[\s\S]*\}/)
        if (jsonObjectMatch) {
          analysisResult = JSON.parse(jsonObjectMatch[0])
        } else {
          throw new Error('Failed to parse AI response as JSON')
        }
      }
    }

    // Validate the response structure based on mode
    let isValid = false
    switch (mode) {
      case 'summarize':
        isValid = typeof analysisResult.summary === 'string'
        break
      case 'insights':
      case 'mechanic_question':
        isValid = Array.isArray(analysisResult.insights)
        break
      case 'next_steps':
        isValid = Array.isArray(analysisResult.actions)
        break
      case 'feelings':
        isValid = Array.isArray(analysisResult.primary_emotions) &&
                  Array.isArray(analysisResult.secondary_emotions) &&
                  typeof analysisResult.intensity === 'number' &&
                  Array.isArray(analysisResult.themes) &&
                  Array.isArray(analysisResult.somatic_cues)
        break
    }

    if (!isValid) {
      throw new Error('Invalid response structure from AI')
    }

    // Return the structured response
    return new Response(
      JSON.stringify(analysisResult),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in perplexity-journal-ai function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        details: error.toString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
