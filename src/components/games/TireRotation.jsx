import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RefreshCw, CheckCircle } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { toast } from '@/components/ui/use-toast';

const TireRotation = ({ onComplete }) => {
  const { addXP } = useUser();
  const [selectedTire, setSelectedTire] = useState(null);
  const [tires, setTires] = useState([
    { id: 0, position: 'FL', pattern: 'A', correct: false },
    { id: 1, position: 'FR', pattern: 'B', correct: false },
    { id: 2, position: 'RL', pattern: 'C', correct: false },
    { id: 3, position: 'RR', pattern: 'D', correct: false }
  ]);
  const [moves, setMoves] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [stage, setStage] = useState('playing');

  const targetPattern = { FL: 'C', FR: 'D', RL: 'A', RR: 'B' };

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

  const handleComplete = () => {
    if (stage === 'complete') return;
    setStage('complete');
    const correctCount = tires.filter((tire, idx) => 
      tire.pattern === targetPattern[tire.position]
    ).length;
    const score = correctCount * 50 + timeLeft * 2;
    const xpGained = Math.round(20 + (correctCount / 4) * 10);
    addXP(xpGained);
    toast({
      title: "Tire Rotation Complete!",
      description: `${correctCount}/4 correct! Earned +${xpGained} XP.`,
    });
    setTimeout(onComplete, 1500);
  };

  const handleTireClick = (tireId) => {
    if (stage !== 'playing') return;
    
    if (selectedTire === null) {
      setSelectedTire(tireId);
    } else if (selectedTire === tireId) {
      setSelectedTire(null);
    } else {
      setTires(prev => {
        const newTires = [...prev];
        const temp = newTires[selectedTire].pattern;
        newTires[selectedTire].pattern = newTires[tireId].pattern;
        newTires[tireId].pattern = temp;
        return newTires;
      });
      setMoves(prev => prev + 1);
      setSelectedTire(null);

      const newTires = [...tires];
      const temp = newTires[selectedTire].pattern;
      newTires[selectedTire].pattern = newTires[tireId].pattern;
      newTires[tireId].pattern = temp;
      
      const allCorrect = newTires.every(tire => 
        tire.pattern === targetPattern[tire.position]
      );
      
      if (allCorrect) {
        setTimeout(handleComplete, 500);
      }
    }
  };

  const getTireColor = (tire) => {
    const isCorrect = tire.pattern === targetPattern[tire.position];
    if (stage === 'complete') {
      return isCorrect ? '#22c55e' : '#ef4444';
    }
    return selectedTire === tire.id ? '#3b82f6' : '#64748b';
  };

  const correctCount = tires.filter(tire => 
    tire.pattern === targetPattern[tire.position]
  ).length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Card className="bg-slate-900/80 border-cyan-500/50 p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-bold text-white flex items-center gap-2">
            <RefreshCw className="w-6 h-6 text-cyan-400" />
            Tire Rotation
          </h3>
          <div className="text-lg font-semibold text-white">
            Time: {timeLeft}s | Moves: {moves}
          </div>
        </div>

        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
          <div className="text-sm text-slate-400 mb-2">Target Pattern:</div>
          <div className="grid grid-cols-2 gap-2 text-center text-xs">
            <div className="bg-slate-700 p-2 rounded">FL: {targetPattern.FL}</div>
            <div className="bg-slate-700 p-2 rounded">FR: {targetPattern.FR}</div>
            <div className="bg-slate-700 p-2 rounded">RL: {targetPattern.RL}</div>
            <div className="bg-slate-700 p-2 rounded">RR: {targetPattern.RR}</div>
          </div>
        </div>

        <div className="relative h-80 bg-gradient-to-b from-slate-800 to-slate-900 rounded-lg overflow-hidden border-2 border-slate-700 p-8">
          <div className="relative w-full h-full">
            {tires.map((tire, idx) => {
              const positions = [
                { top: '10%', left: '10%' },
                { top: '10%', right: '10%' },
                { bottom: '10%', left: '10%' },
                { bottom: '10%', right: '10%' }
              ];
              
              return (
                <motion.div
                  key={tire.id}
                  className="absolute cursor-pointer"
                  style={positions[idx]}
                  onClick={() => handleTireClick(tire.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="relative">
                    <svg width="80" height="80" viewBox="0 0 80 80">
                      <circle
                        cx="40"
                        cy="40"
                        r="35"
                        fill={getTireColor(tire)}
                        stroke="#000"
                        strokeWidth="2"
                      />
                      <circle
                        cx="40"
                        cy="40"
                        r="20"
                        fill="#1a1a1a"
                        stroke="#444"
                        strokeWidth="1"
                      />
                      <text
                        x="40"
                        y="48"
                        textAnchor="middle"
                        fill="white"
                        fontSize="20"
                        fontWeight="bold"
                      >
                        {tire.pattern}
                      </text>
                    </svg>
                    <div className="absolute -bottom-6 left-0 right-0 text-center text-xs font-semibold text-white">
                      {tire.position}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Correct Positions</span>
            <span className="text-cyan-400 font-semibold">{correctCount}/4</span>
          </div>
          <Progress value={(correctCount / 4) * 100} className="h-3 bg-slate-700" />
        </div>

        <div className="text-center text-slate-400 text-sm">
          Click two tires to swap them. Match the target pattern!
        </div>

        {stage === 'complete' && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-center py-4"
          >
            <div className="text-2xl font-bold text-green-400 flex items-center justify-center gap-2">
              <CheckCircle className="w-8 h-8" />
              Rotation Complete!
            </div>
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
};

export default TireRotation;
