import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Wind, Sparkles, Eye, Search, Wand2, PenSquare } from 'lucide-react'; // Added new icons
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea'; // Added Textarea
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUser } from '@/contexts/UserContext';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

const BlacksmithsRhythm = ({ addXP }) => {
  // This component remains unchanged
  const steps = [
    { part: "Head & Face", prompt: "Bring focus to your head. Feel the weight of it. Notice any tension in your jaw or forehead. With each exhale, let the embers of stress cool and fade." },
    { part: "Shoulders & Arms", prompt: "Move your attention to your shoulders. Let them drop. Feel their strength, the tools they can hold. Follow the sensation down your arms to your fingertips." },
    { part: "Chest & Back", prompt: "Focus on your torso, the forge of your breath. Feel the rise and fall of your chest. Imagine your spine, a strong piece of steel, supporting you." },
    { part: "Hips & Legs", prompt: "Bring awareness to your hips and legs, your foundation. Feel the connection to the ground beneath you, solid and steady." },
    { part: "Feet", prompt: "Finally, focus on your feet. Feel every point of contact with the floor. Imagine roots growing down, anchoring you firmly to the earth." },
    { part: "Whole Body", prompt: "Now, feel your entire body as one. A complete, tempered blade. Strong, resilient, and at peace. Rest here for a moment." },
  ];
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      addXP(30);
      toast({ title: "Meditation Complete! 🎉", description: "+30 XP earned for grounding practice" });
      setCurrentStep(0);
    }
  };

  return (
    <Card className="bg-dark-steel/50 border-slate-800 p-8 space-y-6 text-center">
      <div className="min-h-[150px] flex items-center justify-center">
        <motion.div key={currentStep} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-2xl font-bold text-gold-accent">{steps[currentStep].part}</p>
          <p className="text-lg text-slate-300 max-w-lg mx-auto mt-2">{steps[currentStep].prompt}</p>
        </motion.div>
      </div>
      <div className="flex justify-center space-x-2 py-4">
        {steps.map((_, index) => <div key={index} className={`w-3 h-3 rounded-full transition-all ${index === currentStep ? 'bg-gold-accent w-8' : 'bg-slate-700'}`} />)}
      </div>
      <Button onClick={nextStep} className="bg-gradient-to-r from-gold-accent/80 to-gold-accent text-dark-steel font-bold py-6 px-12 text-lg">{currentStep < steps.length - 1 ? 'Next' : 'Complete'}</Button>
    </Card>
  );
};

const DriversFocus = ({ addXP }) => {
  // This component remains unchanged
  const [isObserving, setIsObserving] = useState(false);
  const handleStart = () => { setIsObserving(true); };
  const handleComplete = () => {
    setIsObserving(false);
    addXP(15);
    toast({ title: "Observation Complete! 🚗", description: "+15 XP for focused attention." });
  };

  return (
    <Card className="bg-dark-steel/50 border-slate-800 p-8 space-y-6 text-center">
      <div className="min-h-[200px] flex flex-col items-center justify-center relative overflow-hidden rounded-lg border-2 border-slate-700/50">
        <img className="absolute inset-0 w-full h-full object-cover opacity-20" alt="serene road viewed from a car dashboard" src="https://images.unsplash.com/photo-1592332902379-fc57b5291dab" />
        <div className="relative z-10 p-4">
          {!isObserving ? (
            <>
              <Eye className="w-12 h-12 text-gold-accent mx-auto mb-4" />
              <p className="text-lg text-slate-300 max-w-lg mx-auto">Select an object in your sight. This is your road. Notice its color, its texture, the way the light hits it. Your only task is to keep your attention on this road. Begin when you're ready.</p>
              <Button onClick={handleStart} className="mt-6 bg-gradient-to-r from-gold-accent/80 to-gold-accent text-dark-steel font-bold py-4 px-8 text-lg">Begin Observation</Button>
            </>
          ) : (
            <>
              <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
                <p className="text-2xl font-bold text-green-400">Observing...</p>
              </motion.div>
              <p className="text-lg text-slate-300 max-w-lg mx-auto mt-2">Maintain your focus on your chosen object. Acknowledge other thoughts, then gently return your attention to your road. Click complete when you feel centered.</p>
              <Button onClick={handleComplete} className="mt-6 bg-gradient-to-r from-blood-red to-red-900 text-white font-bold py-4 px-8 text-lg">Complete</Button>
            </>
          )}
        </div>
      </div>
    </Card>
  );
};

