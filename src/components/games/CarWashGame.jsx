import React, { useState, useRef, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Droplets, WashingMachine, Sparkles, Wind } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { toast } from '@/components/ui/use-toast';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Float } from '@react-three/drei';
import * as THREE from 'three';
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
                    {/* HDRI Environment for realistic garage lighting */}
                    <Environment preset="warehouse" background={false} />
                    
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
                      <CarModel color={user?.car_color || '#DC2626'} />
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
