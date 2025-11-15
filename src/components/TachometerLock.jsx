import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

const EvoPedal = ({ children, type, size = 'normal', ...props }) => {
  const isBrake = type === 'brake';
  const isGas = type === 'gas';
  const isClutch = type === 'clutch';
  const isSmall = size === 'small';
  
  const accentColor = isBrake ? '#dc2626' : isGas ? '#22c55e' : '#f59e0b';
  const glowColor = isBrake ? 'rgba(220, 38, 38, 0.5)' : isGas ? 'rgba(34, 197, 94, 0.5)' : 'rgba(245, 158, 11, 0.5)';
  
  const width = isSmall ? 'w-24' : 'w-32';
  const height = isSmall ? 'h-40' : 'h-48';
  const svgHeight = isSmall ? 'h-32' : 'h-36';
  
  return (
    <motion.button
      {...props}
      whileTap={{ scale: 0.94, y: isSmall ? 4 : 6 }}
      whileHover={{ scale: 1.04 }}
      className={`relative ${width} ${height} group touch-manipulation`}
      style={{ perspective: '1200px' }}
    >
      {/* Mounting bracket assembly */}
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 ${isSmall ? 'w-16 h-5' : 'w-20 h-6'} bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 rounded-t-lg border-x-2 border-t-2 border-slate-600 shadow-xl`}>
        {/* Mounting bolts */}
        <div className="absolute top-0.5 left-1/2 -translate-x-1/2 flex gap-2">
          <div className={`${isSmall ? 'w-1 h-1' : 'w-1.5 h-1.5'} rounded-full bg-slate-950 border border-slate-500 shadow-inner`}></div>
          <div className={`${isSmall ? 'w-1 h-1' : 'w-1.5 h-1.5'} rounded-full bg-slate-950 border border-slate-500 shadow-inner`}></div>
        </div>
        {/* Bracket rivets */}
        <div className="absolute inset-x-1 top-2 flex justify-between">
          <div className="w-1 h-1 rounded-full bg-slate-950 border border-slate-600"></div>
          <div className="w-1 h-1 rounded-full bg-slate-950 border border-slate-600"></div>
        </div>
      </div>

      {/* Main pedal body - brushed aluminum with enhanced realism */}
      <div className={`absolute ${isSmall ? 'top-5' : 'top-6'} left-1/2 -translate-x-1/2 ${isSmall ? 'w-22' : 'w-28'} ${svgHeight} rounded-xl overflow-hidden shadow-2xl border-2 border-slate-500`}>
        {/* Base metal layer */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-300 via-slate-400 to-slate-500"></div>
        
        {/* Brushed metal texture */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(90deg, 
                transparent 0%, 
                rgba(255,255,255,0.15) 25%, 
                transparent 50%, 
                rgba(0,0,0,0.1) 75%, 
                transparent 100%
              )
            `,
            backgroundSize: '3px 100%'
          }}
        ></div>
        
        {/* Anodized aluminum shine */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent via-40% to-black/40"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        
        {/* Beveled edges */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-b from-white/40 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-t from-black/40 to-transparent"></div>
        <div className="absolute top-0 bottom-0 left-0 w-2 bg-gradient-to-r from-black/20 to-transparent"></div>
        <div className="absolute top-0 bottom-0 right-0 w-2 bg-gradient-to-l from-black/20 to-transparent"></div>
        
        {/* Rubber grip sections with enhanced depth */}
        <div className={`absolute ${isSmall ? 'top-4 left-2 right-2' : 'top-8 left-3 right-3'}`}>
          {[...Array(isSmall ? 3 : 4)].map((_, i) => (
            <div key={i} className="mb-2">
              {/* Grip mounting recess */}
              <div className="absolute -inset-0.5 bg-gradient-to-b from-slate-700 to-slate-800 rounded-md opacity-30 blur-sm"></div>
              
              {/* Rubber grip bar */}
              <div className={`relative ${isSmall ? 'h-3' : 'h-4'} rounded-md overflow-hidden bg-gradient-to-b from-slate-900 via-black to-slate-950 border border-slate-800 shadow-lg`}
                style={{
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.8), inset 0 -1px 2px rgba(255,255,255,0.1)'
                }}
              >
                {/* Rubber texture dimples */}
                <div className="flex h-full items-center justify-around px-1">
                  {[...Array(isSmall ? 6 : 8)].map((_, j) => (
                    <div 
                      key={j} 
                      className={`${isSmall ? 'w-0.5 h-1.5' : 'w-0.5 h-2'} bg-slate-950 rounded-full`}
                      style={{ boxShadow: '0 1px 1px rgba(0,0,0,0.5)' }}
                    ></div>
                  ))}
                </div>
                
                {/* Grip surface highlight */}
                <div className="absolute top-0 left-2 right-2 h-px bg-slate-700/50"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Accent LED indicator strip with realistic housing */}
        <div className={`absolute ${isSmall ? 'bottom-2' : 'bottom-4'} left-3 right-3`}>
          {/* LED housing recess */}
          <div className="absolute -inset-1 bg-gradient-to-b from-slate-800 to-slate-900 rounded-lg opacity-60 blur-sm"></div>
          
          {/* LED strip */}
          <div 
            className="relative h-1.5 rounded-full shadow-xl transition-all duration-300 border border-slate-900"
            style={{ 
              backgroundColor: accentColor,
              boxShadow: `
                0 0 16px ${glowColor},
                0 0 8px ${glowColor},
                inset 0 1px 2px rgba(255,255,255,0.4),
                inset 0 -1px 1px rgba(0,0,0,0.4)
              `
            }}
          >
            {/* LED light sweep animation */}
            <motion.div 
              className="h-full w-1/2 rounded-full bg-white/60"
              animate={{ 
                x: ['0%', '100%', '0%'],
                opacity: [0.4, 0.8, 0.4]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            ></motion.div>
          </div>
        </div>

        {/* Wear marks and surface detail */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-4 h-px bg-white/40 rotate-12"></div>
          <div className="absolute top-1/2 right-1/4 w-3 h-px bg-black/30 -rotate-6"></div>
        </div>
      </div>

      {/* Label badge with premium finish */}
      <div className={`absolute ${isSmall ? 'bottom-1' : 'bottom-2'} left-1/2 -translate-x-1/2 px-3 py-1 rounded-lg bg-gradient-to-br from-slate-800 via-slate-900 to-black border border-slate-700 shadow-2xl`}>
        <span 
          className={`font-bold ${isSmall ? 'text-[10px]' : 'text-xs'} tracking-widest group-hover:text-white transition-all duration-200`}
          style={{ 
            color: accentColor,
            textShadow: `0 0 10px ${glowColor}, 0 1px 2px rgba(0,0,0,0.8)`
          }}
        >
          {children}
        </span>
      </div>

      {/* Enhanced floor shadow */}
      <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 ${isSmall ? 'w-20 h-2' : 'w-24 h-3'} bg-black rounded-full blur-lg opacity-50`}></div>

      {/* Side mounting bolts */}
      <div className={`absolute ${isSmall ? 'top-7 left-2' : 'top-9 left-4'} w-1.5 h-1.5 rounded-full bg-slate-950 border border-slate-500 shadow-lg`}
        style={{ boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.8)' }}
      ></div>
      <div className={`absolute ${isSmall ? 'top-7 right-2' : 'top-9 right-4'} w-1.5 h-1.5 rounded-full bg-slate-950 border border-slate-500 shadow-lg`}
        style={{ boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.8)' }}
      ></div>
    </motion.button>
  );
};

const TachometerLock = ({ onSuccess }) => {
  const [rpm, setRpm] = useState(0);
  const [checkpointIndex, setCheckpointIndex] = useState(0);
  const [isGasPressed, setIsGasPressed] = useState(false);
  const [isBrakePressed, setIsBrakePressed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [audioContext, setAudioContext] = useState(null);
  const [engineOscillator, setEngineOscillator] = useState(null);
  const [gainNode, setGainNode] = useState(null);
  
  const [targetRpms, setTargetRpms] = useState([2500, 5000, 7500]);
  const [tolerance, setTolerance] = useState(200);
  const [rpmSpeed, setRpmSpeed] = useState(120);

  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('lock_configurations')
        .select('config')
        .eq('lock_type', 'tachometer')
        .single();

      if (data?.config) {
        setTargetRpms([
          data.config.checkpoint1 || 2500,
          data.config.checkpoint2 || 5000,
          data.config.checkpoint3 || 7500
        ]);
        setTolerance(data.config.tolerance || 200);
        setRpmSpeed(data.config.rpm_speed || 120);
      }
    } catch (error) {
      console.error('Error loading tachometer configuration:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initAudio = () => {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.value = 30;
      gain.gain.value = 0;
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      
      setAudioContext(ctx);
      setEngineOscillator(osc);
      setGainNode(gain);
    };

    const handleUserInteraction = () => {
      if (!audioContext) {
        initAudio();
      }
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };

    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('touchstart', handleUserInteraction);

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
      if (engineOscillator) {
        engineOscillator.stop();
      }
      if (audioContext) {
        audioContext.close();
      }
    };
  }, []);

  useEffect(() => {
    let interval;
    
    if (isGasPressed && !isBrakePressed && rpm < 9000) {
      interval = setInterval(() => {
        setRpm(prev => Math.min(prev + rpmSpeed, 9000));
      }, 50);
    } else if (isBrakePressed && !isGasPressed && rpm > 0) {
      interval = setInterval(() => {
        setRpm(prev => Math.max(prev - (rpmSpeed * 1.25), 0));
      }, 50);
    } else if (!isGasPressed && !isBrakePressed && rpm > 0) {
      interval = setInterval(() => {
        setRpm(prev => Math.max(prev - (rpmSpeed * 0.5), 0));
      }, 50);
    }
    
    return () => clearInterval(interval);
  }, [isGasPressed, isBrakePressed, rpm, rpmSpeed]);

  useEffect(() => {
    if (!engineOscillator || !gainNode) return;

    const idleFreq = 30;
    const maxFreq = 400;
    const targetFreq = idleFreq + (rpm / 9000) * (maxFreq - idleFreq);
    
    const minVolume = 0;
    const maxVolume = 0.15;
    const targetVolume = rpm > 0 ? minVolume + (rpm / 9000) * (maxVolume - minVolume) : 0;

    engineOscillator.frequency.setTargetAtTime(targetFreq, audioContext.currentTime, 0.1);
    gainNode.gain.setTargetAtTime(targetVolume, audioContext.currentTime, 0.1);
  }, [rpm, engineOscillator, gainNode, audioContext]);

  const checkRpm = () => {
    const currentTarget = targetRpms[checkpointIndex];
    
    if (Math.abs(rpm - currentTarget) <= tolerance) {
      if (checkpointIndex === targetRpms.length - 1) {
        if (gainNode) {
          gainNode.gain.setTargetAtTime(0, audioContext.currentTime, 0.3);
        }
        toast({
          title: `Checkpoint ${checkpointIndex + 1}/3 ✓`,
          description: "All checkpoints cleared! Unlocking..."
        });
        setTimeout(onSuccess, 1000);
      } else {
        toast({
          title: `Checkpoint ${checkpointIndex + 1}/3 ✓`,
          description: `Perfect! Next target: ${targetRpms[checkpointIndex + 1]} RPM`
        });
        setCheckpointIndex(checkpointIndex + 1);
      }
    } else {
      toast({
        title: `Checkpoint ${checkpointIndex + 1}/3 Failed`,
        description: `Target: ${currentTarget} RPM (±${tolerance}). You hit: ${rpm} RPM`,
        variant: "destructive"
      });
    }
  };

  const needleRotation = (rpm / 9000) * 270 - 135;
  const isInRedzone = rpm >= 7000;
  const currentTarget = targetRpms[checkpointIndex];

  if (loading) {
    return <div className="text-center py-12 text-slate-400">Loading configuration...</div>;
  }

  return (
    <div className="space-y-10 flex flex-col items-center">
      {/* Enhanced tachometer */}
      <div className="relative w-96 h-96">
        <svg viewBox="0 0 240 240" className="w-full h-full drop-shadow-2xl">
          <defs>
            <filter id="needle-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <radialGradient id="evo-bezel" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0.85" stopColor="#1a1a1a" />
              <stop offset="0.90" stopColor="#505050" />
              <stop offset="0.94" stopColor="#404040" />
              <stop offset="0.97" stopColor="#2a2a2a" />
              <stop offset="1" stopColor="#0a0a0a" />
            </radialGradient>
            <radialGradient id="evo-face" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="#ffffff" />
              <stop offset="0.80" stopColor="#f8f8f8" />
              <stop offset="0.92" stopColor="#f0f0f0" />
              <stop offset="1" stopColor="#e5e5e5" />
            </radialGradient>
            <linearGradient id="redzone-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#dc2626" />
              <stop offset="50%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#991b1b" />
            </linearGradient>
            <radialGradient id="glass-effect" cx="0.3" cy="0.3" r="0.8">
              <stop offset="0%" stopColor="rgba(255,255,255,0.2)" />
              <stop offset="70%" stopColor="rgba(255,255,255,0.05)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0.1)" />
            </radialGradient>
          </defs>
          
          {/* Bezel with enhanced metallic effect */}
          <circle cx="120" cy="120" r="115" fill="url(#evo-bezel)" />
          <circle cx="120" cy="120" r="113" fill="none" stroke="#555" strokeWidth="0.5" opacity="0.6" />
          <circle cx="120" cy="120" r="105" fill="#0a0a0a" />
          <circle cx="120" cy="120" r="103" fill="none" stroke="#1a1a1a" strokeWidth="0.5" />
          
          {/* Gauge face */}
          <circle cx="120" cy="120" r="100" fill="url(#evo-face)" stroke="#c8c8c8" strokeWidth="0.8" />
          
          {/* Redzone arc */}
          <path
            d="M 120 120 L 143.3 206.9 A 90 90 0 0 1 56.4 183.6 L 120 120 Z"
            fill="url(#redzone-gradient)"
            opacity="0.75"
          />

          {/* Tick marks */}
          {Array.from({ length: 91 }).map((_, i) => {
            const angle = -135 + i * 3;
            const isMajor = i % 10 === 0;
            const isMid = i % 5 === 0 && !isMajor;
            const isRedzone = i >= 70;
            const r1 = 100;
            const r2 = isMajor ? 80 : isMid ? 87 : 92;
            const x1 = 120 + r1 * Math.cos(angle * Math.PI / 180);
            const y1 = 120 + r1 * Math.sin(angle * Math.PI / 180);
            const x2 = 120 + r2 * Math.cos(angle * Math.PI / 180);
            const y2 = 120 + r2 * Math.sin(angle * Math.PI / 180);
            const strokeColor = isRedzone ? "#dc2626" : "#0a0a0a";
            const strokeWidth = isMajor ? "3" : isMid ? "1.8" : "0.9";
            return (
              <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={strokeColor} strokeWidth={strokeWidth} opacity={isMajor ? "1" : isMid ? "0.85" : "0.6"} strokeLinecap="round" />
            );
          })}

          {/* Numbers */}
          {Array.from({ length: 10 }).map((_, i) => {
            const angle = -135 + i * 30;
            const textX = 120 + 66 * Math.cos(angle * Math.PI / 180);
            const textY = 120 + 66 * Math.sin(angle * Math.PI / 180);
            const isRedzone = i >= 7;
            return (
              <text 
                key={i} 
                x={textX} 
                y={textY + 6} 
                textAnchor="middle" 
                fill={isRedzone ? "#dc2626" : "#0a0a0a"} 
                fontSize="19" 
                fontWeight="900"
                fontFamily="Arial, sans-serif"
                style={{ textShadow: isRedzone ? '0 0 3px rgba(220, 38, 38, 0.3)' : 'none' }}
              >
                {i}
              </text>
            );
          })}
          
          {/* Labels */}
          <text x="120" y="98" textAnchor="middle" fill="#222" fontSize="11" fontWeight="900" letterSpacing="2.5">RPM</text>
          <text x="120" y="109" textAnchor="middle" fill="#555" fontSize="7" fontWeight="700" letterSpacing="1.2">x1000</text>
          
          <text x="120" y="152" textAnchor="middle" fill="#1a1a1a" fontSize="9" fontWeight="800" letterSpacing="0.5">MITSUBISHI</text>
          <text x="120" y="162" textAnchor="middle" fill="#dc2626" fontSize="8" fontWeight="900" letterSpacing="2">EVOLUTION IV</text>

          {/* Digital RPM readout */}
          <rect x="96" y="170" width="48" height="20" fill="#0a0a0a" rx="3" stroke="#2a2a2a" strokeWidth="1.5" 
            style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }} />
          <text x="120" y="185" textAnchor="middle" fill={isInRedzone ? "#dc2626" : "#22c55e"} fontSize="13" fontWeight="900" fontFamily="monospace"
            style={{ textShadow: `0 0 6px ${isInRedzone ? 'rgba(220, 38, 38, 0.6)' : 'rgba(34, 197, 94, 0.6)'}` }}>
            {rpm.toFixed(0)}
          </text>

          {/* Needle with enhanced shadow */}
          <motion.g
            style={{ transformOrigin: '120px 120px' }}
            animate={{ rotate: needleRotation }}
            transition={{ type: "spring", stiffness: 300, damping: 30, mass: 0.8 }}
          >
            {/* Wider shadow needle - points to tick marks at radius 80 */}
            <line
              x1="120"
              y1="120"
              x2="120"
              y2="40"
              stroke={isInRedzone ? "#dc2626" : "#1a1a1a"}
              strokeWidth="3.5"
              strokeLinecap="round"
              filter="url(#needle-glow)"
              opacity="0.9"
            />
            {/* Precise center needle - exactly 80 units from center to align with major tick marks */}
            <line
              x1="120"
              y1="120"
              x2="120"
              y2="40"
              stroke={isInRedzone ? "#ef4444" : "#2a2a2a"}
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </motion.g>
          
          {/* Center hub */}
          <circle cx="120" cy="120" r="14" fill="#0a0a0a" stroke="#555" strokeWidth="1.5" />
          <circle cx="120" cy="120" r="11" fill="url(#evo-bezel)" />
          <circle cx="120" cy="120" r="7" fill="#1a1a1a" stroke="#333" strokeWidth="0.5" />
          
          {/* Glass reflection effect */}
          <circle cx="120" cy="120" r="100" fill="url(#glass-effect)" pointerEvents="none" />
        </svg>
      </div>

      {/* 3-Pedal System */}
      <div className="flex justify-center items-end space-x-6">
        {/* Clutch Pedal (Left - Smaller) */}
        <div className="flex flex-col items-center space-y-2">
          <EvoPedal
            type="clutch"
            size="small"
            onClick={checkRpm}
          >
            CLUTCH
          </EvoPedal>
          <span className="text-sm text-amber-400 font-semibold">Press to Check</span>
        </div>

        {/* Gas Pedal (Center) */}
        <div className="flex flex-col items-center space-y-2">
          <EvoPedal
            type="gas"
            size="normal"
            onMouseDown={() => setIsGasPressed(true)}
            onMouseUp={() => setIsGasPressed(false)}
            onMouseLeave={() => setIsGasPressed(false)}
            onTouchStart={() => setIsGasPressed(true)}
            onTouchEnd={() => setIsGasPressed(false)}
          >
            GAS
          </EvoPedal>
          <span className="text-sm text-green-400 font-semibold">Hold to Rev</span>
        </div>

        {/* Brake Pedal (Right) */}
        <div className="flex flex-col items-center space-y-2">
          <EvoPedal
            type="brake"
            size="normal"
            onMouseDown={() => setIsBrakePressed(true)}
            onMouseUp={() => setIsBrakePressed(false)}
            onMouseLeave={() => setIsBrakePressed(false)}
            onTouchStart={() => setIsBrakePressed(true)}
            onTouchEnd={() => setIsBrakePressed(false)}
          >
            BRAKE
          </EvoPedal>
          <span className="text-sm text-red-400 font-semibold">Hold to Slow</span>
        </div>
      </div>
    </div>
  );
};

export default TachometerLock;
