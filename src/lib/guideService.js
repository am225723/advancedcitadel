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
    if (!messageHistory) {
      console.error('getAIGuideResponse error: messageHistory is null or undefined.');
      throw new Error('Message history is required (but can be empty).');
    }

    // Use local API instead of Supabase Edge Function
    const response = await fetch('/api/guide-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemPrompt,
        userContext,
        messageHistory,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('API error:', data.error);
      throw new Error(`Error from AI Guide: ${data.error || 'Unknown error'}`);
    }

    // Handle errors returned in the data object
    if (data.error) {
      console.error('API runtime error:', data.error);
      throw new Error(`Error from AI Guide: ${data.error}`);
    }

    // Remove citation numbers like [3][1] from the response
    if (data.response) {
      data.response = data.response.replace(/\[\d+\]/g, '');
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

/**
 * Unlocks a guide for a user by calling the Supabase RPC function.
 * @param {string} userId - The user's ID.
 * @param {string} guideId - The guide's ID to unlock.
 * @returns {Promise<boolean>} - True if guide was successfully unlocked, false otherwise.
 */
export const unlockGuide = async (userId, guideId) => {
  try {
    // Call the Supabase RPC function that unlocks a guide for a user
    const { data, error } = await supabase.rpc('unlock_guide', {
      p_user_id: userId,
      p_guide_name: guideId
    });

    if (error) {
      console.error('Error unlocking guide:', error);
      return false;
    }

    // The RPC function returns true if guide was unlocked, false if already unlocked
    return data;
  } catch (error) {
    console.error('Error calling unlockGuide:', error);
    return false;
  }
};

/**
 * Gets the user's currently active guide.
 * @param {string} userId - The user's ID.
 * @returns {Promise<string>} - The active guide ID.
 */
export const getActiveGuide = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('active_guide')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching active guide:', error);
      return 'solaire'; // Default guide
    }

    return data.active_guide || 'solaire';
  } catch (error) {
    console.error('Error calling getActiveGuide:', error);
    return 'solaire'; // Default guide
  }
};

/**
 * Sets the user's active guide.
 * @param {string} userId - The user's ID.
 * @param {string} guideId - The guide ID to set as active.
 * @returns {Promise<boolean>} - True if successful, false otherwise.
 */
export const setActiveGuide = async (userId, guideId) => {
  try {
    const { error } = await supabase
      .from('user_profiles')
      .update({ active_guide: guideId, updated_at: new Date().toISOString() })
      .eq('id', userId);

    if (error) {
      console.error('Error setting active guide:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error calling setActiveGuide:', error);
    return false;
  }
};

/**
 * Gets the list of guides unlocked by the user.
 * @param {string} userId - The user's ID.
 * @returns {Promise<Array<string>>} - Array of unlocked guide IDs.
 */
export const getUnlockedGuides = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('unlocked_guides')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching unlocked guides:', error);
      // Return default unlocked guides if error
      return ['solaire', 'siegward', 'artorias'];
    }

    return data.unlocked_guides || ['solaire', 'siegward', 'artorias'];
  } catch (error) {
    console.error('Error calling getUnlockedGuides:', error);
    return ['solaire', 'siegward', 'artorias']; // Default guides
  }
};

/**
 * Gets statistics for all guides the user has interacted with.
 * @param {string} userId - The user's ID.
 * @returns {Promise<Array<Object>>} - Array of guide statistics.
 */
export const getGuideStats = async (userId) => {
  try {
    const { data, error } = await supabase.rpc('get_user_guide_stats', {
      p_user_id: userId
    });

    if (error) {
      console.error('Error fetching guide stats:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error calling getGuideStats:', error);
    return [];
  }
};

/**
 * Gets the interaction history for a user with all guides.
 * @param {string} userId - The user's ID.
 * @param {number} limit - The number of recent interactions to fetch.
 * @returns {Promise<Array<Object>>} - Array of guide interactions.
 */
export const getGuideInteractionHistory = async (userId, limit = 10) => {
  try {
    const { data, error } = await supabase
      .from('guide_interactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching guide interaction history:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error calling getGuideInteractionHistory:', error);
    return [];
  }
};

/**
 * Gets a journal response from the AI guide persona.
 * @param {string} guideId - The guide's ID.
 * @param {string} journalContent - The user's journal entry content.
 * @param {Object} userContext - The user's current progress context.
 * @returns {Promise<string>} - The AI guide's response.
 */
export const getGuideJournalResponse = async (guideId, journalContent, userContext) => {
  try {
    // Get the persona configuration and prompt for this guide
    const { getPersona, getPersonaPrompt } = await import('./personaConfig');
    const persona = getPersona(guideId);
    
    if (!persona) {
      throw new Error(`Guide persona not found for ID: ${guideId}`);
    }

    // Get the system prompt for this persona
    const systemPrompt = getPersonaPrompt(guideId);

    // Prepare the message history for the journal entry
    const messageHistory = [
      {
        role: 'user',
        content: journalContent
      }
    ];

    // Call the AI guide response function with the persona's system prompt
    const response = await getAIGuideResponse(systemPrompt, messageHistory, userContext);
    
    return response.response;
  } catch (error) {
    console.error('Error getting guide journal response:', error);
    return "Hark, Undead. I am unable to channel my guidance at this moment. Rest at the bonfire and try again presently.";
  }
};

/**
 * Gets a cognitive reframing response from the AI guide persona.
 * @param {string} guideId - The guide's ID.
 * @param {string} thought - The negative thought to reframe.
 * @param {string} context - The context of the thought.
 * @param {Object} userContext - The user's current progress context.
 * @returns {Promise<string>} - The AI guide's reframing response.
 */
export const getGuideReframeResponse = async (guideId, thought, context, userContext) => {
  try {
    // Get the persona configuration and prompt for this guide
    const { getPersona, getPersonaPrompt } = await import('./personaConfig');
    const persona = getPersona(guideId);
    
    if (!persona) {
      throw new Error(`Guide persona not found for ID: ${guideId}`);
    }

    // Get the system prompt for this persona
    const systemPrompt = getPersonaPrompt(guideId);

    // Prepare the message history for the reframing exercise
    const messageHistory = [
      {
        role: 'user',
        content: `Help me reframe this negative thought: "${thought}"\n\nContext: ${context || 'No additional context provided.'}`
      }
    ];

    // Call the AI guide response function with the persona's system prompt
    const response = await getAIGuideResponse(systemPrompt, messageHistory, userContext);
    
    return response.response;
  } catch (error) {
    console.error('Error getting guide reframe response:', error);
    return "Hark, Undead. I am unable to channel my guidance at this moment. Rest at the bonfire and try again presently.";
  }
};

/**
 * Saves a guide interaction to the database.
 * @param {string} userId - The user's ID.
 * @param {string} guideName - The guide's name.
 * @param {string} interactionType - The type of interaction (journal, reframe, chat).
 * @param {string} userInput - The user's input.
 * @param {string} guideResponse - The guide's response.
 * @returns {Promise<boolean>} - True if successful, false otherwise.
 */
export const saveGuideInteraction = async (userId, guideName, interactionType, userInput, guideResponse) => {
  try {
    const { error } = await supabase
      .from('guide_interactions')
      .insert({
        user_id: userId,
        guide_name: guideName,
        interaction_type: interactionType,
        user_input: userInput,
        guide_response: guideResponse,
      });

    if (error) {
      console.error('Error saving guide interaction:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error calling saveGuideInteraction:', error);
    return false;
  }
};