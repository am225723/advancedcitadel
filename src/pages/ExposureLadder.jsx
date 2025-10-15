// src/components/ExposureLadder.jsx

import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Sparkles, CheckCircle, Circle, Footprints } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUser } from '@/contexts/UserContext';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

const ExposureLadder = () => {
  const [fear, setFear] = useState('');
  const [goal, setGoal] = useState('');
  const [constraints, setConstraints] = useState('');
  const [steps, setSteps] = useState([]);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user, addXP, unlockPart } = useUser();
  const { session } = useAuth();

  const generateLadder = async () => {
    if (!fear.trim()) {
      toast({ variant: "destructive", title: "Empty Fear", description: "Please enter a fear to create a quest." });
      return;
    }
    if (!session) {
      toast({ variant: "destructive", title: "Authentication Error", description: "You must be logged in." });
      return;
    }
    setLoading(true);
    setSteps([]);
    setCompletedSteps([]);
    try {
      const { data, error } = await supabase.functions.invoke('perplexity-exposure-ladder', {
        body: { fear, goal, constraints },
      });
      if (error) throw new Error(error.message);
      // CHANGE: The original code expected data.steps, but the function returns data.ladder.
      if (!data || !data.ladder) {
        throw new Error("Received an unexpected response from the AI.");
      }
      // CHANGE: Set state from data.ladder, not data.steps
      setSteps(data.ladder);
      addXP(15);
      toast({ title: "Quest Created! ✨", description: "Your exposure ladder is ready. +15 XP earned." });
    } catch (error) {
      toast({ variant: "destructive", title: "AI Error", description: `Failed to create quest. ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  const toggleStep = index => {
    const newCompletedSteps = [...completedSteps];
    if (newCompletedSteps.includes(index)) {
      newCompletedSteps.splice(newCompletedSteps.indexOf(index), 1);
    } else {
      newCompletedSteps.push(index);
      addXP(5);
      toast({ title: "Step Complete!", description: "+5 XP for your bravery!" });

      // Check for HKS Turbo Kit unlock when all steps are completed
      if (steps.length > 0 && newCompletedSteps.length === steps.length) {
        unlockPart('HKS Turbo Kit');
        toast({
          title: "Part Unlocked! 🔧",
          description: "You've completed the Path of the Undaunted and earned the HKS Turbo Kit!",
        });
      }
    }
    setCompletedSteps(newCompletedSteps);
  };

  return (
    <>
      <Helmet>
        <title>Path of the Undaunted - The Citadel</title>
        <meta name="description" content="Create AI-generated exposure therapy quests to face your fears." />
      </Helmet>

      <div className="max-w-4xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-2">
            <div className="flex items-center justify-center space-x-3"><Footprints className="w-12 h-12 text-gold-accent" /><h1 className="text-4xl font-bold text-gradient-gold">Path of the Undaunted</h1></div>
            <p className="text-xl text-slate-400 font-garamond max-w-3xl mx-auto">Every hero must face their trials. Define the fear that holds you back, the ultimate goal you wish to achieve, and any limitations on your quest.</p>
        </motion.div>

        <Card className="bg-dark-steel/50 border-slate-800 p-8 space-y-6">
            <div className="space-y-4">
                <div>
                    <label htmlFor="fear-input" className="text-lg font-semibold text-white">Your Fear (Required)</label>
                    <Input id="fear-input" value={fear} onChange={e => setFear(e.target.value)} placeholder="e.g., 'Public speaking' or 'spiders'" className="bg-dark-steel/70 border-slate-700 mt-2" />
                </div>
                <div>
                    <label htmlFor="goal-input" className="text-lg font-semibold text-white">Your Goal (Optional)</label>
                    <Input id="goal-input" value={goal} onChange={e => setGoal(e.target.value)} placeholder="e.g., 'To give a toast at a friend's wedding'" className="bg-dark-steel/70 border-slate-700 mt-2" />
                </div>
                <div>
                    <label htmlFor="constraints-input" className="text-lg font-semibold text-white">Your Constraints (Optional)</label>
                    <Input id="constraints-input" value={constraints} onChange={e => setConstraints(e.target.value)} placeholder="e.g., 'I have one month' or 'I want to practice online first'" className="bg-dark-steel/70 border-slate-700 mt-2" />
                </div>
            </div>
            <Button onClick={generateLadder} disabled={loading} className="w-full bg-gradient-to-r from-blood-red to-red-900 text-white font-bold py-6 text-lg">
                {loading ? 'Creating Quest...' : <><Sparkles className="w-5 h-5 mr-2" />Create Quest</>}
            </Button>
        </Card>

        {steps.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-2xl font-bold text-center text-gradient-gold mb-4">Your Quest: {fear}</h2>
            <div className="space-y-3">
              {/* CHANGE: The rendering logic now displays the properties of the 'step' object (title, description, etc.) */}
              {steps.map((step, index) => (
                <motion.div 
                    key={index} 
                    initial={{ opacity: 0, x: -20 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    transition={{ delay: index * 0.1 }} 
                    onClick={() => toggleStep(index)} 
                    className="flex items-start p-4 bg-black/20 border-l-4 border-gold-accent rounded cursor-pointer hover:bg-black/40 transition-colors"
                >
                    {completedSteps.includes(index) ? <CheckCircle className="w-6 h-6 mt-1 mr-4 text-green-500 flex-shrink-0" /> : <Circle className="w-6 h-6 mt-1 mr-4 text-slate-500 flex-shrink-0" />}
                    <div className={`flex-grow ${completedSteps.includes(index) ? 'line-through text-slate-500' : ''}`}>
                        <p className="font-bold text-lg text-white">{step.title}</p>
                        <p className="text-slate-300">{step.description}</p>
                        <div className="text-xs text-slate-400 mt-2">
                           <span>Anxiety: {step.anxietyLevel}/10</span> | <span>Duration: {step.duration}</span>
                        </div>
                    </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </>
  );
};

export default ExposureLadder;
