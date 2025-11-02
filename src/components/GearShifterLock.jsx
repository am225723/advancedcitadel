import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

const GearShifterLock = ({ onSuccess }) => {
  const [sequence, setSequence] = useState([]);
  const [currentGear, setCurrentGear] = useState('N');
  const [reverseUnlocked, setReverseUnlocked] = useState(false);
  const targetSequence = [1, 3, 5, 2, 4];

  const gearPositions = {
    'N': { x: 120, y: 180 },
    1: { x: 50, y: 80 },
    2: { x: 50, y: 280 },
    3: { x: 120, y: 80 },
    4: { x: 120, y: 280 },
    5: { x: 190, y: 80 },
    'R': { x: 190, y: 280 }
  };

  const selectGear = (gear) => {
    if (gear === 'R' && !reverseUnlocked) {
      toast({
        title: "Reverse Locked",
        description: "Pull up the shift knob to unlock reverse gear",
        variant: "destructive"
      });
      return;
    }
    
    setCurrentGear(gear);
    
    if (gear === 'R') {
      toast({
        title: "Reverse Engaged",
        description: "Careful! Backing up...",
      });
      return;
    }
    
    const newSequence = [...sequence, gear];
    setSequence(newSequence);

    if (newSequence.length === targetSequence.length) {
      if (JSON.stringify(newSequence) === JSON.stringify(targetSequence)) {
        toast({
          title: "Access Granted! 🎉",
          description: "Perfect shift sequence! Unlocking vault..."
        });
        setTimeout(onSuccess, 1000);
      } else {
        toast({
          title: "Incorrect Sequence",
          description: "Gearbox grinding... try again!",
          variant: "destructive"
        });
        setSequence([]);
        setCurrentGear('N');
      }
    }
  };

  const toggleReverseLockout = () => {
    setReverseUnlocked(!reverseUnlocked);
    toast({
      title: reverseUnlocked ? "Reverse Locked" : "Reverse Unlocked",
      description: reverseUnlocked ? "Lockout ring lowered" : "Pull up completed"
    });
  };

  const reset = () => {
    setSequence([]);
    setCurrentGear('N');
    setReverseUnlocked(false);
  };

  return (
    <div className="space-y-8 flex flex-col items-center">
      {/* Shift Gate Assembly */}
      <div className="relative w-80 h-96">
        {/* Metal shift gate base */}
        <svg viewBox="0 0 240 360" className="w-full h-full">
          <defs>
            {/* Metal textures and gradients */}
            <linearGradient id="gate-metal" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3a3a3a" />
              <stop offset="50%" stopColor="#5a5a5a" />
              <stop offset="100%" stopColor="#2a2a2a" />
            </linearGradient>
            <linearGradient id="shift-boot" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1a1a1a" />
              <stop offset="100%" stopColor="#0a0a0a" />
            </linearGradient>
            <radialGradient id="knob-gradient">
              <stop offset="0%" stopColor="#6a6a6a" />
              <stop offset="70%" stopColor="#3a3a3a" />
              <stop offset="100%" stopColor="#1a1a1a" />
            </radialGradient>
            <linearGradient id="knob-leather" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2a2a2a" />
              <stop offset="50%" stopColor="#1a1a1a" />
              <stop offset="100%" stopColor="#0a0a0a" />
            </linearGradient>
            <filter id="metal-shadow">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.5"/>
            </filter>
            <filter id="inset-shadow">
              <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
              <feOffset dx="0" dy="2" result="offsetblur"/>
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.5"/>
              </feComponentTransfer>
              <feMerge>
                <feMergeNode/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Gate base plate */}
          <rect x="10" y="10" width="220" height="340" rx="8" fill="url(#gate-metal)" stroke="#1a1a1a" strokeWidth="2" filter="url(#metal-shadow)"/>
          
          {/* Shift gate slots */}
          <g filter="url(#inset-shadow)">
            {/* Left column (1-2) */}
            <rect x="30" y="60" width="30" height="240" rx="15" fill="#0a0a0a" stroke="#2a2a2a" strokeWidth="1.5"/>
            {/* Center column (3-4) */}
            <rect x="100" y="60" width="30" height="240" rx="15" fill="#0a0a0a" stroke="#2a2a2a" strokeWidth="1.5"/>
            {/* Right column (5-R) */}
            <rect x="170" y="60" width="30" height="240" rx="15" fill="#0a0a0a" stroke="#2a2a2a" strokeWidth="1.5"/>
          </g>

          {/* Gear position labels */}
          <g className="select-none" style={{ fontFamily: 'Arial, sans-serif', fontWeight: 'bold', fontSize: '16px', fill: '#c0c0c0' }}>
            <text x="45" y="50" textAnchor="middle">1</text>
            <text x="45" y="330" textAnchor="middle">2</text>
            <text x="115" y="50" textAnchor="middle">3</text>
            <text x="115" y="330" textAnchor="middle">4</text>
            <text x="185" y="50" textAnchor="middle">5</text>
            <text x="185" y="330" textAnchor="middle" fill={reverseUnlocked ? "#ff4444" : "#666"}>R</text>
          </g>

          {/* Shift pattern diagram (top right) */}
          <g transform="translate(190, 15)" opacity="0.6">
            <rect width="40" height="40" rx="4" fill="#1a1a1a" stroke="#3a3a3a" strokeWidth="1"/>
            <text x="8" y="12" style={{ fontSize: '6px', fill: '#888' }}>1  3  5</text>
            <line x1="7" y1="15" x2="7" y2="28" stroke="#888" strokeWidth="0.5"/>
            <line x1="20" y1="15" x2="20" y2="28" stroke="#888" strokeWidth="0.5"/>
            <line x1="33" y1="15" x2="33" y2="28" stroke="#888" strokeWidth="0.5"/>
            <text x="8" y="35" style={{ fontSize: '6px', fill: '#888' }}>2  4  R</text>
          </g>

          {/* Reverse lockout indicator */}
          {reverseUnlocked && (
            <g>
              <circle cx="185" cy="290" r="20" fill="none" stroke="#ff4444" strokeWidth="2" opacity="0.5">
                <animate attributeName="opacity" values="0.3;0.7;0.3" dur="1.5s" repeatCount="indefinite"/>
              </circle>
            </g>
          )}

          {/* Shift boot */}
          <ellipse cx="120" cy="320" rx="35" ry="15" fill="url(#shift-boot)" opacity="0.8"/>
          <ellipse cx="120" cy="318" rx="30" ry="12" fill="#0a0a0a" opacity="0.9"/>

          {/* Interactive shift knob */}
          <motion.g
            animate={{
              x: gearPositions[currentGear].x - 120,
              y: gearPositions[currentGear].y - 180,
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            {/* Knob shaft */}
            <rect x="115" y="160" width="10" height="40" rx="5" fill="url(#knob-gradient)" filter="url(#metal-shadow)"/>
            
            {/* Knob ball */}
            <circle cx="120" cy="155" r="18" fill="url(#knob-leather)" stroke="#3a3a3a" strokeWidth="1.5" filter="url(#metal-shadow)"/>
            
            {/* Leather texture lines */}
            <circle cx="120" cy="155" r="14" fill="none" stroke="#2a2a2a" strokeWidth="0.5"/>
            <path d="M 120 141 Q 125 155 120 169" fill="none" stroke="#2a2a2a" strokeWidth="0.5"/>
            <path d="M 120 141 Q 115 155 120 169" fill="none" stroke="#2a2a2a" strokeWidth="0.5"/>
            
            {/* Reverse lockout ring */}
            {reverseUnlocked && (
              <circle cx="120" cy="170" r="12" fill="none" stroke="#ff4444" strokeWidth="2" opacity="0.7"/>
            )}
            
            {/* Current gear indicator on knob */}
            <text x="120" y="160" textAnchor="middle" style={{ fontSize: '14px', fontWeight: 'bold', fill: '#fff' }}>
              {currentGear}
            </text>
          </motion.g>

          {/* Clickable gear zones */}
          {Object.entries(gearPositions).filter(([gear]) => gear !== 'N').map(([gear, pos]) => (
            <motion.circle
              key={gear}
              cx={pos.x}
              cy={pos.y}
              r="25"
              fill="transparent"
              className="cursor-pointer"
              onClick={() => selectGear(gear === 'R' ? 'R' : parseInt(gear))}
              whileHover={{ r: 30 }}
              whileTap={{ r: 22 }}
            />
          ))}

          {/* Mitsubishi Evo IV branding */}
          <text x="120" y="355" textAnchor="middle" style={{ fontSize: '8px', fontWeight: 'bold', fill: '#666', letterSpacing: '1px' }}>
            MITSUBISHI EVOLUTION IV
          </text>
        </svg>
      </div>

      {/* Control panel */}
      <div className="text-center space-y-4">
        {/* Sequence display */}
        <div className="flex justify-center space-x-2">
          {sequence.map((gear, index) => (
            <motion.div
              key={index}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              className="w-12 h-12 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-white font-bold text-xl shadow-lg border-2 border-red-400"
            >
              {gear}
            </motion.div>
          ))}
          {[...Array(targetSequence.length - sequence.length)].map((_, index) => (
            <div
              key={`empty-${index}`}
              className="w-12 h-12 rounded-full border-2 border-slate-700 border-dashed bg-slate-900/50"
            />
          ))}
        </div>

        {/* Controls */}
        <div className="flex gap-4 justify-center">
          <Button
            onClick={toggleReverseLockout}
            variant="outline"
            className={`border-2 ${reverseUnlocked ? 'border-red-500 text-red-400 hover:bg-red-950' : 'border-slate-600 text-slate-300 hover:bg-slate-800'}`}
          >
            {reverseUnlocked ? '🔓 Lower Ring' : '🔒 Pull Up Ring'}
          </Button>
          
          <Button
            onClick={reset}
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-800"
          >
            Reset to Neutral
          </Button>
        </div>

        {/* Hint */}
        <p className="text-sm text-slate-500 mt-2">
          Click gear positions to shift • Pull up ring to unlock reverse
        </p>
      </div>
    </div>
  );
};

export default GearShifterLock;
