import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Hammer, PaintBucket, Wind, CheckCircle } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { toast } from '@/components/ui/use-toast';

const BodyRepair = ({ onComplete }) => {
  const { user, addXP } = useUser();
  const [stage, setStage] = useState('finding');
  const [dents, setDents] = useState([]);
  const [foundDents, setFoundDents] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const totalDents = 8;

  useEffect(() => {
    const dentPositions = Array.from({ length: totalDents }, (_, i) => ({
      id: i,
      x: Math.random() * 80 + 10,
      y: Math.random() * 70 + 15,
      found: false
    }));
    setDents(dentPositions);
  }, []);

  useEffect(() => {
    if (stage === 'complete') return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [stage, foundDents]);

  const handleComplete = () => {
    if (stage === 'complete') return;
    setStage('complete');
    const score = foundDents * 50 + timeLeft * 5;
    const xpGained = Math.round(20 + (foundDents / totalDents) * 10);
    addXP(xpGained);
    toast({
      title: "Body Repair Complete!",
      description: `Found ${foundDents}/${totalDents} dents! Earned +${xpGained} XP.`,
    });
    setTimeout(onComplete, 1500);
  };

  const handleDentClick = (dentId) => {
    setDents(prev => prev.map(dent =>
      dent.id === dentId ? { ...dent, found: true } : dent
    ));
    setFoundDents(prev => prev + 1);

    if (foundDents + 1 >= totalDents) {
      handleComplete();
    }
  };

  const carColor = user?.car_color || '#DC2626';
  const progress = (foundDents / totalDents) * 100;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Card className="bg-slate-900/80 border-cyan-500/50 p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-bold text-white flex items-center gap-2">
            <Hammer className="w-6 h-6 text-cyan-400" />
            Body Repair
          </h3>
          <div className="text-lg font-semibold text-white">
            Time: {timeLeft}s
          </div>
        </div>

        <div className="relative h-80 bg-gradient-to-b from-slate-800 to-slate-900 rounded-lg overflow-hidden border-2 border-slate-700">
          <svg viewBox="0 0 300 150" className="w-full h-full">
            <defs>
              <filter id="dentShadow">
                <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
                <feOffset dx="1" dy="1" result="offsetblur"/>
                <feMerge>
                  <feMergeNode/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            <g transform="translate(150, 75)">
              <ellipse cx="0" cy="35" rx="120" ry="15" fill="#000" opacity="0.3"/>
              
              <path
                d="M -80 20 L -90 0 L -60 -15 L 0 -20 L 60 -15 L 90 0 L 80 20 L 70 30 L -70 30 Z"
                fill={carColor}
                stroke="#000"
                strokeWidth="2"
                opacity="0.9"
              />
              
              <ellipse cx="-50" cy="25" rx="15" ry="10" fill="#1a1a1a"/>
              <ellipse cx="50" cy="25" rx="15" ry="10" fill="#1a1a1a"/>
              
              <path
                d="M -50 -10 L -30 -15 L 30 -15 L 50 -10 L 40 5 L -40 5 Z"
                fill="#87ceeb"
                opacity="0.6"
                stroke="#000"
              />
            </g>
          </svg>

          <AnimatePresence>
            {dents.filter(dent => !dent.found).map(dent => (
              <motion.div
                key={dent.id}
                initial={{ scale: 0 }}
                animate={{ scale: [1, 1.1, 1], transition: { repeat: Infinity, duration: 1 } }}
                exit={{ scale: 0, opacity: 0 }}
                className="absolute cursor-pointer"
                style={{
                  left: `${dent.x}%`,
                  top: `${dent.y}%`,
                  width: '24px',
                  height: '24px'
                }}
                onClick={() => handleDentClick(dent.id)}
              >
                <div className="w-full h-full rounded-full bg-gradient-radial from-red-600/70 to-red-800/90 hover:scale-125 transition-transform border-2 border-red-900 shadow-lg" />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Repair Progress</span>
            <span className="text-cyan-400 font-semibold">{foundDents}/{totalDents} dents</span>
          </div>
          <Progress value={progress} className="h-3 bg-slate-700" />
        </div>

        <div className="text-center text-slate-400 text-sm">
          Click on the red dents to repair them!
        </div>

        {stage === 'complete' && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-center py-4"
          >
            <div className="text-2xl font-bold text-green-400 flex items-center justify-center gap-2">
              <CheckCircle className="w-8 h-8" />
              Body Restored!
            </div>
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
};

export default BodyRepair;
