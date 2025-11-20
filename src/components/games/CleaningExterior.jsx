import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Sparkles, CheckCircle } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { toast } from '@/components/ui/use-toast';

const CleaningExterior = ({ onComplete }) => {
  const { user, addXP } = useUser();
  const [dirtyAreas, setDirtyAreas] = useState([]);
  const [cleanedCount, setCleanedCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [stage, setStage] = useState('cleaning');
  const totalAreas = 12;

  useEffect(() => {
    const areas = Array.from({ length: totalAreas }, (_, i) => ({
      id: i,
      x: Math.random() * 85 + 5,
      y: Math.random() * 80 + 10,
      size: Math.random() * 50 + 30,
      cleaned: false
    }));
    setDirtyAreas(areas);
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
  }, [stage, cleanedCount]);

  const handleComplete = () => {
    if (stage === 'complete') return;
    setStage('complete');
    const completionRate = (cleanedCount / totalAreas) * 100;
    const xpGained = Math.round(20 + (completionRate / 100) * 10);
    addXP(xpGained);
    toast({
      title: "Exterior Cleaned!",
      description: `${completionRate.toFixed(0)}% clean! Earned +${xpGained} XP.`,
    });
    setTimeout(onComplete, 1500);
  };

  const handleAreaClean = (areaId) => {
    setDirtyAreas(prev => prev.map(area =>
      area.id === areaId ? { ...area, cleaned: true } : area
    ));
    setCleanedCount(prev => prev + 1);

    if (cleanedCount + 1 >= totalAreas) {
      handleComplete();
    }
  };

  const carColor = user?.car_color || '#DC2626';
  const cleanPercentage = (cleanedCount / totalAreas) * 100;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Card className="bg-slate-900/80 border-cyan-500/50 p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-cyan-400" />
            Exterior Detailing
          </h3>
          <div className="text-lg font-semibold text-white">
            Time: {timeLeft}s
          </div>
        </div>

        <div className="relative h-80 bg-gradient-to-b from-slate-800 to-slate-900 rounded-lg overflow-hidden border-2 border-slate-700">
          <svg viewBox="0 0 300 150" className="w-full h-full">
            <defs>
              <linearGradient id="cleanCarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: carColor, stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: carColor, stopOpacity: 0.8 }} />
              </linearGradient>
            </defs>
            
            <g transform="translate(150, 75)">
              <ellipse cx="0" cy="35" rx="120" ry="15" fill="#000" opacity="0.3"/>
              
              <path
                d="M -80 20 L -90 0 L -60 -15 L 0 -20 L 60 -15 L 90 0 L 80 20 L 70 30 L -70 30 Z"
                fill="url(#cleanCarGradient)"
                stroke="#000"
                strokeWidth="2"
                style={{
                  filter: cleanPercentage > 80 ? 'drop-shadow(0 0 10px rgba(255,255,255,0.5))' : 'none'
                }}
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
            {dirtyAreas.filter(area => !area.cleaned).map(area => (
              <motion.div
                key={area.id}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{
                  scale: 0,
                  opacity: 0,
                  transition: { duration: 0.3 }
                }}
                className="absolute cursor-pointer"
                style={{
                  left: `${area.x}%`,
                  top: `${area.y}%`,
                  width: `${area.size}px`,
                  height: `${area.size}px`
                }}
                onClick={() => handleAreaClean(area.id)}
              >
                <div
                  className="w-full h-full rounded-full bg-gradient-radial from-gray-600/60 to-gray-800/80 hover:scale-110 transition-transform"
                  style={{
                    filter: 'blur(4px)',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)'
                  }}
                />
              </motion.div>
            ))}
          </AnimatePresence>

          {cleanPercentage > 80 && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.3, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="w-full h-full bg-gradient-radial from-white/20 to-transparent" />
            </motion.div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Shine Level</span>
            <span className="text-cyan-400 font-semibold">{cleanPercentage.toFixed(0)}%</span>
          </div>
          <Progress value={cleanPercentage} className="h-3 bg-slate-700" />
        </div>

        <div className="text-center text-slate-400 text-sm">
          Click dirty spots to polish them! ({cleanedCount}/{totalAreas})
        </div>

        {stage === 'complete' && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-center py-4"
          >
            <div className="text-2xl font-bold text-cyan-400 flex items-center justify-center gap-2">
              <Sparkles className="w-8 h-8" />
              Mirror Shine!
            </div>
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
};

export default CleaningExterior;
