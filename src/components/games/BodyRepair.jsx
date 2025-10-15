import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Hammer } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useUser } from '@/contexts/UserContext';

const BodyRepair = ({ onComplete }) => {
  const { addXP } = useUser();
  const initialCracks = [
    { id: 1, top: '20%', left: '30%' },
    { id: 2, top: '50%', left: '70%' },
    { id: 3, top: '80%', left: '20%' },
    { id: 4, top: '40%', left: '50%' },
  ];
  const [cracks, setCracks] = useState(initialCracks);

  const handleRepair = (id) => {
    setCracks(prev => prev.filter(crack => crack.id !== id));
  };

  useEffect(() => {
    if (cracks.length === 0) {
      addXP(30);
      toast({
        title: "Body Repaired!",
        description: "You've healed the trauma and earned +30 XP.",
      });
    }
  }, [cracks]);

  if (cracks.length === 0) {
    return (
      <div className="text-center space-y-4">
        <h3 className="text-2xl font-bold text-green-400">Body Repaired!</h3>
        <Button onClick={onComplete}>Return to Garage</Button>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Card className="bg-slate-900/80 border-cyan-500/50 p-8 text-center">
        <h3 className="text-2xl font-bold text-white flex items-center justify-center space-x-2 mb-4">
          <Hammer className="w-6 h-6 text-cyan-400" />
          <span>Body Repair</span>
        </h3>
        <p className="text-slate-400 mb-6">
          Tap on the cracks to repair the body.
        </p>

        <div className="relative w-full h-64 bg-gray-500 rounded-lg">
          {cracks.map(crack => (
            <div
              key={crack.id}
              className="absolute w-10 h-1 bg-black transform rotate-45 cursor-pointer"
              style={{ top: crack.top, left: crack.left }}
              onClick={() => handleRepair(crack.id)}
            />
          ))}
        </div>
      </Card>
    </motion.div>
  );
};

export default BodyRepair;
