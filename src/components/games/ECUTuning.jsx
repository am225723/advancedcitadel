import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider.jsx';
import { SlidersHorizontal } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useUser } from '@/contexts/UserContext';

const ECUTuning = ({ onComplete }) => {
  const { addXP } = useUser();
  const [fuelMap, setFuelMap] = useState([50]);
  const [timing, setTiming] = useState([50]);
  const [boost, setBoost] = useState([50]);

  const handleSubmit = () => {
    if (fuelMap[0] > 60 && fuelMap[0] < 70 && timing[0] > 45 && timing[0] < 55 && boost[0] > 75 && boost[0] < 85) {
      addXP(40);
      toast({
        title: "ECU Tuned!",
        description: "You've uploaded new logic and earned +40 XP.",
      });
      onComplete();
    } else {
      toast({
        variant: "destructive",
        title: " suboptimal Tune",
        description: "The settings are not quite right. Try again.",
      });
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Card className="bg-slate-900/80 border-cyan-500/50 p-8">
        <h3 className="text-2xl font-bold text-white flex items-center justify-center space-x-2 mb-4">
          <SlidersHorizontal className="w-6 h-6 text-cyan-400" />
          <span>ECU Tuning</span>
        </h3>
        <p className="text-slate-400 mb-6 text-center">
          Adjust the sliders to restructure your thoughts and optimize performance.
        </p>

        <div className="space-y-6">
          <div>
            <label className="text-white">Fuel Map</label>
            <Slider
              value={fuelMap}
              onValueChange={setFuelMap}
              max={100}
              step={1}
            />
          </div>
          <div>
            <label className="text-white">Ignition Timing</label>
            <Slider
              value={timing}
              onValueChange={setTiming}
              max={100}
              step={1}
            />
          </div>
          <div>
            <label className="text-white">Boost Pressure</label>
            <Slider
              value={boost}
              onValueChange={setBoost}
              max={100}
              step={1}
            />
          </div>
        </div>

        <div className="text-center mt-6">
          <Button onClick={handleSubmit} className="bg-cyan-600 hover:bg-cyan-700">
            Apply Tune
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};

export default ECUTuning;
