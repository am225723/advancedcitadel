import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Car, Palette, Wrench, Gauge } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUser } from '@/contexts/UserContext';
import { toast } from '@/components/ui/use-toast';
import CarModel from '@/components/CarModel';

const VirtualGarage = () => {
  const { user, updateCarColor, loading } = useUser();
  const [selectedColor, setSelectedColor] = useState('');

  useEffect(() => {
    if (user) {
      setSelectedColor(user.car_color);
    }
  }, [user]);

  const colors = [
    { name: 'Rally Red', hex: '#DC2626', gradient: 'from-red-600 to-red-800' },
    { name: 'Cosmic Blue', hex: '#2563EB', gradient: 'from-blue-600 to-blue-800' },
    { name: 'Shadow Black', hex: '#0F172A', gradient: 'from-slate-900 to-black' },
    { name: 'Pearl White', hex: '#F8FAFC', gradient: 'from-slate-100 to-white' },
    { name: 'Gold Rush', hex: '#EAB308', gradient: 'from-yellow-500 to-yellow-700' }
  ];

  const specs = [
    { label: 'Engine', value: '2.0L Turbocharged I4' },
    { label: 'Horsepower', value: '286 HP @ 6,500 RPM' },
    { label: 'Torque', value: '289 lb-ft @ 3,500 RPM' },
    { label: 'Transmission', value: '5-Speed Manual' },
    { label: '0-60 mph', value: '4.8 seconds' },
    { label: 'Top Speed', value: '155 mph (limited)' }
  ];

  const modifications = [
    { name: 'HKS Turbo Kit', category: 'Performance', boost: '+50 HP' },
    { name: 'Brembo Brake Kit', category: 'Braking', boost: 'Enhanced Stopping' },
    { name: 'Coilover Suspension', category: 'Handling', boost: 'Improved Cornering' },
    { name: 'Titanium Exhaust', category: 'Performance', boost: '+15 HP' },
    { name: 'Carbon Fiber Hood', category: 'Weight Reduction', boost: '-20 lbs' }
  ];

  const applyColor = () => {
    updateCarColor(selectedColor);
    toast({
      title: "Color Applied! 🎨",
      description: `Your Evo IX is now ${selectedColor}`
    });
  };

  if (loading || !user) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Helmet>
        <title>Virtual Garage - Therapeutic Garage</title>
        <meta name="description" content="Customize your Mitsubishi Lancer Evolution IX and track your progress" />
      </Helmet>

      <div className="max-w-6xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center space-x-3">
            <Car className="w-12 h-12 text-blue-600" />
            <h1 className="text-4xl font-bold text-gradient-red-gold">Virtual Garage</h1>
          </div>
          <p className="text-xl text-slate-400">Your Mitsubishi Lancer Evolution IX</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="relative"
        >
          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-blue-900/50 p-8 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-950/20 to-transparent" />
            <div className="relative car-3d-container h-96">
              <CarModel />
              <div className="absolute top-4 right-4 px-4 py-2 bg-blue-950/80 backdrop-blur-sm border border-blue-700 rounded-lg">
                <span className="text-blue-400 font-bold">{user?.car_color || 'Default'}</span>
              </div>
            </div>
          </Card>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-slate-900/80 border-slate-700 p-6 space-y-4 h-full">
              <h3 className="text-2xl font-bold text-white flex items-center space-x-2">
                <Gauge className="w-6 h-6 text-red-600" />
                <span>Specifications</span>
              </h3>
              <div className="space-y-3">
                {specs.map((spec, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-slate-800">
                    <span className="text-slate-400">{spec.label}</span>
                    <span className="text-white font-semibold">{spec.value}</span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-slate-900/80 border-slate-700 p-6 space-y-4 h-full">
              <h3 className="text-2xl font-bold text-white flex items-center space-x-2">
                <Wrench className="w-6 h-6 text-yellow-600" />
                <span>Modifications</span>
              </h3>
              <div className="space-y-3">
                {modifications.map((mod, index) => (
                  <div key={index} className="p-3 bg-slate-950/50 border border-slate-800 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-white font-semibold">{mod.name}</p>
                        <p className="text-sm text-slate-400">{mod.category}</p>
                      </div>
                      <span className="text-green-400 text-sm font-bold">{mod.boost}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-purple-900/50 p-8 space-y-6">
            <h3 className="text-2xl font-bold text-white flex items-center space-x-2">
              <Palette className="w-6 h-6 text-purple-600" />
              <span>Color Customization</span>
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {colors.map((color) => (
                <motion.button
                  key={color.name}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedColor(color.name)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedColor === color.name
                      ? 'border-purple-600 shadow-lg shadow-purple-600/50'
                      : 'border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <div className={`w-full h-20 rounded-lg bg-gradient-to-br ${color.gradient} mb-2`} />
                  <p className="text-sm text-white font-semibold">{color.name}</p>
                </motion.button>
              ))}
            </div>

            <Button
              onClick={applyColor}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white font-bold py-6 text-lg"
            >
              <Palette className="w-5 h-5 mr-2" />
              Apply Color
            </Button>
          </Card>
        </motion.div>
      </div>
    </>
  );
};

export default VirtualGarage;