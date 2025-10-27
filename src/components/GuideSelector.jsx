// src/components/GuideSelector.jsx
// Component for selecting and displaying the active guide

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, Check, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUser } from '@/contexts/UserContext';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { toast } from '@/components/ui/use-toast';
import { 
  getActiveGuide, 
  setActiveGuide, 
  getUnlockedGuides,
  getGuideStats 
} from '@/lib/guideService';
import { getAllPersonas } from '@/lib/personaConfig';

const GuideSelector = ({ onGuideSelected }) => {
  const [activeGuideId, setActiveGuideId] = useState('solaire');
  const [unlockedGuides, setUnlockedGuides] = useState([]);
  const [guideStats, setGuideStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState(false);
  const { user } = useUser();
  const { session } = useAuth();

  const personas = getAllPersonas();

  useEffect(() => {
    if (session?.user?.id) {
      loadGuideData();
    }
  }, [session?.user?.id]);

  const loadGuideData = async () => {
    try {
      setLoading(true);
      const [active, unlocked, stats] = await Promise.all([
        getActiveGuide(session.user.id),
        getUnlockedGuides(session.user.id),
        getGuideStats(session.user.id),
      ]);

      setActiveGuideId(active);
      setUnlockedGuides(unlocked);
      setGuideStats(stats);
    } catch (error) {
      console.error('Error loading guide data:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load guide information.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectGuide = async (guideId) => {
    if (!unlockedGuides.includes(guideId)) {
      toast({
        variant: 'destructive',
        title: 'Guide Locked',
        description: 'You must unlock this guide first by reaching the required level.',
      });
      return;
    }

    try {
      setSelecting(true);
      const success = await setActiveGuide(session.user.id, guideId);
      
      if (success) {
        setActiveGuideId(guideId);
        const persona = personas.find(p => p.id === guideId);
        
        toast({
          title: 'Guide Selected',
          description: `${persona.name} is now your active guide.`,
        });

        if (onGuideSelected) {
          onGuideSelected(guideId);
        }
      } else {
        throw new Error('Failed to update guide');
      }
    } catch (error) {
      console.error('Error selecting guide:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to select guide. Please try again.',
      });
    } finally {
      setSelecting(false);
    }
  };

  const getGuideInteractionCount = (guideId) => {
    const stat = guideStats.find(s => s.guide_name === guideId);
    return stat?.interaction_count || 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-accent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-gradient-gold font-cinzel">
          Choose Your Guide
        </h2>
        <p className="text-slate-400 font-garamond">
          Select a companion to guide you on your therapeutic journey
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {personas.map((persona) => {
          const isUnlocked = unlockedGuides.includes(persona.id);
          const isActive = activeGuideId === persona.id;
          const interactionCount = getGuideInteractionCount(persona.id);

          return (
            <motion.div
              key={persona.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card
                className={`relative overflow-hidden transition-all duration-300 ${
                  isActive
                    ? 'border-gold-accent border-2 bg-gradient-to-br from-gold-accent/10 to-transparent'
                    : 'border-slate-800 hover:border-slate-700'
                } ${!isUnlocked ? 'opacity-60' : 'cursor-pointer'}`}
                onClick={() => isUnlocked && handleSelectGuide(persona.id)}
              >
                {/* Active Indicator */}
                {isActive && (
                  <div className="absolute top-2 right-2 z-10">
                    <div className="bg-gold-accent text-black px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      ACTIVE
                    </div>
                  </div>
                )}

                {/* Lock Overlay */}
                {!isUnlocked && (
                  <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-10 flex items-center justify-center">
                    <div className="text-center space-y-2">
                      <Lock className="w-12 h-12 text-slate-500 mx-auto" />
                      <p className="text-slate-400 font-semibold">
                        Reach Level {persona.unlockLevel}
                      </p>
                    </div>
                  </div>
                )}

                {/* Character Image */}
                <div className="relative h-48 overflow-hidden bg-gradient-to-b from-slate-900 to-black">
                  <img
                    src={persona.imageUrl}
                    alt={persona.name}
                    className="w-full h-full object-cover object-top"
                    style={{ filter: isUnlocked ? 'none' : 'grayscale(100%)' }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                </div>

                {/* Content */}
                <div className="p-5 space-y-3">
                  <div>
                    <h3 className="text-xl font-bold text-white font-cinzel">
                      {persona.name}
                    </h3>
                    <p className="text-sm text-slate-500">{persona.title}</p>
                  </div>

                  <p className="text-sm text-slate-400 font-garamond">
                    {persona.description}
                  </p>

                  <div className="pt-2 border-t border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Theme:</span>
                      <span className="text-slate-400">{persona.theme}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Focus:</span>
                      <span className="text-slate-400">{persona.therapeuticLens}</span>
                    </div>
                    {interactionCount > 0 && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Interactions:</span>
                        <span className="text-gold-accent font-semibold">
                          {interactionCount}
                        </span>
                      </div>
                    )}
                  </div>

                  {isUnlocked && !isActive && (
                    <Button
                      className="w-full mt-4 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700"
                      disabled={selecting}
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      Select Guide
                    </Button>
                  )}

                  {isActive && (
                    <div className="w-full mt-4 py-2 text-center text-gold-accent font-semibold flex items-center justify-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Currently Active
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Legend */}
      <Card className="bg-dark-steel/30 border-slate-800 p-4">
        <div className="flex flex-wrap gap-6 justify-center text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border-2 border-gold-accent bg-gold-accent/10" />
            <span className="text-slate-400">Active Guide</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-slate-500" />
            <span className="text-slate-400">Locked (Level Required)</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-slate-400" />
            <span className="text-slate-400">Available to Select</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default GuideSelector;