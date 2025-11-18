import React, { useState, useEffect, useRef, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Wrench, Zap, Fuel, Rss, CircleDotDashed } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Float } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, DepthOfField } from '@react-three/postprocessing';
import EngineModel from './EngineModel';
import * as THREE from 'three';

const EngineTuning = ({ onComplete }) => {
  const { addXP } = useUser();
  const [tasks, setTasks] = useState([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [currentTask, setCurrentTask] = useState(null);
  const [highlightedPart, setHighlightedPart] = useState(null);

  const taskTypes = [
    { name: 'Spark Plugs', icon: Zap, color: 'text-yellow-400' },
    { name: 'Injectors', icon: Fuel, color: 'text-green-400' },
    { name: 'Camshaft', icon: Rss, color: 'text-blue-400' },
    { name: 'Turbo', icon: CircleDotDashed, color: 'text-red-400' },
  ];

  useEffect(() => {
    generateTasks();
    const gameTimer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(gameTimer);
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(gameTimer);
  }, []);

  const generateTasks = () => {
    const newTasks = Array.from({ length: 10 }, (_, i) => ({
      id: i,
      part: taskTypes[Math.floor(Math.random() * taskTypes.length)],
      time: Math.random() * 2 + 1, // Time to complete: 1-3 seconds
      completed: false,
    }));
    setTasks(newTasks);
    setCurrentTask(newTasks[0]);
    setHighlightedPart(newTasks[0].part.name);
  };

  const handlePartClick = (partName) => {
    if (currentTask && partName === currentTask.part.name) {
      setScore(s => s + 100);
      const newTasks = tasks.map(t => t.id === currentTask.id ? { ...t, completed: true } : t);
      setTasks(newTasks);

      const nextTask = newTasks.find(t => !t.completed);
      if(nextTask) {
        setCurrentTask(nextTask);
        setHighlightedPart(nextTask.part.name);
      } else {
        endGame();
      }
    } else {
      // Penalty for wrong click
      setScore(s => Math.max(0, s - 50));
      toast({ variant: 'destructive', title: 'Wrong Part!' });
    }
  };

  const endGame = () => {
    const xpGained = Math.round(score / 20);
    addXP(xpGained);
    toast({
      title: "Engine Tuning Complete!",
      description: `You scored ${score} and earned +${xpGained} XP.`,
    });
    setTimeout(onComplete, 2000);
  };

  const CurrentTaskIcon = currentTask?.part.icon;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Card className="bg-slate-900/80 border-cyan-500/50 p-6 space-y-4">
        <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold text-white flex items-center">
                <Wrench className="w-6 h-6 text-cyan-400 mr-2" />
                Engine Tuning
            </h3>
            <div className='flex gap-4'>
                <div className="text-lg font-semibold text-white">Score: {score}</div>
                <div className="text-lg font-semibold text-white">Time: {timeLeft}s</div>
            </div>
        </div>
        
        <div className="h-64 bg-black rounded-lg overflow-hidden">
            <Suspense fallback={<div className="flex items-center justify-center h-full text-cyan-400">Loading Engine...</div>}>
                <Canvas
                  shadows
                  camera={{ position: [3, 2, 3], fov: 50 }}
                  gl={{
                    antialias: true,
                    toneMapping: THREE.ACESFilmicToneMapping,
                    toneMappingExposure: 1.1
                  }}
                >
                    {/* HDRI Environment for realistic workshop lighting */}
                    <Environment preset="warehouse" background={false} />
                    
                    {/* Enhanced Lighting Setup */}
                    <ambientLight intensity={0.4} />
                    
                    {/* Main spotlight from above */}
                    <spotLight 
                      position={[0, 6, 0]} 
                      angle={0.5} 
                      penumbra={1}
                      intensity={2}
                      castShadow
                      shadow-mapSize-width={1024}
                      shadow-mapSize-height={1024}
                    />
                    
                    {/* Rim lights for cinematic effect */}
                    <pointLight position={[-4, 3, 3]} intensity={1.5} color="#00ffff" distance={12} decay={2} />
                    <pointLight position={[4, 3, 3]} intensity={1.2} color="#ff6b35" distance={12} decay={2} />
                    <pointLight position={[0, 1, -3]} intensity={0.8} color="#ffffff" distance={10} decay={2} />
                    
                    {/* Engine with subtle floating animation */}
                    <Float speed={1.5} rotationIntensity={0.05} floatIntensity={0.1}>
                      <EngineModel highlightedPart={highlightedPart} onPartClick={handlePartClick} />
                    </Float>
                    
                    {/* Ground plane for shadows */}
                    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]} receiveShadow>
                      <planeGeometry args={[15, 15]} />
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
                      autoRotate
                      autoRotateSpeed={0.5}
                      minPolarAngle={Math.PI / 4}
                      maxPolarAngle={Math.PI / 2}
                    />
                </Canvas>
            </Suspense>
        </div>

        <div className="text-center p-4 bg-slate-900 rounded-lg">
          <p className="text-slate-400 mb-2">Next Task:</p>
          {currentTask && CurrentTaskIcon && (
            <div className={`flex items-center justify-center text-xl font-bold ${currentTask.part.color}`}>
              <CurrentTaskIcon className="w-6 h-6 mr-2" />
              <span>{currentTask.part.name}</span>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

export default EngineTuning;
