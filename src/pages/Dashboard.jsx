
import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import WelcomeMessage from '@/components/WelcomeMessage';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useUser } from '@/contexts/UserContext';
import { BookOpen, Shield, Anchor, BookMarked, BrainCircuit, Flame, Car, Footprints, Scroll, Sparkles } from 'lucide-react';

const ToolCard = ({ title, description, icon, imageUrl, path, delay }) => {
  const navigate = useNavigate();
  const Icon = icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ 
        y: -8,
        transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
      }}
      whileTap={{ 
        scale: 0.98,
        y: -4,
        transition: { duration: 0.15 }
      }}
      onClick={() => navigate(path)}
      className="cursor-pointer group h-full touch-manipulation"
    >
      <Card className="relative h-full min-h-[200px] overflow-hidden border-2 border-slate-800/80 bg-gradient-to-br from-black/60 via-slate-900/50 to-black/70 backdrop-blur-md transition-all duration-500 ease-out group-hover:border-gold-accent/70 group-active:border-gold-accent/70 group-hover:shadow-2xl group-active:shadow-2xl group-hover:shadow-gold-accent/20 group-active:shadow-gold-accent/20">
        <div className="absolute inset-0 bg-gradient-to-br from-gold-accent/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-500 z-0"></div>
        
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-500 z-0">
          <div className="absolute top-0 left-0 w-32 h-32 bg-gold-accent/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent z-10"></div>
        
        <div className="absolute left-6 top-1/2 -translate-y-1/2 z-15 transition-all duration-500 group-hover:scale-110 group-active:scale-110 group-hover:left-8 group-active:left-8">
          <div className="relative">
            <div className="absolute inset-0 blur-xl bg-gold-accent/30 scale-110 opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-500"></div>
            <img 
              src={imageUrl} 
              alt={title} 
              className="relative w-28 h-36 object-contain drop-shadow-2xl filter brightness-90 group-hover:brightness-110 group-active:brightness-110 transition-all duration-500" 
            />
          </div>
        </div>
        
        <CardHeader className="relative z-20 h-full flex items-center justify-center p-3 pl-36 text-center">
          <div>
            <CardTitle className="text-2xl font-cinzel font-bold text-gold-accent tracking-wide leading-tight mb-1 group-hover:text-amber-300 group-active:text-amber-300 transition-all duration-300 drop-shadow-[0_2px_8px_rgba(218,165,32,0.4)]">
              {title.toUpperCase()}
            </CardTitle>
            <CardDescription className="text-slate-300 font-garamond text-lg leading-tight group-hover:text-slate-100 group-active:text-slate-100 transition-colors duration-300 mb-1">
              {description}
            </CardDescription>
            
            <div className="flex items-center justify-center gap-2 text-gold-accent/70 group-hover:text-gold-accent group-active:text-gold-accent transition-colors duration-300">
              <Icon size={16} className="group-hover:scale-110 group-active:scale-110 transition-transform duration-300" />
              <span className="text-xs font-cinzel tracking-wider uppercase opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-all duration-300">
                ENTER
              </span>
            </div>
          </div>
        </CardHeader>
        
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold-accent/50 to-transparent scale-x-0 group-hover:scale-x-100 group-active:scale-x-100 transition-transform duration-500 origin-center"></div>
      </Card>
    </motion.div>
  );
};

