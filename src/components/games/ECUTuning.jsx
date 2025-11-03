import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { SlidersHorizontal } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useUser } from '@/contexts/UserContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const ECUTuning = ({ onComplete }) => {
  const { addXP } = useUser();
  const [fuelMap, setFuelMap] = useState([50]);
  const [timing, setTiming] = useState([50]);
  const [boost, setBoost] = useState([50]);
  const [currentCurve, setCurrentCurve] = useState([]);

  const labels = ['1000', '2000', '3000', '4000', '5000', '6000', '7000'];
  const optimalData = [180, 220, 280, 320, 340, 310, 260];
  const baseData = [150, 180, 220, 250, 260, 240, 200];

  useEffect(() => {
    const fuelFactor = (fuelMap[0] - 50) / 100;
    const timingFactor = (timing[0] - 50) / 100;
    const boostFactor = (boost[0] - 50) / 100;

    const newCurve = baseData.map((value, index) => {
      const fuelEffect = value * (1 + fuelFactor * 0.4);
      const timingEffect = fuelEffect * (1 + timingFactor * 0.3);
      const boostEffect = timingEffect * (1 + boostFactor * 0.5);
      
      const rpmFactor = index / labels.length;
      const boostRpmMultiplier = 1 + (rpmFactor * boostFactor * 0.3);
      
      return Math.round(boostEffect * boostRpmMultiplier);
    });

    setCurrentCurve(newCurve);
  }, [fuelMap, timing, boost]);

  const calculateError = () => {
    let totalError = 0;
    for (let i = 0; i < optimalData.length; i++) {
      const diff = currentCurve[i] - optimalData[i];
      totalError += diff * diff;
    }
    return Math.sqrt(totalError / optimalData.length);
  };

  const handleRunDyno = () => {
    const error = calculateError();
    
    if (error < 15) {
      addXP(70);
      toast({
        title: "Perfect Tune! 🎯",
        description: "You've earned +70 XP for optimal performance!",
      });
      setTimeout(onComplete, 1000);
    } else if (error < 35) {
      toast({
        title: "Good Tune!",
        description: "Close, but not perfect. Keep adjusting!",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Suboptimal Tune",
        description: `Error: ${error.toFixed(1)}. Try different settings!`,
      });
    }
  };

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Optimal Tune',
        data: optimalData,
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderDash: [5, 5],
        borderWidth: 2,
        tension: 0.4,
      },
      {
        label: 'Your Tune',
        data: currentCurve,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#e2e8f0',
          font: { size: 12 },
        },
      },
      title: {
        display: true,
        text: 'Torque Curve (Nm vs RPM)',
        color: '#e2e8f0',
        font: { size: 16, weight: 'bold' },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 400,
        ticks: { color: '#94a3b8' },
        grid: { color: 'rgba(148, 163, 184, 0.1)' },
        title: {
          display: true,
          text: 'Torque (Nm)',
          color: '#cbd5e1',
        },
      },
      x: {
        ticks: { color: '#94a3b8' },
        grid: { color: 'rgba(148, 163, 184, 0.1)' },
        title: {
          display: true,
          text: 'RPM',
          color: '#cbd5e1',
        },
      },
    },
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Card className="bg-slate-900/80 border-cyan-500/50 p-8">
        <h3 className="text-2xl font-bold text-white flex items-center justify-center space-x-2 mb-4">
          <SlidersHorizontal className="w-6 h-6 text-cyan-400" />
          <span>ECU Tuning - Dyno</span>
        </h3>
        <p className="text-slate-400 mb-6 text-center">
          Match the green target curve by adjusting the sliders below.
        </p>

        <div className="bg-slate-800/50 p-4 rounded-lg mb-6" style={{ height: '300px' }}>
          <Line data={chartData} options={chartOptions} />
        </div>

        <div className="space-y-6 mb-6">
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-white font-semibold">Fuel Map</label>
              <span className="text-cyan-400">{fuelMap[0]}</span>
            </div>
            <Slider
              value={fuelMap}
              onValueChange={setFuelMap}
              max={100}
              step={1}
              className="cursor-pointer"
            />
          </div>
          
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-white font-semibold">Ignition Timing</label>
              <span className="text-cyan-400">{timing[0]}</span>
            </div>
            <Slider
              value={timing}
              onValueChange={setTiming}
              max={100}
              step={1}
              className="cursor-pointer"
            />
          </div>
          
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-white font-semibold">Boost Pressure</label>
              <span className="text-cyan-400">{boost[0]}</span>
            </div>
            <Slider
              value={boost}
              onValueChange={setBoost}
              max={100}
              step={1}
              className="cursor-pointer"
            />
          </div>
        </div>

        <div className="text-center">
          <Button onClick={handleRunDyno} className="bg-green-600 hover:bg-green-700 text-lg px-8 py-4">
            🏁 Run on Dyno
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};

export default ECUTuning;
