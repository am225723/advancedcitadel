import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { toast } from '@/components/ui/use-toast';
import { Wrench, Zap, Gauge, TrendingUp, AlertTriangle, CheckCircle, Flame } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';

const EngineTuning = ({ onComplete }) => {
  const { addXP } = useUser();
  
  const [stage, setStage] = useState('tuning');
  const [timeLeft, setTimeLeft] = useState(120);
  
  const [airFuelRatio, setAirFuelRatio] = useState(15.0);
  const optimalAFR = 14.7;
  
  const [ignitionTiming, setIgnitionTiming] = useState(10);
  const optimalTiming = 15;
  
  const [boostPressure, setBoostPressure] = useState(5);
  const optimalBoost = 15;
  
  const [rpmLimiter, setRPMLimiter] = useState(6500);
  const optimalRPM = 7000;
  
  const [currentRPM, setCurrentRPM] = useState(1000);
  const [currentHP, setCurrentHP] = useState(0);
  const [currentTorque, setCurrentTorque] = useState(0);
  const [peakHP, setPeakHP] = useState(0);
  const [peakTorque, setPeakTorque] = useState(0);
  
  const [knockDetected, setKnockDetected] = useState(false);
  const [knockCount, setKnockCount] = useState(0);
  
  const [dynoRunning, setDynoRunning] = useState(false);
  const [dynoComplete, setDynoComplete] = useState(false);
  
  const [tuningQuality, setTuningQuality] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [qualityRating, setQualityRating] = useState('');
  
  const [powerGraph, setPowerGraph] = useState([]);
  const [torqueGraph, setTorqueGraph] = useState([]);

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
    calculatePower();
  }, [airFuelRatio, ignitionTiming, boostPressure, rpmLimiter, currentRPM]);

  useEffect(() => {
    if (dynoRunning && currentRPM < rpmLimiter) {
      const interval = setInterval(() => {
        setCurrentRPM(prev => {
          const newRPM = prev + 100;
          if (newRPM >= rpmLimiter) {
            setDynoRunning(false);
            setDynoComplete(true);
            finishDynoRun();
            return rpmLimiter;
          }
          return newRPM;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [dynoRunning, currentRPM, rpmLimiter]);

  const calculatePower = () => {
    const afrAccuracy = 100 - Math.abs(airFuelRatio - optimalAFR) * 20;
    const timingAccuracy = 100 - Math.abs(ignitionTiming - optimalTiming) * 5;
    const boostAccuracy = 100 - Math.abs(boostPressure - optimalBoost) * 5;
    const rpmAccuracy = 100 - Math.abs(rpmLimiter - optimalRPM) / 50;
    
    const quality = Math.max(0, (afrAccuracy + timingAccuracy + boostAccuracy + rpmAccuracy) / 4);
    setTuningQuality(quality);
    
    const rpmFactor = currentRPM / 7000;
    const baseHP = 250;
    const hpMultiplier = (quality / 100) * (1 + boostPressure / 20);
    const calculatedHP = baseHP * hpMultiplier * rpmFactor;
    
    const baseTorque = 280;
    const torqueMultiplier = (quality / 100) * (1 + boostPressure / 25);
    const calculatedTorque = baseTorque * torqueMultiplier * (1 - rpmFactor * 0.3);
    
    setCurrentHP(Math.round(calculatedHP));
    setCurrentTorque(Math.round(calculatedTorque));
    
    if (calculatedHP > peakHP) setPeakHP(Math.round(calculatedHP));
    if (calculatedTorque > peakTorque) setPeakTorque(Math.round(calculatedTorque));
    
    if (ignitionTiming > 20 || boostPressure > 20) {
      if (Math.random() > 0.7) {
        setKnockDetected(true);
        setKnockCount(prev => prev + 1);
        setTimeout(() => setKnockDetected(false), 500);
      }
    } else {
      setKnockDetected(false);
    }
  };

  const handleDynoRun = () => {
    if (dynoRunning || dynoComplete) return;
    
    setDynoRunning(true);
    setCurrentRPM(1000);
    setPowerGraph([]);
    setTorqueGraph([]);
    toast({ title: "Dyno Run Started!", description: "Hold on tight!" });
  };

  const finishDynoRun = () => {
    const graphPoints = 50;
    const newPowerGraph = [];
    const newTorqueGraph = [];
    
    for (let i = 0; i <= graphPoints; i++) {
      const rpm = 1000 + (rpmLimiter - 1000) * (i / graphPoints);
      const rpmFactor = rpm / 7000;
      
      const quality = tuningQuality / 100;
      const hp = 250 * quality * (1 + boostPressure / 20) * rpmFactor;
      const torque = 280 * quality * (1 + boostPressure / 25) * (1 - rpmFactor * 0.3);
      
      newPowerGraph.push({ rpm, value: hp });
      newTorqueGraph.push({ rpm, value: torque });
    }
    
    setPowerGraph(newPowerGraph);
    setTorqueGraph(newTorqueGraph);
    
    toast({ 
      title: "Dyno Run Complete!", 
      description: `Peak HP: ${peakHP} | Peak Torque: ${peakTorque} lb-ft`
    });
    
    setTimeout(() => handleComplete(), 2000);
  };

  const handleComplete = () => {
    if (stage === 'complete') return;
    setStage('complete');
    
    const afrScore = Math.max(0, 250 - Math.abs(airFuelRatio - optimalAFR) * 50);
    const timingScore = Math.max(0, 250 - Math.abs(ignitionTiming - optimalTiming) * 15);
    const boostScore = Math.max(0, 250 - Math.abs(boostPressure - optimalBoost) * 15);
    const rpmScore = Math.max(0, 250 - Math.abs(rpmLimiter - optimalRPM) / 2);
    const knockPenalty = knockCount * 20;
    const dynoBonus = dynoComplete ? 200 : 0;
    const timeBonus = timeLeft * 3;
    
    const finalScore = Math.max(0, Math.round(
      afrScore + timingScore + boostScore + rpmScore - knockPenalty + dynoBonus + timeBonus
    ));
    setTotalScore(finalScore);
    
    let rating = 'Novice Tuner';
    if (finalScore > 1200) rating = 'Master Tuner';
    else if (finalScore > 1000) rating = 'Expert Tuner';
    else if (finalScore > 800) rating = 'Professional Tuner';
    else if (finalScore > 600) rating = 'Skilled Tuner';
    setQualityRating(rating);
    
    const xpGained = Math.round(30 + (finalScore / 40));
    addXP(xpGained);
    
    toast({
      title: "Engine Tuning Complete!",
      description: `${rating}! ${peakHP} HP / ${peakTorque} TQ. Earned +${xpGained} XP.`,
    });
    
    setTimeout(onComplete, 3000);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Card className="bg-slate-900/80 border-cyan-500/50 p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-bold text-white flex items-center gap-2">
            <Wrench className="w-6 h-6 text-cyan-400" />
            Dyno Tuning Simulator
          </h3>
          <div className="text-lg font-semibold text-white">
            Time: {timeLeft}s
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className="bg-slate-800 p-2 rounded border border-slate-700">
            <span className="text-slate-400">Quality: </span>
            <span className="text-cyan-400 font-bold">{Math.round(tuningQuality)}%</span>
          </div>
          <div className="bg-slate-800 p-2 rounded border border-slate-700">
            <span className="text-slate-400">Knock Events: </span>
            <span className="text-red-400 font-bold">{knockCount}</span>
          </div>
          <div className="bg-slate-800 p-2 rounded border border-slate-700">
            <span className="text-slate-400">Peak HP: </span>
            <span className="text-green-400 font-bold">{peakHP}</span>
          </div>
        </div>

        {knockDetected && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-red-900/50 border border-red-500 p-3 rounded flex items-center gap-2"
          >
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <span className="text-red-300 font-semibold">KNOCK DETECTED! Reduce timing or boost!</span>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4 bg-slate-800/50 p-4 rounded-lg border border-slate-700">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm text-slate-300 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-400" />
                  Air-Fuel Ratio
                </label>
                <span className={`text-sm font-bold ${Math.abs(airFuelRatio - optimalAFR) < 0.3 ? 'text-green-400' : 'text-red-400'}`}>
                  {airFuelRatio.toFixed(1)}:1
                </span>
              </div>
              <Slider
                value={[airFuelRatio]}
                onValueChange={(val) => setAirFuelRatio(val[0])}
                min={12}
                max={18}
                step={0.1}
                className="w-full"
              />
              <div className="text-xs text-slate-400 text-center">
                Target: {optimalAFR}:1 (Stoichiometric)
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm text-slate-300 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  Ignition Timing
                </label>
                <span className={`text-sm font-bold ${Math.abs(ignitionTiming - optimalTiming) < 2 ? 'text-green-400' : 'text-red-400'}`}>
                  {ignitionTiming}° BTDC
                </span>
              </div>
              <Slider
                value={[ignitionTiming]}
                onValueChange={(val) => setIgnitionTiming(val[0])}
                min={5}
                max={25}
                step={1}
                className="w-full"
              />
              <div className="text-xs text-slate-400 text-center">
                Target: {optimalTiming}° (Optimal advance)
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm text-slate-300 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                  Boost Pressure
                </label>
                <span className={`text-sm font-bold ${Math.abs(boostPressure - optimalBoost) < 2 ? 'text-green-400' : 'text-red-400'}`}>
                  {boostPressure} PSI
                </span>
              </div>
              <Slider
                value={[boostPressure]}
                onValueChange={(val) => setBoostPressure(val[0])}
                min={0}
                max={25}
                step={1}
                className="w-full"
              />
              <div className="text-xs text-slate-400 text-center">
                Target: {optimalBoost} PSI (Safe turbo boost)
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm text-slate-300 flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-red-400" />
                  RPM Limiter
                </label>
                <span className={`text-sm font-bold ${Math.abs(rpmLimiter - optimalRPM) < 200 ? 'text-green-400' : 'text-red-400'}`}>
                  {rpmLimiter} RPM
                </span>
              </div>
              <Slider
                value={[rpmLimiter]}
                onValueChange={(val) => setRPMLimiter(val[0])}
                min={5000}
                max={8000}
                step={100}
                className="w-full"
              />
              <div className="text-xs text-slate-400 text-center">
                Target: {optimalRPM} RPM (Redline)
              </div>
            </div>
          </div>

          <div className="space-y-4 bg-slate-800/50 p-4 rounded-lg border border-slate-700">
            <div className="text-center mb-4">
              <h4 className="text-lg font-bold text-white mb-2">Live Dyno Readings</h4>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="bg-slate-900 p-2 rounded">
                  <div className="text-slate-400 text-xs">RPM</div>
                  <div className="text-white font-bold">{currentRPM}</div>
                </div>
                <div className="bg-slate-900 p-2 rounded">
                  <div className="text-slate-400 text-xs">HP</div>
                  <div className="text-green-400 font-bold">{currentHP}</div>
                </div>
                <div className="bg-slate-900 p-2 rounded">
                  <div className="text-slate-400 text-xs">TQ</div>
                  <div className="text-blue-400 font-bold">{currentTorque}</div>
                </div>
              </div>
            </div>

            <div className="relative h-48 bg-slate-900 rounded border border-slate-700 p-2">
              <svg viewBox="0 0 300 150" className="w-full h-full">
                <line x1="30" y1="10" x2="30" y2="140" stroke="#475569" strokeWidth="2"/>
                <line x1="30" y1="140" x2="290" y2="140" stroke="#475569" strokeWidth="2"/>
                
                <text x="10" y="15" fill="#94a3b8" fontSize="10">HP</text>
                <text x="270" y="150" fill="#94a3b8" fontSize="10">RPM</text>
                
                {powerGraph.length > 0 && (
                  <motion.polyline
                    points={powerGraph.map((p, i) => 
                      `${30 + (260 * (i / powerGraph.length))},${140 - (p.value / peakHP) * 120}`
                    ).join(' ')}
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="3"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2 }}
                  />
                )}
                
                {torqueGraph.length > 0 && (
                  <motion.polyline
                    points={torqueGraph.map((p, i) => 
                      `${30 + (260 * (i / torqueGraph.length))},${140 - (p.value / peakTorque) * 120}`
                    ).join(' ')}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="3"
                    strokeDasharray="5,5"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2 }}
                  />
                )}
                
                {dynoRunning && (
                  <motion.line
                    x1={30 + (260 * ((currentRPM - 1000) / (rpmLimiter - 1000)))}
                    y1="10"
                    x2={30 + (260 * ((currentRPM - 1000) / (rpmLimiter - 1000)))}
                    y2="140"
                    stroke="#ef4444"
                    strokeWidth="2"
                    strokeDasharray="3,3"
                  />
                )}
              </svg>
              
              <div className="absolute bottom-2 left-2 right-2 flex justify-between text-xs">
                <span className="text-green-400">━━ HP</span>
                <span className="text-blue-400">- - TQ</span>
              </div>
            </div>

            <Button
              onClick={handleDynoRun}
              className="w-full h-16 text-lg font-bold"
              disabled={dynoRunning || dynoComplete}
              variant={dynoComplete ? 'outline' : 'default'}
            >
              {dynoRunning ? `Running... ${currentRPM} RPM` : dynoComplete ? 'Dyno Complete' : 'START DYNO RUN'}
            </Button>

            {dynoComplete && (
              <div className="bg-green-900/30 border border-green-500 p-3 rounded">
                <div className="text-center">
                  <div className="text-green-400 font-bold text-lg">Final Results</div>
                  <div className="text-white text-xl mt-2">{peakHP} HP @ {Math.round(rpmLimiter * 0.8)} RPM</div>
                  <div className="text-white text-xl">{peakTorque} lb-ft @ {Math.round(rpmLimiter * 0.6)} RPM</div>
                </div>
              </div>
            )}
          </div>
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
            <div className="text-xl text-white">Final Score: {totalScore}</div>
            <div className="text-lg text-cyan-400">Peak: {peakHP} HP / {peakTorque} lb-ft TQ</div>
            <div className="grid grid-cols-4 gap-2 text-xs mt-4">
              <div className="bg-slate-800 p-2 rounded">
                <div className="text-slate-400">AFR</div>
                <div className="text-cyan-400 font-bold">{airFuelRatio.toFixed(1)}</div>
              </div>
              <div className="bg-slate-800 p-2 rounded">
                <div className="text-slate-400">Timing</div>
                <div className="text-cyan-400 font-bold">{ignitionTiming}°</div>
              </div>
              <div className="bg-slate-800 p-2 rounded">
                <div className="text-slate-400">Boost</div>
                <div className="text-cyan-400 font-bold">{boostPressure} PSI</div>
              </div>
              <div className="bg-slate-800 p-2 rounded">
                <div className="text-slate-400">RPM</div>
                <div className="text-cyan-400 font-bold">{rpmLimiter}</div>
              </div>
            </div>
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
};

export default EngineTuning;
