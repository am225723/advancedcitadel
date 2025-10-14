import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, Unlock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import TachometerLock from '@/components/TachometerLock';
import GearShifterLock from '@/components/GearShifterLock';
import SecureVault from '@/components/SecureVault';

const SafeView = () => {
  const [stage, setStage] = useState('tachometer');
  const [isUnlocked, setIsUnlocked] = useState(false);

  const handleTachometerSuccess = () => {
    setStage('gearshifter');
  };

  const handleGearShifterSuccess = () => {
    setIsUnlocked(true);
    setStage('vault');
  };

  const handleLock = () => {
    setIsUnlocked(false);
    setStage('tachometer');
  };

  return (
    <>
      <Helmet>
        <title>SafeView - Therapeutic Garage</title>
        <meta name="description" content="Secure storage with car-themed two-factor authentication" />
      </Helmet>

      <div className="max-w-4xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center space-x-3">
            <Shield className="w-12 h-12 text-green-600" />
            <h1 className="text-4xl font-bold text-gradient-red-gold">SafeView</h1>
          </div>
          <p className="text-xl text-slate-400">Car-themed security authentication</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {stage === 'tachometer' && (
            <motion.div
              key="tachometer"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-red-900/50 p-8">
                <div className="text-center space-y-6">
                  <div className="flex items-center justify-center space-x-2">
                    <Lock className="w-6 h-6 text-red-600" />
                    <h2 className="text-2xl font-bold text-white">Security Layer 1</h2>
                  </div>
                  <p className="text-slate-400">Rev the engine to the correct RPM to unlock</p>
                  <TachometerLock onSuccess={handleTachometerSuccess} />
                </div>
              </Card>
            </motion.div>
          )}

          {stage === 'gearshifter' && (
            <motion.div
              key="gearshifter"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-yellow-900/50 p-8">
                <div className="text-center space-y-6">
                  <div className="flex items-center justify-center space-x-2">
                    <Lock className="w-6 h-6 text-yellow-600" />
                    <h2 className="text-2xl font-bold text-white">Security Layer 2</h2>
                  </div>
                  <p className="text-slate-400">Enter the correct gear sequence</p>
                  <GearShifterLock onSuccess={handleGearShifterSuccess} />
                </div>
              </Card>
            </motion.div>
          )}

          {stage === 'vault' && (
            <motion.div
              key="vault"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-green-900/50 p-8">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Unlock className="w-6 h-6 text-green-600" />
                      <h2 className="text-2xl font-bold text-white">Vault Unlocked</h2>
                    </div>
                    <Button
                      onClick={handleLock}
                      variant="outline"
                      className="border-red-600 text-red-600 hover:bg-red-950/30"
                    >
                      <Lock className="w-4 h-4 mr-2" />
                      Lock Vault
                    </Button>
                  </div>
                  <SecureVault />
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default SafeView;