// NEW COMPONENT: Themed 5-4-3-2-1 Method
const ScoutsSurvey = ({ addXP }) => {
  const steps = [
    { num: 5, sense: "Things You Can See", prompt: "A good scout observes the terrain. Look around and name five distinct objects. Notice their color, shape, and position in the room." },
    { num: 4, sense: "Things You Can Feel", prompt: "Survey your immediate area. What are four things you can touch? Notice their texture, temperature, and weight without judgment." },
    { num: 3, sense: "Things You Can Hear", prompt: "Quiet your thoughts and listen. Identify three separate sounds. The hum of a machine, a distant conversation, the sound of your own breathing." },
    { num: 2, sense: "Things You Can Smell", prompt: "Focus on your sense of smell. What are two distinct scents in the air? The aroma of coffee, the clean scent of soap, or the faint smell of rain." },
    { num: 1, sense: "Thing You Can Taste", prompt: "Bring your awareness to your sense of taste. Name one thing you can taste. It could be the lingering taste of your last meal, or simply the neutral taste of your own mouth." },
    { num: '✔', sense: "Survey Complete", prompt: "You have successfully surveyed your environment and anchored yourself in the present. You are grounded and aware." },
  ];
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      addXP(30);
      toast({ title: "Survey Complete! 🗺️", description: "+30 XP for situational awareness." });
      setCurrentStep(0);
    }
  };

  return (
    <Card className="bg-dark-steel/50 border-slate-800 p-8 space-y-6 text-center">
      <div className="min-h-[150px] flex items-center justify-center">
        <motion.div key={currentStep} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-3xl font-bold text-gold-accent">{steps[currentStep].num} <span className="text-2xl">{steps[currentStep].sense}</span></p>
          <p className="text-lg text-slate-300 max-w-lg mx-auto mt-2">{steps[currentStep].prompt}</p>
        </motion.div>
      </div>
      <div className="flex justify-center space-x-2 py-4">
        {steps.map((_, index) => <div key={index} className={`w-3 h-3 rounded-full transition-all ${index === currentStep ? 'bg-gold-accent w-8' : 'bg-slate-700'}`} />)}
      </div>
      <Button onClick={nextStep} className="bg-gradient-to-r from-gold-accent/80 to-gold-accent text-dark-steel font-bold py-6 px-12 text-lg">{currentStep < steps.length - 1 ? 'Next' : 'Complete'}</Button>
    </Card>
  );
};

// NEW COMPONENT: AI-Powered Custom Grounding Technique
const CustomAnchor = ({ addXP }) => {
  const [prompt, setPrompt] = useState('');
  const [technique, setTechnique] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({ variant: "destructive", title: "Empty Prompt", description: "Please describe your situation." });
      return;
    }
    setLoading(true);
    setTechnique(null);
    try {
      // NOTE: This assumes you will create an Edge Function named 'perplexity-custom-grounding'.
      // This function should accept a 'prompt' and return a JSON object like:
      // { title: "Your Custom Technique", steps: ["Step 1...", "Step 2...", "Step 3..."] }
      const { data, error } = await supabase.functions.invoke('perplexity-custom-grounding', {
        body: { prompt },
      });
      if (error) throw error;
      setTechnique(data);
      addXP(40);
      toast({ title: "Custom Technique Created!", description: "A new anchor, forged just for you. +40 XP." });
    } catch (error) {
      toast({ variant: "destructive", title: "AI Error", description: `Could not forge a custom technique. ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-dark-steel/50 border-slate-800 p-8 space-y-6">
      <div className="text-center">
        <Wand2 className="w-10 h-10 text-gold-accent mx-auto mb-2" />
        <h3 className="text-2xl font-bold text-gradient-gold">Forge a Custom Anchor</h3>
        <p className="text-slate-400 font-garamond">Describe your current state. The AI will forge a unique grounding technique based on CBT methods to bring you back to center.</p>
      </div>
      <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="e.g., 'I feel overwhelmed by my to-do list and can't focus' or 'I'm anxious about an upcoming meeting'" className="bg-dark-steel/70 border-slate-700 min-h-[100px]" />
      <Button onClick={handleGenerate} disabled={loading} className="w-full bg-gradient-to-r from-blood-red to-red-900 text-white font-bold py-6 text-lg">
        {loading ? 'Forging...' : <><Sparkles className="w-5 h-5 mr-2" />Generate My Technique</>}
      </Button>

      {technique && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-t border-slate-700 pt-6 space-y-4">
          <h4 className="text-xl font-bold text-gold-accent">{technique.title}</h4>
          <ul className="list-decimal list-inside space-y-2 text-slate-300 font-garamond text-lg">
            {technique.steps.map((step, index) => <li key={index}>{step}</li>)}
          </ul>
        </motion.div>
      )}
    </Card>
  );
};

// NEW COMPONENT: AI-Powered Mantra Generation
const MantraForge = ({ addXP }) => {
  const [prompt, setPrompt] = useState('');
  const [mantras, setMantras] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({ variant: "destructive", title: "Empty Prompt", description: "Please describe what's on your mind." });
      return;
    }
    setLoading(true);
    setMantras([]);
    try {
      const { data, error } = await supabase.functions.invoke('perplexity-grounding', {
        body: { context: prompt },
      });
      if (error) throw error;
      setMantras(data.mantras);
      addXP(10);
      toast({ title: "Mantras Forged!", description: "Words of power, crafted for you. +10 XP." });
    } catch (error) {
      toast({ variant: "destructive", title: "AI Error", description: `Could not forge mantras. ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-dark-steel/50 border-slate-800 p-8 space-y-6">
      <div className="text-center">
        <PenSquare className="w-10 h-10 text-gold-accent mx-auto mb-2" />
        <h3 className="text-2xl font-bold text-gradient-gold">The Mantra Forge</h3>
        <p className="text-slate-400 font-garamond">Provide the raw material of your thoughts, and the AI will forge them into words of power.</p>
      </div>
      <div className="flex gap-4">
        <Input value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="What is weighing on you right now?" className="bg-dark-steel/70 border-slate-700 flex-grow" />
        <Button onClick={handleGenerate} disabled={loading} className="bg-gradient-to-r from-gold-accent/80 to-gold-accent text-dark-steel font-bold">
          {loading ? 'Forging...' : 'Forge'}
        </Button>
      </div>

      {mantras.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-slate-700">
          {mantras.map((mantra, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-3 bg-black/20 border-l-2 border-gold-accent rounded text-center"
            >
              <p className="text-md text-slate-300 font-garamond italic">"{mantra}"</p>
            </motion.div>
          ))}
        </div>
      )}
    </Card>
  );
};

