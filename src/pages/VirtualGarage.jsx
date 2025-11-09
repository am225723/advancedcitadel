import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Car, Palette, Wrench, Gauge, Waves, Map, Lock, CheckCircle, Sparkles, BookOpen } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUser } from '@/contexts/UserContext';
import { toast } from '@/components/ui/use-toast';
import CarModel from '@/components/CarModel';
import { allGarageParts, partTiers, getUnlockProgress } from '@/lib/garage_parts';
import CarWashGame from '@/components/games/CarWashGame';
import EngineTuning from '@/components/games/EngineTuning';
import CleaningExterior from '@/components/games/CleaningExterior';
import OilChange from '@/components/games/OilChange';
import TireRotation from '@/components/games/TireRotation';
import ECUTuning from '@/components/games/ECUTuning';
import BodyRepair from '@/components/games/BodyRepair';

const VirtualGarage = () => {
  const { user, updateCarColor, loading } = useUser();
  const [selectedColor, setSelectedColor] = useState('');
  const [activeGame, setActiveGame] = useState(null);

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

  // Filter the master list of parts to show only what the user has unlocked.
  const modifications = allGarageParts.filter(part =>
    user?.unlocked_parts?.includes(part.name)
  );

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

        {activeGame ? (
          <>
            {activeGame === 'carWash' && <CarWashGame onComplete={() => setActiveGame(null)} />}
            {activeGame === 'engineTuning' && <EngineTuning onComplete={() => setActiveGame(null)} />}
            {activeGame === 'cleaningExterior' && <CleaningExterior onComplete={() => setActiveGame(null)} />}
            {activeGame === 'oilChange' && <OilChange onComplete={() => setActiveGame(null)} />}
            {activeGame === 'tireRotation' && <TireRotation onComplete={() => setActiveGame(null)} />}
            {activeGame === 'ecuTuning' && <ECUTuning onComplete={() => setActiveGame(null)} />}
            {activeGame === 'bodyRepair' && <BodyRepair onComplete={() => setActiveGame(null)} />}
          </>
        ) : (
          <>
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

            <Link to="/mindful-drive">
              <Button className="w-full py-8 text-xl font-bold" variant="outline">
                <Map className="w-6 h-6 mr-2" />
                Take a Mindful Drive
              </Button>
            </Link>

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
                    <span>Unlocked Parts ({modifications.length}/{allGarageParts.length})</span>
                  </h3>
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                    {modifications.length > 0 ? (
                      modifications.map((mod, index) => (
                        <div key={index} className="p-3 bg-slate-950/50 border border-slate-800 rounded-lg">
                          <div className="flex justify-between items-start mb-1">
                            <div>
                              <p className="text-white font-semibold">{mod.name}</p>
                              <p className="text-xs text-slate-400">{mod.category}</p>
                            </div>
                            <span className="text-green-400 text-sm font-bold">{mod.boost}</span>
                          </div>
                          <p className="text-xs text-slate-500 italic mt-1">{mod.skillMapping}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-500 text-center py-4 italic">Complete exercises to unlock your first upgrade!</p>
                    )}
                  </div>
                </Card>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="bg-slate-900/80 border-slate-700 p-6 space-y-4">
                <h3 className="text-2xl font-bold text-white flex items-center space-x-2">
                  <Waves className="w-6 h-6 text-cyan-400" />
                  <span>Maintenance</span>
                </h3>
                <p className="text-slate-400">
                  Engage in mindful maintenance to improve your car's performance and earn rewards.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                  <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => setActiveGame('carWash')}>
                    <Waves className="w-8 h-8" />
                    Car Wash
                  </Button>
                  <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => setActiveGame('engineTuning')}>
                    Engine Tuning
                  </Button>
                  <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => setActiveGame('cleaningExterior')}>
                    Cleaning Exterior
                  </Button>
                  <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => setActiveGame('oilChange')}>
                    Oil Change
                  </Button>
                  <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => setActiveGame('tireRotation')}>
                    Tire Rotation
                  </Button>
                  <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => setActiveGame('ecuTuning')}>
                    ECU Tuning
                  </Button>
                  <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => setActiveGame('bodyRepair')}>
                    Body Repair
                  </Button>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="bg-gradient-to-br from-slate-900 to-black border-gold-accent/30 p-8 space-y-6">
                <div>
                  <h3 className="text-3xl font-bold text-gold-accent flex items-center space-x-2 mb-2">
                    <BookOpen className="w-7 h-7" />
                    <span>Blueprint Compendium</span>
                  </h3>
                  <p className="text-slate-400 text-sm">Your path to mastery. Complete exercises to unlock therapeutic upgrades.</p>
                </div>

                {['Starter', 'Knight', 'Legendary'].map((tier) => {
                  const tierParts = allGarageParts.filter(part => part.tier === tier);
                  const tierInfo = partTiers[tier];
                  
                  return (
                    <div key={tier} className="space-y-3">
                      <div className="flex items-center gap-3 mb-3">
                        <h4 className={`text-xl font-bold ${tierInfo.color}`}>{tier} Tier</h4>
                        <div className="flex-1 h-px bg-slate-700"></div>
                      </div>
                      <p className="text-xs text-slate-500 mb-3 italic">{tierInfo.description}</p>
                      
                      <div className="grid gap-3">
                        {tierParts.map((part) => {
                          const progress = getUnlockProgress(user, part);
                          const isUnlocked = progress.unlocked;
                          
                          return (
                            <div
                              key={part.name}
                              className={`p-4 rounded-lg border ${
                                isUnlocked 
                                  ? `${tierInfo.borderColor} ${tierInfo.bgColor}` 
                                  : 'border-slate-800 bg-slate-900/30'
                              } transition-all`}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <h5 className={`font-bold ${isUnlocked ? 'text-white' : 'text-slate-400'}`}>
                                      {part.name}
                                    </h5>
                                    {isUnlocked && (
                                      <CheckCircle className="w-4 h-4 text-green-500" />
                                    )}
                                  </div>
                                  <p className="text-xs text-slate-500">{part.category}</p>
                                </div>
                                <span className={`text-sm font-bold ${isUnlocked ? 'text-green-400' : 'text-slate-600'}`}>
                                  {part.boost}
                                </span>
                              </div>
                              
                              <p className="text-xs text-slate-400 mb-3">{part.description}</p>
                              
                              {!isUnlocked && (
                                <>
                                  {part.unlockType === 'level_and_xp' ? (
                                    <>
                                      <div className="space-y-2 mb-2">
                                        <div>
                                          <div className="flex justify-between text-xs mb-1">
                                            <span className="text-slate-500">Level Progress</span>
                                            <span className={tierInfo.color}>
                                              {progress.levelProgress}/{part.unlockValue.level}
                                            </span>
                                          </div>
                                          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                            <motion.div
                                              initial={{ width: 0 }}
                                              animate={{ 
                                                width: `${Math.min(100, (progress.levelProgress / part.unlockValue.level) * 100)}%` 
                                              }}
                                              transition={{ duration: 0.5, ease: "easeOut" }}
                                              className="h-full bg-gradient-to-r from-gold-accent to-amber-500"
                                            />
                                          </div>
                                        </div>
                                        <div>
                                          <div className="flex justify-between text-xs mb-1">
                                            <span className="text-slate-500">XP Progress</span>
                                            <span className={tierInfo.color}>
                                              {progress.xpProgress}/{part.unlockValue.xp}
                                            </span>
                                          </div>
                                          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                            <motion.div
                                              initial={{ width: 0 }}
                                              animate={{ 
                                                width: `${Math.min(100, (progress.xpProgress / part.unlockValue.xp) * 100)}%` 
                                              }}
                                              transition={{ duration: 0.5, ease: "easeOut" }}
                                              className="h-full bg-gradient-to-r from-gold-accent to-amber-500"
                                            />
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flex items-start gap-2 text-xs">
                                        <Lock className="w-3 h-3 text-slate-500 mt-0.5" />
                                        <span className="text-slate-500">{part.unlockRequirement}</span>
                                      </div>
                                    </>
                                  ) : (
                                    <>
                                      <div className="mb-2">
                                        <div className="flex justify-between text-xs mb-1">
                                          <span className="text-slate-500">Progress</span>
                                          <span className={tierInfo.color}>
                                            {progress.progress}/{progress.total}
                                          </span>
                                        </div>
                                        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                          <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ 
                                              width: `${Math.min(100, (progress.progress / progress.total) * 100)}%` 
                                            }}
                                            transition={{ duration: 0.5, ease: "easeOut" }}
                                            className={`h-full bg-gradient-to-r ${
                                              tier === 'Starter' ? 'from-slate-400 to-slate-500' :
                                              tier === 'Knight' ? 'from-blue-400 to-blue-600' :
                                              'from-gold-accent to-amber-500'
                                            }`}
                                          />
                                        </div>
                                      </div>
                                      <div className="flex items-start gap-2 text-xs">
                                        <Lock className="w-3 h-3 text-slate-500 mt-0.5" />
                                        <span className="text-slate-500">{part.unlockRequirement}</span>
                                      </div>
                                    </>
                                  )}
                                </>
                              )}
                              
                              {isUnlocked && (
                                <p className="text-xs text-green-500 flex items-center gap-1">
                                  <Sparkles className="w-3 h-3" />
                                  <span className="italic">{part.skillMapping}</span>
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
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
          </>
        )}
      </div>
    </>
  );
};

export default VirtualGarage;
