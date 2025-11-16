import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

// EvoPedal component (Unchanged)
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
      aria-label={`${children} pedal`}
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

        {/* Accent LED indicator strip with realistic-housing */}
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

// --- START Configurator Component ---
const TachometerConfigurator = ({ config, setConfig }) => {
  // Generic handler for top-level numeric properties
  const handleConfigChange = (e) => {
    const { name, value } = e.target;
    setConfig(prev => ({ ...prev, [name]: Number(value) }));
  };

  // Handler for nested LABEL_COORDS
  const handleCoordChange = (e) => {
    const { name, value } = e.target;
    const axis = name.slice(-1).toLowerCase(); // 'x' or 'y'
    setConfig(prev => ({
      ...prev,
      LABEL_COORDS: {
        ...prev.LABEL_COORDS,
        [axis]: Number(value)
      }
    }));
  };

  return (
    <div className="relative w-full max-w-2xl p-4 bg-slate-800/80 backdrop-blur-sm text-white rounded-lg shadow-2xl space-y-3 border border-slate-700" style={{maxHeight: '90vh', overflowY: 'auto'}}>
      <h3 className="font-bold text-lg text-center">Tach Configurator</h3>

      {/* Sliders */}
      <div className="grid grid-cols-3 gap-x-6 gap-y-3">
        {/* Left Column */}
        <div className="space-y-3">
          <div>
            <label htmlFor="TACH_START_ANGLE" className="flex justify-between text-sm font-medium">
              <span>Start Angle (0)</span>
              <span className="text-amber-300">{config.TACH_START_ANGLE}°</span>
            </label>
            <input
              type="range" id="TACH_START_ANGLE" name="TACH_START_ANGLE"
              min="-360" max="360" value={config.TACH_START_ANGLE}
              onChange={handleConfigChange}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div>
            <label htmlFor="TACH_END_ANGLE" className="flex justify-between text-sm font-medium">
              <span>End Angle (9)</span>
              <span className="text-amber-300">{config.TACH_END_ANGLE}°</span>
            </label>
            <input
              type="range" id="TACH_END_ANGLE" name="TACH_END_ANGLE"
              min="-360" max="360" value={config.TACH_END_ANGLE}
              onChange={handleConfigChange}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div>
            <label htmlFor="NEEDLE_REST_ANGLE" className="flex justify-between text-sm font-medium">
              <span>Rest Angle (Needle)</span>
              <span className="text-amber-300">{config.NEEDLE_REST_ANGLE}°</span>
            </label>
            <input
              type="range" id="NEEDLE_REST_ANGLE" name="NEEDLE_REST_ANGLE"
              min="-360" max="360" value={config.NEEDLE_REST_ANGLE}
              onChange={handleConfigChange}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        {/* Middle Column */}
        <div className="space-y-3">
          <div>
            <label htmlFor="NUMBER_FONT_SIZE" className="flex justify-between text-sm font-medium">
              <span>Number Font Size</span>
              <span className="text-amber-300">{config.NUMBER_FONT_SIZE}px</span>
            </label>
            <input
              type="range" id="NUMBER_FONT_SIZE" name="NUMBER_FONT_SIZE"
              min="8" max="30" value={config.NUMBER_FONT_SIZE}
              onChange={handleConfigChange}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div>
            <label htmlFor="NUMBER_RADIUS" className="flex justify-between text-sm font-medium">
              <span>Number Radius</span>
              <span className="text-amber-300">{config.NUMBER_RADIUS}</span>
            </label>
            <input
              type="range" id="NUMBER_RADIUS" name="NUMBER_RADIUS"
              min="40" max="90" value={config.NUMBER_RADIUS}
              onChange={handleConfigChange}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div>
            <label htmlFor="NEEDLE_LENGTH" className="flex justify-between text-sm font-medium">
              <span>Needle Length</span>
              <span className="text-amber-300">{config.NEEDLE_LENGTH}</span>
            </label>
            <input
              type="range" id="NEEDLE_LENGTH" name="NEEDLE_LENGTH"
              min="50" max="110" value={config.NEEDLE_LENGTH}
              onChange={handleConfigChange}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-3">
          <div>
            <label htmlFor="NEEDLE_PIVOT_X" className="flex justify-between text-sm font-medium">
              <span>Needle Pivot X</span>
              <span className="text-amber-300">{config.NEEDLE_PIVOT_X}</span>
            </label>
            <input
              type="range" id="NEEDLE_PIVOT_X" name="NEEDLE_PIVOT_X"
              min="100" max="140" value={config.NEEDLE_PIVOT_X}
              onChange={handleConfigChange}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          <div>
            <label htmlFor="NEEDLE_PIVOT_Y" className="flex justify-between text-sm font-medium">
              <span>Needle Pivot Y</span>
              <span className="text-amber-300">{config.NEEDLE_PIVOT_Y}</span>
            </label>
            <input
              type="range" id="NEEDLE_PIVOT_Y" name="NEEDLE_PIVOT_Y"
              min="100" max="140" value={config.NEEDLE_PIVOT_Y}
              onChange={handleConfigChange}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      </div>

      <hr className="border-slate-600" />

      {/* Bottom Row */}
      <div className="grid grid-cols-3 gap-x-6">
        <div>
          <label htmlFor="MAJOR_TICK_LENGTH" className="flex justify-between text-sm font-medium">
            <span>Major Tick</span>
            <span className="text-amber-300">{config.MAJOR_TICK_LENGTH}</span>
          </label>
          <input
            type="range" id="MAJOR_TICK_LENGTH" name="MAJOR_TICK_LENGTH"
            min="5" max="30" value={config.MAJOR_TICK_LENGTH}
            onChange={handleConfigChange}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>
        <div>
          <label htmlFor="QUARTER_TICK_LENGTH" className="flex justify-between text-sm font-medium">
            <span>Quarter Tick</span>
            <span className="text-amber-300">{config.QUARTER_TICK_LENGTH}</span>
          </label>
          <input
            type="range" id="QUARTER_TICK_LENGTH" name="QUARTER_TICK_LENGTH"
            min="2" max="25" value={config.QUARTER_TICK_LENGTH}
            onChange={handleConfigChange}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>
        <div>
          <label htmlFor="FINE_TICK_LENGTH" className="flex justify-between text-sm font-medium">
            <span>Fine Tick</span>
            <span className="text-amber-300">{config.FINE_TICK_LENGTH}</span>
          </label>
          <input
            type="range" id="FINE_TICK_LENGTH" name="FINE_TICK_LENGTH"
            min="1" max="20" value={config.FINE_TICK_LENGTH}
            onChange={handleConfigChange}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>

      <hr className="border-slate-600" />
      {/* Coordinate Inputs */}
      <div>
        <label className="block text-sm font-medium mb-1">Label Coords (x1000)</label>
        <div className="flex space-x-2">
          <div className="flex-1">
            <label htmlFor="labelX" className="block text-xs text-slate-400">X</label>
            <input
              type="number" id="labelX" name="labelX"
              value={config.LABEL_COORDS.x}
              onChange={handleCoordChange}
              className="w-full p-1.5 bg-slate-900 border border-slate-700 rounded-md text-sm"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="labelY" className="block text-xs text-slate-400">Y</label>
            <input
              type="number" id="labelY" name="labelY"
              value={config.LABEL_COORDS.y}
              onChange={handleCoordChange}
              className="w-full p-1.5 bg-slate-900 border border-slate-700 rounded-md text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
// --- END Configurator Component ---


const TachometerLock = ({ onSuccess }) => {
  // --- TACHOMETER CALIBRATION ---
  // Using values from 15708.jpg, but with a VISIBLE rest angle.
  const [tachometerConfig, setTachometerConfig] = useState({
    TACH_START_ANGLE: -218,
    TACH_END_ANGLE: -25,
    NEEDLE_REST_ANGLE: -132, // <-- Set to a visible angle like -132 (at the '4')
    LABEL_COORDS: { x: 98, y: 105 },
    NUMBER_FONT_SIZE: 14,
    NUMBER_RADIUS: 65,
    NEEDLE_LENGTH: 78,
    NEEDLE_PIVOT_X: 120, // <-- CORRECTED: Set to true center 120
    NEEDLE_PIVOT_Y: 120, // <-- CORRECTED: Set to true center 120
    MAJOR_TICK_LENGTH: 22,
    QUARTER_TICK_LENGTH: 13,
    FINE_TICK_LENGTH: 6,
  });
  // --- END CALIBRATION ---

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

  // Use the calibration state
  const { 
    TACH_START_ANGLE, TACH_END_ANGLE, NEEDLE_REST_ANGLE, 
    LABEL_COORDS, NUMBER_FONT_SIZE, NUMBER_RADIUS, NEEDLE_LENGTH,
    NEEDLE_PIVOT_X, NEEDLE_PIVOT_Y,
    MAJOR_TICK_LENGTH, QUARTER_TICK_LENGTH, FINE_TICK_LENGTH
  } = tachometerConfig;

  const TOTAL_SWEEP = TACH_END_ANGLE - TACH_START_ANGLE;

  const [currentNeedleAngle, setCurrentNeedleAngle] = useState(NEEDLE_REST_ANGLE);

  useEffect(() => {
    if (rpm === 0) {
      setCurrentNeedleAngle(NEEDLE_REST_ANGLE);
    }
  }, [NEEDLE_REST_ANGLE, rpm]);


  useEffect(() => {
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

    loadConfiguration();
  }, []);

  useEffect(() => {
    const initAudio = () => {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) {
        console.warn("AudioContext not supported in this browser.");
        return;
      }

      const ctx = new AudioContext();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

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
      } else if (audioContext.state === 'suspended') {
        audioContext.resume();
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
      if (audioContext && audioContext.state !== 'closed') {
        audioContext.close();
      }
    };
  }, [audioContext, engineOscillator]);


  useEffect(() => {
    let interval;
    let currentRpm = rpm;

    const updateRpm = (newRpm) => {
      newRpm = Math.max(0, Math.min(9000, newRpm));
      setRpm(newRpm);

      const dynamicAngle = TACH_START_ANGLE + (newRpm / 9000) * TOTAL_SWEEP;
      setCurrentNeedleAngle(dynamicAngle);
    };

    if (isGasPressed && !isBrakePressed) {
      interval = setInterval(() => {
        currentRpm += rpmSpeed;
        updateRpm(currentRpm);
      }, 50);
    } else if (isBrakePressed && !isGasPressed) {
      interval = setInterval(() => {
        currentRpm -= (rpmSpeed * 1.25);
        updateRpm(currentRpm);
      }, 50);
    } else if (!isGasPressed && !isBrakePressed) {
      interval = setInterval(() => {
        if (currentRpm > 0) {
          currentRpm -= (rpmSpeed * 0.5);
          updateRpm(currentRpm);
        } else {
          setCurrentNeedleAngle(NEEDLE_REST_ANGLE);
          if (interval) clearInterval(interval);
        }
      }, 50);
    }

    return () => {
      if(interval) clearInterval(interval)
    };
  }, [isGasPressed, isBrakePressed, rpm, rpmSpeed, TACH_START_ANGLE, TOTAL_SWEEP, NEEDLE_REST_ANGLE]);


  useEffect(() => {
    if (!engineOscillator || !gainNode || !audioContext) return;

    const idleFreq = 30;
    const maxFreq = 400;
    const targetFreq = idleFreq + (rpm / 9000) * (maxFreq - idleFreq);

    const minVolume = 0;
    const maxVolume = 0.15;
    const targetVolume = rpm > 0 ? minVolume + (rpm / 9000) * (maxVolume - minVolume) : 0;

    engineOscillator.frequency.setTargetAtTime(targetFreq, audioContext.currentTime, 0.1);
    gainNode.gain.setTargetAtTime(targetVolume, audioContext.currentTime, 0.1);
  }, [rpm, engineOscillator, gainNode, audioContext]);

  const checkRpm = useCallback(() => {
    if (!audioContext || !gainNode) {
      toast({
        title: "Audio Not Initialized",
        description: "Please click or touch the screen first to enable audio.",
        variant: "destructive"
      });
      return;
    }

    const currentTarget = targetRpms[checkpointIndex];

    if (Math.abs(rpm - currentTarget) <= tolerance) {
      if (checkpointIndex === targetRpms.length - 1) {
        gainNode.gain.setTargetAtTime(0, audioContext.currentTime, 0.3);
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
  }, [rpm, checkpointIndex, targetRpms, tolerance, gainNode, audioContext, onSuccess]);


  if (loading) {
    return <div className="text-center py-12 text-slate-400">Loading configuration...</div>;
  }

  return (
    <div className="space-y-10 flex flex-col items-center">

      {/* --- Configurator Panel --- */}
      <TachometerConfigurator config={tachometerConfig} setConfig={setTachometerConfig} />

      {/* Tachometer */}
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
            <filter id="red-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
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
              <stop offset="0" stopColor="#0f0f0f" />
              <stop offset="0.80" stopColor="#0a0a0a" />
              <stop offset="0.92" stopColor="#050505" />
              <stop offset="1" stopColor="#000000" />
            </radialGradient>
            <radialGradient id="glass-effect" cx="0.3" cy="0.3" r="0.8">
              <stop offset="0%" stopColor="rgba(255,255,255,0.12)" />
              <stop offset="70%" stopColor="rgba(255,255,255,0.02)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0.25)" />
            </radialGradient>
          </defs>

          {/* Bezel */}
          <circle cx="120" cy="120" r="115" fill="url(#evo-bezel)" />
          <circle cx="120" cy="120" r="113" fill="none" stroke="#555" strokeWidth="0.5" opacity="0.6" />
          <circle cx="120" cy="120" r="105" fill="#0a0a0a" />

          {/* Face */}
          <circle cx="120" cy="120" r="100" fill="url(#evo-face)" stroke="#2a2a2a" strokeWidth="0.8" />

          {/* Redzone */}
          {(() => {
            const angle7 = TACH_START_ANGLE + (7000 / 9000) * TOTAL_SWEEP;
            const angle9 = TACH_END_ANGLE;
            const r_redzone = 100;
            const r_inner_redzone = 75; // Matches number radius

            const x_start_outer = 120 + r_redzone * Math.cos(angle7 * Math.PI / 180);
            const y_start_outer = 120 + r_redzone * Math.sin(angle7 * Math.PI / 180);
            const x_end_outer = 120 + r_redzone * Math.cos(angle9 * Math.PI / 180);
            const y_end_outer = 120 + r_redzone * Math.sin(angle9 * Math.PI / 180);

            const x_start_inner = 120 + r_inner_redzone * Math.cos(angle7 * Math.PI / 180);
            const y_start_inner = 120 + r_inner_redzone * Math.sin(angle7 * Math.PI / 180);
            const x_end_inner = 120 + r_inner_redzone * Math.cos(angle9 * Math.PI / 180);
            const y_end_inner = 120 + r_inner_redzone * Math.sin(angle9 * Math.PI / 180);

            let arcSweep = (angle9 - angle7 + 360) % 360;
            const largeArcFlag = arcSweep > 180 ? 1 : 0;
            const sweepFlag = 1;

            return (
              <path
                d={`
                  M ${x_start_outer} ${y_start_outer}
                  A ${r_redzone} ${r_redzone} 0 ${largeArcFlag} ${sweepFlag} ${x_end_outer} ${y_end_outer}
                  L ${x_end_inner} ${y_end_inner}
                  A ${r_inner_redzone} ${r_inner_redzone} 0 ${largeArcFlag} ${1 - sweepFlag} ${x_start_inner} ${y_start_inner}
                  Z
                `}
                fill="#dc2626"
                opacity="0.9"
              />
            );
          })()}


          {/* Ticks */}
          {(() => {
            const ticks = [];
            const r_outer = 100;
            const tickColor = "#ff2020"; // All ticks red

            for (let num = 0; num <= 9; num++) {
              const baseAngle = TACH_START_ANGLE + (num / 9) * TOTAL_SWEEP;
              const r_inner_major = r_outer - MAJOR_TICK_LENGTH; // Use config
              const x1_major = 120 + r_outer * Math.cos(baseAngle * Math.PI / 180);
              const y1_major = 120 + r_outer * Math.sin(baseAngle * Math.PI / 180);
              const x2_major = 120 + r_inner_major * Math.cos(baseAngle * Math.PI / 180);
              const y2_major = 120 + r_inner_major * Math.sin(baseAngle * Math.PI / 180);

              const isRedzone = num >= 7;

              ticks.push(
                <line key={`major-${num}`} x1={x1_major} y1={y1_major} x2={x2_major} y2={y2_major} stroke={tickColor} strokeWidth={isRedzone ? 4 : 3.5} opacity="1" strokeLinecap="round" filter="url(#red-glow)" />
              );

              if (num === 0) {
                for (let i = 1; i < 10; i++) { 
                  const fineAngle = TACH_START_ANGLE + (i / 90) * TOTAL_SWEEP;
                  const r_inner_fine = r_outer - FINE_TICK_LENGTH; // Use config
                  const x1_fine = 120 + r_outer * Math.cos(fineAngle * Math.PI / 180);
                  const y1_fine = 120 + r_outer * Math.sin(fineAngle * Math.PI / 180);
                  const x2_fine = 120 + r_inner_fine * Math.cos(fineAngle * Math.PI / 180);
                  const y2_fine = 120 + r_inner_fine * Math.sin(fineAngle * Math.PI / 180);
                  ticks.push(
                    <line key={`fine-${i}`} x1={x1_fine} y1={y1_fine} x2={x2_fine} y2={y2_fine} stroke={tickColor} strokeWidth="0.8" opacity="0.7" strokeLinecap="round" filter="url(#red-glow)" />
                  );
                }
              }

              if (num < 9) {
                for (let q = 1; q <= 3; q++) { 
                  const quarterAngle = TACH_START_ANGLE + ((num * 1000 + q * 250) / 9000) * TOTAL_SWEEP;
                  const r_inner_quarter = r_outer - QUARTER_TICK_LENGTH; // Use config
                  const qx1 = 120 + r_outer * Math.cos(quarterAngle * Math.PI / 180);
                  const qy1 = 120 + r_outer * Math.sin(quarterAngle * Math.PI / 180);
                  const qx2 = 120 + r_inner_quarter * Math.cos(quarterAngle * Math.PI / 180);
                  const qy2 = 120 + r_inner_quarter * Math.sin(quarterAngle * Math.PI / 180);

                  const qIsRedzone = (num * 1000 + q * 250) >= 7000;

                  ticks.push(
                    <line key={`quarter-${num}-${q}`} x1={qx1} y1={qy1} x2={qx2} y2={qy2} stroke={tickColor} strokeWidth={qIsRedzone ? 2.5 : 1.8} opacity="0.9" strokeLinecap="round" filter="url(#red-glow)" />
                  );
                }
              }
            }
            return ticks;
          })()}

          {/* Numbers */}
          {Array.from({ length: 10 }).map((_, i) => {
            const num = i;
            const angle = TACH_START_ANGLE + (num / 9) * TOTAL_SWEEP;
            const textRadius = NUMBER_RADIUS; // Use config
            const textX = 120 + textRadius * Math.cos(angle * Math.PI / 180);
            const textY = 120 + textRadius * Math.sin(angle * Math.PI / 180);

            return (
              <text 
                key={num} 
                x={textX} 
                y={textY} 
                textAnchor="middle" 
                dominantBaseline="middle"
                fill="#ff2020" // All numbers red
                fontSize={NUMBER_FONT_SIZE} // Use config
                fontWeight="900"
                fontFamily="Arial, sans-serif"
                filter="url(#red-glow)"
              >
                {num}
              </text>
            );
          })}

          {/* Label */}
          <text 
            x={LABEL_COORDS.x}
            y={LABEL_COORDS.y}
            textAnchor="middle" 
            fill="#ff2020" // Red label
            fontSize="8" 
            fontWeight="700"
            letterSpacing="0.5"
            fontFamily="Arial, sans-serif"
            filter="url(#red-glow)"
          >
            x1000r/min
          </text>

          {/* LCD */}
          <g>
            <rect x="78" y="168" width="84" height="32" rx="2" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1" /> {/* Lighter, less orange */}
            <text x="84" y="178" fill="#1a1a1a" fontSize="7" fontWeight="700" fontFamily="monospace">TRIP</text>
            {/* Box around 'A' */}
            <rect x="102" y="172" width="10" height="8" rx="1" fill="none" stroke="#1a1a1a" strokeWidth="0.5" />
            <text x="107" y="178" textAnchor="middle" fill="#1a1a1a" fontSize="6" fontWeight="900" fontFamily="monospace">A</text>

            <text x="156" y="178" textAnchor="end" fill="#1a1a1a" fontSize="8" fontWeight="900" fontFamily="monospace">
              60.9
            </text>
            <line x1="80" y1="182" x2="160" y2="182" stroke="#1a1a1a" strokeWidth="0.5" opacity="0.5" />

            <text x="156" y="194" textAnchor="end" fill="#1a1a1a" fontSize="12" fontWeight="900" fontFamily="monospace">
              072191
            </text>
          </g>

          {/* Drive Mode */}
          <g transform="translate(172, 106)">
            <rect x="0" y="0" width="38" height="34" rx="2" fill="none" stroke="#666" strokeWidth="0.8" />
            <circle cx="6" cy="6" r="2.5" fill="#fbbf24" />
            <text x="12" y="8" fill="#e0e0e0" fontSize="5.5" fontWeight="700" fontFamily="Arial, sans-serif">TARMAC</text>
            <circle cx="6" cy="16" r="2.5" fill="#3a3a3a" stroke="#555" strokeWidth="0.5" />
            <text x="12" y="18" fill="#888" fontSize="5.5" fontWeight="700" fontFamily="Arial, sans-serif">GRAVEL</text>
            <circle cx="6" cy="26" r="2.5" fill="#3a3a3a" stroke="#555" strokeWidth="0.5" />
            <text x="12" y="28" fill="#888" fontSize="5.5" fontWeight="700" fontFamily="Arial, sans-serif">SNOW</text>
          </g>

          {/* SRS light */}
          <text x="190" y="148" fill="#4a4a4a" fontSize="5" fontWeight="700" fontFamily="Arial, sans-serif">SRS</text>

          {/* Needle AND Pivot */}
          {/*
            FIX: This is the correct way to rotate the group.
            1. A static <g> translates the pivot to the center (NEEDLE_PIVOT_X, NEEDLE_PIVOT_Y).
            2. The inner <motion.g> rotates around its new origin (0,0).
          */}
          <g transform={`translate(${NEEDLE_PIVOT_X} ${NEEDLE_PIVOT_Y})`}>
            <motion.g
              initial={false}
              animate={{ rotate: currentNeedleAngle }}
              transition={{ type: "spring", stiffness: 300, damping: 30, mass: 0.8 }}
            >
              {/* Needle (drawn from the new 0,0 origin) */}
              <line
                x1={0}
                y1={0} // Attached to pivot (0,0)
                x2={0}
                y2={-NEEDLE_LENGTH} // Tip (negative Y is "up")
                stroke="#dc2626"
                strokeWidth="3"
                strokeLinecap="round"
                filter="url(#needle-glow)"
                opacity="0.8"
              />
              <line
                x1={0}
                y1={0} // Attached to pivot (0,0)
                x2={0}
                y2={-NEEDLE_LENGTH} // Tip (negative Y is "up")
                stroke="#ff2020"
                strokeWidth="2"
                strokeLinecap="round"
              />

              {/* Pivot cap (drawn at the new 0,0 origin) */}
              <circle cx={0} cy={0} r="8" fill="#0a0a0a" stroke="#1a1a1a" strokeWidth="1" />
              <circle cx={0} cy={0} r="5" fill="#1a1a1a" />
            </motion.g>
          </g>


          {/* Glass */}
          <circle cx="120" cy="120" r="100" fill="url(#glass-effect)" pointerEvents="none" />
        </svg>
      </div>

      {/* Pedals */}
      <div className="flex justify-center items-end space-x-6">
        <div className="flex flex-col items-center space-y-2">
          <EvoPedal
            type="clutch"
            size="small"
            onClick={checkRpm}
            aria-label="Clutch Pedal (Press to check RPM)"
          >
            CLUTCH
          </EvoPedal>
          <span className="text-sm text-amber-400 font-semibold">Press to Check</span>
        </div>
        <div className="flex flex-col items-center space-y-2">
          <EvoPedal
            type="brake"
            size="normal"
            onMouseDown={() => setIsBrakePressed(true)}
            onMouseUp={() => setIsBrakePressed(false)}
            onMouseLeave={() => setIsBrakePressed(false)}
            onTouchStart={() => setIsBrakePressed(true)}
            onTouchEnd={() => setIsBrakePressed(false)}
            aria-label="Brake Pedal (Hold to slow RPM)"
          >
            BRAKE
          </EvoPedal>
          <span className="text-sm text-red-400 font-semibold">Hold to Slow</span>
        </div>
        <div className="flex flex-col items-center space-y-2">
          <EvoPedal
            type="gas"
            size="normal"
            onMouseDown={() => setIsGasPressed(true)}
            onMouseUp={() => setIsGasPressed(false)}
            onMouseLeave={() => setIsGasPressed(false)}
            onTouchStart={() => setIsGasPressed(true)}
            onTouchEnd={() => setIsGasPressed(false)}
            aria-label="Gas Pedal (Hold to rev)"
          >
            GAS
          </EvoPedal>
          <span className="text-sm text-green-400 font-semibold">Hold to Rev</span>
        </div>
      </div>
    </div>
  );
};

export default TachometerLock;