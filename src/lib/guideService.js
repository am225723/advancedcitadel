// src/lib/guideService.js
import { supabase } from './customSupabaseClient'; // Your custom client

/**
 * Sends a chat message to the AI guide persona via the Supabase edge function.
 * @param {string} systemPrompt - The system prompt defining the AI's persona.
 * @param {Array<Object>} messageHistory - The history of the conversation.
 * @param {Object} userContext - The user's current progress (level, exercises).
 * @returns {Promise<Object>} - An object containing the AI's response.
 */
export const getAIGuideResponse = async (systemPrompt, messageHistory, userContext) => {
  try {
    const { data, error } = await supabase.functions.invoke('guide-persona-chat', {
      body: JSON.stringify({
        systemPrompt,
        userContext,
        messageHistory,
      }),
    });

    if (error) {
      console.error('Supabase function error:', error);
      throw new Error(`Error from AI Guide: ${error.message || 'Unknown error'}`);
    }

    if (data.error) {
      console.error('Edge function runtime error:', data.error, data.details);
      throw new Error(`Error from AI Guide: ${data.error}`);
    }

    return data; // Contains { response, model, usage }
  } catch (error) {
    console.error('Error calling getAIGuideResponse:', error);
    // Return a user-friendly error message
    return {
      response: "Hark, Undead. I am unable to channel my guidance at this moment. Rest at the bonfire and try again presently."
    };
  }
};
