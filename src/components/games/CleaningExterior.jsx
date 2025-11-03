import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Sun } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { toast } from '@/components/ui/use-toast';

const CleaningExterior = ({ onComplete }) => {
  const { addXP } = useUser();
  const [isSoaked, setIsSoaked] = useState(false);
  const [dirtSpots, setDirtSpots] = useState([]);
  const initialCount = 10;

  useEffect(() => {
    const spots = Array.from({ length: initialCount }, (_, i) => ({
      id: i + 1,
      top: `${Math.random() * 70 + 10}%`,
      left: `${Math.random() * 70 + 10}%`,
    }));
    setDirtSpots(spots);
  }, []);

  useEffect(() => {
    if (isSoaked && dirtSpots.length === 0) {
      addXP(25);
      toast({
        title: "Panel Cleaned! ✨",
        description: "You've earned +25 XP for thorough cleaning.",
      });
      setTimeout(onComplete, 1000);
    }
  }, [isSoaked, dirtSpots.length]);

  const handleSoak = () => {
    setIsSoaked(true);
    toast({
      title: "Panel Soaked!",
      description: "Now click all the dirt spots to clean them.",
    });
  };

  const handleSpotClick = (id) => {
    if (!isSoaked) {
      toast({
        variant: "destructive",
        title: "Too Dry!",
        description: "Soak the panel first before cleaning.",
      });
      return;
    }
    setDirtSpots(prev => prev.filter(spot => spot.id !== id));
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Card className="bg-slate-900/80 border-cyan-500/50 p-8">
        <h3 className="text-2xl font-bold text-white flex items-center justify-center space-x-2 mb-4">
          <Sun className="w-6 h-6 text-cyan-400" />
          <span>Cleaning Exterior</span>
        </h3>
        <p className="text-slate-400 mb-6 text-center">
          {!isSoaked ? "First, soak the panel to reveal the dirt." : "Click all the dirt spots to clean them!"}
        </p>

        {!isSoaked && (
          <div className="text-center mb-6">
            <Button onClick={handleSoak} className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-4">
              Soak Panel
            </Button>
          </div>
        )}

        <div 
          className={`relative w-full h-96 bg-gradient-to-br from-red-700 to-red-900 rounded-lg ${
            !isSoaked ? 'backdrop-blur-sm' : ''
          }`}
        >
          {!isSoaked && (
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm rounded-lg" />
          )}
          
          {isSoaked && dirtSpots.map(spot => (
            <motion.div
              key={spot.id}
              className="absolute w-6 h-6 bg-amber-900 rounded-full cursor-pointer border-2 border-amber-700"
              style={{ top: spot.top, left: spot.left }}
              onClick={() => handleSpotClick(spot.id)}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0 }}
            />
          ))}
        </div>

        {isSoaked && (
          <div className="space-y-2 mt-4">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Progress</span>
              <span className="text-cyan-400 font-bold">
                {initialCount - dirtSpots.length} / {initialCount}
              </span>
            </div>
            <Progress value={((initialCount - dirtSpots.length) / initialCount) * 100} className="h-3" />
          </div>
        )}
      </Card>
    </motion.div>
  );
};

export default CleaningExterior;
