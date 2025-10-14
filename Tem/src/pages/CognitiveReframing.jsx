// src/components/CognitiveReframing.jsx

import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { BrainCircuit, Sparkles, Lightbulb, CheckCircle, XCircle, Forward, ShieldAlert } from 'lucide-react'; // CHANGE: Imported new icons
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useUser } from '@/contexts/UserContext';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

const CognitiveReframing = () => {
  const [thought, setThought] = useState('');
  const [context, setContext] = useState('');
  // CHANGE: State now holds the entire analysis object, not just an array of reframes.
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const { addXP } = useUser();
  const { session } = useAuth();

  const handleReframe = async () => {
    if (!thought.trim()) {
      toast({ variant: "destructive", title: "Empty Thought", description: "Please enter a thought to reframe." });
      return;
    }
    if (!session) {
      toast({ variant: "destructive", title: "Authentication Error", description: "You must be logged in." });
      return;
    }
    setLoading(true);
    // CHANGE: Reset the full analysis object
    setAnalysis(null);
    try {
      // CHANGE: The body now correctly uses 'negative_thought' to match the Edge Function
      const { data, error } = await supabase.functions.invoke('perplexity-reframe-forge', {
        body: { negative_thought: thought, context },
      });

      if (error) throw new Error(error.message);
      if (!data) { // CHANGE: Simplified error check
        throw new Error("Received an unexpected response from the AI.");
      }

      // CHANGE: Set the entire returned data object to the new state variable
      setAnalysis(data);
      addXP(20);
      toast({ title: "Thought Reframed! ✨", description: "+20 XP earned for mental flexibility." });
    } catch (error) {
      toast({ variant: "destructive", title: "AI Error", description: `Failed to get reframes. ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>The Reforge - The Citadel</title>
        <meta name="description" content="Use AI-powered CBT to challenge and reframe your negative thoughts." />
      </Helmet>

      <div className="max-w-4xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-3"><BrainCircuit className="w-12 h-12 text-gold-accent" /><h1 className="text-4xl font-bold text-gradient-gold">The Reforge</h1></div>
          <p className="text-xl text-slate-400 font-garamond max-w-2xl mx-auto">The forge of the mind requires fuel. Present the negative thought that weighs upon you, and provide the context of its origin. We will reforge it.</p>
        </motion.div>

        <Card className="bg-dark-steel/50 border-slate-800 p-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="thought-input" className="text-lg font-semibold text-white">Your Negative Thought (Required)</label>
              <Textarea id="thought-input" value={thought} onChange={(e) => setThought(e.target.value)} placeholder="e.g., 'I'm going to fail this presentation and everyone will think I'm incompetent.'" className="bg-dark-steel/70 border-slate-700 min-h-[100px] mt-2" />
            </div>
            <div>
              <label htmlFor="context-input" className="text-lg font-semibold text-white">The Context (Optional)</label>
              <Input id="context-input" value={context} onChange={(e) => setContext(e.target.value)} placeholder="e.g., 'I have a big presentation at work tomorrow.'" className="bg-dark-steel/70 border-slate-700 mt-2" />
            </div>
          </div>
          <Button onClick={handleReframe} disabled={loading} className="w-full bg-gradient-to-r from-blood-red to-red-900 text-white font-bold py-6 text-lg">
            {loading ? 'Reforging...' : <><Sparkles className="w-5 h-5 mr-2" />Reframe Thought</>}
          </Button>
        </Card>

        {/* CHANGE: This entire section is new. It renders the structured data from the 'analysis' object. */}
        {analysis && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <h2 className="text-2xl font-bold text-center text-gradient-gold mb-4 flex items-center justify-center"><Lightbulb className="mr-2" />Analysis & Reframing</h2>

            {/* Balanced Reframe */}
            <Card className="bg-black/20 border-l-4 border-gold-accent p-5">
              <h3 className="font-semibold text-lg text-gold-accent mb-2">A More Balanced Perspective</h3>
              <p className="text-lg text-slate-300 font-garamond italic">"{analysis.balanced_reframe}"</p>
            </Card>

            {/* Evidence Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-dark-steel/30 p-5 border-slate-800">
                <h4 className="font-semibold text-white mb-3 flex items-center"><CheckCircle className="w-5 h-5 mr-2 text-green-500" />Evidence For the Thought</h4>
                <ul className="list-disc list-inside space-y-2 text-slate-400">
                  {analysis.evidence_for.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </Card>
              <Card className="bg-dark-steel/30 p-5 border-slate-800">
                <h4 className="font-semibold text-white mb-3 flex items-center"><XCircle className="w-5 h-5 mr-2 text-red-500" />Evidence Against the Thought</h4>
                <ul className="list-disc list-inside space-y-2 text-slate-400">
                  {analysis.evidence_against.map((item, i) => <li key={i}>{item}</li>)}
                </ul>
              </Card>
            </div>

            {/* Cognitive Distortions */}
            <Card className="bg-dark-steel/30 p-5 border-slate-800">
              <h4 className="font-semibold text-white mb-3">Potential Cognitive Distortions</h4>
              <div className="flex flex-wrap gap-2">
                {analysis.cognitive_distortions.map((item, i) => (
                  <span key={i} className="px-3 py-1 text-sm rounded-full bg-slate-700 text-slate-300">{item}</span>
                ))}
              </div>
            </Card>

            {/* Tiny Action */}
            <Card className="bg-dark-steel/30 p-5 border-slate-800">
              <h4 className="font-semibold text-white mb-3 flex items-center"><Forward className="w-5 h-5 mr-2 text-cyan-400" />A Tiny Next Step</h4>
              <p className="text-slate-300">{analysis.tiny_action}</p>
            </Card>

            {/* Safety Note */}
            {analysis.safety_note && (
              <Card className="bg-red-900/30 border-l-4 border-red-500 p-5 text-center">
                <p className="text-red-300 flex items-center justify-center"><ShieldAlert className="w-5 h-5 mr-2" /> {analysis.safety_note}</p>
              </Card>
            )}
          </motion.div>
        )}
      </div>
    </>
  );
};

export default CognitiveReframing;
