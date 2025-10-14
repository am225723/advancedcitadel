
import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import WelcomeMessage from '@/components/WelcomeMessage';
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useUser } from '@/contexts/UserContext';
import { BookOpen, Shield, Anchor, Users, BrainCircuit, Flame, Car, Footprints } from 'lucide-react';

const ToolCard = ({ title, description, icon, imageUrl, path, delay }) => {
  const navigate = useNavigate();
  const Icon = icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -5 }}
      onClick={() => navigate(path)}
      className="cursor-pointer group"
    >
      <Card className="bg-black/40 border-slate-800 group-hover:border-gold-accent/50 transition-all duration-300 ease-in-out h-full flex flex-col overflow-hidden relative group-hover:shadow-lg group-hover:shadow-gold-accent/10 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10"></div>
        <img src={imageUrl} alt={title} className="absolute inset-0 w-full h-full object-contain object-center scale-90 opacity-40 group-hover:opacity-60 group-hover:scale-100 transition-all duration-300 ease-in-out z-0" />
        
        <CardHeader className="flex-grow z-20 flex flex-col justify-end p-4">
          <div className="flex items-center gap-4">
            <div className="text-gold-accent bg-dark-steel/50 p-3 rounded-lg shadow-inner-light group-hover:text-white transition-colors group-hover:scale-110">
              <Icon size={28} />
            </div>
            <div>
              <CardTitle className="text-lg font-cinzel text-gold-accent group-hover:text-white transition-colors">{title}</CardTitle>
              <CardDescription className="text-slate-400 font-sans text-sm">{description}</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>
    </motion.div>
  );
};

const Dashboard = () => {
  const { user } = useUser();
  const tools = [
    { title: "The Reforge", path: "/reforge", description: "Challenge and reshape negative thought patterns.", icon: BrainCircuit, imageUrl: "https://brywmjhsrnebfmhrhlmi.supabase.co/storage/v1/object/public/Citadel/Reforge.png", delay: 0.1 },
    { title: "Path of the Undaunted", path: "/forward-path", description: "Confront fears with courage and strategy.", icon: Footprints, imageUrl: "https://brywmjhsrnebfmhrhlmi.supabase.co/storage/v1/object/public/Citadel/Path.png", delay: 0.2 },
    { title: "Scribe's Chronicle", path: "/journal", description: "Document your journey and uncover insights.", icon: BookOpen, imageUrl: "https://brywmjhsrnebfmhrhlmi.supabase.co/storage/v1/object/public/Citadel/Scribe.png", delay: 0.3 },
    { title: "Anchor & Mantra", path: "/anchor", description: "Find your center with grounding techniques.", icon: Anchor, imageUrl: "https://brywmjhsrnebfmhrhlmi.supabase.co/storage/v1/object/public/Citadel/Anchor.png", delay: 0.4 },
    { title: "Hall of Characters", path: "/characters", description: "Consult with legendary figures for guidance.", icon: Users, imageUrl: "https://brywmjhsrnebfmhrhlmi.supabase.co/storage/v1/object/public/Citadel/Characters.png", delay: 0.5 },
    { title: "The Garage", path: "/garage", description: "Tune your engine of resilience.", icon: Car, imageUrl: "https://brywmjhsrnebfmhrhlmi.supabase.co/storage/v1/object/public/Citadel/Garage.png", delay: 0.6 },
    { title: "Bonfire of Breath", path: "/bonfire-enhanced", description: "Rekindle your inner flame.", icon: Flame, imageUrl: "https://brywmjhsrnebfmhrhlmi.supabase.co/storage/v1/object/public/Citadel/Bonfire.png", delay: 0.7 },
    { title: "The Safe", path: "/safe", description: "Secure your most sensitive reflections.", icon: Shield, imageUrl: "https://brywmjhsrnebfmhrhlmi.supabase.co/storage/v1/object/public/Citadel/Safe.png", delay: 0.8 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="font-cinzel"
    >
      <WelcomeMessage user={user} />
      
      <div className="mt-8">
        <h2 className="text-3xl font-bold text-gold-accent mb-6 text-center tracking-wider">Your Armoury</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tools.map((tool) => (
            <ToolCard key={tool.title} {...tool} />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
