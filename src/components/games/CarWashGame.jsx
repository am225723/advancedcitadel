import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Droplets } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { toast } from '@/components/ui/use-toast';

const CarWashGame = ({ onComplete }) => {
  const [stage, setStage] = useState('soak');
  const [dirtLevel, setDirtLevel] = useState(100);
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const { addXP } = useUser();

  useEffect(() => {
    if (stage === 'scrub' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'rgba(139, 69, 19, 0.8)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, [stage]);

  const handleSoak = () => {
    setStage('scrub');
    toast({
      title: "Car Soaked!",
      description: "Now scrub away all the dirt.",
    });
  };

  const calculateDirtLevel = () => {
    if (!canvasRef.current) return 100;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    let dirtyPixels = 0;
    for (let i = 3; i < imageData.data.length; i += 4) {
      if (imageData.data[i] > 10) {
        dirtyPixels++;
      }
    }
    
    const totalPixels = canvas.width * canvas.height;
    return Math.round((dirtyPixels / totalPixels) * 100);
  };

  const handleMouseMove = (e) => {
    if (!isDrawingRef.current || stage !== 'scrub') return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 25, 0, Math.PI * 2);
    ctx.fill();

    const newDirtLevel = calculateDirtLevel();
    setDirtLevel(newDirtLevel);
  };

  const handleTouchMove = (e) => {
    if (!isDrawingRef.current || stage !== 'scrub') return;
    e.preventDefault();

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = (touch.clientX - rect.left) * (canvas.width / rect.width);
    const y = (touch.clientY - rect.top) * (canvas.height / rect.height);

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 25, 0, Math.PI * 2);
    ctx.fill();

    const newDirtLevel = calculateDirtLevel();
    setDirtLevel(newDirtLevel);
  };

  const handleRinse = () => {
    if (dirtLevel > 10) {
      toast({
        variant: "destructive",
        title: "You missed a spot!",
        description: `Still ${dirtLevel}% dirty. Keep scrubbing!`,
      });
    } else {
      addXP(30);
      toast({
        title: "Car Wash Complete! ✨",
        description: "You've earned +30 XP for mindful washing.",
      });
      setTimeout(onComplete, 1000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <Card className="bg-slate-900/80 border-cyan-500/50 p-8">
        <h3 className="text-2xl font-bold text-white flex items-center justify-center space-x-2 mb-4">
          <Droplets className="w-6 h-6 text-cyan-400" />
          <span>Mindful Car Wash</span>
        </h3>
        <p className="text-slate-400 mb-6 text-center">
          {stage === 'soak' && "First, soak the car to prepare for washing."}
          {stage === 'scrub' && "Drag your mouse/finger to scrub away all the dirt."}
        </p>

        {stage === 'soak' && (
          <div className="text-center">
            <Button onClick={handleSoak} className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6">
              Soak Car
            </Button>
          </div>
        )}

        {stage === 'scrub' && (
          <div className="space-y-4">
            <div className="relative bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg overflow-hidden">
              <svg viewBox="0 0 400 200" className="w-full h-64">
                <defs>
                  <linearGradient id="carBody" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#dc2626" />
                    <stop offset="100%" stopColor="#991b1b" />
                  </linearGradient>
                </defs>
                <ellipse cx="120" cy="150" rx="30" ry="30" fill="#1a1a1a" />
                <ellipse cx="280" cy="150" rx="30" ry="30" fill="#1a1a1a" />
                <rect x="80" y="80" width="240" height="70" rx="10" fill="url(#carBody)" />
                <path d="M 140 80 L 160 50 L 240 50 L 260 80 Z" fill="url(#carBody)" />
                <rect x="170" y="55" width="60" height="25" fill="#87ceeb" opacity="0.7" />
              </svg>
              
              <canvas
                ref={canvasRef}
                width={400}
                height={200}
                className="absolute top-0 left-0 w-full h-full cursor-pointer touch-none"
                onMouseDown={() => isDrawingRef.current = true}
                onMouseUp={() => isDrawingRef.current = false}
                onMouseLeave={() => isDrawingRef.current = false}
                onMouseMove={handleMouseMove}
                onTouchStart={() => isDrawingRef.current = true}
                onTouchEnd={() => isDrawingRef.current = false}
                onTouchMove={handleTouchMove}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Cleanliness</span>
                <span className="text-cyan-400 font-bold">{100 - dirtLevel}%</span>
              </div>
              <Progress value={100 - dirtLevel} className="h-3" />
            </div>

            <div className="text-center">
              <Button 
                onClick={handleRinse} 
                className="bg-green-600 hover:bg-green-700 text-lg px-8 py-4"
              >
                Rinse
              </Button>
            </div>
          </div>
        )}
      </Card>
    </motion.div>
  );
};

export default CarWashGame;
