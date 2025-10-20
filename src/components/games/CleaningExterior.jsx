import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Sun } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { toast } from '@/components/ui/use-toast';

const CleaningExterior = ({ onComplete }) => {
  const { addXP } = useUser();
  const [dirtLevel, setDirtLevel] = useState(100);
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(139, 69, 19, 0.7)'; // Brown color for dirt
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const handleMouseMove = (e) => {
    if (dirtLevel === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.clearRect(x - 15, y - 15, 30, 30);

    // Recalculate dirt level by checking remaining pixels
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let dirtyPixels = 0;
    for (let i = 0; i < imageData.data.length; i += 4) {
      if (imageData.data[i + 3] > 0) { // Check alpha channel
        dirtyPixels++;
      }
    }
    const totalPixels = canvas.width * canvas.height;
    const newDirtLevel = Math.round((dirtyPixels / totalPixels) * 100);
    setDirtLevel(newDirtLevel);

    if (newDirtLevel === 0) {
      addXP(20);
      toast({
        title: "Exterior Cleaned!",
        description: "You've earned +20 XP for your meditative focus.",
      });
    }
  };

  if (dirtLevel === 0) {
    return (
        <div className="text-center space-y-4">
            <h3 className="text-2xl font-bold text-green-400">Exterior is Clean!</h3>
            <p className="text-slate-300">Great job on the mindful maintenance.</p>
            <Button onClick={onComplete}>Return to Garage</Button>
        </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Card className="bg-slate-900/80 border-cyan-500/50 p-8 text-center">
        <h3 className="text-2xl font-bold text-white flex items-center justify-center space-x-2 mb-4">
          <Sun className="w-6 h-6 text-cyan-400" />
          <span>Cleaning Exterior</span>
        </h3>
        <p className="text-slate-400 mb-6">
          Drag your mouse over the car to wipe away the dirt.
        </p>

        <canvas
          ref={canvasRef}
          width="500"
          height="300"
          className="mx-auto bg-gray-400 rounded-lg cursor-pointer"
          onMouseMove={handleMouseMove}
        ></canvas>

        <div className="space-y-4 mt-4">
          <Progress value={100 - dirtLevel} className="w-full" />
          <p className="text-sm text-slate-300">{100 - dirtLevel}% Clean</p>
        </div>
      </Card>
    </motion.div>
  );
};

export default CleaningExterior;
