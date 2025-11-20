import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RefreshCw, CheckCircle, Gauge, Wrench, AlertCircle } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { toast } from '@/components/ui/use-toast';

const TireRotation = ({ onComplete }) => {
  const { addXP } = useUser();
  
  const [stage, setStage] = useState('jack');
  const [timeLeft, setTimeLeft] = useState(120);
  
  const [jackProgress, setJackProgress] = useState(0);
  const [isJacking, setIsJacking] = useState(false);
  const [jackTimer, setJackTimer] = useState(0);
  
  const [lugNutOrder, setLugNutOrder] = useState([]);
  const [correctPattern, setCorrectPattern] = useState([0, 3, 1, 4, 2]);
  const [currentLugIndex, setCurrentLugIndex] = useState(0);
  
  const [tires, setTires] = useState([
    { id: 0, position: 'FL', pattern: 'A', swapped: false },
    { id: 1, position: 'FR', pattern: 'B', swapped: false },
    { id: 2, position: 'RL', pattern: 'C', swapped: false },
    { id: 3, position: 'RR', pattern: 'D', swapped: false }
  ]);
  const [selectedTire, setSelectedTire] = useState(null);
  const [swapCount, setSwapCount] = useState(0);
  const targetPattern = { FL: 'C', FR: 'D', RL: 'A', RR: 'B' };
  
  const [torqueNeedle, setTorqueNeedle] = useState(0);
  const [torqueTargetStart, setTorqueTargetStart] = useState(45);
  const [isTorquing, setIsTorquing] = useState(false);
  const [torqueCompleted, setTorqueCompleted] = useState(false);
  
  const [pressureValues, setPressureValues] = useState([32, 32, 32, 32]);
  const [targetPressure] = useState(35);
  const [currentPressureTire, setCurrentPressureTire] = useState(0);
  
  const [score, setScore] = useState(0);
  const [sequenceBonus, setSequenceBonus] = useState(0);
  const [qualityRating, setQualityRating] = useState('');

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
    if (stage === 'torque' && isTorquing) {
      const interval = setInterval(() => {
        setTorqueNeedle(prev => {
          const newValue = prev + 2;
          if (newValue >= 100) {
            setIsTorquing(false);
            return 0;
          }
          return newValue;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [stage, isTorquing]);

  const handleJackHold = () => {
    setIsJacking(true);
    const interval = setInterval(() => {
      setJackProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          advanceToLugNuts();
          return 100;
        }
        return prev + 1;
      });
    }, 30);
    setJackTimer(interval);
  };

  const handleJackRelease = () => {
    setIsJacking(false);
    if (jackTimer) clearInterval(jackTimer);
  };

  const advanceToLugNuts = () => {
    setStage('lugnuts');
    toast({ title: "Car Lifted!", description: "Now remove lug nuts in star pattern." });
  };

  const handleLugNutClick = (nutIndex) => {
    if (nutIndex === correctPattern[currentLugIndex]) {
      setLugNutOrder(prev => [...prev, nutIndex]);
      setCurrentLugIndex(prev => prev + 1);
      
      if (currentLugIndex === correctPattern.length - 1) {
        const perfectSequence = lugNutOrder.every((nut, idx) => nut === correctPattern[idx]);
        if (perfectSequence) {
          setSequenceBonus(prev => prev + 50);
          toast({ title: "Perfect Pattern!", description: "+50 Bonus!" });
        }
        advanceToSwap();
      }
    } else {
      toast({ variant: 'destructive', title: "Wrong Pattern!", description: "Follow the star pattern!" });
      setLugNutOrder([]);
      setCurrentLugIndex(0);
    }
  };

  const advanceToSwap = () => {
    setStage('swap');
    toast({ title: "Lug Nuts Removed!", description: "Now swap the tires correctly." });
  };

  const handleTireClick = (tireId) => {
    if (selectedTire === null) {
      setSelectedTire(tireId);
    } else if (selectedTire === tireId) {
      setSelectedTire(null);
    } else {
      setTires(prev => {
        const newTires = [...prev];
        const temp = newTires[selectedTire].pattern;
        newTires[selectedTire].pattern = newTires[tireId].pattern;
        newTires[selectedTire].swapped = true;
        newTires[tireId].pattern = temp;
        newTires[tireId].swapped = true;
        return newTires;
      });
      setSwapCount(prev => prev + 1);
      setSelectedTire(null);

      setTimeout(() => {
        const allCorrect = tires.every(tire => 
          tire.pattern === targetPattern[tire.position] || 
          (tires.find(t => t.id === selectedTire)?.pattern === targetPattern[tires.find(t => t.id === selectedTire)?.position])
        );
        
        const newTires = [...tires];
        const temp = newTires[selectedTire].pattern;
        newTires[selectedTire].pattern = newTires[tireId].pattern;
        newTires[tireId].pattern = temp;
        
        const nowCorrect = newTires.every(tire => 
          tire.pattern === targetPattern[tire.position]
        );
        
        if (nowCorrect) {
          advanceToTorque();
        }
      }, 100);
    }
  };

  const advanceToTorque = () => {
    setStage('torque');
    toast({ title: "Tires Swapped!", description: "Now torque the lug nuts properly." });
  };

  const handleTorqueClick = () => {
    if (isTorquing) {
      if (torqueNeedle >= torqueTargetStart && torqueNeedle <= torqueTargetStart + 10) {
        setTorqueCompleted(true);
        setSequenceBonus(prev => prev + 30);
        toast({ title: "Perfect Torque!", description: "+30 Bonus!" });
        advanceToPressure();
      } else {
        toast({ variant: 'destructive', title: "Missed!", description: "Try again." });
        setTorqueNeedle(0);
        setIsTorquing(false);
      }
    } else {
      setIsTorquing(true);
    }
  };

  const advanceToPressure = () => {
    setStage('pressure');
    toast({ title: "Torqued!", description: "Now check tire pressures." });
  };

  const handlePressureAdjust = (tireIndex, adjustment) => {
    setPressureValues(prev => {
      const newValues = [...prev];
      newValues[tireIndex] = Math.max(20, Math.min(50, newValues[tireIndex] + adjustment));
      return newValues;
    });

    if (Math.abs(pressureValues[tireIndex] + adjustment - targetPressure) <= 1) {
      if (tireIndex < 3) {
        setCurrentPressureTire(tireIndex + 1);
      } else {
        const allCorrect = pressureValues.every((p, idx) => 
          Math.abs((idx === tireIndex ? p + adjustment : p) - targetPressure) <= 1
        );
        if (allCorrect) {
          handleComplete();
        }
      }
    }
  };

  const handleComplete = () => {
    if (stage === 'complete') return;
    setStage('complete');
    
    const jackScore = (jackProgress / 100) * 150;
    const lugNutScore = (lugNutOrder.length / correctPattern.length) * 150;
    const swapScore = tires.filter(tire => tire.pattern === targetPattern[tire.position]).length * 100;
    const torqueScore = torqueCompleted ? 150 : 0;
    const pressureScore = pressureValues.filter(p => Math.abs(p - targetPressure) <= 1).length * 50;
    const timeBonus = timeLeft * 3;
    
    const finalScore = Math.round(jackScore + lugNutScore + swapScore + torqueScore + pressureScore + sequenceBonus + timeBonus);
    setScore(finalScore);
    
    let rating = 'Apprentice';
    if (finalScore > 900) rating = 'Master Mechanic';
    else if (finalScore > 750) rating = 'Expert';
    else if (finalScore > 600) rating = 'Professional';
    else if (finalScore > 400) rating = 'Skilled';
    setQualityRating(rating);
    
    const xpGained = Math.round(25 + (finalScore / 40));
    addXP(xpGained);
    
    toast({
      title: "Tire Rotation Complete!",
      description: `${rating}! Score: ${finalScore}. Earned +${xpGained} XP.`,
    });
    
    setTimeout(onComplete, 3000);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Card className="bg-slate-900/80 border-cyan-500/50 p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-bold text-white flex items-center gap-2">
            <RefreshCw className="w-6 h-6 text-cyan-400" />
            Tire Rotation - {stage === 'jack' ? 'Lift' : stage === 'lugnuts' ? 'Lug Nuts' : stage === 'swap' ? 'Swap' : stage === 'torque' ? 'Torque' : stage === 'pressure' ? 'Pressure' : 'Complete'}
          </h3>
          <div className="text-lg font-semibold text-white">
            Time: {timeLeft}s
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="bg-slate-800 p-2 rounded border border-slate-700">
            <span className="text-slate-400">Swaps: </span>
            <span className="text-cyan-400 font-bold">{swapCount}</span>
          </div>
          <div className="bg-slate-800 p-2 rounded border border-slate-700">
            <span className="text-slate-400">Bonus: </span>
            <span className="text-green-400 font-bold">+{sequenceBonus}</span>
          </div>
        </div>

        <div className="relative h-80 bg-gradient-to-b from-slate-800 to-slate-900 rounded-lg overflow-hidden border-2 border-slate-700 p-4">
          {stage === 'jack' && (
            <div className="flex flex-col items-center justify-center h-full space-y-6">
              <div className="text-center">
                <Wrench className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
                <p className="text-white text-lg mb-2">Hold to lift the car</p>
                <div className="text-slate-400 text-sm">Release at 100% for perfect lift</div>
              </div>
              <div className="w-full max-w-xs space-y-2">
                <Progress value={jackProgress} className="h-6 bg-slate-700" />
                <div className="text-center text-cyan-400 font-bold text-xl">{Math.round(jackProgress)}%</div>
              </div>
              <Button
                onMouseDown={handleJackHold}
                onMouseUp={handleJackRelease}
                onMouseLeave={handleJackRelease}
                className="w-48 h-16 text-lg font-bold"
                disabled={jackProgress >= 100}
              >
                {isJacking ? 'Lifting...' : 'HOLD TO JACK'}
              </Button>
            </div>
          )}

          {stage === 'lugnuts' && (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              <div className="text-center mb-4">
                <p className="text-white text-lg mb-2">Remove lug nuts in star pattern</p>
                <div className="text-cyan-400 text-sm">Progress: {currentLugIndex}/{correctPattern.length}</div>
              </div>
              <div className="relative w-48 h-48">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <circle cx="50" cy="50" r="45" fill="#64748b" stroke="#000" strokeWidth="2"/>
                  <circle cx="50" cy="50" r="25" fill="#1a1a1a" stroke="#444" strokeWidth="1"/>
                  
                  {[0, 1, 2, 3, 4].map((nutIndex) => {
                    const angle = (nutIndex * 72 - 90) * (Math.PI / 180);
                    const x = 50 + 35 * Math.cos(angle);
                    const y = 50 + 35 * Math.sin(angle);
                    const isRemoved = lugNutOrder.includes(nutIndex);
                    const isNext = nutIndex === correctPattern[currentLugIndex];
                    
                    return (
                      <motion.g
                        key={nutIndex}
                        onClick={() => !isRemoved && handleLugNutClick(nutIndex)}
                        className="cursor-pointer"
                        whileHover={{ scale: isRemoved ? 1 : 1.1 }}
                      >
                        <circle
                          cx={x}
                          cy={y}
                          r="6"
                          fill={isRemoved ? '#22c55e' : isNext ? '#3b82f6' : '#ef4444'}
                          stroke="#000"
                          strokeWidth="1"
                        />
                        <text
                          x={x}
                          y={y + 1}
                          textAnchor="middle"
                          fill="white"
                          fontSize="6"
                          fontWeight="bold"
                        >
                          {nutIndex + 1}
                        </text>
                      </motion.g>
                    );
                  })}
                </svg>
              </div>
              <div className="text-center text-slate-400 text-xs">
                Follow the star pattern: {correctPattern.map(n => n + 1).join(' → ')}
              </div>
            </div>
          )}

          {stage === 'swap' && (
            <div className="relative w-full h-full">
              <div className="absolute top-2 left-2 right-2 bg-slate-800 p-2 rounded text-xs">
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div>FL → {targetPattern.FL}</div>
                  <div>FR → {targetPattern.FR}</div>
                  <div>RL → {targetPattern.RL}</div>
                  <div>RR → {targetPattern.RR}</div>
                </div>
              </div>
              
              {tires.map((tire, idx) => {
                const positions = [
                  { top: '20%', left: '15%' },
                  { top: '20%', right: '15%' },
                  { bottom: '15%', left: '15%' },
                  { bottom: '15%', right: '15%' }
                ];
                
                const isCorrect = tire.pattern === targetPattern[tire.position];
                
                return (
                  <motion.div
                    key={tire.id}
                    className="absolute cursor-pointer"
                    style={positions[idx]}
                    onClick={() => handleTireClick(tire.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg width="70" height="70" viewBox="0 0 80 80">
                      <circle
                        cx="40"
                        cy="40"
                        r="35"
                        fill={selectedTire === tire.id ? '#3b82f6' : isCorrect ? '#22c55e' : '#64748b'}
                        stroke="#000"
                        strokeWidth="2"
                      />
                      <circle cx="40" cy="40" r="20" fill="#1a1a1a" stroke="#444" strokeWidth="1"/>
                      <text x="40" y="48" textAnchor="middle" fill="white" fontSize="20" fontWeight="bold">
                        {tire.pattern}
                      </text>
                    </svg>
                    <div className="absolute -bottom-6 left-0 right-0 text-center text-xs font-semibold text-white">
                      {tire.position}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {stage === 'torque' && (
            <div className="flex flex-col items-center justify-center h-full space-y-6">
              <div className="text-center">
                <Gauge className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
                <p className="text-white text-lg mb-2">Stop the needle in the green zone</p>
              </div>
              
              <div className="relative w-64 h-32">
                <div className="absolute inset-0 bg-slate-700 rounded-lg overflow-hidden">
                  <div 
                    className="absolute top-0 left-0 h-full bg-green-500 opacity-30"
                    style={{ left: `${torqueTargetStart}%`, width: '10%' }}
                  />
                  <motion.div
                    className="absolute top-0 w-1 h-full bg-red-500"
                    style={{ left: `${torqueNeedle}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-white font-bold">
                    {Math.round(torqueNeedle)}%
                  </div>
                </div>
              </div>
              
              <Button
                onClick={handleTorqueClick}
                className="w-48 h-16 text-lg font-bold"
                disabled={torqueCompleted}
              >
                {isTorquing ? 'STOP!' : 'START TORQUE'}
              </Button>
            </div>
          )}

          {stage === 'pressure' && (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              <div className="text-center mb-2">
                <p className="text-white text-lg">Adjust tire pressure to {targetPressure} PSI</p>
                <div className="text-cyan-400 text-sm">Tire: {currentPressureTire + 1}/4</div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                {pressureValues.map((pressure, idx) => (
                  <div key={idx} className="bg-slate-800 p-3 rounded border border-slate-700">
                    <div className="text-xs text-slate-400 mb-2">
                      {['FL', 'FR', 'RL', 'RR'][idx]}
                    </div>
                    <div className="text-2xl font-bold text-center mb-2" style={{
                      color: Math.abs(pressure - targetPressure) <= 1 ? '#22c55e' : '#ef4444'
                    }}>
                      {pressure} PSI
                    </div>
                    {idx === currentPressureTire && (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handlePressureAdjust(idx, -1)}
                          className="flex-1"
                          size="sm"
                        >
                          -
                        </Button>
                        <Button
                          onClick={() => handlePressureAdjust(idx, 1)}
                          className="flex-1"
                          size="sm"
                        >
                          +
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
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
              {qualityRating}!
            </div>
            <div className="text-xl text-white">Final Score: {score}</div>
            <div className="text-sm text-green-400">Sequence Bonus: +{sequenceBonus}</div>
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
};

export default TireRotation;
