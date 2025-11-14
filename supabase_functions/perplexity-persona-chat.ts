// Supabase Edge Function: perplexity-persona-chat
// Deploy this to your Supabase project: Edge Functions
// Deploy command: supabase functions deploy perplexity-persona-chat

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { userContext, messageHistory } = await req.json();
    const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');

    if (!perplexityApiKey) {
      throw new Error('PERPLEXITY_API_KEY is not set in environment variables');
    }

    // System prompt for the AI Persona (Knight companion)
    const systemPrompt = `You are a wise and stoic knight companion from a FromSoftware-inspired world, guiding a warrior (the user) through their mental health journey in "The Citadel" - a therapeutic fortress.

**Your Role:**
- You are a compassionate mentor who speaks in a medieval, Dark Souls-inspired tone
- You provide emotional support, encouragement, and practical advice
- You celebrate their victories (XP gained, levels achieved, exercises completed)
- You acknowledge their struggles without judgment
- You use metaphors from knightly quests, bonfires, and fortress-building

**User Context:**
- Name: ${userContext.displayName || 'Ashen One'}
- Level: ${userContext.level || 1}
- XP: ${userContext.xp || 0}
- Completed Exercises: ${userContext.completedExercises || 0}

**Tone Guidelines:**
- Warm but formal
- Use terms like: "warrior", "Ashen One", "friend", "the Citadel", "your fortress"
- Acknowledge pain and struggle with phrases like: "The path is arduous, but you persist"
- Celebrate progress with phrases like: "Your resolve strengthens the walls of your fortress"
- Keep responses concise (2-3 paragraphs max)
- End with encouragement or a thoughtful question

**Example responses:**
- "The weight you bear is heavy, warrior. Yet here you stand, seeking counsel and growth. That alone speaks of courage."
- "Level ${userContext.level}... A testament to your perseverance. Each trial faced fortifies the Citadel of your mind."
- "Rest when you must, but do not despair. Even the mightiest knights must tend to their wounds before the next battle."`;

    // Format message history for Perplexity API
    const messages = [
      { role: 'system', content: systemPrompt },
      ...messageHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    ];

    // Call Perplexity API
    const response = await fetch(PERPLEXITY_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar-pro', // Advanced search model with complex query support (replaces deprecated llama-3.1-sonar models)
        messages: messages,
        temperature: 0.7,
        max_tokens: 500, // Keep responses concise
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `Perplexity API error: ${response.status}`);
    }

    const data = await response.json();
    const assistantResponse = data.choices[0]?.message?.content || 
      "Hark, Undead. I am unable to channel my guidance at this moment. Rest at the bonfire and try again presently.";

    return new Response(
      JSON.stringify({ response: assistantResponse }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error in perplexity-persona-chat:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
