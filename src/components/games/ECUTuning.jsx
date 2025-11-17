import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SlidersHorizontal, Lightbulb } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useUser } from '@/contexts/UserContext';
import LogicGrid from './LogicGrid';

const ECUTuning = ({ onComplete }) => {
  const { addXP } = useUser();
  const options = useMemo(() => ['A', 'B', 'C'], []);
  const [solution, setSolution] = useState({});
  const [settings, setSettings] = useState({ Fuel: null, Timing: null, Boost: null });
  const [timeLeft, setTimeLeft] = useState(120);
  const [score, setScore] = useState(0);

  useEffect(() => {
    // Generate a random solution
    const shuffledOptions = [...options].sort(() => 0.5 - Math.random());
    setSolution({
      Fuel: shuffledOptions[0],
      Timing: shuffledOptions[1],
      Boost: shuffledOptions[2],
    });
  }, [options]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          endGame(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSettingChange = (param, value) => {
    setSettings(s => ({ ...s, [param]: value }));
  };

  const checkSolution = () => {
    if (settings.Fuel === solution.Fuel && settings.Timing === solution.Timing && settings.Boost === solution.Boost) {
      endGame(true);
    } else {
      toast({ variant: "destructive", title: "Incorrect Tune", description: "The settings are not optimal. Check the clues." });
      setScore(s => Math.max(0, s - 50));
    }
  };

  const endGame = (isCorrect) => {
    const finalScore = isCorrect ? 500 + timeLeft * 5 : score;
    const xpGained = Math.round(finalScore / 10);
    addXP(xpGained);
    toast({
      title: isCorrect ? "Optimal Tune Achieved!" : "Time's Up!",
      description: `You scored ${finalScore} and earned +${xpGained} XP.`,
    });
    setTimeout(onComplete, 2000);
  };

  const clues = useMemo(() => [
      `Fuel is not set to ${solution.Timing}.`,
      `Timing is not set to ${solution.Boost}.`,
      `Boost is either ${solution.Boost} or ${solution.Fuel}.`
  ], [solution]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Card className="bg-slate-900/80 border-cyan-500/50 p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-bold text-white"><SlidersHorizontal className="inline mr-2" />ECU Logic Puzzle</h3>
          <div className="text-lg font-bold">Time: {timeLeft}s</div>
        </div>

        <div className="flex gap-4">
            <div className="w-2/3">
                <LogicGrid options={options} settings={settings} onSettingChange={handleSettingChange} />
            </div>
            <div className="w-1/3 p-4 bg-slate-800 rounded">
                <h4 className="font-bold mb-2 flex items-center"><Lightbulb className="mr-2 text-yellow-400"/>Clues</h4>
                <ul className="space-y-2 text-sm text-slate-300">
                    {clues.map((clue, i) => <li key={i}>{clue}</li>)}
                </ul>
            </div>
        </div>

        <Button onClick={checkSolution} className="w-full bg-green-600 hover:bg-green-700">Lock In Tune</Button>
      </Card>
    </motion.div>
  );
};

export default ECUTuning;
