import React, { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RefreshCw, ArrowUp, ArrowDown } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { toast } from '@/components/ui/use-toast';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Float } from '@react-three/drei';
import * as THREE from 'three';
import WheelModel from './WheelModel';

const TireRotation = ({ onComplete }) => {
  const { addXP } = useUser();
  const [stage, setStage] = useState('jacking');
  const [jackHeight, setJackHeight] = useState(0);
  const [lugNuts, setLugNuts] = useState([false, false, false, false, false]);
  const [score, setScore] = useState(0);
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

  const handleJack = (amount) => {
    setJackHeight(h => {
      const newHeight = h + amount;
      if (newHeight >= 100) {
        setStage('loosen_lugs');
        return 100;
      }
      return newHeight;
    });
  };

  const handleLugNutClick = (index) => {
    if ((stage === 'loosen_lugs' || stage === 'tighten_lugs') && !lugNuts[index]) {
      setLugNuts(nuts => nuts.map((nut, i) => (i === index ? true : nut)));
      setScore(s => s + 20);
    }
  };

  useEffect(() => {
    if (stage === 'loosen_lugs' && lugNuts.every(n => n)) {
      setTimeout(() => {
        setStage('swap_tire');
        setLugNuts([false, false, false, false, false]);
      }, 1000);
    } else if (stage === 'tighten_lugs' && lugNuts.every(n => n)) {
        setTimeout(() => {
            endGame();
        }, 1000);
    }
  }, [lugNuts, stage]);

  const handleSwapTire = () => {
    setStage('tighten_lugs');
    setScore(s => s + 100);
  };

  const endGame = () => {
    const finalScore = score + timeLeft * 2;
    const xpGained = Math.round(finalScore / 10);
    addXP(xpGained);
    toast({
      title: "Tire Rotation Complete!",
      description: `You scored ${finalScore} and earned +${xpGained} XP.`,
    });
    setTimeout(onComplete, 1500);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Card className="bg-slate-900/80 border-cyan-500/50 p-6 space-y-4">
        <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold text-white"><RefreshCw className="inline mr-2" />Tire Rotation</h3>
            <div>
                <span className="text-lg font-bold">Score: {score} | </span>
                <span className="text-lg font-bold">Time: {timeLeft}s</span>
            </div>
        </div>

        <div className="h-64 bg-black rounded-lg overflow-hidden">
          <Suspense fallback={<div className="flex items-center justify-center h-full text-cyan-400">Loading Wheel...</div>}>
            <Canvas
              shadows
              camera={{ position: [2.5, 1.5, 2.5], fov: 50 }}
              gl={{
                antialias: true,
                toneMapping: THREE.ACESFilmicToneMapping,
                toneMappingExposure: 1.1
              }}
            >
              {/* HDRI Environment for realistic garage lighting */}
              <Environment preset="warehouse" background={false} />
              
              {/* Enhanced Lighting Setup */}
              <ambientLight intensity={0.4} />
              
              {/* Main spotlight from above */}
              <spotLight 
                position={[0, 5, 0]} 
                angle={0.5} 
                penumbra={1}
                intensity={2}
                castShadow
                shadow-mapSize-width={1024}
                shadow-mapSize-height={1024}
              />
              
              {/* Rim lights for cinematic effect */}
              <pointLight position={[-3, 2, 2]} intensity={1.5} color="#00ffff" distance={10} decay={2} />
              <pointLight position={[3, 2, 2]} intensity={1.2} color="#ff6b35" distance={10} decay={2} />
              <pointLight position={[0, 1, -3]} intensity={0.8} color="#ffffff" distance={8} decay={2} />
              
              {/* Wheel with subtle floating animation */}
              <Float speed={1.5} rotationIntensity={0.05} floatIntensity={0.1}>
                <WheelModel onLugNutClick={handleLugNutClick} />
              </Float>
              
              {/* Ground plane for shadows */}
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
                <planeGeometry args={[12, 12]} />
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

        <div>
          <h4 className='font-bold mb-2'>Current Stage: {stage.replace('_', ' ')}</h4>
          {stage === 'jacking' && <Progress value={jackHeight} />}
          {(stage === 'loosen_lugs' || stage === 'tighten_lugs') && <Progress value={(lugNuts.filter(Boolean).length / 5) * 100} />}
        </div>

        <div className="flex justify-center gap-4">
          {stage === 'jacking' && <Button onClick={() => handleJack(20)}><ArrowUp className="mr-2" />Jack Up</Button>}
          {stage === 'swap_tire' && <Button onClick={handleSwapTire}>Swap Tire</Button>}
          {(stage === 'loosen_lugs' || stage === 'tighten_lugs') && <p className='text-center text-slate-400'>Click the lug nuts to continue.</p>}
        </div>
      </Card>
    </motion.div>
  );
};

export default TireRotation;
