import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Hammer, PaintBucket, Wind, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { toast } from '@/components/ui/use-toast';
import { getTouchPosition } from '@/lib/touchHelpers';
import dentImage from '../../../attached_assets/stock_images/car_body_repair_dent_6160edf8.jpg';

const BodyRepair = ({ onComplete }) => {
  const { user, addXP } = useUser();
  const canvasRef = useRef(null);
  
  const [stage, setStage] = useState('sanding');
  const [timeLeft, setTimeLeft] = useState(120);
  
  const [dentPosition, setDentPosition] = useState({ x: 50, y: 50 });
  const [sandingProgress, setSandingProgress] = useState(0);
  const [isSanding, setIsSanding] = useState(false);
  const [mouseMovement, setMouseMovement] = useState(0);
  
  const [fillerPresses, setFillerPresses] = useState([]);
  const [fillerQuality, setFillerQuality] = useState(0);
  const [targetTime, setTargetTime] = useState(0);
  
  const [sprayPattern, setSprayPattern] = useState([]);
  const [primeCoverage, setPrimeCoverage] = useState(0);
  const [oversprayPenalty, setOversprayPenalty] = useState(0);
  
  const [paintMix, setPaintMix] = useState({ r: 128, g: 128, b: 128 });
  const [targetColor, setTargetColor] = useState({ r: 220, g: 38, b: 38 });
  const [paintAccuracy, setPaintAccuracy] = useState(0);
  
  const [totalScore, setTotalScore] = useState(0);
  const [qualityRating, setQualityRating] = useState('');
  const [combo, setCombo] = useState(0);

  useEffect(() => {
    if (user?.car_color) {
      const hex = user.car_color;
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      setTargetColor({ r, g, b });
      setPaintMix({ r: Math.max(0, r - 50), g: Math.max(0, g - 50), b: Math.max(0, b - 50) });
    }
    
    setDentPosition({
      x: 30 + Math.random() * 40,
      y: 40 + Math.random() * 30
    });
  }, [user?.car_color]);

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

  const handleSandingStart = (e) => {
    e.preventDefault();
    setIsSanding(true);
  };

  const handleSandingEnd = () => {
    setIsSanding(false);
    setMouseMovement(0);
  };

  const handleSandingMove = (e) => {
    if (!isSanding) return;
    e.preventDefault();
    
    const { x, y } = getTouchPosition(e, e.currentTarget);
    
    const distance = Math.sqrt(
      Math.pow(x - dentPosition.x, 2) + Math.pow(y - dentPosition.y, 2)
    );
    
    if (distance < 15) {
      setMouseMovement(prev => prev + 1);
      setSandingProgress(prev => Math.min(100, prev + 0.5));
      
      if (sandingProgress > 95) {
        advanceToFiller();
      }
    }
  };

  const advanceToFiller = () => {
    setStage('filler');
    setTargetTime(Date.now() + 500);
    toast({ title: "Sanding Complete!", description: "Now apply filler with timed presses." });
  };

  const handleFillerPress = () => {
    const now = Date.now();
    const timeDiff = Math.abs(now - targetTime);
    const accuracy = Math.max(0, 100 - timeDiff / 5);
    
    setFillerPresses(prev => [...prev, { time: now, accuracy }]);
    setFillerQuality(prev => prev + accuracy / 10);
    setTargetTime(now + 500);
    
    if (fillerPresses.length >= 9) {
      advanceToPriming();
    }
  };

  const advanceToPriming = () => {
    setStage('priming');
    toast({ title: "Filler Applied!", description: "Now prime the surface evenly." });
  };

  const handlePrimeSpray = (e) => {
    e.preventDefault();
    const { x, y } = getTouchPosition(e, e.currentTarget);
    
    const distance = Math.sqrt(
      Math.pow(x - dentPosition.x, 2) + Math.pow(y - dentPosition.y, 2)
    );
    
    const newSpot = { x, y, id: Date.now() };
    setSprayPattern(prev => [...prev, newSpot]);
    
    if (distance < 20) {
      setPrimeCoverage(prev => Math.min(100, prev + 5));
    } else if (distance > 30) {
      setOversprayPenalty(prev => prev + 2);
    }
    
    if (primeCoverage > 95) {
      advanceToPainting();
    }
  };

  const advanceToPainting = () => {
    setStage('painting');
    toast({ title: "Priming Complete!", description: "Match the paint color exactly!" });
  };

  const handleColorChange = (color, value) => {
    setPaintMix(prev => ({ ...prev, [color]: value }));
    calculatePaintAccuracy({ ...paintMix, [color]: value });
  };

  const calculatePaintAccuracy = (currentMix) => {
    const rDiff = Math.abs(currentMix.r - targetColor.r);
    const gDiff = Math.abs(currentMix.g - targetColor.g);
    const bDiff = Math.abs(currentMix.b - targetColor.b);
    const totalDiff = rDiff + gDiff + bDiff;
    const accuracy = Math.max(0, 100 - (totalDiff / 7.65));
    setPaintAccuracy(accuracy);
    
    if (accuracy > 95) {
      handleComplete();
    }
  };

  const handleComplete = () => {
    if (stage === 'complete') return;
    setStage('complete');
    
    const sandingScore = (sandingProgress / 100) * 250;
    const fillerScore = (fillerQuality / 10) * 250;
    const primingScore = ((primeCoverage / 100) * 250) - (oversprayPenalty * 5);
    const paintingScore = (paintAccuracy / 100) * 250;
    const timeBonus = timeLeft * 2;
    
    const finalScore = Math.round(sandingScore + fillerScore + primingScore + paintingScore + timeBonus);
    setTotalScore(finalScore);
    
    let rating = 'Novice';
    if (finalScore > 900) rating = 'Master';
    else if (finalScore > 750) rating = 'Expert';
    else if (finalScore > 600) rating = 'Professional';
    else if (finalScore > 400) rating = 'Apprentice';
    setQualityRating(rating);
    
    const xpGained = Math.round(25 + (finalScore / 40));
    addXP(xpGained);
    
    toast({
      title: "Body Repair Complete!",
      description: `${rating} Quality! Score: ${finalScore}. Earned +${xpGained} XP.`,
    });
    
    setTimeout(onComplete, 3000);
  };

  const carColor = user?.car_color || '#DC2626';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Card className="bg-slate-900/80 border-cyan-500/50 p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-bold text-white flex items-center gap-2">
            <Hammer className="w-6 h-6 text-cyan-400" />
            Body Repair - Stage {stage === 'sanding' ? '1' : stage === 'filler' ? '2' : stage === 'priming' ? '3' : stage === 'painting' ? '4' : '✓'}
          </h3>
          <div className="text-lg font-semibold text-white">
            Time: {timeLeft}s
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="bg-slate-800 p-2 rounded border border-slate-700">
            <span className="text-slate-400">Combo: </span>
            <span className="text-cyan-400 font-bold">{combo}x</span>
          </div>
          <div className="bg-slate-800 p-2 rounded border border-slate-700">
            <span className="text-slate-400">Overspray: </span>
            <span className="text-red-400 font-bold">{oversprayPenalty}</span>
          </div>
        </div>

        <div 
          className="relative h-80 rounded-lg overflow-hidden border-2 border-slate-700 cursor-crosshair"
          style={{
            backgroundImage: `url(${dentImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            touchAction: 'none'
          }}
          onMouseDown={stage === 'sanding' ? handleSandingStart : undefined}
          onTouchStart={stage === 'sanding' ? handleSandingStart : undefined}
          onMouseUp={stage === 'sanding' ? handleSandingEnd : undefined}
          onTouchEnd={stage === 'sanding' ? handleSandingEnd : undefined}
          onMouseMove={stage === 'sanding' ? handleSandingMove : undefined}
          onTouchMove={stage === 'sanding' ? handleSandingMove : undefined}
          onMouseLeave={stage === 'sanding' ? handleSandingEnd : undefined}
          onClick={stage === 'priming' ? handlePrimeSpray : undefined}
          onTouchStart={stage === 'priming' ? handlePrimeSpray : undefined}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/10" />
          <svg viewBox="0 0 300 150" className="w-full h-full">
            <defs>
              <filter id="dentEffect">
                <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
                <feOffset dx="2" dy="2" result="offsetblur"/>
                <feMerge>
                  <feMergeNode/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              <radialGradient id="shineGradient">
                <stop offset="0%" stopColor="rgba(255,255,255,0.6)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0)" />
              </radialGradient>
            </defs>
            
            <g transform="translate(150, 75)">
              <ellipse cx="0" cy="35" rx="120" ry="15" fill="#000" opacity="0.3"/>
              
              <path
                d="M -80 20 L -90 0 L -60 -15 L 0 -20 L 60 -15 L 90 0 L 80 20 L 70 30 L -70 30 Z"
                fill={stage === 'painting' ? `rgb(${paintMix.r}, ${paintMix.g}, ${paintMix.b})` : carColor}
                stroke="#000"
                strokeWidth="2"
                opacity={stage === 'complete' ? 1 : 0.9}
                style={{
                  filter: stage === 'complete' && paintAccuracy > 95 ? 'drop-shadow(0 0 20px rgba(255,255,255,0.5))' : 'none'
                }}
              />
              
              {stage === 'sanding' && sandingProgress < 100 && (
                <ellipse
                  cx={(dentPosition.x - 50) * 2.4}
                  cy={(dentPosition.y - 50) * 1.5}
                  rx="15"
                  ry="10"
                  fill="rgba(0,0,0,0.3)"
                  filter="url(#dentEffect)"
                />
              )}
              
              {(stage === 'filler' || stage === 'priming' || stage === 'painting' || stage === 'complete') && (
                <ellipse
                  cx={(dentPosition.x - 50) * 2.4}
                  cy={(dentPosition.y - 50) * 1.5}
                  rx="15"
                  ry="10"
                  fill={stage === 'filler' ? '#9ca3af' : 'transparent'}
                  opacity="0.6"
                />
              )}
              
              <ellipse cx="-50" cy="25" rx="15" ry="10" fill="#1a1a1a"/>
              <ellipse cx="50" cy="25" rx="15" ry="10" fill="#1a1a1a"/>
              
              <path
                d="M -50 -10 L -30 -15 L 30 -15 L 50 -10 L 40 5 L -40 5 Z"
                fill="#87ceeb"
                opacity="0.6"
                stroke="#000"
              />
              
              {stage === 'complete' && paintAccuracy > 95 && (
                <ellipse
                  cx="-30"
                  cy="-5"
                  rx="30"
                  ry="20"
                  fill="url(#shineGradient)"
                />
              )}
            </g>
          </svg>

          <AnimatePresence>
            {stage === 'priming' && sprayPattern.map(spot => (
              <motion.div
                key={spot.id}
                initial={{ scale: 0, opacity: 0.8 }}
                animate={{ scale: 1, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
                className="absolute pointer-events-none"
                style={{
                  left: `${spot.x}%`,
                  top: `${spot.y}%`,
                  width: '40px',
                  height: '40px',
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <div className="w-full h-full rounded-full bg-gray-400 opacity-30" />
              </motion.div>
            ))}
          </AnimatePresence>

          {stage === 'sanding' && isSanding && (
            <motion.div
              className="absolute pointer-events-none"
              style={{
                left: `${dentPosition.x}%`,
                top: `${dentPosition.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-8 h-8 text-yellow-400" />
            </motion.div>
          )}
        </div>

        <div className="space-y-3">
          {stage === 'sanding' && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Sanding Progress</span>
                <span className="text-cyan-400 font-semibold">{Math.round(sandingProgress)}%</span>
              </div>
              <Progress value={sandingProgress} className="h-3 bg-slate-700" />
              <p className="text-center text-slate-400 text-sm">
                Click and hold while moving mouse over the dent to sand it smooth
              </p>
            </div>
          )}

          {stage === 'filler' && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Filler Quality</span>
                <span className="text-cyan-400 font-semibold">{fillerPresses.length}/10 presses</span>
              </div>
              <Progress value={(fillerPresses.length / 10) * 100} className="h-3 bg-slate-700" />
              <Button 
                onClick={handleFillerPress}
                onTouchStart={(e) => { e.preventDefault(); handleFillerPress(); }}
                className="w-full h-16 text-lg font-bold active:scale-95 transition-transform"
                disabled={fillerPresses.length >= 10}
                style={{ touchAction: 'manipulation' }}
              >
                <Hammer className="w-6 h-6 mr-2" />
                Apply Filler (Press at the right rhythm!)
              </Button>
              <p className="text-center text-slate-400 text-sm">
                Press when the indicator is green for best quality!
              </p>
            </div>
          )}

          {stage === 'priming' && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Prime Coverage</span>
                <span className="text-cyan-400 font-semibold">{Math.round(primeCoverage)}%</span>
              </div>
              <Progress value={primeCoverage} className="h-3 bg-slate-700" />
              <div className="flex justify-between text-xs">
                <span className="text-yellow-400">
                  <Wind className="w-4 h-4 inline mr-1" />
                  Keep spray near dent area
                </span>
                <span className="text-red-400">
                  <AlertCircle className="w-4 h-4 inline mr-1" />
                  Overspray: -{oversprayPenalty}
                </span>
              </div>
              <p className="text-center text-slate-400 text-sm">
                Click to spray primer. Stay close to the repair area!
              </p>
            </div>
          )}

          {stage === 'painting' && (
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Paint Match Accuracy</span>
                <span className="text-cyan-400 font-semibold">{Math.round(paintAccuracy)}%</span>
              </div>
              <Progress value={paintAccuracy} className="h-3 bg-slate-700" />
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-slate-400">Target Color</label>
                  <div 
                    className="h-16 rounded border-2 border-slate-700"
                    style={{ backgroundColor: `rgb(${targetColor.r}, ${targetColor.g}, ${targetColor.b})` }}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-slate-400">Your Mix</label>
                  <div 
                    className="h-16 rounded border-2 border-slate-700"
                    style={{ backgroundColor: `rgb(${paintMix.r}, ${paintMix.g}, ${paintMix.b})` }}
                  />
                </div>
              </div>

              <div className="space-y-3 bg-slate-800 p-3 rounded">
                <div className="space-y-1">
                  <label className="text-xs text-red-400">Red: {paintMix.r}</label>
                  <Slider
                    value={[paintMix.r]}
                    onValueChange={(val) => handleColorChange('r', val[0])}
                    max={255}
                    step={1}
                    className="w-full"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-green-400">Green: {paintMix.g}</label>
                  <Slider
                    value={[paintMix.g]}
                    onValueChange={(val) => handleColorChange('g', val[0])}
                    max={255}
                    step={1}
                    className="w-full"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-blue-400">Blue: {paintMix.b}</label>
                  <Slider
                    value={[paintMix.b]}
                    onValueChange={(val) => handleColorChange('b', val[0])}
                    max={255}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>
              
              <p className="text-center text-slate-400 text-sm">
                Mix the paint to match your car color exactly!
              </p>
            </div>
          )}
        </div>

        {stage === 'complete' && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-center py-4 space-y-2"
          >
            <div className="text-3xl font-bold text-green-400 flex items-center justify-center gap-2">
              <CheckCircle className="w-10 h-10" />
              {qualityRating} Work!
            </div>
            <div className="text-xl text-white">Final Score: {totalScore}</div>
            <div className="grid grid-cols-4 gap-2 text-xs mt-4">
              <div className="bg-slate-800 p-2 rounded">
                <div className="text-slate-400">Sanding</div>
                <div className="text-cyan-400 font-bold">{Math.round(sandingProgress)}%</div>
              </div>
              <div className="bg-slate-800 p-2 rounded">
                <div className="text-slate-400">Filler</div>
                <div className="text-cyan-400 font-bold">{fillerPresses.length}/10</div>
              </div>
              <div className="bg-slate-800 p-2 rounded">
                <div className="text-slate-400">Primer</div>
                <div className="text-cyan-400 font-bold">{Math.round(primeCoverage)}%</div>
              </div>
              <div className="bg-slate-800 p-2 rounded">
                <div className="text-slate-400">Paint</div>
                <div className="text-cyan-400 font-bold">{Math.round(paintAccuracy)}%</div>
              </div>
            </div>
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
};

export default BodyRepair;
