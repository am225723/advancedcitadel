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
    // Client-side validation to prevent 400 errors
    if (!systemPrompt) {
      console.error('getAIGuideResponse error: systemPrompt is missing.');
      throw new Error('System prompt is required.');
    }
    // FIX: Removed check for messageHistory.length === 0
    // An empty history is valid for the first message of a conversation.
    if (!messageHistory) {
      console.error('getAIGuideResponse error: messageHistory is null or undefined.');
      throw new Error('Message history is required (but can be empty).');
    }

    const { data, error } = await supabase.functions.invoke('guide-persona-chat', {
      // FIX: Removed JSON.stringify. The Supabase client handles this automatically.
      // Passing an object directly is the correct way.
      body: {
        systemPrompt,
        userContext,
        messageHistory,
      },
    });

    if (error) {
      console.error('xSupabase function error:', error);
      throw new Error(`Error from AI Guide: ${error.message || 'Unknown error'}`);
    }

    // Handle errors returned successfully in the data object (from the edge function's try/catch)
    if (data.error) {
      console.error('Edge function runtime error:', data.error, data.details);
      throw new Error(`Error from AI Guide: ${data.error}`);
    }

    return data; // Contains { response, model, usage }
  } catch (error) {
    console.error('Error calling getAIGuideResponse:', error);
    // Return a user-friendly error message that includes the specific error
    return {
      response: `Hark, Undead. I am unable to channel my guidance at this moment (${error.message || 'Unknown error'}). Rest at the bonfire and try again presently.`
    };
  }
};

