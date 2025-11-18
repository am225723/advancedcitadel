import React, { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Sun, Droplets, Wind } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { toast } from '@/components/ui/use-toast';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Float } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, DepthOfField } from '@react-three/postprocessing';
import * as THREE from 'three';
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

        <div className="h-64 bg-black rounded-lg overflow-hidden">
          <Suspense fallback={<div className="flex items-center justify-center h-full text-cyan-400">Loading Car...</div>}>
            <Canvas
              shadows
              camera={{ position: [4, 2, 4], fov: 50 }}
              gl={{
                antialias: true,
                toneMapping: THREE.ACESFilmicToneMapping,
                toneMappingExposure: 1.2
              }}
            >
              {/* HDRI Environment for realistic detailing bay */}
              <Environment preset="city" background={false} />
              
              {/* Enhanced Lighting Setup */}
              <ambientLight intensity={0.3} />
              
              {/* Main spotlight from above */}
              <spotLight 
                position={[0, 8, 0]} 
                angle={0.4} 
                penumbra={1}
                intensity={2}
                castShadow
                shadow-mapSize-width={1024}
                shadow-mapSize-height={1024}
              />
              
              {/* Rim lights for cinematic effect */}
              <pointLight position={[-5, 3, 3]} intensity={1.5} color="#00ffff" distance={15} decay={2} />
              <pointLight position={[5, 3, 3]} intensity={1.2} color="#ff6b35" distance={15} decay={2} />
              <pointLight position={[0, 1, -4]} intensity={0.8} color="#ffffff" distance={10} decay={2} />
              
              {/* Car with subtle floating animation */}
              <Float speed={1.5} rotationIntensity={0.05} floatIntensity={0.1}>
                <CarModel color={user?.car_color || '#F8FAFC'} />
              </Float>
              
              {/* Ground plane for shadows */}
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
                <planeGeometry args={[20, 20]} />
                <meshStandardMaterial 
                  color="#1a1a1a"
                  roughness={0.8}
                  metalness={0.2}
                />
              </mesh>
              
              {/* Post-Processing Effects */}
              <EffectComposer>
                <Bloom 
                  luminanceThreshold={0.3}
                  intensity={1.2}
                  radius={0.5}
                  levels={8}
                />
                <DepthOfField 
                  focusDistance={0.02}
                  focalLength={0.05}
                  bokehScale={3}
                />
                <Vignette eskil={false} offset={0.2} darkness={0.8} />
              </EffectComposer>
              
              <OrbitControls 
                enableZoom={false}
                autoRotate={stage !== 'scrub'}
                autoRotateSpeed={0.5}
                minPolarAngle={Math.PI / 4}
                maxPolarAngle={Math.PI / 2}
              />
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
