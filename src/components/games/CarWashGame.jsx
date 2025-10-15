import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Droplets } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { toast } from '@/components/ui/use-toast';

const CarWashGame = ({ onComplete }) => {
  const [cleanliness, setCleanliness] = useState(0);
  const { addXP } = useUser();

  const handleWash = () => {
    setCleanliness(prev => Math.min(prev + 15, 100));
  };

  const handleCompletion = () => {
    addXP(25);
    toast({
      title: "Maintenance Complete!",
      description: "You've earned +25 XP for taking care of your car.",
    });
    onComplete(); // This will close the game view
  };

  if (cleanliness >= 100) {
    return (
      <div className="text-center space-y-4">
        <h3 className="text-2xl font-bold text-green-400">Car is Sparkling Clean!</h3>
        <p className="text-slate-300">Great job on the mindful maintenance.</p>
        <Button onClick={handleCompletion}>Return to Garage</Button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <Card className="bg-slate-900/80 border-cyan-500/50 p-8 text-center">
        <h3 className="text-2xl font-bold text-white flex items-center justify-center space-x-2 mb-4">
          <Droplets className="w-6 h-6 text-cyan-400" />
          <span>Mindful Car Wash</span>
        </h3>
        <p className="text-slate-400 mb-6">
          Slowly and deliberately "wash" the car to clean it. Focus on the motion and the feeling of making something new again.
        </p>

        <div className="space-y-4">
          <Progress value={cleanliness} className="w-full" />
          <p className="text-sm text-slate-300">{cleanliness}% Clean</p>

          {/* This button simulates the washing action for now */}
          <Button onClick={handleWash} className="bg-cyan-600 hover:bg-cyan-700">
            Wash
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};

export default CarWashGame;
