import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Sparkles, CheckCircle, Circle, Droplets, Wind } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { toast } from '@/components/ui/use-toast';

const CleaningExterior = ({ onComplete }) => {
  const { user, addXP } = useUser();
  const canvasRef = useRef(null);
  
  const [stage, setStage] = useState('claybar');
  const [timeLeft, setTimeLeft] = useState(120);
  
  const [selectedTool, setSelectedTool] = useState('clay');
  const [clayProgress, setClayProgress] = useState(0);
  const [clayPaths, setClayPaths] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [lastPos, setLastPos] = useState(null);
  
  const [polishProgress, setPolishProgress] = useState(0);
  const [circularMotions, setCircularMotions] = useState([]);
  const [currentCircle, setCurrentCircle] = useState({ points: [], center: null });
  const [polishQuality, setPolishQuality] = useState(0);
  
  const [waxCoverage, setWaxCoverage] = useState(0);
  const [waxedAreas, setWaxedAreas] = useState([]);
  const [streaks, setStreaks] = useState(0);
  
  const [shineMeter, setShineMeter] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [qualityRating, setQualityRating] = useState('');
  const [combo, setCombo] = useState(0);

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

  const handleMouseDown = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setIsDragging(true);
    setLastPos({ x, y });
    
    if (stage === 'polish') {
      setCurrentCircle({ points: [{ x, y }], center: { x, y } });
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    if (stage === 'claybar' && lastPos) {
      const distance = Math.sqrt(Math.pow(x - lastPos.x, 2) + Math.pow(y - lastPos.y, 2));
      
      if (distance > 2 && distance < 15) {
        setClayPaths(prev => [...prev, { x, y, id: Date.now() }]);
        setClayProgress(prev => Math.min(100, prev + 0.3));
        setCombo(prev => prev + 1);
      }
      
      setLastPos({ x, y });
    }
    
    if (stage === 'polish' && lastPos) {
      const centerX = currentCircle.center?.x || x;
      const centerY = currentCircle.center?.y || y;
      const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
      
      setCurrentCircle(prev => ({
        ...prev,
        points: [...prev.points, { x, y }]
      }));
      
      if (distance > 5 && distance < 20) {
        setPolishProgress(prev => Math.min(100, prev + 0.4));
        setPolishQuality(prev => Math.min(100, prev + 0.5));
      } else {
        setStreaks(prev => prev + 1);
      }
      
      setLastPos({ x, y });
    }
    
    if (stage === 'wax') {
      setWaxedAreas(prev => [...prev, { x, y, id: Date.now() }]);
      setWaxCoverage(prev => Math.min(100, prev + 0.2));
      
      if (Math.random() > 0.95) {
        setStreaks(prev => prev + 1);
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setLastPos(null);
    
    if (stage === 'polish' && currentCircle.points.length > 5) {
      const isCircular = checkCircularMotion(currentCircle.points);
      if (isCircular) {
        setCircularMotions(prev => [...prev, currentCircle]);
        setCombo(prev => prev + 1);
        toast({ title: "Perfect Circle!", description: "+10 Bonus" });
      }
      setCurrentCircle({ points: [], center: null });
    }
  };

  const checkCircularMotion = (points) => {
    if (points.length < 5) return false;
    
    const centerX = points.reduce((sum, p) => sum + p.x, 0) / points.length;
    const centerY = points.reduce((sum, p) => sum + p.y, 0) / points.length;
    
    const distances = points.map(p => 
      Math.sqrt(Math.pow(p.x - centerX, 2) + Math.pow(p.y - centerY, 2))
    );
    
    const avgDistance = distances.reduce((sum, d) => sum + d, 0) / distances.length;
    const variance = distances.reduce((sum, d) => sum + Math.pow(d - avgDistance, 2), 0) / distances.length;
    
    return variance < 50;
  };

  useEffect(() => {
    if (stage === 'claybar' && clayProgress >= 100) {
      advanceToPolish();
    } else if (stage === 'polish' && polishProgress >= 100) {
      advanceToWax();
    } else if (stage === 'wax' && waxCoverage >= 100) {
      handleComplete();
    }
  }, [clayProgress, polishProgress, waxCoverage, stage]);

  const advanceToPolish = () => {
    setStage('polish');
    setSelectedTool('polish');
    toast({ title: "Clay Bar Complete!", description: "Now apply polish in circular motions." });
  };

  const advanceToWax = () => {
    setStage('wax');
    setSelectedTool('wax');
    toast({ title: "Polish Applied!", description: "Now apply wax coating evenly." });
  };

  const handleComplete = () => {
    if (stage === 'complete') return;
    setStage('complete');
    
    const clayScore = (clayProgress / 100) * 250;
    const polishScore = (polishProgress / 100) * 250 + (polishQuality / 100) * 100;
    const waxScore = (waxCoverage / 100) * 250;
    const streakPenalty = streaks * 5;
    const comboBonus = combo * 2;
    const timeBonus = timeLeft * 3;
    
    const finalShine = Math.max(0, Math.min(100, 
      (clayProgress + polishProgress + waxCoverage) / 3 - streaks
    ));
    setShineMeter(finalShine);
    
    const finalScore = Math.max(0, Math.round(
      clayScore + polishScore + waxScore - streakPenalty + comboBonus + timeBonus
    ));
    setTotalScore(finalScore);
    
    let rating = 'Amateur';
    if (finalScore > 1000) rating = 'Master Detailer';
    else if (finalScore > 850) rating = 'Expert';
    else if (finalScore > 700) rating = 'Professional';
    else if (finalScore > 500) rating = 'Skilled';
    setQualityRating(rating);
    
    const xpGained = Math.round(25 + (finalScore / 40));
    addXP(xpGained);
    
    toast({
      title: "Detailing Complete!",
      description: `${rating}! Shine: ${Math.round(finalShine)}%. Earned +${xpGained} XP.`,
    });
    
    setTimeout(onComplete, 3000);
  };

  const carColor = user?.car_color || '#DC2626';
  const stageProgress = stage === 'claybar' ? clayProgress : stage === 'polish' ? polishProgress : waxCoverage;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Card className="bg-slate-900/80 border-cyan-500/50 p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-cyan-400" />
            Exterior Detailing - {stage === 'claybar' ? 'Clay Bar' : stage === 'polish' ? 'Polish' : stage === 'wax' ? 'Wax' : 'Complete'}
          </h3>
          <div className="text-lg font-semibold text-white">
            Time: {timeLeft}s
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className="bg-slate-800 p-2 rounded border border-slate-700">
            <span className="text-slate-400">Combo: </span>
            <span className="text-cyan-400 font-bold">{combo}x</span>
          </div>
          <div className="bg-slate-800 p-2 rounded border border-slate-700">
            <span className="text-slate-400">Streaks: </span>
            <span className="text-red-400 font-bold">{streaks}</span>
          </div>
          <div className="bg-slate-800 p-2 rounded border border-slate-700">
            <span className="text-slate-400">Shine: </span>
            <span className="text-yellow-400 font-bold">{Math.round(shineMeter)}%</span>
          </div>
        </div>

        {stage !== 'complete' && (
          <div className="grid grid-cols-3 gap-2">
            <Button
              onClick={() => setSelectedTool('clay')}
              variant={selectedTool === 'clay' ? 'default' : 'outline'}
              className="h-12"
              disabled={stage !== 'claybar'}
            >
              <Circle className="w-4 h-4 mr-2" />
              Clay Bar
            </Button>
            <Button
              onClick={() => setSelectedTool('polish')}
              variant={selectedTool === 'polish' ? 'default' : 'outline'}
              className="h-12"
              disabled={stage !== 'polish'}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Polish
            </Button>
            <Button
              onClick={() => setSelectedTool('wax')}
              variant={selectedTool === 'wax' ? 'default' : 'outline'}
              className="h-12"
              disabled={stage !== 'wax'}
            >
              <Droplets className="w-4 h-4 mr-2" />
              Wax
            </Button>
          </div>
        )}

        <div 
          className="relative h-80 bg-gradient-to-b from-slate-800 to-slate-900 rounded-lg overflow-hidden border-2 border-slate-700 cursor-crosshair select-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <svg viewBox="0 0 300 150" className="w-full h-full">
            <defs>
              <linearGradient id="cleanCarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: carColor, stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: carColor, stopOpacity: 0.8 }} />
              </linearGradient>
              <filter id="shine">
                <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur"/>
                <feComponentTransfer in="blur" result="bright">
                  <feFuncA type="discrete" tableValues="0 1"/>
                </feComponentTransfer>
                <feMerge>
                  <feMergeNode in="bright"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              <radialGradient id="mirrorShine">
                <stop offset="0%" stopColor="rgba(255,255,255,0.8)" />
                <stop offset="50%" stopColor="rgba(255,255,255,0.3)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0)" />
              </radialGradient>
            </defs>
            
            <g transform="translate(150, 75)">
              <ellipse cx="0" cy="35" rx="120" ry="15" fill="#000" opacity="0.3"/>
              
              <path
                d="M -80 20 L -90 0 L -60 -15 L 0 -20 L 60 -15 L 90 0 L 80 20 L 70 30 L -70 30 Z"
                fill="url(#cleanCarGradient)"
                stroke="#000"
                strokeWidth="2"
                style={{
                  filter: shineMeter > 80 ? 'url(#shine) drop-shadow(0 0 15px rgba(255,255,255,0.6))' : 
                         shineMeter > 60 ? 'drop-shadow(0 0 8px rgba(255,255,255,0.3))' : 'none',
                  opacity: stage === 'complete' ? 1 : 0.9
                }}
              />
              
              <ellipse cx="-50" cy="25" rx="15" ry="10" fill="#1a1a1a"/>
              <ellipse cx="50" cy="25" rx="15" ry="10" fill="#1a1a1a"/>
              
              <path
                d="M -50 -10 L -30 -15 L 30 -15 L 50 -10 L 40 5 L -40 5 Z"
                fill="#87ceeb"
                opacity={shineMeter > 80 ? 0.8 : 0.6}
                stroke="#000"
              />
              
              {shineMeter > 80 && (
                <>
                  <ellipse
                    cx="-40"
                    cy="-5"
                    rx="25"
                    ry="15"
                    fill="url(#mirrorShine)"
                    opacity="0.7"
                  />
                  <ellipse
                    cx="30"
                    cy="5"
                    rx="20"
                    ry="12"
                    fill="url(#mirrorShine)"
                    opacity="0.6"
                  />
                </>
              )}
            </g>
          </svg>

          <AnimatePresence>
            {stage === 'claybar' && clayPaths.slice(-30).map(path => (
              <motion.div
                key={path.id}
                initial={{ scale: 1, opacity: 0.6 }}
                animate={{ scale: 0, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute pointer-events-none"
                style={{
                  left: `${path.x}%`,
                  top: `${path.y}%`,
                  width: '16px',
                  height: '16px',
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <div className="w-full h-full rounded-full bg-blue-400 opacity-40" />
              </motion.div>
            ))}
          </AnimatePresence>

          <AnimatePresence>
            {stage === 'polish' && currentCircle.points.slice(-20).map((point, idx) => (
              <motion.div
                key={`${point.x}-${point.y}-${idx}`}
                initial={{ scale: 1, opacity: 0.7 }}
                animate={{ scale: 0.5, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="absolute pointer-events-none"
                style={{
                  left: `${point.x}%`,
                  top: `${point.y}%`,
                  width: '20px',
                  height: '20px',
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <motion.div 
                  className="w-full h-full rounded-full bg-gradient-radial from-yellow-300 to-transparent"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
              </motion.div>
            ))}
          </AnimatePresence>

          <AnimatePresence>
            {stage === 'wax' && waxedAreas.slice(-40).map(area => (
              <motion.div
                key={area.id}
                initial={{ scale: 0.5, opacity: 0.8 }}
                animate={{ scale: 1.5, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
                className="absolute pointer-events-none"
                style={{
                  left: `${area.x}%`,
                  top: `${area.y}%`,
                  width: '30px',
                  height: '30px',
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <div className="w-full h-full rounded-full bg-gradient-radial from-white/30 to-transparent" />
              </motion.div>
            ))}
          </AnimatePresence>

          {shineMeter > 90 && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.4, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="w-full h-full bg-gradient-radial from-white/20 via-transparent to-transparent" />
            </motion.div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">
              {stage === 'claybar' ? 'Clay Bar Progress' : stage === 'polish' ? 'Polish Coverage' : 'Wax Coverage'}
            </span>
            <span className="text-cyan-400 font-semibold">{Math.round(stageProgress)}%</span>
          </div>
          <Progress value={stageProgress} className="h-3 bg-slate-700" />
        </div>

        <div className="text-center text-slate-400 text-sm">
          {stage === 'claybar' && 'Drag slowly over the surface to remove contaminants'}
          {stage === 'polish' && 'Apply polish in circular motions for best results'}
          {stage === 'wax' && 'Cover the surface evenly with wax - avoid streaks!'}
        </div>

        {stage === 'complete' && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-center py-4 space-y-2"
          >
            <div className="text-3xl font-bold text-cyan-400 flex items-center justify-center gap-2">
              <Sparkles className="w-10 h-10" />
              {qualityRating}!
            </div>
            <div className="text-xl text-white">Final Score: {totalScore}</div>
            <div className="text-lg text-yellow-400">Shine Level: {Math.round(shineMeter)}%</div>
            <div className="grid grid-cols-3 gap-2 text-xs mt-4">
              <div className="bg-slate-800 p-2 rounded">
                <div className="text-slate-400">Clay Bar</div>
                <div className="text-cyan-400 font-bold">{Math.round(clayProgress)}%</div>
              </div>
              <div className="bg-slate-800 p-2 rounded">
                <div className="text-slate-400">Polish</div>
                <div className="text-cyan-400 font-bold">{Math.round(polishProgress)}%</div>
              </div>
              <div className="bg-slate-800 p-2 rounded">
                <div className="text-slate-400">Wax</div>
                <div className="text-cyan-400 font-bold">{Math.round(waxCoverage)}%</div>
              </div>
            </div>
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
};

export default CleaningExterior;
