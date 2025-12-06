// src/pages/CognitiveReframingWithGuide.jsx
// Enhanced Cognitive Reframing with Guide Integration

import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { BrainCircuit, Sparkles, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useUser } from '@/contexts/UserContext';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { 
  getActiveGuide, 
  getGuideReframeResponse, 
  saveGuideInteraction 
} from '@/lib/guideService';
import { getPersona } from '@/lib/personaConfig';
import ReframeAnalysisPanel from '@/components/ReframeAnalysisPanel';

const CognitiveReframingWithGuide = () => {
  const [thought, setThought] = useState('');
  const [context, setContext] = useState('');
  const [cbtAnalysis, setCbtAnalysis] = useState(null);
  const [guideResponse, setGuideResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeGuideId, setActiveGuideId] = useState('solaire');
  const [activeGuide, setActiveGuide] = useState(getPersona('solaire'));
  const { user, addXP, unlockPart, recordExerciseType } = useUser();
  const { session } = useAuth();

  useEffect(() => {
    loadActiveGuide();
  }, []);

  const loadActiveGuide = async () => {
    if (session?.user?.id) {
      const guideId = await getActiveGuide(session.user.id);
      setActiveGuideId(guideId);
      setActiveGuide(getPersona(guideId) || getPersona('solaire'));
    }
  };

  const handleReframe = async () => {
    if (!thought.trim()) {
      toast({ 
        variant: "destructive", 
        title: "Empty Thought", 
        description: "Please enter a thought to reframe." 
      });
      return;
    }
    if (!session) {
      toast({ 
        variant: "destructive", 
        title: "Authentication Error", 
        description: "You must be logged in." 
      });
      return;
    }
    
    // Validate thought length
    if (thought.length < 10) {
      toast({ 
        variant: "destructive", 
        title: "Thought Too Short", 
        description: "Please provide more detail about your thought." 
      });
      return;
    }

    setLoading(true);
    setCbtAnalysis(null);
    setGuideResponse(null);

    try {
      // 1. Get Perplexity CBT analysis via API route
      const reframeResponse = await fetch('/api/reframe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ negative_thought: thought, context }),
      });

      const analysisData = await reframeResponse.json();

      if (!reframeResponse.ok || analysisData.error) {
        console.error('API error:', analysisData.error);
        throw new Error(analysisData.error || 'AI analysis failed');
      }

      // 2. Store the CBT analysis in state
      setCbtAnalysis(analysisData);

      // 3. Get guide's reframing response with analysis context
      const response = await getGuideReframeResponse(
        activeGuideId,
        thought,
        context,
        {
          level: user?.level,
          xp: user?.xp,
          displayName: user?.display_name,
          completedExercises: user?.completed_exercises,
          cognitiveDistortions: analysisData?.cognitive_distortions || [],
          evidenceFor: analysisData?.evidence_for || [],
          evidenceAgainst: analysisData?.evidence_against || [],
          balancedReframe: analysisData?.balanced_reframe,
          tinyAction: analysisData?.tiny_action,
        }
      );

      // 4. Save the interaction
      await saveGuideInteraction(
        session.user.id,
        activeGuideId,
        'reframe',
        `Thought: ${thought}\nContext: ${context}`,
        response
      );

      setGuideResponse(response);
      addXP(20, 'Reforge');
      recordExerciseType('Reforge');

      // Check for Brembo Brake Kit unlock after 10 Reforge exercises
      if (user && (user.reforge_count || 0) === 9) {
        unlockPart('Brembo Brake Kit');
        toast({
          title: "Part Unlocked! 🔧",
          description: "You've earned the Brembo Brake Kit for gaining control over your thoughts!",
        });
      }

      toast({ 
        title: `Analysis Complete! ✨`, 
        description: `${activeGuide?.name || 'Your guide'} has reviewed the CBT analysis. +20 XP earned.`,
      });
    } catch (error) {
      toast({ 
        variant: "destructive", 
        title: "AI Error", 
        description: `Failed to get reframe. ${error.message}` 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>The Reforge - The Citadel</title>
        <meta name="description" content="Use AI-powered CBT to challenge and reframe your negative thoughts with your guide." />
      </Helmet>

      <div className="max-w-4xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-3">
            <BrainCircuit className="w-12 h-12 text-gold-accent" />
            <h1 className="text-4xl font-bold text-gradient-gold font-cinzel">The Reforge</h1>
          </div>
          <p className="text-xl text-slate-400 font-garamond max-w-2xl mx-auto">
            The forge of the mind requires fuel. Present your negative thought, and your guide will help you reforge it.
          </p>
        </motion.div>

        {/* Active Guide Display */}
        {activeGuide && (
          <Card className="bg-gradient-to-r from-dark-steel/50 to-transparent border-slate-800 p-4">
            <div className="flex items-center gap-4">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${activeGuide.color}20` }}
              >
                <Users className="w-6 h-6" style={{ color: activeGuide.color }} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500">Your Active Guide:</span>
                  <span className="font-semibold text-white">{activeGuide.name}</span>
                </div>
                <p className="text-xs text-slate-400">{activeGuide.therapeuticLens}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Input Form */}
        <Card className="bg-dark-steel/50 border-slate-800 p-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="thought-input" className="text-lg font-semibold text-white">Your Negative Thought (Required)</label>
              <Textarea 
                id="thought-input" 
                value={thought} 
                onChange={(e) => setThought(e.target.value)} 
                placeholder="e.g., 'I'm going to fail this presentation and everyone will think I'm incompetent.'" 
                className="bg-dark-steel/70 border-slate-700 min-h-[100px] mt-2" 
              />
            </div>
            <div>
              <label htmlFor="context-input" className="text-lg font-semibold text-white">The Context (Optional)</label>
              <Input 
                id="context-input" 
                value={context} 
                onChange={(e) => setContext(e.target.value)} 
                placeholder="e.g., 'I have a big presentation at work tomorrow.'" 
                className="bg-dark-steel/70 border-slate-700 mt-2" 
              />
            </div>
          </div>
          <Button 
            onClick={handleReframe} 
            disabled={loading} 
            className="w-full bg-gradient-to-r from-blood-red to-red-900 text-white font-bold py-6 text-lg hover:from-red-900 hover:to-blood-red"
          >
            {loading ? 'Reforging...' : <><Sparkles className="w-5 h-5 mr-2" />Reframe with {activeGuide?.name}</>}
          </Button>
        </Card>

        {/* CBT Analysis Panel */}
        {cbtAnalysis && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <ReframeAnalysisPanel analysis={cbtAnalysis} />
          </motion.div>
        )}

        {/* Guide Response */}
        {guideResponse && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <Card 
              className="bg-dark-steel/50 border-slate-800 p-8"
              style={{ borderLeftWidth: '4px', borderLeftColor: activeGuide?.color }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${activeGuide?.color}20` }}
                >
                  <Users className="w-5 h-5" style={{ color: activeGuide?.color }} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white font-cinzel">
                    {activeGuide?.name}'s Guidance
                  </h3>
                  <p className="text-sm text-slate-500">{activeGuide?.title}</p>
                </div>
              </div>

              <div className="prose prose-invert max-w-none">
                <div className="text-slate-300 whitespace-pre-wrap font-garamond leading-relaxed">
                  {guideResponse}
                </div>
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                onClick={() => {
                  setThought('');
                  setContext('');
                  setCbtAnalysis(null);
                  setGuideResponse(null);
                }}
                className="flex-1 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700"
              >
                Reforge Another Thought
              </Button>
            </div>
          </motion.div>
        )}

        {/* Info Card */}
        <Card className="bg-dark-steel/30 border-slate-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-3 font-cinzel">About The Reforge</h3>
          <p className="text-slate-400 font-garamond leading-relaxed">
            The Reforge is where negative thoughts are transformed. Your guide will help you examine your thoughts 
            through their unique lens, providing perspective based on their therapeutic approach. Each guide offers 
            different wisdom—Solaire finds the light, Siegward breaks down the problem, Artorias acknowledges the 
            darkness, and so on. Choose your guide wisely in the Codex.
          </p>
        </Card>
      </div>
    </>
  );
};

export default CognitiveReframingWithGuide;