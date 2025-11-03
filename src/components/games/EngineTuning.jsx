import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Wrench } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';

const EngineTuning = ({ onComplete }) => {
  const { addXP } = useUser();
  const parts = ['Spark Plugs', 'Injectors', 'Camshaft', 'Turbo'];
  const [sequence, setSequence] = useState([]);
  const [playerSequence, setPlayerSequence] = useState([]);
  const [level, setLevel] = useState(1);
  const [isPlayerTurn, setIsPlayerTurn] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const isResettingRef = useRef(false);

  useEffect(() => {
    if (!isResettingRef.current) {
      startComputerTurn();
    }
  }, [level]);

  const startComputerTurn = () => {
    setIsPlayerTurn(false);
    setPlayerSequence([]);
    const newPart = parts[Math.floor(Math.random() * parts.length)];
    const newSequence = [...sequence, newPart];
    setSequence(newSequence);
    
    setTimeout(() => {
      playSequence(newSequence);
    }, 500);
  };

  const resetGame = () => {
    isResettingRef.current = true;
    setSequence([]);
    setPlayerSequence([]);
    setIsPlayerTurn(false);
    setActiveIndex(-1);
    
    setTimeout(() => {
      const firstPart = parts[Math.floor(Math.random() * parts.length)];
      setSequence([firstPart]);
      setTimeout(() => {
        playSequence([firstPart]);
        isResettingRef.current = false;
      }, 500);
    }, 500);
  };

  const playSequence = async (seq) => {
    for (let i = 0; i < seq.length; i++) {
      setActiveIndex(parts.indexOf(seq[i]));
      await new Promise(resolve => setTimeout(resolve, 600));
      setActiveIndex(-1);
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    setIsPlayerTurn(true);
  };

  const handleClick = (part) => {
    if (!isPlayerTurn) return;

    const newPlayerSequence = [...playerSequence, part];
    setPlayerSequence(newPlayerSequence);

    const currentIndex = newPlayerSequence.length - 1;
    if (newPlayerSequence[currentIndex] !== sequence[currentIndex]) {
      toast({
        variant: "destructive",
        title: "Wrong Part!",
        description: "Starting over from Round 1...",
      });
      setLevel(1);
      resetGame();
      return;
    }

    if (newPlayerSequence.length === sequence.length) {
      if (level < 5) {
        toast({
          title: `Round ${level} Complete!`,
          description: `Moving to Round ${level + 1}`,
        });
        setLevel(level + 1);
        setIsPlayerTurn(false);
      } else {
        addXP(60);
        toast({
          title: "Engine Tuned! 🎉",
          description: "You've earned +60 XP for perfect rhythm!",
        });
        setTimeout(onComplete, 1000);
      }
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Card className="bg-slate-900/80 border-cyan-500/50 p-8">
        <h3 className="text-2xl font-bold text-white flex items-center justify-center space-x-2 mb-4">
          <Wrench className="w-6 h-6 text-cyan-400" />
          <span>Engine Tuning - Simon Says</span>
        </h3>
        
        <div className="text-center mb-6">
          <p className="text-lg font-bold text-cyan-400">Round: {level} / 5</p>
          <p className="text-sm text-slate-400 mt-2">
            {isPlayerTurn ? "Your turn!" : "Listen carefully..."}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
          {parts.map((part, index) => (
            <motion.div key={part}>
              <Button
                onClick={() => handleClick(part)}
                disabled={!isPlayerTurn}
                className="w-full h-24 text-lg font-bold"
                animate={{
                  scale: activeIndex === index ? 1.05 : 1,
                  backgroundColor: activeIndex === index ? '#3b82f6' : undefined
                }}
                transition={{ duration: 0.2 }}
              >
                {part}
              </Button>
            </motion.div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
};

export default EngineTuning;
