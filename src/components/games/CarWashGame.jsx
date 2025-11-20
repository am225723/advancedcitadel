import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Droplets, Sparkles, Wind, Target } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { toast } from '@/components/ui/use-toast';
import { getTouchPosition } from '@/lib/touchHelpers';
import evoImage from '../../../attached_assets/stock_images/mitsubishi_lancer_ev_3158e65e.jpg';

const CarWashGame = ({ onComplete }) => {
  const { user, addXP } = useUser();
  const [timeLeft, setTimeLeft] = useState(120);
  const [stage, setStage] = useState('soap');
  const [dirtSpots, setDirtSpots] = useState([]);
  const [soapBubbles, setSoapBubbles] = useState([]);
  const [cleanedSpots, setCleanedSpots] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [pressure, setPressure] = useState(50);
  const [score, setScore] = useState(0);
  const [waterParticles, setWaterParticles] = useState([]);
  const comboTimerRef = useRef(null);
  const totalSpots = 20;

  useEffect(() => {
    const spots = Array.from({ length: totalSpots }, (_, i) => ({
      id: i,
      x: Math.random() * 80 + 10,
      y: Math.random() * 75 + 15,
      size: Math.random() * 25 + 20,
      cleaned: false,
      soaped: false
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
  }, [stage]);

  useEffect(() => {
    if (combo > maxCombo) setMaxCombo(combo);
  }, [combo]);

  const handleComplete = () => {
    if (stage === 'complete') return;
    setStage('complete');
    const completionBonus = Math.round((cleanedSpots / totalSpots) * 100);
    const comboBonus = maxCombo * 10;
    const finalScore = score + completionBonus + comboBonus;
    const xpGained = Math.round(20 + finalScore / 50);
    addXP(xpGained);
    toast({ 
      title: "Car Wash Complete!", 
      description: `Score: ${finalScore} | Max Combo: ${maxCombo}x | +${xpGained} XP` 
    });
    setTimeout(onComplete, 2000);
  };

  const resetComboTimer = () => {
    if (comboTimerRef.current) clearTimeout(comboTimerRef.current);
    comboTimerRef.current = setTimeout(() => {
      setCombo(0);
    }, 2000);
  };

  const createWaterSpray = (x, y) => {
    const particles = Array.from({ length: 8 }, (_, i) => ({
      id: Date.now() + Math.random(),
      x,
      y,
      angle: (i * 45) + (Math.random() * 30 - 15)
    }));
    setWaterParticles(prev => [...prev.slice(-12), ...particles]);
  };

  const handleSpotInteraction = (e, spotId) => {
    e.preventDefault();
    const spot = dirtSpots.find(s => s.id === spotId);
    if (!spot) return;
    
    const spotX = spot.x;
    const spotY = spot.y;
    
    if (stage === 'soap' && !spot.soaped) {
      setDirtSpots(prev => prev.map(s => 
        s.id === spotId ? { ...s, soaped: true } : s
      ));
      
      setSoapBubbles(prev => [...prev, {
        id: Date.now() + Math.random(),
        x: spotX,
        y: spotY
      }]);
      
      setCombo(prev => prev + 1);
      setScore(prev => prev + 10 * (combo + 1));
      resetComboTimer();
      
      const soapedCount = dirtSpots.filter(s => s.soaped).length + 1;
      if (soapedCount >= totalSpots) {
        toast({ title: "Soap Applied!", description: "Time to rinse!" });
        setTimeout(() => setStage('rinse'), 1000);
      }
    } else if (stage === 'rinse' && spot.soaped && !spot.cleaned) {
      const effectivenessPressure = Math.abs(pressure - 75) / 75;
      const effectiveness = 1 - effectivenessPressure;
      
      if (effectiveness > 0.5) {
        setDirtSpots(prev => prev.map(s => 
          s.id === spotId ? { ...s, cleaned: true } : s
        ));
        setCleanedSpots(prev => prev + 1);
        
        createWaterSpray(spotX, spotY);
        
        const bonusPoints = Math.round(effectiveness * 50);
        setCombo(prev => prev + 1);
        setScore(prev => prev + (20 + bonusPoints) * (combo + 1));
        resetComboTimer();
        
        if (cleanedSpots + 1 >= totalSpots) {
          handleComplete();
        }
      } else {
        toast({ 
          variant: "destructive", 
          title: "Weak Spray!", 
          description: "Adjust pressure closer to 75 PSI" 
        });
      }
    }
  };

  const adjustPressure = (delta) => {
    setPressure(prev => Math.max(0, Math.min(100, prev + delta)));
  };

  const carColor = user?.car_color || '#DC2626';
  const stageProgress = stage === 'soap' 
    ? (dirtSpots.filter(s => s.soaped).length / totalSpots) * 100
    : (cleanedSpots / totalSpots) * 100;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Card className="bg-slate-900/80 border-cyan-500/50 p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-bold text-white flex items-center gap-2">
            <Droplets className="w-6 h-6 text-cyan-400" />
            Pro Car Wash
          </h3>
          <div className="text-lg font-semibold text-white flex gap-4">
            <span>Score: {score}</span>
            <span>Time: {Math.floor(timeLeft / 60)}:{('0' + timeLeft % 60).slice(-2)}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-sm">
          <div className={`p-2 rounded ${stage === 'soap' ? 'bg-cyan-600' : 'bg-slate-700'}`}>
            Soap Application
          </div>
          <div className={`p-2 rounded ${stage === 'rinse' ? 'bg-cyan-600' : 'bg-slate-700'}`}>
            Pressure Rinse
          </div>
          <div className={`p-2 rounded ${stage === 'complete' ? 'bg-green-600' : 'bg-slate-700'}`}>
            Complete
          </div>
        </div>

        {combo > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-center"
          >
            <div className={`text-3xl font-bold ${combo > 5 ? 'text-yellow-400' : 'text-cyan-400'}`}>
              {combo}x COMBO!
            </div>
          </motion.div>
        )}

        <div 
          className="relative h-80 rounded-lg overflow-hidden border-2 border-slate-700"
          style={{
            backgroundImage: `url(${evoImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            touchAction: 'none'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/20" style={{
            filter: stageProgress > 80 ? 'drop-shadow(0 0 20px rgba(255,255,255,0.4))' : 'none'
          }} />

          <AnimatePresence>
            {dirtSpots.map(spot => (
              <motion.div
                key={spot.id}
                initial={{ scale: 0 }}
                animate={{ 
                  scale: spot.cleaned ? 0 : (spot.soaped ? 1.1 : 1),
                  opacity: spot.cleaned ? 0 : (spot.soaped ? 0.8 : 1)
                }}
                exit={{ scale: 0, opacity: 0 }}
                className="absolute cursor-pointer"
                style={{
                  left: `${spot.x}%`,
                  top: `${spot.y}%`,
                  width: `${Math.max(spot.size, 44)}px`,
                  height: `${Math.max(spot.size, 44)}px`,
                  pointerEvents: spot.cleaned ? 'none' : 'auto',
                  touchAction: 'none'
                }}
                onClick={(e) => handleSpotInteraction(e, spot.id)}
                onTouchStart={(e) => handleSpotInteraction(e, spot.id)}
                whileTap={{ scale: 0.9 }}
              >
                <div
                  className={`w-full h-full rounded-full transition-all ${
                    spot.soaped 
                      ? 'bg-gradient-radial from-white/60 to-cyan-300/80 animate-pulse'
                      : 'bg-gradient-radial from-amber-900/80 to-amber-950/90 active:scale-110'
                  }`}
                  style={{
                    boxShadow: spot.soaped 
                      ? '0 0 15px rgba(0, 255, 255, 0.7)' 
                      : 'inset 0 2px 4px rgba(0,0,0,0.5)'
                  }}
                />
              </motion.div>
            ))}
          </AnimatePresence>

          <AnimatePresence>
            {soapBubbles.slice(-8).map(bubble => (
              <motion.div
                key={bubble.id}
                initial={{ scale: 0, y: 0, opacity: 1 }}
                animate={{ scale: 2, y: -60, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2 }}
                className="absolute pointer-events-none"
                style={{
                  left: `${bubble.x}%`,
                  top: `${bubble.y}%`
                }}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-radial from-white/40 to-cyan-200/60 border-2 border-white/30" />
              </motion.div>
            ))}
          </AnimatePresence>

          <AnimatePresence>
            {waterParticles.slice(-24).map(particle => (
              <motion.div
                key={particle.id}
                initial={{ 
                  x: 0, 
                  y: 0, 
                  opacity: 1,
                  scale: 1
                }}
                animate={{ 
                  x: Math.cos(particle.angle * Math.PI / 180) * 60,
                  y: Math.sin(particle.angle * Math.PI / 180) * 60,
                  opacity: 0,
                  scale: 0.5
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="absolute pointer-events-none"
                style={{
                  left: `${particle.x}%`,
                  top: `${particle.y}%`
                }}
              >
                <Droplets className="text-cyan-400 w-4 h-4" />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {stage === 'rinse' && (
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Water Pressure (Target: 75 PSI)
              </span>
              <span className={`font-semibold ${
                Math.abs(pressure - 75) < 10 ? 'text-green-400' : 
                Math.abs(pressure - 75) < 25 ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {pressure} PSI
              </span>
            </div>
            <Progress value={pressure} className="h-3 bg-slate-700" />
            <div className="flex gap-2">
              <Button 
                onClick={() => adjustPressure(-5)}
                onTouchStart={(e) => { e.preventDefault(); adjustPressure(-5); }}
                variant="outline" 
                className="flex-1 h-14 text-lg font-semibold active:scale-95 transition-transform"
                style={{ touchAction: 'manipulation' }}
              >
                - Pressure
              </Button>
              <Button 
                onClick={() => adjustPressure(5)}
                onTouchStart={(e) => { e.preventDefault(); adjustPressure(5); }}
                variant="outline" 
                className="flex-1 h-14 text-lg font-semibold active:scale-95 transition-transform"
                style={{ touchAction: 'manipulation' }}
              >
                + Pressure
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">
              {stage === 'soap' ? 'Soaped' : 'Cleaned'}: {Math.round(stageProgress)}%
            </span>
            <span className="text-cyan-400 font-semibold">Max Combo: {maxCombo}x</span>
          </div>
          <Progress value={stageProgress} className="h-3 bg-slate-700" />
        </div>

        <div className="text-center text-slate-400 text-sm">
          {stage === 'soap' && "Click dirt spots to apply soap!"}
          {stage === 'rinse' && "Adjust pressure to 75 PSI, then click to rinse!"}
          {stage === 'complete' && "✨ Wash Complete!"}
        </div>
      </Card>
    </motion.div>
  );
};

export default CarWashGame;
