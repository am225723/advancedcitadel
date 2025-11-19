import React, { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Filter, CheckCircle, XCircle } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { toast } from '@/components/ui/use-toast';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Float } from '@react-three/drei';
import * as THREE from 'three';
import EngineBayModel from './EngineBayModel';

const OilChange = ({ onComplete }) => {
  const { addXP } = useUser();
  const [tasks, setTasks] = useState({
    'drain_plug': false,
    'oil_filter': false,
    'oil_cap': false,
    'fill_oil': false,
    'replace_cap': false
  });
  const [timeLeft, setTimeLeft] = useState(120);
  const [score, setScore] = useState(0);

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

  const handlePartClick = (partName) => {
    switch (partName) {
      case 'drain_plug':
        if (!tasks.drain_plug) {
          setTasks(t => ({ ...t, drain_plug: true }));
          setScore(s => s + 50);
        }
        break;
      case 'oil_filter':
        if (tasks.drain_plug && !tasks.oil_filter) {
          setTasks(t => ({ ...t, oil_filter: true }));
          setScore(s => s + 50);
        } else {
          toast({ variant: "destructive", title: "Drain the oil first!" });
        }
        break;
      case 'oil_cap':
        if (tasks.oil_filter && !tasks.oil_cap) {
          setTasks(t => ({ ...t, oil_cap: true }));
          setScore(s => s + 50);
        }
        break;
      default:
        break;
    }
  };

  const handleFillOil = () => {
    if (tasks.oil_cap && !tasks.fill_oil) {
        setTasks(t => ({...t, fill_oil: true}));
        setScore(s => s + 100);
    }
  }

  const endGame = () => {
    const allComplete = Object.values(tasks).every(Boolean);
    const finalScore = allComplete ? score + timeLeft * 5 : score;
    const xpGained = Math.round(finalScore / 15);
    addXP(xpGained);

    toast({
      title: allComplete ? "Oil Change Complete!" : "Time's Up!",
      description: `You scored ${finalScore} and earned +${xpGained} XP.`,
    });
    setTimeout(onComplete, 2000);
  };

  const taskList = [
      { id: 'drain_plug', text: 'Unscrew Drain Plug' },
      { id: 'oil_filter', text: 'Replace Oil Filter' },
      { id: 'oil_cap', text: 'Open Oil Cap' },
      { id: 'fill_oil', text: 'Fill with New Oil' },
  ]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Card className="bg-slate-900/80 border-cyan-500/50 p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-bold text-white"><Filter className="inline mr-2" />Oil Change</h3>
          <div>
            <span className="text-lg font-bold">Score: {score} | </span>
            <span className="text-lg font-bold">Time: {timeLeft}s</span>
          </div>
        </div>

        <div className="h-64 bg-black rounded-lg overflow-hidden">
          <Suspense fallback={<div className="flex items-center justify-center h-full text-cyan-400">Loading Engine Bay...</div>}>
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
              
              {/* Engine Bay with subtle floating animation */}
              <Float speed={1.5} rotationIntensity={0.05} floatIntensity={0.1}>
                <EngineBayModel onPartClick={handlePartClick} />
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

        <div className='grid grid-cols-2 gap-4'>
            <div>
                <h4 className='font-bold mb-2'>Tasks:</h4>
                <ul className="space-y-2">
                    {taskList.map(task => (
                        <li key={task.id} className="flex items-center text-slate-300">
                            {tasks[task.id] ? <CheckCircle className="text-green-500 mr-2" /> : <XCircle className="text-red-500 mr-2" />}
                            {task.text}
                        </li>
                    ))}
                </ul>
            </div>
            <div className='flex flex-col gap-4 justify-center'>
                <Button onClick={handleFillOil} disabled={!tasks.oil_cap || tasks.fill_oil}>Fill Oil</Button>
                <Button onClick={endGame} className="bg-green-600 hover:bg-green-700">Finish</Button>
            </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default OilChange;
