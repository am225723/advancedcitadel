import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Filter, CheckCircle, XCircle, Droplet } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { toast } from '@/components/ui/use-toast';

const OilChange = ({ onComplete }) => {
  const { addXP } = useUser();
  const [stage, setStage] = useState('drain');
  const [oilLevel, setOilLevel] = useState(100);
  const [newOilLevel, setNewOilLevel] = useState(0);
  const [timeLeft, setTimeLeft] = useState(90);
  const [filterChanged, setFilterChanged] = useState(false);

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

  const handleDrain = () => {
    if (oilLevel > 0) {
      setOilLevel(prev => Math.max(0, prev - 20));
    }
    if (oilLevel <= 20 && stage === 'drain') {
      setTimeout(() => setStage('filter'), 500);
    }
  };

  const handleChangeFilter = () => {
    if (!filterChanged) {
      setFilterChanged(true);
      toast({ title: "Filter Replaced!", description: "Ready to add new oil." });
      setTimeout(() => setStage('fill'), 1000);
    }
  };

  const handleFill = () => {
    if (newOilLevel < 100) {
      setNewOilLevel(prev => Math.min(100, prev + 20));
    }
    if (newOilLevel >= 80) {
      handleComplete();
    }
  };

  const handleComplete = () => {
    if (stage === 'complete') return;
    setStage('complete');
    const completionScore = (filterChanged ? 50 : 0) + (newOilLevel >= 80 ? 50 : newOilLevel / 2);
    const xpGained = Math.round(20 + completionScore / 5);
    addXP(xpGained);
    toast({
      title: "Oil Change Complete!",
      description: `Oil refreshed! Earned +${xpGained} XP.`,
    });
    setTimeout(onComplete, 1500);
  };

  const getStageInfo = () => {
    switch (stage) {
      case 'drain':
        return {
          title: 'Drain Old Oil',
          instruction: 'Click DRAIN button to remove old oil',
          action: handleDrain,
          actionText: 'DRAIN',
          disabled: oilLevel <= 0
        };
      case 'filter':
        return {
          title: 'Replace Oil Filter',
          instruction: 'Click to replace the oil filter',
          action: handleChangeFilter,
          actionText: 'CHANGE FILTER',
          disabled: filterChanged
        };
      case 'fill':
        return {
          title: 'Fill New Oil',
          instruction: 'Click FILL to add fresh oil',
          action: handleFill,
          actionText: 'FILL',
          disabled: newOilLevel >= 100
        };
      default:
        return {
          title: 'Complete',
          instruction: 'Oil change finished!',
          action: () => {},
          actionText: 'DONE',
          disabled: true
        };
    }
  };

  const stageInfo = getStageInfo();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Card className="bg-slate-900/80 border-cyan-500/50 p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-bold text-white flex items-center gap-2">
            <Filter className="w-6 h-6 text-cyan-400" />
            Oil Change
          </h3>
          <div className="text-lg font-semibold text-white">
            Time: {timeLeft}s
          </div>
        </div>

        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
          <h4 className="text-lg font-semibold text-cyan-400 mb-2">{stageInfo.title}</h4>
          <p className="text-sm text-slate-400">{stageInfo.instruction}</p>
        </div>

        <div className="relative h-80 bg-gradient-to-b from-slate-800 to-slate-900 rounded-lg overflow-hidden border-2 border-slate-700 p-8">
          <div className="flex flex-col items-center justify-center h-full gap-8">
            <div className="w-48">
              <div className="text-sm text-slate-400 mb-2">Old Oil</div>
              <div className="relative w-full h-32 bg-slate-700 rounded-lg border-2 border-slate-600 overflow-hidden">
                <motion.div
                  className="absolute bottom-0 w-full bg-gradient-to-t from-amber-900 to-amber-700"
                  animate={{ height: `${oilLevel}%` }}
                  transition={{ duration: 0.3 }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">{oilLevel}%</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center">
              {filterChanged ? (
                <CheckCircle className="w-16 h-16 text-green-500" />
              ) : (
                <Filter className="w-16 h-16 text-slate-500" />
              )}
            </div>

            <div className="w-48">
              <div className="text-sm text-slate-400 mb-2">New Oil</div>
              <div className="relative w-full h-32 bg-slate-700 rounded-lg border-2 border-slate-600 overflow-hidden">
                <motion.div
                  className="absolute bottom-0 w-full bg-gradient-to-t from-green-600 to-green-400"
                  animate={{ height: `${newOilLevel}%` }}
                  transition={{ duration: 0.3 }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">{newOilLevel}%</span>
                </div>
                {newOilLevel > 0 && newOilLevel < 100 && (
                  <motion.div
                    className="absolute w-full flex justify-center"
                    animate={{ top: ['80%', '20%', '80%'] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Droplet className="text-green-300 w-6 h-6" />
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>

        <Button
          onClick={stageInfo.action}
          disabled={stageInfo.disabled || stage === 'complete'}
          className="w-full h-16 text-lg font-bold"
          variant={stageInfo.disabled ? 'outline' : 'default'}
        >
          {stageInfo.actionText}
        </Button>

        {stage === 'complete' && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-center py-4"
          >
            <div className="text-2xl font-bold text-green-400 flex items-center justify-center gap-2">
              <CheckCircle className="w-8 h-8" />
              Fresh Oil!
            </div>
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
};

export default OilChange;
