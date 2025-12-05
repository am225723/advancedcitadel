// Supabase Edge Function: guide-persona-chat
// This function handles AI responses with Dark Souls guide personas using Perplexity AI

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    const { systemPrompt, userContext, messageHistory } = await req.json()

    if (!systemPrompt || !messageHistory) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: systemPrompt and messageHistory' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
    
    if (!Array.isArray(messageHistory) || messageHistory.length === 0) {
      return new Response(
        JSON.stringify({ error: 'messageHistory must be a non-empty array' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Build the messages array for Perplexity
    const messages = [
      {
        role: 'system',
        content: systemPrompt
      },
      ...messageHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    ]

    // Add user context to the last user message if provided
    if (userContext && messageHistory.length > 0) {
      const lastMessage = messages[messages.length - 1]
      if (lastMessage.role === 'user') {
        lastMessage.content += `\n\n[User Context: Level ${userContext.level || 1}, ${userContext.completedExercises || 0} exercises completed]`
      }
    }

    // Call Perplexity API
    const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar-pro', // Advanced search model (replaces deprecated llama-3.1-sonar-large-128k-online)
        messages: messages,
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

    // Return the response
    return new Response(
      JSON.stringify({ 
        response: aiResponse,
        model: data.model,
        usage: data.usage 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in guide-persona-chat function:', error)
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