// Supabase Edge Function: perplexity-reframe-forge
// This function uses Perplexity AI to analyze negative thoughts and provide cognitive reframing

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
    const { negative_thought, context } = await req.json()

    if (!negative_thought || typeof negative_thought !== 'string' || !negative_thought.trim()) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: negative_thought (must be a non-empty string)' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Build the system prompt for cognitive reframing
    const systemPrompt = `You are a compassionate CBT (Cognitive Behavioral Therapy) therapist specializing in cognitive reframing. Your role is to help users challenge and reframe their negative thoughts using evidence-based techniques.

When analyzing a negative thought, you must respond with a valid JSON object (and ONLY the JSON object, no additional text) in this exact format:
{
  "balanced_reframe": "A more balanced, realistic perspective on the thought",
  "evidence_for": ["Point 1 supporting the thought", "Point 2 supporting the thought"],
  "evidence_against": ["Point 1 challenging the thought", "Point 2 challenging the thought", "Point 3 challenging the thought"],
  "cognitive_distortions": ["Distortion name 1", "Distortion name 2"],
  "tiny_action": "One small, concrete actionable step",
  "safety_note": "Optional warning for severe cases or leave empty string"
}

Common cognitive distortions to identify:
- All-or-nothing thinking
- Overgeneralization
- Mental filter (focusing on negatives)
- Discounting the positive
- Jumping to conclusions
- Magnification/Catastrophizing
- Emotional reasoning
- Should statements
- Labeling
- Personalization

Guidelines:
1. Be warm and validating while gently challenging unhelpful thoughts
2. Provide 2-3 evidence points for each side
3. Keep the balanced reframe realistic and actionable
4. Make the tiny action specific and achievable
5. Only include safety_note if the thought suggests serious mental health concerns (suicidal ideation, severe depression, etc.)
6. Return ONLY valid JSON, no markdown, no code blocks, no additional text`

    // Build the user message
    let userMessage = `Negative thought: "${negative_thought}"`
    if (context && context.trim()) {
      userMessage += `\n\nContext: ${context.trim()}`
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
            content: userMessage
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

    // Validate the response structure
    if (!analysisResult.balanced_reframe || !Array.isArray(analysisResult.evidence_for) || 
        !Array.isArray(analysisResult.evidence_against) || !Array.isArray(analysisResult.cognitive_distortions) ||
        !analysisResult.tiny_action) {
      throw new Error('Invalid response structure from AI')
    }

    // Ensure safety_note is optional
    if (!analysisResult.safety_note) {
      delete analysisResult.safety_note
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
    console.error('Error in perplexity-reframe-forge function:', error)
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
