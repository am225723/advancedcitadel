import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from '@/components/ui/use-toast';

const EvoPedal = ({ children, type, ...props }) => {
  const isBrake = type === 'brake';
  const isGas = type === 'gas';
  const isCheck = type === 'check';
  
  const accentColor = isBrake ? '#dc2626' : isGas ? '#22c55e' : '#3b82f6';
  const glowColor = isBrake ? 'rgba(220, 38, 38, 0.4)' : isGas ? 'rgba(34, 197, 94, 0.4)' : 'rgba(59, 130, 246, 0.4)';
  
  return (
    <motion.button
      {...props}
      whileTap={{ scale: 0.95, y: 6 }}
      whileHover={{ scale: 1.03 }}
      className="relative w-32 h-48 group touch-manipulation"
      style={{ perspective: '1000px' }}
    >
      {/* Mounting bracket (top) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-6 bg-gradient-to-b from-slate-700 to-slate-800 rounded-t-lg border-x-2 border-t-2 border-slate-600 shadow-lg">
        <div className="absolute top-1 left-1/2 -translate-x-1/2 flex gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-slate-900 border border-slate-600"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-slate-900 border border-slate-600"></div>
        </div>
      </div>

      {/* Main pedal body - brushed aluminum */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 w-28 h-36 rounded-lg overflow-hidden shadow-2xl border-2 border-slate-600">
        {/* Brushed metal gradient */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-slate-400 via-slate-500 to-slate-600"
          style={{
            backgroundImage: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
            backgroundSize: '4px 100%'
          }}
        ></div>
        
        {/* Metal shine effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-black/30"></div>
        
        {/* Angled edge highlights */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-black/40 to-transparent"></div>
        
        {/* Rubber grip sections */}
        <div className="absolute top-8 left-3 right-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="mb-2">
              {/* Rubber grip bar */}
              <div className="h-4 rounded-sm overflow-hidden bg-gradient-to-b from-slate-800 to-black border border-slate-700/50 shadow-inner">
                {/* Rubber texture pattern */}
                <div className="flex h-full items-center justify-around px-1">
                  {[...Array(8)].map((_, j) => (
                    <div key={j} className="w-0.5 h-2 bg-slate-900 rounded-full"></div>
                  ))}
                </div>
              </div>
              {/* Gap between grips */}
              <div className="h-2"></div>
            </div>
          ))}
        </div>

        {/* Accent LED indicator strip */}
        <div 
          className="absolute bottom-4 left-4 right-4 h-1 rounded-full shadow-lg transition-all duration-300"
          style={{ 
            backgroundColor: accentColor,
            boxShadow: `0 0 12px ${glowColor}, inset 0 1px 2px rgba(255,255,255,0.3)`
          }}
        >
          <div 
            className="h-full w-1/3 rounded-full bg-white/50 animate-pulse"
            style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}
          ></div>
        </div>
      </div>

      {/* Label badge */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-md bg-gradient-to-b from-slate-800 to-slate-950 border border-slate-700 shadow-lg">
        <span 
          className="font-bold text-xs tracking-widest group-hover:text-white transition-all duration-200"
          style={{ 
            color: accentColor,
            textShadow: `0 0 8px ${glowColor}`
          }}
        >
          {children}
        </span>
      </div>

      {/* Floor shadow */}
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-24 h-3 bg-black rounded-full blur-md opacity-40"></div>

      {/* Mounting bolt details */}
      <div className="absolute top-2 left-8 w-2 h-2 rounded-full bg-slate-900 border border-slate-600 shadow-inner"></div>
      <div className="absolute top-2 right-8 w-2 h-2 rounded-full bg-slate-900 border border-slate-600 shadow-inner"></div>
    </motion.button>
  );
};

