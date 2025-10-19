import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useUser } from '@/contexts/UserContext';

const TireRotation = ({ onComplete }) => {
  const { addXP } = useUser();
  const initialPositions = ['Front Left', 'Front Right', 'Rear Left', 'Rear Right'];
  const [tirePositions, setTirePositions] = useState(initialPositions);
  const [isComplete, setIsComplete] = useState(false);

  const handleRotate = () => {
    // A simple rotation pattern: FL -> RR, FR -> RL, RL -> FR, RR -> FL
    const newPositions = [
      tirePositions[3], // Rear Right moves to Front Left
      tirePositions[2], // Rear Left moves to Front Right
      tirePositions[1], // Front Right moves to Rear Left
      tirePositions[0], // Front Left moves to Rear Right
    ];
    setTirePositions(newPositions);

    if (
      newPositions[0] === 'Rear Right' &&
      newPositions[1] === 'Rear Left' &&
      newPositions[2] === 'Front Right' &&
      newPositions[3] === 'Front Left'
    ) {
      addXP(20);
      toast({
          title: "Rotation Complete!",
          description: "You've gained a new perspective and earned +20 XP.",
        });
      setIsComplete(true);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Card className="bg-slate-900/80 border-cyan-500/50 p-8 text-center">
        <h3 className="text-2xl font-bold text-white flex items-center justify-center space-x-2 mb-4">
          <RefreshCw className="w-6 h-6 text-cyan-400" />
          <span>Tire Rotation</span>
        </h3>
        <p className="text-slate-400 mb-6">
          Rotate the tires to gain a new perspective.
        </p>

        <div className="grid grid-cols-2 gap-4 w-64 mx-auto mb-6">
          {tirePositions.map((tire, index) => (
            <div key={index} className="border border-slate-700 p-4 rounded-lg">
              <p className="font-bold">{initialPositions[index]}</p>
              <p>{tire}</p>
            </div>
          ))}
        </div>

        {!isComplete ? (
          <Button onClick={handleRotate} className="bg-cyan-600 hover:bg-cyan-700">
            Rotate
          </Button>
        ) : (
          <div className="text-center space-y-4">
            <h3 className="text-2xl font-bold text-green-400">Tires Rotated!</h3>
            <Button onClick={onComplete}>Return to Garage</Button>
          </div>
        )}
      </Card>
    </motion.div>
  );
};

export default TireRotation;