const GroundingTools = () => {
  const { addXP, recordExerciseType } = useUser();

  // Wrapper function to record the exercise type
  const handleExerciseCompletion = (xp, type) => {
    addXP(xp);
    recordExerciseType(type);
  };

  return (
    <>
      <Helmet>
        <title>Anchor & Mantra - The Citadel</title>
        <meta name="description" content="Find your center with grounding exercises and AI-powered mantras." />
      </Helmet>

      <div className="max-w-4xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-3"><Wind className="w-12 h-12 text-gold-accent" /><h1 className="text-4xl font-bold text-gradient-gold">Anchor & Mantra</h1></div>
          <p className="text-xl text-slate-400 font-garamond">Return to the present moment.</p>
        </motion.div>

        <Tabs defaultValue="blacksmith" className="w-full">
          {/* UPDATED: Changed to 4 columns */}
          <TabsList className="grid w-full grid-cols-4 bg-dark-steel/50 border-slate-700">
            <TabsTrigger value="blacksmith">The Blacksmith's Rhythm</TabsTrigger>
            <TabsTrigger value="driver">The Driver's Focus</TabsTrigger>
            <TabsTrigger value="scout">The Scout's Survey</TabsTrigger>
            <TabsTrigger value="custom">Custom Anchor</TabsTrigger>
          </TabsList>

          <TabsContent value="blacksmith" className="mt-6">
            <BlacksmithsRhythm addXP={(xp) => handleExerciseCompletion(xp, 'Grounding')} />
          </TabsContent>

          <TabsContent value="driver" className="mt-6">
            <DriversFocus addXP={(xp) => handleExerciseCompletion(xp, 'Grounding')} />
          </TabsContent>

          {/* NEW: Tab content for Scout's Survey */}
          <TabsContent value="scout" className="mt-6">
            <ScoutsSurvey addXP={(xp) => handleExerciseCompletion(xp, 'Grounding')} />
          </TabsContent>

          {/* NEW: Tab content for Custom Anchor */}
          <TabsContent value="custom" className="mt-6">
            <CustomAnchor addXP={(xp) => handleExerciseCompletion(xp, 'Grounding')} />
          </TabsContent>
        </Tabs>

        {/* NEW: Mantra Forge component added below the tabs */}
        <MantraForge addXP={(xp) => handleExerciseCompletion(xp, 'Grounding')} />
      </div>
    </>
  );
};

export default GroundingTools;
