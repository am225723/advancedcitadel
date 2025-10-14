import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';

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

  const addXP = async (amount) => {
    if (!user) return;

    const newXP = user.xp + amount;
    const newTotalXP = user.total_xp + amount;
    let newLevel = user.level;
    let remainingXP = newXP;
    let xpNeeded = user.xp_to_next_level;

    while (remainingXP >= xpNeeded) {
      remainingXP -= xpNeeded;
      newLevel += 1;
      xpNeeded = Math.floor(100 * Math.pow(1.5, newLevel - 1));
    }

    const updatedProfile = {
      level: newLevel,
      xp: remainingXP,
      xp_to_next_level: xpNeeded,
      total_xp: newTotalXP,
      completed_exercises: user.completed_exercises + 1,
      updated_at: new Date().toISOString(),
    };

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

  return (
    <UserContext.Provider value={{ user, loading, addXP, updateCarColor, unlockPart }}>
      {children}
    </UserContext.Provider>
  );
};