import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Hammer, Sparkles } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useUser } from '@/contexts/UserContext';

const BodyRepair = ({ onComplete }) => {
  const { addXP } = useUser();
  const [tool, setTool] = useState('dent');
  const [damage, setDamage] = useState([
    { id: 1, type: 'dent', top: '20%', left: '25%', fixed: false },
    { id: 2, type: 'scratch', top: '15%', left: '60%', progress: 0, fixed: false },
    { id: 3, type: 'dent', top: '50%', left: '70%', fixed: false },
    { id: 4, type: 'scratch', top: '65%', left: '30%', progress: 0, fixed: false },
    { id: 5, type: 'dent', top: '75%', left: '50%', fixed: false },
    { id: 6, type: 'scratch', top: '40%', left: '45%', progress: 0, fixed: false },
  ]);

  useEffect(() => {
    if (damage.every(d => d.fixed)) {
      addXP(45);
      toast({
        title: "Body Repaired! ✨",
        description: "You've earned +45 XP for expert repairs!",
      });
      setTimeout(onComplete, 1000);
    }
  }, [damage]);

  const handleDamageClick = (damageItem) => {
    if (damageItem.fixed) return;

    if (damageItem.type === 'dent') {
      if (tool === 'dent') {
        setDamage(prev => prev.map(d => 
          d.id === damageItem.id ? { ...d, fixed: true } : d
        ));
        toast({
          title: "Dent Fixed!",
          description: "One less dent to worry about.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Wrong Tool!",
          description: "Use the Dent tool for dents.",
        });
      }
    } else if (damageItem.type === 'scratch') {
      if (tool === 'scratch') {
        const newProgress = damageItem.progress + 25;
        if (newProgress >= 100) {
          setDamage(prev => prev.map(d => 
            d.id === damageItem.id ? { ...d, progress: 100, fixed: true } : d
          ));
          toast({
            title: "Scratch Buffed!",
            description: "Smooth as new!",
          });
        } else {
          setDamage(prev => prev.map(d => 
            d.id === damageItem.id ? { ...d, progress: newProgress } : d
          ));
        }
      } else {
        toast({
          variant: "destructive",
          title: "Wrong Tool!",
          description: "Use the Buff tool for scratches.",
        });
      }
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Card className="bg-slate-900/80 border-cyan-500/50 p-8">
        <h3 className="text-2xl font-bold text-white flex items-center justify-center space-x-2 mb-4">
          <Hammer className="w-6 h-6 text-cyan-400" />
          <span>Body Repair</span>
        </h3>
        <p className="text-slate-400 mb-4 text-center">
          Switch tools to fix dents and buff scratches.
        </p>

        <div className="flex justify-center gap-4 mb-6">
          <Button
            onClick={() => setTool('dent')}
            className={`px-6 py-3 ${tool === 'dent' ? 'bg-cyan-600' : 'bg-slate-700'}`}
          >
            🔨 Fix Dents
          </Button>
          <Button
            onClick={() => setTool('scratch')}
            className={`px-6 py-3 ${tool === 'scratch' ? 'bg-amber-600' : 'bg-slate-700'}`}
          >
            ✨ Buff Scratches
          </Button>
        </div>

        <div className="relative w-full h-96 bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg border-2 border-slate-600">
          {damage.map(damageItem => (
            !damageItem.fixed && (
              damageItem.type === 'dent' ? (
                <motion.div
                  key={damageItem.id}
                  className="absolute w-12 h-12 bg-slate-900 rounded-full cursor-pointer border-2 border-slate-800 shadow-inner"
                  style={{ 
                    top: damageItem.top, 
                    left: damageItem.left,
                    filter: 'blur(1px)',
                  }}
                  onClick={() => handleDamageClick(damageItem)}
                  whileTap={{ scale: 0.8 }}
                  whileHover={{ scale: 1.1 }}
                />
              ) : (
                <motion.div
                  key={damageItem.id}
                  className="absolute w-24 h-2 bg-slate-300/40 rounded cursor-pointer overflow-hidden"
                  style={{ top: damageItem.top, left: damageItem.left }}
                  onClick={() => handleDamageClick(damageItem)}
                  whileHover={{ scale: 1.05 }}
                >
                  <motion.div
                    className="h-full bg-green-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${damageItem.progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.div>
              )
            )
          ))}
        </div>

        <div className="mt-4 text-center">
          <p className="text-cyan-400">
            {damage.filter(d => !d.fixed).length} damage spots remaining
          </p>
        </div>
      </Card>
    </motion.div>
  );
};

export default BodyRepair;
