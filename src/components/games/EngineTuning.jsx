import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/use-toast';
import { Wrench, Zap, Fuel, Rss, CircleDotDashed, CheckCircle } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';

const EngineTuning = ({ onComplete }) => {
  const { addXP } = useUser();
  const [tasks, setTasks] = useState([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [currentTask, setCurrentTask] = useState(null);
  const [stage, setStage] = useState('playing');

  const taskTypes = [
    { name: 'Spark Plugs', icon: Zap, color: 'text-yellow-400' },
    { name: 'Injectors', icon: Fuel, color: 'text-green-400' },
    { name: 'Camshaft', icon: Rss, color: 'text-blue-400' },
    { name: 'Turbo', icon: CircleDotDashed, color: 'text-red-400' },
  ];

  useEffect(() => {
    generateTasks();
  }, []);

  useEffect(() => {
    if (stage === 'complete') return;
    
    const gameTimer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(gameTimer);
  }, [stage]);

  const generateTasks = () => {
    const newTasks = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      part: taskTypes[Math.floor(Math.random() * taskTypes.length)],
      completed: false,
    }));
    setTasks(newTasks);
    setCurrentTask(newTasks[0]);
  };

  const handlePartClick = (partName) => {
    if (currentTask && partName === currentTask.part.name) {
      setScore(s => s + 100);
      const newTasks = tasks.map(t => t.id === currentTask.id ? { ...t, completed: true } : t);
      setTasks(newTasks);

      const nextTask = newTasks.find(t => !t.completed);
      if (nextTask) {
        setCurrentTask(nextTask);
      } else {
        endGame();
      }
    } else {
      setScore(s => Math.max(0, s - 50));
      toast({ variant: 'destructive', title: 'Wrong Part!' });
    }
  };

  const endGame = () => {
    if (stage === 'complete') return;
    setStage('complete');
    const xpGained = Math.round(20 + score / 20);
    addXP(xpGained);
    toast({
      title: "Engine Tuning Complete!",
      description: `You scored ${score} and earned +${xpGained} XP.`,
    });
    setTimeout(onComplete, 2000);
  };

  const CurrentTaskIcon = currentTask?.part.icon;
  const completedCount = tasks.filter(t => t.completed).length;
  const progress = (completedCount / tasks.length) * 100;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Card className="bg-slate-900/80 border-cyan-500/50 p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-bold text-white flex items-center gap-2">
            <Wrench className="w-6 h-6 text-cyan-400" />
            Engine Tuning
          </h3>
          <div className='flex gap-4'>
            <div className="text-lg font-semibold text-white">Score: {score}</div>
            <div className="text-lg font-semibold text-white">Time: {timeLeft}s</div>
          </div>
        </div>

        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
          <p className="text-slate-400 mb-2 text-center">Next Part to Tune:</p>
          {currentTask && CurrentTaskIcon && (
            <div className={`flex items-center justify-center text-2xl font-bold ${currentTask.part.color}`}>
              <CurrentTaskIcon className="w-8 h-8 mr-3" />
              <span>{currentTask.part.name}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 p-4">
          {taskTypes.map((part) => {
            const PartIcon = part.icon;
            return (
              <Button
                key={part.name}
                onClick={() => handlePartClick(part.name)}
                className={`h-32 flex-col gap-3 text-lg font-semibold ${
                  currentTask?.part.name === part.name ? 'ring-4 ring-cyan-400' : ''
                }`}
                variant={currentTask?.part.name === part.name ? 'default' : 'outline'}
              >
                <PartIcon className={`w-12 h-12 ${part.color}`} />
                <span>{part.name}</span>
              </Button>
            );
          })}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Parts Tuned</span>
            <span className="text-cyan-400 font-semibold">{completedCount}/{tasks.length}</span>
          </div>
          <Progress value={progress} className="h-3 bg-slate-700" />
        </div>

        <div className="text-center text-slate-400 text-sm">
          Click the highlighted part as quickly as possible!
        </div>

        {stage === 'complete' && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-center py-4"
          >
            <div className="text-2xl font-bold text-green-400 flex items-center justify-center gap-2">
              <CheckCircle className="w-8 h-8" />
              Engine Tuned!
            </div>
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
};

export default EngineTuning;
