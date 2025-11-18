import React, { useState, useRef, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Droplets, WashingMachine, Sparkles, Wind } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { toast } from '@/components/ui/use-toast';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import CarModel from '@/components/CarModel';

const CarWashGame = ({ onComplete }) => {
  const [stage, setStage] = useState('pre-rinse'); // pre-rinse, soap, scrub, final-rinse
  const [dirtLevel, setDirtLevel] = useState(100);
  const [soapLevel, setSoapLevel] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes for the whole wash
  const { user, addXP } = useUser();

  useEffect(() => {
    if (stage !== 'complete') {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            // Handle time up
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [stage]);

  const handleNextStage = () => {
    switch (stage) {
      case 'pre-rinse':
        setStage('soap');
        break;
      case 'soap':
        setStage('scrub');
        break;
      case 'scrub':
        if (dirtLevel > 10) {
          toast({ variant: "destructive", title: "Still Dirty!", description: "You need to scrub more." });
        } else {
          setStage('final-rinse');
        }
        break;
      case 'final-rinse':
        if (soapLevel > 10) {
            toast({ variant: "destructive", title: "Still Soapy!", description: "Rinse off all the soap." });
        } else {
            setStage('complete');
            const thoroughness = 100 - dirtLevel - soapLevel;
            const xpGained = 20 + Math.round(thoroughness / 10);
            addXP(xpGained);
            toast({ title: "Car Wash Complete!", description: `You earned +${xpGained} XP for your thoroughness.` });
            setTimeout(onComplete, 1000);
        }
        break;
      default:
        break;
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Card className="bg-slate-900/80 border-cyan-500/50 p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-bold text-white flex items-center">
            <Droplets className="w-6 h-6 text-cyan-400 mr-2" />
            Mindful Car Wash
          </h3>
          <div className="text-lg font-semibold text-white">
            Time: {Math.floor(timeLeft / 60)}:{('0' + timeLeft % 60).slice(-2)}
          </div>
        </div>

        <div className="h-64 bg-slate-800 rounded-lg">
            <Suspense fallback={<div>Loading Car...</div>}>
                <Canvas>
                    <ambientLight intensity={0.5} />
                    <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
                    <pointLight position={[-10, -10, -10]} />
                    <CarModel color={user?.car_color || '#DC2626'} />
                    <OrbitControls />
                </Canvas>
            </Suspense>
        </div>

        {/* Progress Bars */}
        <div className="space-y-2">
            <div>
                <label className="text-slate-400">Dirt Level</label>
                <Progress value={dirtLevel} className="h-3" />
            </div>
            <div>
                <label className="text-slate-400">Soap Level</label>
                <Progress value={soapLevel} className="h-3" />
            </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            disabled={stage !== 'pre-rinse' && stage !== 'final-rinse'}
            onClick={() => {
                if(stage === 'pre-rinse') setDirtLevel(d => Math.max(0, d - 25));
                if(stage === 'final-rinse') setSoapLevel(s => Math.max(0, s - 25));
            }}
            className="h-20 flex-col gap-2" variant="outline"
          >
            <Sparkles /> Rinse
          </Button>
          <Button
            disabled={stage !== 'soap'}
            onClick={() => setSoapLevel(s => Math.min(100, s + 20))}
            className="h-20 flex-col gap-2" variant="outline"
          >
            <WashingMachine /> Soap
          </Button>
          <Button
            disabled={stage !== 'scrub'}
            onClick={() => setDirtLevel(d => Math.max(0, d - 20))}
            className="h-20 flex-col gap-2" variant="outline"
          >
            <Wind /> Scrub
          </Button>
          <Button
            onClick={handleNextStage}
            className="h-20 bg-green-600 hover:bg-green-700 text-lg"
          >
            {stage === 'final-rinse' ? 'Finish' : 'Next Stage'}
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};

export default CarWashGame;
