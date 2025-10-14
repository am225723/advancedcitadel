import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

const GearShifterLock = ({ onSuccess }) => {
  const [sequence, setSequence] = useState([]);
  const targetSequence = [1, 3, 5, 2, 4];

  const gears = [
    { number: 1, position: { col: 1, row: 1 } },
    { number: 2, position: { col: 1, row: 3 } },
    { number: 3, position: { col: 2, row: 1 } },
    { number: 4, position: { col: 2, row: 3 } },
    { number: 5, position: { col: 3, row: 1 } },
    { number: 'R', position: { col: 3, row: 3 } }
  ];

  const selectGear = (gear) => {
    if (gear === 'R') return;
    
    const newSequence = [...sequence, gear];
    setSequence(newSequence);

    if (newSequence.length === targetSequence.length) {
      if (JSON.stringify(newSequence) === JSON.stringify(targetSequence)) {
        toast({
          title: "Access Granted! 🎉",
          description: "Perfect gear sequence! Unlocking vault..."
        });
        setTimeout(onSuccess, 1000);
      } else {
        toast({
          title: "Incorrect Sequence",
          description: "Try again!",
          variant: "destructive"
        });
        setSequence([]);
      }
    }
  };

  const reset = () => {
    setSequence([]);
  };

  return (
    <div className="space-y-8 flex flex-col items-center">
      <div className="relative w-48 h-64 bg-slate-800 rounded-lg p-4 border-2 border-slate-700 shadow-inner">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-slate-800 rounded-lg"></div>
        <div className="relative grid grid-cols-3 grid-rows-3 h-full w-full gap-y-4">
          {/* H-pattern lines */}
          <div className="absolute top-1/2 left-0 w-full h-px bg-slate-600 -translate-y-1/2"></div>
          <div className="absolute top-1/4 left-1/2 w-px h-1/2 bg-slate-600 -translate-x-1/2"></div>

          {gears.map((gear) => (
            <div
              key={gear.number}
              style={{ gridColumn: gear.position.col, gridRow: gear.position.row }}
              className="flex items-center justify-center"
            >
              <motion.button
                onClick={() => selectGear(gear.number)}
                className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold transition-colors
                  ${sequence.includes(gear.number) ? 'bg-red-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}
                  ${gear.number === 'R' ? 'text-red-400' : ''}`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {gear.number}
              </motion.button>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center space-y-4">
        <div className="flex justify-center space-x-2">
          {sequence.map((gear, index) => (
            <motion.div
              key={index}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-xl"
            >
              {gear}
            </motion.div>
          ))}
          {[...Array(targetSequence.length - sequence.length)].map((_, index) => (
            <div
              key={`empty-${index}`}
              className="w-12 h-12 rounded-full border-2 border-slate-700 border-dashed"
            />
          ))}
        </div>

        <Button
          onClick={reset}
          variant="outline"
          className="border-slate-600 text-slate-300 hover:bg-slate-800"
        >
          Reset Sequence
        </Button>
      </div>
    </div>
  );
};

export default GearShifterLock;