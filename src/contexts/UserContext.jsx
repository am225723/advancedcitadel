import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { toast } from '@/components/ui/use-toast';
import { unlockGuide as unlockGuideService } from '@/lib/guideService';
import { getPersona } from '@/lib/personaConfig';

const UserContext = createContext(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const { session } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = useCallback(async (userId) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error.message);
      setUser(null);
    } else {
      setUser(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (session?.user) {
      fetchUserProfile(session.user.id);
    } else {
      setUser(null);
      setLoading(false);
    }
  }, [session, fetchUserProfile]);

  useEffect(() => {
    if (!session?.user) return;

    const channel = supabase.channel(`user-profile-changes:${session.user.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_profiles',
        filter: `id=eq.${session.user.id}`
      }, (payload) => {
        setUser(payload.new);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session]);

  const checkGuideUnlocks = async (newLevel, oldLevel) => {
    if (!user) return;
    
    const guidesToUnlock = [];
    
    // Check which guides should be unlocked at this level
    if (newLevel >= 2 && oldLevel < 2) {
      guidesToUnlock.push('patches', 'lautrec');
    }
    if (newLevel >= 3 && oldLevel < 3) {
      guidesToUnlock.push('gael', 'alonne');
    }
    
    // Unlock each guide and show notification
    for (const guideId of guidesToUnlock) {
      try {
        const unlocked = await unlockGuideService(user.id, guideId);
        if (unlocked) {
          const persona = getPersona(guideId);
          if (persona) {
            toast({
              title: "New Guide Unlocked! ⚔️",
              description: `${persona.name} is now available in the Codex.`,
              duration: 5000,
            });
          }
        }
      } catch (error) {
        console.error(`Error unlocking guide ${guideId}:`, error);
      }
    }
  };

  const addXP = async (amount, exerciseType = null) => {
    if (!user) return;

    const newXP = user.xp + amount;
    const newTotalXP = user.total_xp + amount;
    const oldLevel = user.level;
    let newLevel = user.level;
    let remainingXP = newXP;
    let xpNeeded = user.xp_to_next_level;

    while (remainingXP >= xpNeeded) {
      remainingXP -= xpNeeded;
      newLevel += 1;
      xpNeeded = Math.floor(100 * Math.pow(1.5, newLevel - 1));
    }

    // Check for level-based unlocks
    if (newLevel >= 5) {
      unlockPart('Roll Cage');
    }

    // Check for guide unlocks
    if (newLevel > oldLevel) {
      await checkGuideUnlocks(newLevel, oldLevel);
    }

    const updatedProfile = {
      level: newLevel,
      xp: remainingXP,
      xp_to_next_level: xpNeeded,
      total_xp: newTotalXP,
      completed_exercises: user.completed_exercises + 1,
      updated_at: new Date().toISOString(),
    };

    if (exerciseType === 'Reforge') {
      updatedProfile.reforge_count = (user.reforge_count || 0) + 1;
    }

    const { error } = await supabase
      .from('user_profiles')
      .update(updatedProfile)
      .eq('id', user.id);

    if (error) {
      console.error('Error updating XP:', error);
    }
  };

  const updateCarColor = async (color) => {
    if (!user) return;

    const { error } = await supabase
      .from('user_profiles')
      .update({ car_color: color, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (error) {
      console.error('Error updating car color:', error);
    }
  };

  const unlockPart = async (partName) => {
    if (!user) return;

    // Ensure unlocked_parts is an array, even if it's null/undefined in the DB
    const currentParts = Array.isArray(user.unlocked_parts) ? user.unlocked_parts : [];

    // Avoid adding duplicate parts
    if (currentParts.includes(partName)) {
      console.log(`Part "${partName}" is already unlocked.`);
      return;
    }

    const newParts = [...currentParts, partName];

    const { error } = await supabase
      .from('user_profiles')
      .update({ unlocked_parts: newParts, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (error) {
      console.error('Error unlocking part:', error);
    }
  };

  const recordExerciseType = async (exerciseType) => {
    if (!user) return;

    const currentTypes = Array.isArray(user.completed_exercise_types) ? user.completed_exercise_types : [];

    if (currentTypes.includes(exerciseType)) {
      return; // Type already recorded
    }

    const newTypes = [...currentTypes, exerciseType];

    const { error } = await supabase
      .from('user_profiles')
      .update({ completed_exercise_types: newTypes, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (error) {
      console.error('Error recording exercise type:', error);
    }

    // Check for Active Center Differential unlock
    if (newTypes.length >= 3) {
      unlockPart('Active Center Differential');
    }
  };

  const updateJournalStreak = async () => {
    if (!user) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastDate = user.last_journal_date ? new Date(user.last_journal_date) : null;
    if (lastDate) {
      lastDate.setHours(0, 0, 0, 0);
    }

    let newStreak = user.journal_streak || 0;

    if (lastDate) {
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);

      if (lastDate.getTime() === today.getTime()) {
        // Already journaled today, do nothing to the streak.
        return;
      } else if (lastDate.getTime() === yesterday.getTime()) {
        // Consecutive day
        newStreak++;
      } else {
        // Streak is broken
        newStreak = 1;
      }
    } else {
      // First journal entry
      newStreak = 1;
    }

    const { error } = await supabase
      .from('user_profiles')
      .update({
        last_journal_date: today.toISOString(),
        journal_streak: newStreak,
      })
      .eq('id', user.id);

    if (error) {
      console.error('Error updating journal streak:', error);
    }

    // Check for Carbon Fiber Hood unlock
    if (newStreak >= 30) {
      unlockPart('Carbon Fiber Hood');
    }
  };

  return (
    <UserContext.Provider value={{ user, loading, addXP, updateCarColor, unlockPart, recordExerciseType, updateJournalStreak }}>
      {children}
    </UserContext.Provider>
  );
};