const MoodBuffIndicator = ({ buff }) => {
  if (!buff || new Date(buff.expires_at) <= new Date()) return null;

  const moodIcons = {
    confidence: { icon: '☀️', color: '#FFD700', name: 'Confidence' },
    calm: { icon: '🕊️', color: '#87CEEB', name: 'Calm' },
    resilience: { icon: '🛡️', color: '#4B0082', name: 'Resilience' },
    focus: { icon: '🎯', color: '#C0C0C0', name: 'Focus' },
    clarity: { icon: '💎', color: '#8B4513', name: 'Clarity' }
  };

  const buffInfo = moodIcons[buff.type] || { icon: '✨', color: '#FFD700', name: buff.type };
  const expiresAt = new Date(buff.expires_at);
  const now = new Date();
  const timeRemaining = Math.max(0, Math.floor((expiresAt - now) / 1000 / 60));
  const hours = Math.floor(timeRemaining / 60);
  const minutes = timeRemaining % 60;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-6"
    >
      <Card className="border-2 bg-gradient-to-br from-black/60 via-slate-900/50 to-black/70 backdrop-blur-md"
        style={{ borderColor: `${buffInfo.color}40` }}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-4xl"
            >
              {buffInfo.icon}
            </motion.div>
            <div className="flex-1">
              <h3 className="text-lg font-cinzel font-bold text-gold-accent flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Active Mood Buff: {buffInfo.name}
              </h3>
              <p className="text-sm text-slate-400">
                Time remaining: {hours > 0 && `${hours}h `}{minutes}m
              </p>
            </div>
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{
                background: `radial-gradient(circle, ${buffInfo.color}40, transparent)`,
                boxShadow: `0 0 20px ${buffInfo.color}60`
              }}
            >
              <Sparkles className="w-6 h-6" style={{ color: buffInfo.color }} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const Dashboard = () => {
  const { user, getActiveMoodBuff } = useUser();
  const activeMoodBuff = getActiveMoodBuff ? getActiveMoodBuff() : null;
  const baseTools = [
    { title: "The Codex", path: "/codex", description: "Consult the ancient tome of wisdom.", icon: BookMarked, imageUrl: "/images/books/codex.png", delay: 0.1 },
    { title: "The Reforge", path: "/journal-guided", description: "Transform your thoughts with guided journaling.", icon: BrainCircuit, imageUrl: "/images/books/reforge.png", delay: 0.2 },
    { title: "Scribe's Chronicle", path: "/reframe-guided", description: "Reshape negative patterns with guided reframing.", icon: Scroll, imageUrl: "/images/books/scribes-chronicle.png", delay: 0.3 },
    { title: "Path of the Undaunted", path: "/forward-path", description: "Confront fears with courage and strategy.", icon: Footprints, imageUrl: "/images/books/path-undaunted.png", delay: 0.4 },
    { title: "Anchor & Mantra", path: "/anchor", description: "Find your center with grounding techniques.", icon: Anchor, imageUrl: "/images/books/anchor-mantra.png", delay: 0.5 },
    { title: "The Garage", path: "/garage", description: "Tune your engine of resilience.", icon: Car, imageUrl: "/images/books/garage.png", delay: 0.6 },
    { title: "Bonfire of Breath", path: "/bonfire-enhanced", description: "Rekindle your inner flame.", icon: Flame, imageUrl: "/images/books/bonfire.png", delay: 0.7 },
    { title: "The Safe", path: "/safe", description: "Secure your most sensitive reflections.", icon: Shield, imageUrl: "/images/books/safe.png", delay: 0.8 },
  ];

  const tools = user?.role === 'admin' 
    ? [...baseTools, { title: "Warden's Notes", path: "/warden-notes", description: "Read and respond to messages from users.", icon: Scroll, imageUrl: "/images/books/scribes-chronicle.png", delay: 0.9 }]
    : baseTools;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="font-cinzel max-w-[1800px] mx-auto"
    >
      <WelcomeMessage user={user} />
      
      {activeMoodBuff && <MoodBuffIndicator buff={activeMoodBuff} />}
      
      <div className="mt-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mb-10"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gold-accent via-amber-400 to-gold-accent mb-3 tracking-wider drop-shadow-[0_0_20px_rgba(218,165,32,0.3)]">
            Your Armoury
          </h2>
          <div className="h-1 w-32 mx-auto bg-gradient-to-r from-transparent via-gold-accent to-transparent rounded-full"></div>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-8 px-4">
          {tools.map((tool) => (
            <ToolCard key={tool.title} {...tool} />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
