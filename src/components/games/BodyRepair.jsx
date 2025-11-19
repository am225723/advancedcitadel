import React, { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Hammer, PaintBucket, Wind } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { toast } from '@/components/ui/use-toast';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Float } from '@react-three/drei';
import * as THREE from 'three';
import { Car3DModel } from '@/components/CarModel';

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

        <div className="h-64 bg-black rounded-lg overflow-hidden">
          <Suspense fallback={<div className="flex items-center justify-center h-full text-cyan-400">Loading Car...</div>}>
            <Canvas
              shadows
              camera={{ position: [3.5, 1.5, 3.5], fov: 50 }}
              gl={{
                antialias: true,
                toneMapping: THREE.ACESFilmicToneMapping,
                toneMappingExposure: 1.1
              }}
            >
              {/* HDRI Environment for realistic workshop lighting */}
              <Environment preset="city" background={false} />
              
              {/* Enhanced Lighting Setup */}
              <ambientLight intensity={0.4} />
              
              {/* Main directional light from above-left */}
              <directionalLight 
                position={[10, 10, 5]} 
                intensity={1.5}
                castShadow
                shadow-mapSize-width={1024}
                shadow-mapSize-height={1024}
              />
              
              {/* Rim lights for detail visibility */}
              <pointLight position={[-4, 2, 3]} intensity={1.2} color="#00d4ff" distance={12} decay={2} />
              <pointLight position={[4, 2, 3]} intensity={1.0} color="#ffaa00" distance={12} decay={2} />
              <spotLight 
                position={[0, 6, 0]} 
                angle={0.5} 
                penumbra={1}
                intensity={1.5}
                color="#ffffff"
              />
              
              {/* Car with subtle float */}
              <Float speed={1.2} rotationIntensity={0.03} floatIntensity={0.08}>
                <Car3DModel color={user?.car_color || '#DC2626'} />
              </Float>
              
              {/* Workshop floor */}
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
                <planeGeometry args={[15, 15]} />
                <meshStandardMaterial 
                  color="#2a2a2a"
                  roughness={0.7}
                  metalness={0.3}
                />
              </mesh>
              
              <OrbitControls 
                enableZoom={false}
                autoRotate
                autoRotateSpeed={0.8}
                minPolarAngle={Math.PI / 6}
                maxPolarAngle={Math.PI / 2.2}
              />
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
