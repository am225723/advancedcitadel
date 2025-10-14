
import React from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@/contexts/UserContext';
import { Shield } from 'lucide-react';

const WelcomeMessage = () => {
  const { user } = useUser();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "The morning sun rises,";
    if (hour < 18) return "The day's battle continues,";
    return "The sun sets, but the vigil remains,";
  };

  return (
    <motion.div
      className="relative p-8 rounded-lg bg-black/30 backdrop-blur-sm border border-gold-accent/20 overflow-hidden text-center shadow-lg"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
      
      <div className="relative z-10">
        <Shield className="mx-auto w-12 h-12 text-gold-accent mb-4" />
        <h1 className="text-3xl md:text-4xl font-bold text-gradient-gold mb-2">
          {getGreeting()} {user ? user.display_name : 'Ashen One'}.
        </h1>
        <p className="text-lg text-slate-300 font-garamond max-w-2xl mx-auto">
          Welcome back to The Citadel. Your armoury awaits.
        </p>
      </div>
    </motion.div>
  );
};

export default WelcomeMessage;