const TachometerLock = ({ onSuccess }) => {
  const [rpm, setRpm] = useState(0);
  const [targetRpm] = useState(5500);
  const [isPressed, setIsPressed] = useState(false);

  useEffect(() => {
    let interval;
    if (isPressed && rpm < 9000) {
      interval = setInterval(() => {
        setRpm(prev => Math.min(prev + 100, 9000));
      }, 50);
    } else if (!isPressed && rpm > 0) {
      interval = setInterval(() => {
        setRpm(prev => Math.max(prev - 80, 0));
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isPressed, rpm]);

  const checkRpm = () => {
    const tolerance = 300;
    if (Math.abs(rpm - targetRpm) <= tolerance) {
      toast({
        title: "Success! 🎉",
        description: "Perfect rev! Moving to next security layer..."
      });
      setTimeout(onSuccess, 1000);
    } else {
      toast({
        title: "Try Again",
        description: `Target: ${targetRpm} RPM (±${tolerance})`,
        variant: "destructive"
      });
    }
  };

  const needleRotation = (rpm / 9000) * 270 - 135;
  const isInRedzone = rpm >= 7000;

  return (
    <div className="space-y-10 flex flex-col items-center">
      <div className="relative w-96 h-96">
        <svg viewBox="0 0 240 240" className="w-full h-full drop-shadow-2xl">
          <defs>
            <filter id="needle-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <radialGradient id="evo-bezel" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0.85" stopColor="#1a1a1a" />
              <stop offset="0.92" stopColor="#404040" />
              <stop offset="0.96" stopColor="#2a2a2a" />
              <stop offset="1" stopColor="#0a0a0a" />
            </radialGradient>
            <radialGradient id="evo-face" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="#ffffff" />
              <stop offset="0.85" stopColor="#f5f5f5" />
              <stop offset="1" stopColor="#e8e8e8" />
            </radialGradient>
            <linearGradient id="redzone-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#dc2626" />
              <stop offset="100%" stopColor="#991b1b" />
            </linearGradient>
          </defs>
          
          <circle cx="120" cy="120" r="115" fill="url(#evo-bezel)" />
          <circle cx="120" cy="120" r="105" fill="#0a0a0a" />
          <circle cx="120" cy="120" r="100" fill="url(#evo-face)" stroke="#d4d4d4" strokeWidth="0.5" />
          
          <path
            d="M 120 120 L 143.3 206.9 A 90 90 0 0 1 56.4 183.6 L 120 120 Z"
            fill="url(#redzone-gradient)"
            opacity="0.7"
          />

          {Array.from({ length: 91 }).map((_, i) => {
            const angle = -135 + i * 3;
            const isMajor = i % 10 === 0;
            const isMid = i % 5 === 0 && !isMajor;
            const isRedzone = i >= 70;
            const r1 = 100;
            const r2 = isMajor ? 82 : isMid ? 88 : 92;
            const x1 = 120 + r1 * Math.cos(angle * Math.PI / 180);
            const y1 = 120 + r1 * Math.sin(angle * Math.PI / 180);
            const x2 = 120 + r2 * Math.cos(angle * Math.PI / 180);
            const y2 = 120 + r2 * Math.sin(angle * Math.PI / 180);
            const strokeColor = isRedzone ? "#dc2626" : "#1a1a1a";
            const strokeWidth = isMajor ? "2.5" : isMid ? "1.5" : "0.8";
            return (
              <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={strokeColor} strokeWidth={strokeWidth} opacity={isMajor ? "1" : isMid ? "0.8" : "0.5"} />
            );
          })}

          {Array.from({ length: 10 }).map((_, i) => {
            const angle = -135 + i * 30;
            const textX = 120 + 68 * Math.cos(angle * Math.PI / 180);
            const textY = 120 + 68 * Math.sin(angle * Math.PI / 180);
            const isRedzone = i >= 7;
            return (
              <text 
                key={i} 
                x={textX} 
                y={textY + 6} 
                textAnchor="middle" 
                fill={isRedzone ? "#dc2626" : "#0a0a0a"} 
                fontSize="18" 
                fontWeight="900"
                fontFamily="Arial, sans-serif"
              >
                {i}
              </text>
            );
          })}
          
          <text x="120" y="100" textAnchor="middle" fill="#333" fontSize="10" fontWeight="900" letterSpacing="2">RPM</text>
          <text x="120" y="110" textAnchor="middle" fill="#666" fontSize="7" fontWeight="600" letterSpacing="1">x1000</text>
          
          <text x="120" y="155" textAnchor="middle" fill="#333" fontSize="8" fontWeight="700">MITSUBISHI</text>
          <text x="120" y="164" textAnchor="middle" fill="#dc2626" fontSize="7" fontWeight="900" letterSpacing="1.5">EVOLUTION IV</text>

          <rect x="100" y="172" width="40" height="16" fill="#0a0a0a" rx="2" stroke="#333" strokeWidth="1" />
          <text x="120" y="183" textAnchor="middle" fill={isInRedzone ? "#dc2626" : "#22c55e"} fontSize="11" fontWeight="900" fontFamily="monospace">
            {rpm.toFixed(0)}
          </text>

          <motion.line
            x1="120"
            y1="120"
            x2="120"
            y2="30"
            stroke={isInRedzone ? "#dc2626" : "#0a0a0a"}
            strokeWidth="3"
            strokeLinecap="round"
            style={{ transformOrigin: '120px 120px' }}
            animate={{ rotate: needleRotation }}
            transition={{ type: "spring", stiffness: 180, damping: 22 }}
            filter="url(#needle-glow)"
          />
          <circle cx="120" cy="120" r="12" fill="#0a0a0a" stroke="#666" strokeWidth="1" />
          <circle cx="120" cy="120" r="6" fill="#1a1a1a" />
        </svg>
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-center">
          <p className="text-amber-400 font-bold text-xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            TARGET: <span className="text-green-400">{targetRpm}</span> RPM
          </p>
        </div>
      </div>

      <div className="flex justify-center space-x-12">
        <div className="flex flex-col items-center space-y-3">
          <EvoPedal
            type="gas"
            onMouseDown={() => setIsPressed(true)}
            onMouseUp={() => setIsPressed(false)}
            onTouchStart={() => setIsPressed(true)}
            onTouchEnd={() => setIsPressed(false)}
          >
            GAS
          </EvoPedal>
          <span className="text-sm text-slate-400 font-semibold">Hold to Rev</span>
        </div>
        <div className="flex flex-col items-center space-y-3">
          <EvoPedal type="check" onClick={checkRpm}>
            CHECK
          </EvoPedal>
          <span className="text-sm text-slate-400 font-semibold">Press to Verify</span>
        </div>
      </div>
    </div>
  );
};

export default TachometerLock;