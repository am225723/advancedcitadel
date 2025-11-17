import React, { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Sun, Droplets, Wind } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { toast } from '@/components/ui/use-toast';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import CarModel from '@/components/CarModel';

const CleaningExterior = ({ onComplete }) => {
  const { user, addXP } = useUser();
  const [stage, setStage] = useState('clay_bar'); // clay_bar, polish, wax
  const [contaminants, setContaminants] = useState(15);
  const [polishLevel, setPolishLevel] = useState(0);
  const [waxLevel, setWaxLevel] = useState(0);
  const [timeLeft, setTimeLeft] = useState(90);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAction = (type) => {
    switch (type) {
      case 'clay_bar':
        setContaminants(c => Math.max(0, c - 1));
        break;
      case 'polish':
        setPolishLevel(p => Math.min(100, p + 10));
        break;
      case 'wax':
        setWaxLevel(w => Math.min(100, w + 10));
        break;
      default:
        break;
    }
  };

  const handleNextStage = () => {
    if (stage === 'clay_bar' && contaminants > 0) {
      toast({ variant: 'destructive', title: 'Still Contaminated!', description: 'You must remove all contaminants.' });
      return;
    }
    if (stage === 'polish' && polishLevel < 100) {
        toast({ variant: 'destructive', title: 'Not Polished Enough!', description: 'The car needs a full polish.' });
        return;
    }
    if (stage === 'wax' && waxLevel < 100) {
        toast({ variant: 'destructive', title: 'Not Fully Waxed!', description: 'Apply a full coat of wax for protection.' });
        return;
    }

    if (stage === 'wax') {
      endGame();
    } else {
      setStage(current => current === 'clay_bar' ? 'polish' : 'wax');
    }
  };

  const endGame = () => {
    const score = (15 - contaminants) * 20 + polishLevel + waxLevel;
    const xpGained = Math.round(score / 20);
    addXP(xpGained);
    toast({
      title: "Exterior Cleaned!",
      description: `You earned +${xpGained} XP for a brilliant shine.`,
    });
    setTimeout(onComplete, 1500);
  };

  const stageData = {
    'clay_bar': { title: 'Clay Bar Treatment', icon: Droplets, progress: ((15 - contaminants) / 15) * 100 },
    'polish': { title: 'Polishing', icon: Sun, progress: polishLevel },
    'wax': { title: 'Waxing', icon: Wind, progress: waxLevel }
  };

  const CurrentIcon = stageData[stage].icon;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Card className="bg-slate-900/80 border-cyan-500/50 p-6 space-y-4">
        <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold text-white flex items-center">
                <CurrentIcon className="w-6 h-6 text-cyan-400 mr-2" />
                {stageData[stage].title}
            </h3>
            <div className="text-lg font-semibold text-white">Time: {timeLeft}s</div>
        </div>

        <div className="h-64 bg-slate-800 rounded-lg">
          <Suspense fallback={<div>Loading Car...</div>}>
            <Canvas>
              <ambientLight intensity={0.7} />
              <directionalLight position={[5, 5, 5]} />
              <CarModel color={user?.car_color || '#F8FAFC'} />
              <OrbitControls />
            </Canvas>
          </Suspense>
        </div>

        <div>
            <label className="text-slate-400">Stage Progress</label>
            <Progress value={stageData[stage].progress} className="h-3" />
        </div>

        <div className="grid grid-cols-2 gap-4">
            <Button
                onClick={() => handleAction(stage)}
                disabled={timeLeft <= 0}
                className="h-20 flex-col gap-2"
                variant="outline"
            >
                Perform Action
            </Button>
            <Button
                onClick={handleNextStage}
                className="h-20 bg-green-600 hover:bg-green-700 text-lg"
            >
                {stage === 'wax' ? 'Finish' : 'Next Stage'}
            </Button>
        </div>
      </Card>
    </motion.div>
  );
};

export default CleaningExterior;
