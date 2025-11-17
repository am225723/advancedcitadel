import React, { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Filter, CheckCircle, XCircle } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { toast } from '@/components/ui/use-toast';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import EngineBayModel from './EngineBayModel';

const OilChange = ({ onComplete }) => {
  const { addXP } = useUser();
  const [tasks, setTasks] = useState({
    'drain_plug': false,
    'oil_filter': false,
    'oil_cap': false,
    'fill_oil': false,
    'replace_cap': false
  });
  const [timeLeft, setTimeLeft] = useState(120);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handlePartClick = (partName) => {
    switch (partName) {
      case 'drain_plug':
        if (!tasks.drain_plug) {
          setTasks(t => ({ ...t, drain_plug: true }));
          setScore(s => s + 50);
        }
        break;
      case 'oil_filter':
        if (tasks.drain_plug && !tasks.oil_filter) {
          setTasks(t => ({ ...t, oil_filter: true }));
          setScore(s => s + 50);
        } else {
          toast({ variant: "destructive", title: "Drain the oil first!" });
        }
        break;
      case 'oil_cap':
        if (tasks.oil_filter && !tasks.oil_cap) {
          setTasks(t => ({ ...t, oil_cap: true }));
          setScore(s => s + 50);
        }
        break;
      default:
        break;
    }
  };

  const handleFillOil = () => {
    if (tasks.oil_cap && !tasks.fill_oil) {
        setTasks(t => ({...t, fill_oil: true}));
        setScore(s => s + 100);
    }
  }

  const endGame = () => {
    const allComplete = Object.values(tasks).every(Boolean);
    const finalScore = allComplete ? score + timeLeft * 5 : score;
    const xpGained = Math.round(finalScore / 15);
    addXP(xpGained);

    toast({
      title: allComplete ? "Oil Change Complete!" : "Time's Up!",
      description: `You scored ${finalScore} and earned +${xpGained} XP.`,
    });
    setTimeout(onComplete, 2000);
  };

  const taskList = [
      { id: 'drain_plug', text: 'Unscrew Drain Plug' },
      { id: 'oil_filter', text: 'Replace Oil Filter' },
      { id: 'oil_cap', text: 'Open Oil Cap' },
      { id: 'fill_oil', text: 'Fill with New Oil' },
  ]

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Card className="bg-slate-900/80 border-cyan-500/50 p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-bold text-white"><Filter className="inline mr-2" />Oil Change</h3>
          <div>
            <span className="text-lg font-bold">Score: {score} | </span>
            <span className="text-lg font-bold">Time: {timeLeft}s</span>
          </div>
        </div>

        <div className="h-64 bg-slate-800 rounded-lg">
          <Suspense fallback={<div>Loading Model...</div>}>
            <Canvas>
              <ambientLight />
              <pointLight position={[10, 10, 10]} />
              <EngineBayModel onPartClick={handlePartClick} />
              <OrbitControls />
            </Canvas>
          </Suspense>
        </div>

        <div className='grid grid-cols-2 gap-4'>
            <div>
                <h4 className='font-bold mb-2'>Tasks:</h4>
                <ul className="space-y-2">
                    {taskList.map(task => (
                        <li key={task.id} className="flex items-center text-slate-300">
                            {tasks[task.id] ? <CheckCircle className="text-green-500 mr-2" /> : <XCircle className="text-red-500 mr-2" />}
                            {task.text}
                        </li>
                    ))}
                </ul>
            </div>
            <div className='flex flex-col gap-4 justify-center'>
                <Button onClick={handleFillOil} disabled={!tasks.oil_cap || tasks.fill_oil}>Fill Oil</Button>
                <Button onClick={endGame} className="bg-green-600 hover:bg-green-700">Finish</Button>
            </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default OilChange;
