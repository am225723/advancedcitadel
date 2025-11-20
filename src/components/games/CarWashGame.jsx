import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Droplets, Sparkles } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { toast } from '@/components/ui/use-toast';

const CarWashGame = ({ onComplete }) => {
  const { user, addXP } = useUser();
  const [timeLeft, setTimeLeft] = useState(90);
  const [dirtSpots, setDirtSpots] = useState([]);
  const [soapBubbles, setSoapBubbles] = useState([]);
  const [cleanedSpots, setCleanedSpots] = useState(0);
  const [stage, setStage] = useState('washing');
  const totalSpots = 15;

  useEffect(() => {
    const spots = Array.from({ length: totalSpots }, (_, i) => ({
      id: i,
      x: Math.random() * 85 + 5,
      y: Math.random() * 85 + 5,
      size: Math.random() * 30 + 20,
      cleaned: false
    }));
    setDirtSpots(spots);
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
  }, [stage, cleanedSpots]);

  const handleComplete = () => {
    if (stage === 'complete') return;
    setStage('complete');
    const completionRate = (cleanedSpots / totalSpots) * 100;
    const xpGained = Math.round(20 + (completionRate / 100) * 10);
    addXP(xpGained);
    toast({ 
      title: "Car Wash Complete!", 
      description: `${completionRate.toFixed(0)}% clean! You earned +${xpGained} XP.` 
    });
    setTimeout(onComplete, 1500);
  };

  const handleSpotClick = (spotId) => {
    setDirtSpots(prev => prev.map(spot => 
      spot.id === spotId ? { ...spot, cleaned: true } : spot
    ));
    setCleanedSpots(prev => prev + 1);
    
    setSoapBubbles(prev => [...prev, {
      id: Date.now() + Math.random(),
      x: Math.random() * 100,
      y: Math.random() * 100
    }]);

    if (cleanedSpots + 1 >= totalSpots) {
      handleComplete();
    }
  };

  const cleanPercentage = (cleanedSpots / totalSpots) * 100;
  const carColor = user?.car_color || '#DC2626';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Card className="bg-slate-900/80 border-cyan-500/50 p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-bold text-white flex items-center gap-2">
            <Droplets className="w-6 h-6 text-cyan-400" />
            Mindful Car Wash
          </h3>
          <div className="text-lg font-semibold text-white">
            Time: {Math.floor(timeLeft / 60)}:{('0' + timeLeft % 60).slice(-2)}
          </div>
        </div>

        <div className="relative h-80 bg-gradient-to-b from-slate-800 to-slate-900 rounded-lg overflow-hidden border-2 border-slate-700">
          <svg viewBox="0 0 300 150" className="w-full h-full">
            <defs>
              <linearGradient id="carGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: carColor, stopOpacity: 0.9 }} />
                <stop offset="100%" style={{ stopColor: carColor, stopOpacity: 1 }} />
              </linearGradient>
            </defs>
            
            <g transform="translate(150, 75)">
              <ellipse cx="0" cy="35" rx="120" ry="15" fill="#000" opacity="0.3"/>
              
              <path
                d="M -80 20 L -90 0 L -60 -15 L 0 -20 L 60 -15 L 90 0 L 80 20 L 70 30 L -70 30 Z"
                fill="url(#carGradient)"
                stroke="#000"
                strokeWidth="2"
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
            {dirtSpots.filter(spot => !spot.cleaned).map(spot => (
              <motion.div
                key={spot.id}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="absolute cursor-pointer"
                style={{
                  left: `${spot.x}%`,
                  top: `${spot.y}%`,
                  width: `${spot.size}px`,
                  height: `${spot.size}px`
                }}
                onClick={() => handleSpotClick(spot.id)}
              >
                <div
                  className="w-full h-full rounded-full bg-gradient-radial from-amber-900/80 to-amber-950/90 hover:scale-110 transition-transform"
                  style={{
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)'
                  }}
                />
              </motion.div>
            ))}
          </AnimatePresence>

          <AnimatePresence>
            {soapBubbles.slice(-5).map(bubble => (
              <motion.div
                key={bubble.id}
                initial={{ scale: 0, y: 0, opacity: 1 }}
                animate={{ scale: 1.5, y: -100, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5 }}
                className="absolute pointer-events-none"
                style={{
                  left: `${bubble.x}%`,
                  top: `${bubble.y}%`
                }}
              >
                <Sparkles className="text-cyan-300 w-6 h-6" />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Cleanliness</span>
            <span className="text-cyan-400 font-semibold">{cleanPercentage.toFixed(0)}%</span>
          </div>
          <Progress value={cleanPercentage} className="h-3 bg-slate-700" />
        </div>

        <div className="text-center text-slate-400 text-sm">
          Click on the dirt spots to clean your car! ({cleanedSpots}/{totalSpots})
        </div>

        {stage === 'complete' && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-center py-4"
          >
            <div className="text-2xl font-bold text-cyan-400">✨ Sparkling Clean! ✨</div>
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
};

export default CarWashGame;
