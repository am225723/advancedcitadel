import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Filter, CheckCircle, XCircle, Droplet, Thermometer, AlertCircle } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { toast } from '@/components/ui/use-toast';
import engineBayImage from '../../../attached_assets/stock_images/mitsubishi_lancer_ev_f859a504.jpg';

const OilChange = ({ onComplete }) => {
  const { addXP } = useUser();
  
  const [stage, setStage] = useState('viscosity');
  const [timeLeft, setTimeLeft] = useState(150);
  
  const [engineTemp, setEngineTemp] = useState(180);
  const [targetTemp] = useState(195);
  const [viscosityCorrect, setViscosityCorrect] = useState(false);
  
  const [drainProgress, setDrainProgress] = useState(0);
  const [isDraining, setIsDraining] = useState(false);
  const [catchPosition, setCatchPosition] = useState(50);
  const [oilCaught, setOilCaught] = useState(100);
  const [spillage, setSpillage] = useState(0);
  
  const [filterInstalled, setFilterInstalled] = useState(false);
  const [gasketChecked, setGasketChecked] = useState(false);
  
  const [newOilTemp, setNewOilTemp] = useState(60);
  const [targetOilTemp] = useState(80);
  const [oilTempVerified, setOilTempVerified] = useState(false);
  
  const [fillLevel, setFillLevel] = useState(0);
  const [isFilling, setIsFilling] = useState(false);
  const [targetFillLevel] = useState(85);
  
  const [qualityScore, setQualityScore] = useState(0);
  const [qualityRating, setQualityRating] = useState('');
  const [totalScore, setTotalScore] = useState(0);

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
    if (stage === 'drain' && isDraining) {
      const interval = setInterval(() => {
        setDrainProgress(prev => {
          if (prev >= 100) {
            setIsDraining(false);
            return 100;
          }
          
          const targetX = 50;
          const distance = Math.abs(catchPosition - targetX);
          
          if (distance > 15) {
            setSpillage(s => s + 2);
            setOilCaught(c => Math.max(0, c - 2));
          }
          
          return prev + 1;
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [stage, isDraining, catchPosition]);

  useEffect(() => {
    if (stage === 'fill' && isFilling) {
      const interval = setInterval(() => {
        setFillLevel(prev => {
          if (prev >= 100) {
            setSpillage(s => s + 10);
            setIsFilling(false);
            toast({ variant: 'destructive', title: "Overfilled!", description: "Oil spilled!" });
            return 100;
          }
          return prev + 0.5;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [stage, isFilling]);

  const handleViscosityCheck = () => {
    if (Math.abs(engineTemp - targetTemp) <= 5) {
      setViscosityCorrect(true);
      toast({ title: "Temperature OK!", description: "Oil viscosity verified." });
      setTimeout(() => advanceToDrain(), 1000);
    } else {
      toast({ variant: 'destructive', title: "Wrong Temperature!", description: `Target: ${targetTemp}°F` });
    }
  };

  const advanceToDrain = () => {
    setStage('drain');
    toast({ title: "Starting Drain", description: "Position the drain pan!" });
  };

  const handleStartDrain = () => {
    if (!isDraining) {
      setIsDraining(true);
    }
  };

  const handleCatchMove = (direction) => {
    setCatchPosition(prev => Math.max(0, Math.min(100, prev + direction * 5)));
  };

  useEffect(() => {
    if (drainProgress >= 100 && stage === 'drain') {
      setTimeout(() => advanceToFilter(), 500);
    }
  }, [drainProgress, stage]);

  const advanceToFilter = () => {
    setStage('filter');
    toast({ title: "Oil Drained!", description: "Now replace the filter." });
  };

  const handleFilterInstall = () => {
    setFilterInstalled(true);
    toast({ title: "Filter Installed!", description: "Check the gasket." });
  };

  const handleGasketCheck = () => {
    if (filterInstalled) {
      setGasketChecked(true);
      toast({ title: "Gasket Verified!", description: "Ready for new oil." });
      setTimeout(() => advanceToTempCheck(), 1000);
    }
  };

  const advanceToTempCheck = () => {
    setStage('temp');
    toast({ title: "Filter Ready", description: "Verify new oil temperature." });
  };

  const handleTempVerify = () => {
    if (Math.abs(newOilTemp - targetOilTemp) <= 5) {
      setOilTempVerified(true);
      toast({ title: "Temperature Perfect!", description: "Ready to fill." });
      setTimeout(() => advanceToFill(), 1000);
    } else {
      toast({ variant: 'destructive', title: "Temperature Off!", description: `Target: ${targetOilTemp}°F` });
    }
  };

  const advanceToFill = () => {
    setStage('fill');
    toast({ title: "Begin Filling", description: "Stop at the exact level!" });
  };

  const handleStartFill = () => {
    setIsFilling(true);
  };

  const handleStopFill = () => {
    setIsFilling(false);
    const accuracy = 100 - Math.abs(fillLevel - targetFillLevel);
    
    if (accuracy > 90) {
      toast({ title: "Perfect Fill!", description: "+50 Bonus!" });
      setTimeout(() => handleComplete(), 1000);
    } else if (accuracy > 70) {
      toast({ title: "Good Fill", description: "Acceptable level." });
      setTimeout(() => handleComplete(), 1000);
    } else {
      toast({ variant: 'destructive', title: "Poor Fill", description: "Level is off." });
      setTimeout(() => handleComplete(), 1000);
    }
  };

  const handleComplete = () => {
    if (stage === 'complete') return;
    setStage('complete');
    
    const viscosityScore = viscosityCorrect ? 150 : 50;
    const drainScore = ((oilCaught / 100) * 200) - (spillage * 2);
    const filterScore = (filterInstalled ? 100 : 0) + (gasketChecked ? 100 : 0);
    const tempScore = oilTempVerified ? 150 : 50;
    const fillScore = Math.max(0, 200 - Math.abs(fillLevel - targetFillLevel) * 5);
    const spillPenalty = spillage * 3;
    const timeBonus = timeLeft * 2;
    
    const finalScore = Math.max(0, Math.round(
      viscosityScore + drainScore + filterScore + tempScore + fillScore - spillPenalty + timeBonus
    ));
    setTotalScore(finalScore);
    
    let rating = 'Apprentice';
    if (finalScore > 1000) rating = 'Master Technician';
    else if (finalScore > 850) rating = 'Expert';
    else if (finalScore > 700) rating = 'Professional';
    else if (finalScore > 500) rating = 'Skilled';
    setQualityRating(rating);
    
    const quality = spillage < 10 ? 100 : Math.max(0, 100 - spillage);
    setQualityScore(quality);
    
    const xpGained = Math.round(25 + (finalScore / 40));
    addXP(xpGained);
    
    toast({
      title: "Oil Change Complete!",
      description: `${rating}! Score: ${finalScore}. Earned +${xpGained} XP.`,
    });
    
    setTimeout(onComplete, 3000);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Card className="bg-slate-900/80 border-cyan-500/50 p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-bold text-white flex items-center gap-2">
            <Filter className="w-6 h-6 text-cyan-400" />
            Oil Change - {stage === 'viscosity' ? 'Viscosity' : stage === 'drain' ? 'Drain' : stage === 'filter' ? 'Filter' : stage === 'temp' ? 'Temp Check' : stage === 'fill' ? 'Fill' : 'Complete'}
          </h3>
          <div className="text-lg font-semibold text-white">
            Time: {timeLeft}s
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="bg-slate-800 p-2 rounded border border-slate-700">
            <span className="text-slate-400">Spillage: </span>
            <span className="text-red-400 font-bold">{spillage}%</span>
          </div>
          <div className="bg-slate-800 p-2 rounded border border-slate-700">
            <span className="text-slate-400">Quality: </span>
            <span className="text-green-400 font-bold">{qualityScore}%</span>
          </div>
        </div>

        <div 
          className="relative h-80 rounded-lg overflow-hidden border-2 border-slate-700 p-6"
          style={{
            backgroundImage: `url(${engineBayImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/40" />
          {stage === 'viscosity' && (
            <div className="relative z-10 flex flex-col items-center justify-center h-full space-y-6">
              <Thermometer className="w-16 h-16 text-cyan-400" />
              <div className="text-center">
                <p className="text-white text-lg mb-2">Check Engine Temperature</p>
                <p className="text-slate-400 text-sm">Target: {targetTemp}°F (±5°F)</p>
              </div>
              
              <div className="w-full max-w-md space-y-3">
                <div className="text-center">
                  <div className="text-4xl font-bold text-white mb-2">{engineTemp}°F</div>
                  <div className={`text-sm ${Math.abs(engineTemp - targetTemp) <= 5 ? 'text-green-400' : 'text-red-400'}`}>
                    {Math.abs(engineTemp - targetTemp) <= 5 ? 'Temperature OK' : 'Adjust temperature'}
                  </div>
                </div>
                <Slider
                  value={[engineTemp]}
                  onValueChange={(val) => setEngineTemp(val[0])}
                  min={150}
                  max={220}
                  step={1}
                  className="w-full"
                />
              </div>
              
              <Button
                onClick={handleViscosityCheck}
                onTouchStart={(e) => { e.preventDefault(); handleViscosityCheck(); }}
                className="w-48 h-14 text-lg font-bold active:scale-95 transition-transform"
                disabled={viscosityCorrect}
                style={{ touchAction: 'manipulation' }}
              >
                Verify Viscosity
              </Button>
            </div>
          )}

          {stage === 'drain' && (
            <div className="relative z-10 flex flex-col items-center justify-center h-full space-y-4">
              <div className="text-center mb-2">
                <p className="text-white text-lg">Catch the draining oil</p>
                <p className="text-slate-400 text-sm">Keep the pan centered!</p>
              </div>
              
              <div className="relative w-full h-32 bg-slate-700 rounded">
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-amber-900 rounded-full">
                  <motion.div
                    className="absolute top-full left-1/2 -translate-x-1/2 w-1 bg-amber-700"
                    animate={{ height: isDraining ? '60px' : '0px' }}
                  />
                </div>
                
                <motion.div
                  className="absolute bottom-2 w-24 h-16 bg-slate-600 rounded border-2 border-slate-500"
                  style={{ left: `${catchPosition}%`, transform: 'translateX(-50%)' }}
                >
                  <div className="absolute bottom-0 w-full bg-amber-700 rounded-b" style={{
                    height: `${Math.min(100, (drainProgress / 100) * 100)}%`
                  }} />
                </motion.div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={() => handleCatchMove(-1)}
                  onTouchStart={(e) => { e.preventDefault(); handleCatchMove(-1); }}
                  className="h-12 text-lg active:scale-95 transition-transform"
                  style={{ touchAction: 'manipulation' }}
                >
                  ← Left
                </Button>
                <Button 
                  onClick={() => handleCatchMove(1)}
                  onTouchStart={(e) => { e.preventDefault(); handleCatchMove(1); }}
                  className="h-12 text-lg active:scale-95 transition-transform"
                  style={{ touchAction: 'manipulation' }}
                >
                  Right →
                </Button>
              </div>
              
              <div className="space-y-2 w-full max-w-xs">
                <Progress value={drainProgress} className="h-4 bg-slate-700" />
                <div className="text-center text-cyan-400 text-sm">
                  Caught: {oilCaught}% | Spilled: {spillage}%
                </div>
              </div>
              
              <Button
                onClick={handleStartDrain}
                onTouchStart={(e) => { e.preventDefault(); handleStartDrain(); }}
                className="w-48 h-14 text-lg font-bold active:scale-95 transition-transform"
                disabled={isDraining || drainProgress >= 100}
                style={{ touchAction: 'manipulation' }}
              >
                {isDraining ? 'Draining...' : drainProgress >= 100 ? 'Drained' : 'Start Drain'}
              </Button>
            </div>
          )}

          {stage === 'filter' && (
            <div className="relative z-10 flex flex-col items-center justify-center h-full space-y-6">
              <Filter className="w-24 h-24 text-cyan-400" />
              <div className="text-center">
                <p className="text-white text-lg mb-2">Replace Oil Filter</p>
                <p className="text-slate-400 text-sm">Check gasket before installing</p>
              </div>
              
              <div className="space-y-4 w-full max-w-md">
                <Button
                  onClick={handleFilterInstall}
                  className="w-full h-16 text-lg font-bold"
                  disabled={filterInstalled}
                  variant={filterInstalled ? 'outline' : 'default'}
                >
                  {filterInstalled ? <CheckCircle className="w-6 h-6 mr-2" /> : <Filter className="w-6 h-6 mr-2" />}
                  {filterInstalled ? 'Filter Installed' : 'Install Filter'}
                </Button>
                
                <Button
                  onClick={handleGasketCheck}
                  className="w-full h-16 text-lg font-bold"
                  disabled={!filterInstalled || gasketChecked}
                  variant={gasketChecked ? 'outline' : 'default'}
                >
                  {gasketChecked ? <CheckCircle className="w-6 h-6 mr-2" /> : <AlertCircle className="w-6 h-6 mr-2" />}
                  {gasketChecked ? 'Gasket Verified' : 'Check Gasket'}
                </Button>
              </div>
            </div>
          )}

          {stage === 'temp' && (
            <div className="relative z-10 flex flex-col items-center justify-center h-full space-y-6">
              <Thermometer className="w-16 h-16 text-green-400" />
              <div className="text-center">
                <p className="text-white text-lg mb-2">Verify New Oil Temperature</p>
                <p className="text-slate-400 text-sm">Target: {targetOilTemp}°F (±5°F)</p>
              </div>
              
              <div className="w-full max-w-md space-y-3">
                <div className="text-center">
                  <div className="text-4xl font-bold text-white mb-2">{newOilTemp}°F</div>
                  <div className={`text-sm ${Math.abs(newOilTemp - targetOilTemp) <= 5 ? 'text-green-400' : 'text-red-400'}`}>
                    {Math.abs(newOilTemp - targetOilTemp) <= 5 ? 'Temperature Perfect' : 'Adjust temperature'}
                  </div>
                </div>
                <Slider
                  value={[newOilTemp]}
                  onValueChange={(val) => setNewOilTemp(val[0])}
                  min={50}
                  max={110}
                  step={1}
                  className="w-full"
                />
              </div>
              
              <Button
                onClick={handleTempVerify}
                className="w-48 h-14 text-lg font-bold"
                disabled={oilTempVerified}
              >
                Verify Temperature
              </Button>
            </div>
          )}

          {stage === 'fill' && (
            <div className="relative z-10 flex flex-col items-center justify-center h-full space-y-6">
              <div className="text-center">
                <Droplet className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <p className="text-white text-lg mb-2">Fill to Exact Level</p>
                <p className="text-slate-400 text-sm">Target: {targetFillLevel}% (±5%)</p>
              </div>
              
              <div className="relative w-48 h-48 bg-slate-700 rounded-lg border-2 border-slate-600 overflow-hidden">
                <motion.div
                  className="absolute bottom-0 w-full bg-gradient-to-t from-green-600 to-green-400"
                  style={{ height: `${fillLevel}%` }}
                />
                <div className="absolute left-0 right-0 bg-yellow-400 h-1" style={{
                  top: `${100 - targetFillLevel}%`
                }}>
                  <div className="absolute -left-8 -top-2 text-xs text-yellow-400 whitespace-nowrap">
                    Target
                  </div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-white font-bold text-2xl bg-black/50 px-3 py-1 rounded">
                    {Math.round(fillLevel)}%
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4">
                <Button
                  onClick={handleStartFill}
                  onTouchStart={(e) => { e.preventDefault(); handleStartFill(); }}
                  className="w-32 h-14 text-lg font-bold active:scale-95 transition-transform"
                  disabled={isFilling || fillLevel >= 100}
                  style={{ touchAction: 'manipulation' }}
                >
                  {isFilling ? 'Filling...' : 'Fill'}
                </Button>
                <Button
                  onClick={handleStopFill}
                  onTouchStart={(e) => { e.preventDefault(); handleStopFill(); }}
                  className="w-32 h-14 text-lg font-bold active:scale-95 transition-transform"
                  disabled={!isFilling && fillLevel === 0}
                  variant="destructive"
                  style={{ touchAction: 'manipulation' }}
                >
                  Stop
                </Button>
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
            <div className="text-xl text-white">Final Score: {totalScore}</div>
            <div className="grid grid-cols-3 gap-2 text-xs mt-4">
              <div className="bg-slate-800 p-2 rounded">
                <div className="text-slate-400">Spillage</div>
                <div className="text-red-400 font-bold">{spillage}%</div>
              </div>
              <div className="bg-slate-800 p-2 rounded">
                <div className="text-slate-400">Quality</div>
                <div className="text-green-400 font-bold">{qualityScore}%</div>
              </div>
              <div className="bg-slate-800 p-2 rounded">
                <div className="text-slate-400">Fill Level</div>
                <div className="text-cyan-400 font-bold">{Math.round(fillLevel)}%</div>
              </div>
            </div>
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
};

export default OilChange;
