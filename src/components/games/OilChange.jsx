import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Filter } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { toast } from '@/components/ui/use-toast';

const OilChange = ({ onComplete }) => {
  const { addXP } = useUser();
  const [stage, setStage] = useState('unscrew');
  const [drainProgress, setDrainProgress] = useState(100);
  const [fillProgress, setFillProgress] = useState(0);
  const [isFilling, setIsFilling] = useState(false);

  useEffect(() => {
    if (stage === 'drain' && drainProgress > 0) {
      const timer = setTimeout(() => {
        setDrainProgress(prev => Math.max(prev - 2, 0));
      }, 60);
      return () => clearTimeout(timer);
    } else if (stage === 'drain' && drainProgress === 0) {
      setTimeout(() => setStage('fill'), 500);
    }
  }, [stage, drainProgress]);

  useEffect(() => {
    let interval;
    if (isFilling && stage === 'fill') {
      interval = setInterval(() => {
        setFillProgress(prev => Math.min(prev + 2, 110));
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isFilling, stage]);

  const handleUnscrew = () => {
    setStage('drain');
    toast({
      title: "Plug Removed!",
      description: "Draining old oil...",
    });
  };

  const handleStopFilling = () => {
    setIsFilling(false);
    
    if (fillProgress >= 95 && fillProgress <= 105) {
      addXP(35);
      toast({
        title: "Perfect Fill! 🎯",
        description: "You've earned +35 XP for precise work!",
      });
      setStage('done');
    } else if (fillProgress > 105) {
      toast({
        variant: "destructive",
        title: "Overfilled!",
        description: "Too much oil! Starting over...",
      });
      setFillProgress(0);
    } else {
      toast({
        variant: "destructive",
        title: "Too Low!",
        description: "Need more oil. Keep filling!",
      });
    }
  };

  if (stage === 'done') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <Card className="bg-slate-900/80 border-cyan-500/50 p-8 text-center">
          <h3 className="text-2xl font-bold text-green-400 mb-4">Oil Changed!</h3>
          <p className="text-slate-300 mb-6">Perfect timing and precision!</p>
          <Button onClick={onComplete} className="bg-green-600 hover:bg-green-700">
            Return to Garage
          </Button>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Card className="bg-slate-900/80 border-cyan-500/50 p-8">
        <h3 className="text-2xl font-bold text-white flex items-center justify-center space-x-2 mb-4">
          <Filter className="w-6 h-6 text-cyan-400" />
          <span>Oil Change</span>
        </h3>

        {stage === 'unscrew' && (
          <div className="space-y-6 text-center">
            <p className="text-slate-400">Remove the drain plug to start the oil change.</p>
            <div className="flex justify-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={handleUnscrew}
                  className="bg-amber-600 hover:bg-amber-700 text-lg px-12 py-8"
                >
                  🔧 Unscrew Plug
                </Button>
              </motion.div>
            </div>
          </div>
        )}

        {stage === 'drain' && (
          <div className="space-y-4">
            <p className="text-slate-400 text-center">Draining old oil...</p>
            <div className="relative h-24 bg-slate-800 rounded-lg overflow-hidden border-2 border-slate-600">
              <motion.div
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-amber-900 to-amber-700"
                style={{ height: `${drainProgress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <p className="text-center text-cyan-400 font-mono">{drainProgress}% remaining</p>
          </div>
        )}

        {stage === 'fill' && (
          <div className="space-y-4">
            <p className="text-slate-400 text-center mb-4">
              Hold the button to fill. Release in the <span className="text-green-400 font-bold">GREEN ZONE</span> (95-105%)!
            </p>
            
            <div className="relative h-24 bg-slate-800 rounded-lg overflow-hidden border-2 border-slate-600">
              {/* Sweet spot indicator */}
              <div className="absolute left-0 right-0" style={{ bottom: '95%', top: '0%', background: 'rgba(34, 197, 94, 0.2)', borderTop: '2px solid #22c55e', borderBottom: '2px solid #22c55e' }} />
              
              {/* Fill level */}
              <motion.div
                className={`absolute bottom-0 left-0 right-0 ${
                  fillProgress >= 95 && fillProgress <= 105
                    ? 'bg-gradient-to-t from-green-600 to-green-400'
                    : fillProgress > 105
                    ? 'bg-gradient-to-t from-red-600 to-red-400'
                    : 'bg-gradient-to-t from-yellow-600 to-yellow-400'
                }`}
                style={{ height: `${Math.min(fillProgress, 100)}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
            
            <p className="text-center font-mono text-2xl font-bold">
              <span className={
                fillProgress >= 95 && fillProgress <= 105
                  ? 'text-green-400'
                  : fillProgress > 105
                  ? 'text-red-400'
                  : 'text-yellow-400'
              }>
                {fillProgress}%
              </span>
            </p>

            <div className="text-center">
              <Button
                onMouseDown={() => setIsFilling(true)}
                onMouseUp={handleStopFilling}
                onMouseLeave={handleStopFilling}
                onTouchStart={() => setIsFilling(true)}
                onTouchEnd={handleStopFilling}
                className="bg-cyan-600 hover:bg-cyan-700 text-lg px-12 py-8"
              >
                {isFilling ? 'Filling...' : 'Hold to Fill'}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </motion.div>
  );
};

export default OilChange;
