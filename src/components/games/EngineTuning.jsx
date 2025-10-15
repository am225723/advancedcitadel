import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Wrench, CheckCircle } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';

const EngineTuning = ({ onComplete }) => {
  const { addXP } = useUser();
  const sequence = ['Spark Plugs', 'Injectors', 'Camshaft', 'Turbo'];
  const [userSequence, setUserSequence] = useState([]);
  const [isComplete, setIsComplete] = useState(false);

  const handleClick = (part) => {
    if (isComplete) return;

    const newUserSequence = [...userSequence, part];
    setUserSequence(newUserSequence);

    // Check if the sequence is correct so far
    for (let i = 0; i < newUserSequence.length; i++) {
      if (newUserSequence[i] !== sequence[i]) {
        toast({
          variant: "destructive",
          title: "Wrong Sequence",
          description: "You've disrupted the rhythm. Try again.",
        });
        setUserSequence([]);
        return;
      }
    }

    if (newUserSequence.length === sequence.length) {
      addXP(50);
      toast({
        title: "Engine Tuned!",
        description: "You've earned +50 XP for your focused effort.",
      });
      setIsComplete(true);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Card className="bg-slate-900/80 border-cyan-500/50 p-8 text-center">
        <h3 className="text-2xl font-bold text-white flex items-center justify-center space-x-2 mb-4">
          <Wrench className="w-6 h-6 text-cyan-400" />
          <span>Engine Tuning</span>
        </h3>
        <p className="text-slate-400 mb-6">
          Click the parts in the correct rhythmic sequence to tune the engine.
        </p>

        <div className="flex justify-center gap-4 mb-6">
          {sequence.map((part) => (
            <Button
              key={part}
              variant={userSequence.includes(part) ? "default" : "outline"}
              className={`w-32 h-20 ${userSequence.includes(part) ? 'bg-green-500' : ''}`}
              onClick={() => handleClick(part)}
            >
              {part}
            </Button>
          ))}
        </div>

        {isComplete && (
          <div className="text-center space-y-4">
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto" />
            <h3 className="text-2xl font-bold text-green-400">Engine Tuned!</h3>
            <Button onClick={onComplete}>Return to Garage</Button>
          </div>
        )}
      </Card>
    </motion.div>
  );
};

export default EngineTuning;
