import React, { useState, useEffect, useRef, Suspense, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import SoulEmber from '@/components/SoulEmber';
import { Button } from '@/components/ui/button';
import { Pause, Play, RotateCw, Settings, GlassWater, Shield, Moon } from 'lucide-react';
import { Stars, Text } from '@react-three/drei';
import { useToast } from '@/components/ui/use-toast';

// --- Configuration for Breathing Rites ---
const breathingRites = {
  'Estus Breath': { icon: GlassWater, rite: { inhale: 5.5, hold: 0, exhale: 5.5, holdAfter: 0 } },
  'Iron Flesh': { icon: Shield, rite: { inhale: 4, hold: 4, exhale: 4, holdAfter: 4 } },
  'Twilit Respite': { icon: Moon, rite: { inhale: 4, hold: 7, exhale: 8, holdAfter: 0 } },
};

// --- Helper Components ---
const CircularProgress = ({ progress }) => {
    const radius = 2.5;
    const strokeWidth = 0.08;
    return (
        <group position={[0, -1.8, 0]}>
            <mesh rotation={[0, 0, Math.PI / 2]}>
                <ringGeometry args={[radius, radius + strokeWidth, 128]} />
                <meshBasicMaterial color="#d4af37" transparent opacity={0.2} side={THREE.DoubleSide} />
            </mesh>
            <mesh rotation={[0, 0, Math.PI / 2]}>
                <ringGeometry args={[radius, radius + strokeWidth, 128, 1, 0, progress * Math.PI * 2]} />
                <meshBasicMaterial color="#d4af37" side={THREE.DoubleSide} />
            </mesh>
        </group>
    );
};

// --- Timer Component (runs inside Canvas) ---
const BreathingTimer = ({ isRunning, isPaused, rite, onPhaseChange, onTimeUpdate }) => {
  const timer = useRef({
      phaseIndex: 0,
      timeInPhase: 0,
      phases: [],
      phaseDurations: []
  });

  useEffect(() => {
    const phases = ['inhale', 'hold', 'exhale', 'holdAfter'];
    const phaseDurations = phases.map(p => rite[p]);
    timer.current = { ...timer.current, phases, phaseDurations };
  }, [rite]);

  useFrame((state, delta) => {
    if (!isRunning || isPaused) return;

    timer.current.timeInPhase += delta;
    const { timeInPhase, phaseIndex, phases, phaseDurations } = timer.current;
    
    const currentPhaseName = phases[phaseIndex];
    const currentPhaseDuration = phaseDurations[phaseIndex];

    onPhaseChange(currentPhaseName);
    onTimeUpdate(
      Math.max(0, currentPhaseDuration - timeInPhase),
      currentPhaseDuration > 0 ? Math.min(1, timeInPhase / currentPhaseDuration) : 1
    );

    if (timeInPhase >= currentPhaseDuration) {
        let nextPhaseIndex = (phaseIndex + 1) % phases.length;
        
        while(phaseDurations[nextPhaseIndex] <= 0) {
            nextPhaseIndex = (nextPhaseIndex + 1) % phases.length;
        }

        timer.current.phaseIndex = nextPhaseIndex;
        timer.current.timeInPhase = 0;
    }
  });

  return null;
};

// --- Main App Component ---
const BonfireOfBreath = () => {
  const [selectedRiteKey, setSelectedRiteKey] = useState('Estus Breath');
  const [rite, setRite] = useState(breathingRites[selectedRiteKey].rite);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  const [phase, setPhase] = useState('idle');
  const [timeLeft, setTimeLeft] = useState(0);
  const [phaseProgress, setPhaseProgress] = useState(0);
  
  const { toast } = useToast();
  
  useEffect(() => {
    if (isRunning && !isPaused) {
      hapticFeedback(rite[phase] * 1000);
    }
  }, [phase, isRunning, isPaused]);

  const hapticFeedback = (pattern) => {
    if ('vibrate' in navigator && pattern && pattern > 0) {
      navigator.vibrate(pattern);
    }
  };
  
  const handlePhaseChange = (newPhase) => {
    setPhase(newPhase);
  };

  const handleTimeUpdate = (timeRemaining, progress) => {
    setTimeLeft(timeRemaining);
    setPhaseProgress(progress);
  };

  const start = () => {
    setIsRunning(true);
    setIsPaused(false);
    setPhase('inhale');
    setTimeLeft(rite.inhale);
    setPhaseProgress(0);
  };
  
  const pause = () => {
    if (!isRunning) return;
    setIsPaused(true);
    if ('vibrate' in navigator) navigator.vibrate(0);
  };
  
  const resume = () => {
    if (!isRunning) return;
    setIsPaused(false);
  };

  const reset = () => {
    setIsRunning(false);
    setIsPaused(false);
    setPhase('idle');
    setTimeLeft(0);
    setPhaseProgress(0);
    if ('vibrate' in navigator) navigator.vibrate(0);
  };
  
  const selectRite = (key) => {
      setSelectedRiteKey(key);
      setRite(breathingRites[key].rite);
      reset();
  }

  const phaseText = useMemo(() => {
    if (!isRunning) return "Ready?";
    if (isPaused) return "Paused";
    switch (phase) {
      case 'inhale': return "INHALE";
      case 'hold': return "HOLD";
      case 'exhale': return "EXHALE";
      case 'holdAfter': return "STILL";
      default: return "";
    }
  }, [isRunning, isPaused, phase]);

  return (
    <>
      <Helmet>
        <title>The Bonfire of Breath - The Citadel</title>
        <meta name="description" content="A meditative breathing ritual to rekindle your inner flame." />
      </Helmet>
      <div className="fixed inset-0 bg-black">
          <Canvas camera={{ position: [0, -0.2, 4.5], fov: 85 }}>
            <ambientLight intensity={0.1} />
            <Suspense fallback={null}>
              <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
              <SoulEmber phase={phase} phaseProgress={phaseProgress} isRunning={isRunning} />
              
              <BreathingTimer 
                isRunning={isRunning} 
                isPaused={isPaused} 
                rite={rite}
                onPhaseChange={handlePhaseChange}
                onTimeUpdate={handleTimeUpdate}
              />

               {/* UI Elements inside the Canvas */}
               <AnimatePresence>
                 {(isRunning || phase === 'idle') && (
                   <motion.group initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                     <Text color="#d4af37" fontSize={0.7} font="/fonts/CormorantGaramond-Regular.ttf" position={[0, 1.5, 0]} anchorX="center">
                       {phaseText}
                     </Text>
                     {isRunning && !isPaused && (
                        <>
                         <Text color="#d4af37" fontSize={1.2} font="/fonts/CormorantGaramond-Bold.ttf" position={[0, -0.8, 0]} anchorX="center">
                           {Math.ceil(timeLeft)}
                         </Text>
                         <CircularProgress progress={phaseProgress} />
                        </>
                     )}
                   </motion.group>
                 )}
               </AnimatePresence>
            </Suspense>
            <EffectComposer>
              <Bloom intensity={0.6} luminanceThreshold={0.7} luminanceSmoothing={0.5} />
              <Vignette eskil={false} offset={0.1} darkness={1.1} />
            </EffectComposer>
          </Canvas>

          {/* HTML UI Overlay */}
          <div className="absolute bottom-8 left-0 right-0 p-8 flex flex-col items-center justify-center pointer-events-none">
                <div className="flex gap-4 md:gap-8 items-center pointer-events-auto">
                    {!isRunning ? (
                        <>
                         {Object.entries(breathingRites).map(([key, { icon: Icon }]) => (
                              <div key={key} className="flex flex-col items-center gap-2 text-center cursor-pointer group" onClick={() => selectRite(key)}>
                                  <div className={`p-3 rounded-full border-2 transition-all duration-300 ${selectedRiteKey === key ? 'border-yellow-400 bg-yellow-400/10' : 'border-slate-600 group-hover:border-yellow-400/50'}`}>
                                      <Icon className={`w-8 h-8 transition-colors duration-300 ${selectedRiteKey === key ? 'text-yellow-400' : 'text-slate-400 group-hover:text-yellow-300'}`} />
                                  </div>
                                  <span className={`text-xs md:text-sm transition-colors duration-300 ${selectedRiteKey === key ? 'text-yellow-400' : 'text-slate-500 group-hover:text-slate-300'}`}>{key}</span>
                              </div>
                          ))}
                          <Button onClick={start} size="lg" className="bg-yellow-400/10 border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black rounded-full w-20 h-20">
                              <Play className="w-8 h-8" />
                          </Button>
                        </>
                    ) : (
                        <>
                           <Button onClick={reset} size="lg" variant="ghost" className="text-slate-400 hover:text-red-500 rounded-full w-20 h-20">
                               <RotateCw className="w-8 h-8" />
                           </Button>
                           <Button onClick={isPaused ? resume : pause} size="lg" className="bg-yellow-400 text-black hover:bg-yellow-400/80 rounded-full w-24 h-24">
                               {isPaused ? <Play className="w-10 h-10"/> : <Pause className="w-10 h-10" />}
                           </Button>
                           <Button size="lg" variant="ghost" className="text-slate-400 hover:text-yellow-400 rounded-full w-20 h-20" onClick={() => toast({title: "🚧 Custom rites coming soon!"})}>
                               <Settings className="w-8 h-8" />
                           </Button>
                        </>
                    )}
                </div>
          </div>
      </div>
    </>
  );
};

export default BonfireOfBreath;
