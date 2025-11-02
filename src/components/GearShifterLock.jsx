import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

const GearShifterLock = ({ onSuccess }) => {
  const [sequence, setSequence] = useState([]);
  const [currentGear, setCurrentGear] = useState('N');
  const [holdingGear, setHoldingGear] = useState(null);
  const [holdProgress, setHoldProgress] = useState(0);
  const [targetSequence, setTargetSequence] = useState([1, 3, 5, 2, 4]);
  const [loading, setLoading] = useState(true);

  const gearPositions = {
    'N': { x: 120, y: 180 },
    1: { x: 50, y: 80 },
    2: { x: 50, y: 280 },
    3: { x: 120, y: 80 },
    4: { x: 120, y: 280 },
    5: { x: 190, y: 80 },
    'R': { x: 190, y: 280 }
  };

  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('lock_configurations')
        .select('config')
        .eq('lock_type', 'gearshifter')
        .single();

      if (data?.config?.sequence) {
        setTargetSequence(data.config.sequence);
      }
    } catch (error) {
      console.error('Error loading gear configuration:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGearPress = (gear) => {
    if (gear === 'R' || gear === 'N') return;
    
    setHoldingGear(gear);
    setHoldProgress(0);

    const interval = setInterval(() => {
      setHoldProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          confirmGearShift(gear);
          return 100;
        }
        return prev + 10;
      });
    }, 50);

    const cleanup = () => {
      clearInterval(interval);
      setHoldingGear(null);
      setHoldProgress(0);
    };

    document.addEventListener('mouseup', cleanup, { once: true });
    document.addEventListener('touchend', cleanup, { once: true });
  };

  const confirmGearShift = (gear) => {
    setHoldingGear(null);
    setHoldProgress(0);
    
    const gearNum = parseInt(gear);
    const newSequence = [...sequence, gearNum];
    setSequence(newSequence);
    setCurrentGear(gear);

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
          description: "Gearbox grinding... resetting!",
          variant: "destructive"
        });
        setTimeout(() => {
          setSequence([]);
          setCurrentGear('N');
        }, 1500);
      }
    } else {
      toast({
        title: `Gear ${gearNum} Engaged`,
        description: `Shift ${newSequence.length}/${targetSequence.length} complete`,
      });
    }
  };

  const reset = () => {
    setSequence([]);
    setCurrentGear('N');
    setHoldingGear(null);
    setHoldProgress(0);
  };

  if (loading) {
    return <div className="text-center py-12 text-slate-400">Loading configuration...</div>;
  }

  return (
    <div className="space-y-8 flex flex-col items-center">
      {/* Enhanced Shift Gate Assembly */}
      <div className="relative w-80 h-96">
        <svg viewBox="0 0 240 360" className="w-full h-full">
          <defs>
            {/* Enhanced metal textures */}
            <linearGradient id="gate-metal" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4a4a4a" />
              <stop offset="30%" stopColor="#5a5a5a" />
              <stop offset="70%" stopColor="#3a3a3a" />
              <stop offset="100%" stopColor="#2a2a2a" />
            </linearGradient>
            <linearGradient id="shift-boot" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#2a2a2a" />
              <stop offset="50%" stopColor="#1a1a1a" />
              <stop offset="100%" stopColor="#0a0a0a" />
            </linearGradient>
            <radialGradient id="knob-gradient" cx="0.4" cy="0.4" r="0.6">
              <stop offset="0%" stopColor="#7a7a7a" />
              <stop offset="50%" stopColor="#4a4a4a" />
              <stop offset="100%" stopColor="#2a2a2a" />
            </radialGradient>
            <linearGradient id="knob-leather" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3a3a3a" />
              <stop offset="40%" stopColor="#2a2a2a" />
              <stop offset="60%" stopColor="#1a1a1a" />
              <stop offset="100%" stopColor="#0a0a0a" />
            </linearGradient>
            <radialGradient id="gate-slot" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0%" stopColor="#050505" />
              <stop offset="80%" stopColor="#0a0a0a" />
              <stop offset="100%" stopColor="#1a1a1a" />
            </radialGradient>
            <filter id="metal-shadow">
              <feDropShadow dx="0" dy="3" stdDeviation="3" floodOpacity="0.6"/>
            </filter>
            <filter id="deep-inset">
              <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
              <feOffset dx="0" dy="3" result="offsetblur"/>
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.7"/>
              </feComponentTransfer>
              <feMerge>
                <feMergeNode/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <filter id="knob-glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Gate base plate with enhanced detail */}
          <rect x="10" y="10" width="220" height="340" rx="10" fill="url(#gate-metal)" stroke="#0a0a0a" strokeWidth="3" filter="url(#metal-shadow)"/>
          
          {/* Brushed metal texture overlay */}
          <rect x="10" y="10" width="220" height="340" rx="10" fill="url(#gate-metal)" opacity="0.3"/>
          
          {/* Base plate rivets */}
          {[...Array(8)].map((_, i) => {
            const isTop = i < 4;
            const x = 30 + (i % 4) * 55;
            const y = isTop ? 25 : 335;
            return (
              <g key={i}>
                <circle cx={x} cy={y} r="4" fill="#1a1a1a" stroke="#0a0a0a" strokeWidth="1"/>
                <circle cx={x} cy={y} r="2" fill="#0a0a0a"/>
              </g>
            );
          })}
          
          {/* Shift gate slots with deep inset */}
          <g filter="url(#deep-inset)">
            {/* Left column (1-2) */}
            <rect x="28" y="58" width="34" height="244" rx="17" fill="url(#gate-slot)" stroke="#050505" strokeWidth="2"/>
            <rect x="30" y="60" width="30" height="240" rx="15" fill="none" stroke="#1a1a1a" strokeWidth="0.5" opacity="0.5"/>
            
            {/* Center column (3-4) */}
            <rect x="98" y="58" width="34" height="244" rx="17" fill="url(#gate-slot)" stroke="#050505" strokeWidth="2"/>
            <rect x="100" y="60" width="30" height="240" rx="15" fill="none" stroke="#1a1a1a" strokeWidth="0.5" opacity="0.5"/>
            
            {/* Right column (5-R) */}
            <rect x="168" y="58" width="34" height="244" rx="17" fill="url(#gate-slot)" stroke="#050505" strokeWidth="2"/>
            <rect x="170" y="60" width="30" height="240" rx="15" fill="none" stroke="#1a1a1a" strokeWidth="0.5" opacity="0.5"/>
          </g>

          {/* Gear position labels with enhanced styling */}
          <g className="select-none" style={{ fontFamily: 'Arial, sans-serif', fontWeight: '900', fontSize: '18px' }}>
            <text x="45" y="48" textAnchor="middle" fill="#e0e0e0" stroke="#0a0a0a" strokeWidth="0.5">1</text>
            <text x="45" y="332" textAnchor="middle" fill="#e0e0e0" stroke="#0a0a0a" strokeWidth="0.5">2</text>
            <text x="115" y="48" textAnchor="middle" fill="#e0e0e0" stroke="#0a0a0a" strokeWidth="0.5">3</text>
            <text x="115" y="332" textAnchor="middle" fill="#e0e0e0" stroke="#0a0a0a" strokeWidth="0.5">4</text>
            <text x="185" y="48" textAnchor="middle" fill="#e0e0e0" stroke="#0a0a0a" strokeWidth="0.5">5</text>
            <text x="185" y="332" textAnchor="middle" fill="#dc2626" stroke="#0a0a0a" strokeWidth="0.5">R</text>
          </g>

          {/* Shift pattern diagram */}
          <g transform="translate(185, 12)" opacity="0.7">
            <rect width="45" height="45" rx="5" fill="#1a1a1a" stroke="#3a3a3a" strokeWidth="1.5"/>
            <text x="10" y="14" style={{ fontSize: '7px', fill: '#aaa', fontWeight: 'bold' }}>1  3  5</text>
            <line x1="9" y1="17" x2="9" y2="32" stroke="#888" strokeWidth="0.8"/>
            <line x1="23" y1="17" x2="23" y2="32" stroke="#888" strokeWidth="0.8"/>
            <line x1="36" y1="17" x2="36" y2="32" stroke="#888" strokeWidth="0.8"/>
            <text x="10" y="40" style={{ fontSize: '7px', fill: '#aaa', fontWeight: 'bold' }}>2  4  R</text>
          </g>

          {/* Shift boot */}
          <ellipse cx="120" cy="322" rx="38" ry="16" fill="url(#shift-boot)" opacity="0.9" filter="url(#metal-shadow)"/>
          <ellipse cx="120" cy="320" rx="34" ry="14" fill="#0a0a0a" opacity="0.95"/>
          <ellipse cx="120" cy="319" rx="30" ry="12" fill="none" stroke="#1a1a1a" strokeWidth="0.5"/>
          <ellipse cx="120" cy="320" rx="25" ry="10" fill="none" stroke="#2a2a2a" strokeWidth="0.5" strokeDasharray="2,2"/>

          {/* Shift knob */}
          <motion.g
            animate={{
              x: gearPositions[currentGear].x - 120,
              y: gearPositions[currentGear].y - 180,
            }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            {/* Shift shaft */}
            <rect x="115" y="155" width="10" height="50" rx="5" fill="url(#knob-gradient)" stroke="#1a1a1a" strokeWidth="0.5" filter="url(#metal-shadow)"/>
            <rect x="116" y="156" width="8" height="48" rx="4" fill="none" stroke="#5a5a5a" strokeWidth="0.5" opacity="0.5"/>
            
            {/* Knob ball */}
            <circle cx="120" cy="152" r="20" fill="url(#knob-leather)" stroke="#2a2a2a" strokeWidth="2" filter="url(#knob-glow)"/>
            <circle cx="120" cy="152" r="17" fill="none" stroke="#3a3a3a" strokeWidth="0.5"/>
            <circle cx="120" cy="152" r="14" fill="none" stroke="#2a2a2a" strokeWidth="0.5"/>
            
            {/* Leather stitching */}
            <path d="M 120 137 Q 127 152 120 167" fill="none" stroke="#3a3a3a" strokeWidth="0.8"/>
            <path d="M 120 137 Q 113 152 120 167" fill="none" stroke="#3a3a3a" strokeWidth="0.8"/>
            <path d="M 108 145 Q 120 150 132 145" fill="none" stroke="#3a3a3a" strokeWidth="0.6"/>
            <path d="M 108 159 Q 120 154 132 159" fill="none" stroke="#3a3a3a" strokeWidth="0.6"/>
            
            {/* Shine */}
            <ellipse cx="115" cy="145" rx="8" ry="6" fill="white" opacity="0.15"/>
            
            {/* Current gear indicator */}
            <text x="120" y="157" textAnchor="middle" style={{ fontSize: '16px', fontWeight: '900', fill: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
              {currentGear}
            </text>
          </motion.g>

          {/* Interactive gear zones with hold progress */}
          {Object.entries(gearPositions).filter(([gear]) => gear !== 'N' && gear !== 'R').map(([gear, pos]) => {
            const isPassed = sequence.includes(parseInt(gear));
            const isHolding = holdingGear === gear;
            
            return (
              <g key={gear}>
                <circle 
                  cx={pos.x} 
                  cy={pos.y} 
                  r="30" 
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseDown={() => handleGearPress(gear)}
                  onTouchStart={() => handleGearPress(gear)}
                />
                <circle 
                  cx={pos.x} 
                  cy={pos.y} 
                  r="6" 
                  fill={isPassed ? "#22c55e" : "#3a3a3a"}
                  stroke={isPassed ? "#16a34a" : "#2a2a2a"}
                  strokeWidth="1.5"
                  opacity={isPassed ? "1" : "0.4"}
                />
                {isHolding && (
                  <circle 
                    cx={pos.x} 
                    cy={pos.y} 
                    r="12" 
                    fill="none" 
                    stroke="#fbbf24" 
                    strokeWidth="3"
                    strokeDasharray="75.4"
                    strokeDashoffset={75.4 * (1 - holdProgress / 100)}
                    transform={`rotate(-90 ${pos.x} ${pos.y})`}
                  />
                )}
              </g>
            );
          })}

          {/* Mitsubishi Evo IV branding */}
          <text x="120" y="355" textAnchor="middle" style={{ fontSize: '9px', fontWeight: '900', fill: '#888', letterSpacing: '2px' }}>
            MITSUBISHI EVOLUTION IV
          </text>
        </svg>
      </div>

      {/* Control panel */}
      <div className="text-center space-y-4">
        {/* Progress indicator */}
        <div className="flex justify-center space-x-2">
          {[...Array(targetSequence.length)].map((_, index) => (
            <div
              key={`progress-${index}`}
              className={`w-14 h-14 rounded-full flex items-center justify-center border-2 ${
                index < sequence.length 
                  ? 'bg-gradient-to-br from-green-600 via-green-700 to-green-900 border-green-400' 
                  : 'border-slate-700 border-dashed bg-slate-900/50'
              }`}
              style={{ boxShadow: index < sequence.length ? '0 4px 12px rgba(34, 197, 94, 0.4)' : 'none' }}
            >
              {index < sequence.length && (
                <span className="text-white font-bold text-2xl">{sequence[index]}</span>
              )}
              {index >= sequence.length && (
                <span className="text-slate-600 text-lg">{index + 1}</span>
              )}
            </div>
          ))}
        </div>

        {/* Instructions */}
        <div className="bg-slate-900/80 border border-slate-700 rounded-lg p-4 max-w-md">
          <p className="text-amber-400 font-bold text-sm mb-2">
            🎯 Press and Hold Each Gear
          </p>
          <p className="text-slate-400 text-xs">
            Touch and hold each gear position until the circle fills, then release
          </p>
        </div>

        {/* Reset button */}
        <Button
          onClick={reset}
          variant="outline"
          className="border-slate-600 text-slate-300 hover:bg-slate-800"
        >
          Reset to Neutral
        </Button>
      </div>
    </div>
  );
};

export default GearShifterLock;
