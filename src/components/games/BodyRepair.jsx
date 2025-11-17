import React, { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Hammer, PaintBucket, Wind } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { toast } from '@/components/ui/use-toast';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import CarModel from '@/components/CarModel'; // We can show damage on this model

const BodyRepair = ({ onComplete }) => {
  const { user, addXP } = useUser();
  const [stage, setStage] = useState('sanding'); // sanding, filling, painting
  const [progress, setProgress] = useState(0);
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

  const handleAction = () => {
    setProgress(p => Math.min(100, p + 10));
  };

  useEffect(() => {
    if (progress >= 100) {
      if (stage === 'painting') {
        endGame();
      } else {
        const nextStage = stage === 'sanding' ? 'filling' : 'painting';
        setStage(nextStage);
        setProgress(0);
      }
    }
  }, [progress, stage]);

  const endGame = () => {
    const score = (stage === 'painting' && progress === 100) ? 500 + timeLeft * 5 : progress * 5 + timeLeft * 2;
    const xpGained = Math.round(score / 15);
    addXP(xpGained);
    toast({
      title: "Body Repair Complete!",
      description: `You scored ${score} and earned +${xpGained} XP.`,
    });
    setTimeout(onComplete, 1500);
  };

  const stageData = {
    'sanding': { title: 'Sanding Dent', icon: Wind },
    'filling': { title: 'Applying Filler', icon: PaintBucket },
    'painting': { title: 'Painting', icon: Hammer }
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
              <ambientLight intensity={0.8} />
              <directionalLight position={[10, 5, 5]} />
              <CarModel color={user?.car_color || '#DC2626'} />
              <OrbitControls />
            </Canvas>
          </Suspense>
        </div>

        <div>
          <label className="text-slate-400">Repair Progress</label>
          <Progress value={progress} className="h-3" />
        </div>

        <div className="text-center">
            <Button onClick={handleAction} className="w-1/2 h-16 text-lg" variant="outline">
                Perform Action
            </Button>
        </div>
      </Card>
    </motion.div>
  );
};

export default BodyRepair;
