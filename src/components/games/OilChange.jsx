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
  const [oilLevel, setOilLevel] = useState(0);
  const [isFilling, setIsFilling] = useState(false);

  useEffect(() => {
    let interval;
    if (isFilling && oilLevel < 100) {
      interval = setInterval(() => {
        setOilLevel(prev => Math.min(prev + 1, 100));
      }, 50);
    } else if (oilLevel === 100) {
      addXP(15);
      toast({
        title: "Oil Changed!",
        description: "You've earned +15 XP for your rhythmic breathing.",
      });
    }
    return () => clearInterval(interval);
  }, [isFilling, oilLevel]);

  if (oilLevel >= 100) {
    return (
      <div className="text-center space-y-4">
        <h3 className="text-2xl font-bold text-green-400">Oil Changed!</h3>
        <p className="text-slate-300">Great job on the mindful maintenance.</p>
        <Button onClick={onComplete}>Return to Garage</Button>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Card className="bg-slate-900/80 border-cyan-500/50 p-8 text-center">
        <h3 className="text-2xl font-bold text-white flex items-center justify-center space-x-2 mb-4">
          <Filter className="w-6 h-6 text-cyan-400" />
          <span>Oil Change</span>
        </h3>
        <p className="text-slate-400 mb-6">
          Press and hold the button to fill the oil. Sync your breathing with the rising level.
        </p>

        <div className="space-y-4">
          <Progress value={oilLevel} className="w-full" />
          <p className="text-sm text-slate-300">{oilLevel}% Full</p>

          <Button
            onMouseDown={() => setIsFilling(true)}
            onMouseUp={() => setIsFilling(false)}
            onMouseLeave={() => setIsFilling(false)}
            className="bg-cyan-600 hover:bg-cyan-700 w-48 h-20"
          >
            {isFilling ? 'Filling...' : 'Press and Hold'}
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};

export default OilChange;
