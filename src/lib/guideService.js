// src/lib/guideService.js
// Service for managing guide interactions and API calls

import { supabase } from './customSupabaseClient';
import { getPersonaPrompt, getPersona } from './personaConfig';

/**
 * Get the user's currently active guide
 * @param {string} userId - The user's ID
 * @returns {Promise<string>} The active guide ID
 */
export async function getActiveGuide(userId) {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('active_guide')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data?.active_guide || 'solaire'; // Default to Solaire
  } catch (error) {
    console.error('Error fetching active guide:', error);
    return 'solaire'; // Fallback to Solaire
  }
}

/**
 * Set the user's active guide
 * @param {string} userId - The user's ID
 * @param {string} guideId - The guide ID to set as active
 * @returns {Promise<boolean>} Success status
 */
export async function setActiveGuide(userId, guideId) {
  try {
    const { error } = await supabase
      .from('user_profiles')
      .update({ 
        active_guide: guideId,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error setting active guide:', error);
    return false;
  }
}

/**
 * Save a guide interaction to the database
 * @param {string} userId - The user's ID
 * @param {string} guideId - The guide ID
 * @param {string} interactionType - Type of interaction ('journal', 'reframe', 'chat')
 * @param {string} userInput - The user's input
 * @param {string} guideResponse - The guide's response
 * @returns {Promise<boolean>} Success status
 */
export async function saveGuideInteraction(userId, guideId, interactionType, userInput, guideResponse) {
  try {
    const { error } = await supabase
      .from('guide_interactions')
      .insert([{
        user_id: userId,
        guide_name: guideId,
        interaction_type: interactionType,
        user_input: userInput,
        guide_response: guideResponse,
      }]);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error saving guide interaction:', error);
    return false;
  }
}

/**
 * Get user's interaction history with guides
 * @param {string} userId - The user's ID
 * @param {number} limit - Maximum number of interactions to retrieve
 * @returns {Promise<Array>} Array of interactions
 */
export async function getGuideInteractionHistory(userId, limit = 50) {
  try {
    const { data, error } = await supabase
      .from('guide_interactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching interaction history:', error);
    return [];
  }
}

/**
 * Get statistics for user's guide usage
 * @param {string} userId - The user's ID
 * @returns {Promise<Object>} Guide usage statistics
 */
export async function getGuideStats(userId) {
  try {
    const { data, error } = await supabase
      .rpc('get_user_guide_stats', { p_user_id: userId });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching guide stats:', error);
    return [];
  }
}

/**
 * Call AI with guide persona for journal analysis
 * @param {string} guideId - The guide ID
 * @param {string} journalContent - The journal entry content
 * @param {Object} userContext - User context (level, XP, etc.)
 * @returns {Promise<string>} The guide's response
 */
export async function getGuideJournalResponse(guideId, journalContent, userContext = {}) {
  try {
    const personaPrompt = getPersonaPrompt(guideId);
    const persona = getPersona(guideId);

    // Call the edge function with persona-specific prompt
    const { data, error } = await supabase.functions.invoke('guide-persona-chat', {
      body: JSON.stringify({
        systemPrompt: personaPrompt,
        userContext: {
          ...userContext,
          activeGuide: guideId,
          guideName: persona.name,
        },
        messageHistory: [
          {
            role: 'user',
            content: `I want to reflect on this journal entry:\n\n${journalContent}\n\nPlease provide your guidance and insights.`
          }
        ],
      }),
    });

    if (error) throw error;
    return data.response;
  } catch (error) {
    console.error('Error getting guide journal response:', error);
    throw error;
  }
}

/**
 * Call AI with guide persona for cognitive reframing
 * @param {string} guideId - The guide ID
 * @param {string} negativeThought - The negative thought to reframe
 * @param {string} context - Optional context
 * @param {Object} userContext - User context (level, XP, etc.)
 * @returns {Promise<Object>} The guide's reframing response
 */
export async function getGuideReframeResponse(guideId, negativeThought, context = '', userContext = {}) {
  try {
    const personaPrompt = getPersonaPrompt(guideId);
    const persona = getPersona(guideId);

    // Build the reframing request
    let requestText = `I need help reframing this negative thought:\n\n"${negativeThought}"`;
    if (context) {
      requestText += `\n\nContext: ${context}`;
    }
    requestText += `\n\nPlease help me see this differently and provide:
1. A more balanced perspective
2. Evidence for and against this thought
3. Any cognitive distortions you notice
4. A small action I can take`;

    // Call the edge function with persona-specific prompt
    const { data, error } = await supabase.functions.invoke('guide-persona-chat', {
      body: JSON.stringify({
        systemPrompt: personaPrompt,
        userContext: {
          ...userContext,
          activeGuide: guideId,
          guideName: persona.name,
        },
        messageHistory: [
          {
            role: 'user',
            content: requestText
          }
        ],
      }),
    });

    if (error) throw error;
    return data.response;
  } catch (error) {
    console.error('Error getting guide reframe response:', error);
    throw error;
  }
}

/**
 * Call AI with guide persona for general chat
 * @param {string} guideId - The guide ID
 * @param {Array} messageHistory - Array of previous messages
 * @param {Object} userContext - User context (level, XP, etc.)
 * @returns {Promise<string>} The guide's response
 */
export async function getGuideChatResponse(guideId, messageHistory, userContext = {}) {
  try {
    const personaPrompt = getPersonaPrompt(guideId);
    const persona = getPersona(guideId);

    // Call the edge function with persona-specific prompt
    const { data, error } = await supabase.functions.invoke('guide-persona-chat', {
      body: JSON.stringify({
        systemPrompt: personaPrompt,
        userContext: {
          ...userContext,
          activeGuide: guideId,
          guideName: persona.name,
        },
        messageHistory: messageHistory,
      }),
    });

    if (error) throw error;
    return data.response;
  } catch (error) {
    console.error('Error getting guide chat response:', error);
    throw error;
  }
}

/**
 * Check if a guide is unlocked for the user
 * @param {string} userId - The user's ID
 * @param {string} guideId - The guide ID to check
 * @returns {Promise<boolean>} Whether the guide is unlocked
 */
export async function isGuideUnlocked(userId, guideId) {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('unlocked_guides, level')
      .eq('id', userId)
      .single();

    if (error) throw error;

    const persona = getPersona(guideId);
    if (!persona) return false;

    // Check if guide is in unlocked_guides array
    const unlockedGuides = data?.unlocked_guides || [];
    if (unlockedGuides.includes(guideId)) {
      return true;
    }

    // Check if user level meets requirement
    const userLevel = data?.level || 1;
    return userLevel >= persona.unlockLevel;
  } catch (error) {
    console.error('Error checking guide unlock status:', error);
    return false;
  }
}

/**
 * Unlock a guide for the user
 * @param {string} userId - The user's ID
 * @param {string} guideId - The guide ID to unlock
 * @returns {Promise<boolean>} Success status
 */
export async function unlockGuide(userId, guideId) {
  try {
    const { data, error } = await supabase
      .rpc('unlock_guide', { 
        p_user_id: userId,
        p_guide_name: guideId 
      });

    if (error) throw error;
    return data; // Returns true if newly unlocked, false if already unlocked
  } catch (error) {
    console.error('Error unlocking guide:', error);
    return false;
  }
}

/**
 * Get all unlocked guides for a user
 * @param {string} userId - The user's ID
 * @returns {Promise<Array>} Array of unlocked guide IDs
 */
export async function getUnlockedGuides(userId) {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('unlocked_guides, level')
      .eq('id', userId)
      .single();

    if (error) throw error;

    const unlockedGuides = data?.unlocked_guides || [];
    const userLevel = data?.level || 1;

    // Also include guides unlocked by level
    const allPersonas = Object.values(await import('./personaConfig').then(m => m.PERSONAS));
    const levelUnlockedGuides = allPersonas
      .filter(p => p.unlockLevel <= userLevel)
      .map(p => p.id);

    // Combine and deduplicate
    return [...new Set([...unlockedGuides, ...levelUnlockedGuides])];
  } catch (error) {
    console.error('Error getting unlocked guides:', error);
    return ['solaire', 'siegward', 'artorias']; // Default unlocked guides
  }
}