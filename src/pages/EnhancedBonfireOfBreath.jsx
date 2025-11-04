import React, { useState, useEffect, useRef, Suspense, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import PremiumSoulFlame from '@/components/PremiumSoulFlame';
import ProceduralStarfield from '@/components/ProceduralStarfield';
import GeometricOverlay from '@/components/GeometricOverlay';
import BreathingParticles from '@/components/BreathingParticles'; // Assuming this exists now
import RiteScribe from '@/components/RiteScribe';
import { useBreathingAudio } from '@/components/BreathingAudio';
import { Button } from '@/components/ui/button';
import { Pause, Play, RotateCw, Settings, GlassWater, Shield, Moon, Flame, Volume2, VolumeX } from 'lucide-react';
import { Text } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, ChromaticAberration } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';

// --- Configuration for Breathing Rites ---
const breathingRites = {
  'Estus Breath': {
    icon: GlassWater,
    rite: { inhale: 5.5, hold: 0, exhale: 5.5, holdAfter: 0 },
    description: 'Resonance breathing for balance'
  },
  'Iron Flesh': {
    icon: Shield,
    rite: { inhale: 4, hold: 4, exhale: 4, holdAfter: 4 },
    description: 'Box breathing for resilience'
  },
  'Twilit Respite': {
    icon: Moon,
    rite: { inhale: 4, hold: 7, exhale: 8, holdAfter: 0 },
    description: '4-7-8 breathing for rest'
  },
  'Dragon\'s Roar': {
    icon: Flame,
    rite: { inhale: 2, hold: 0, exhale: 1, holdAfter: 0 },
    description: 'Wim Hof method for energy'
  },
};

// --- Helper Components ---
const CircularProgress = ({ progress, breathCount }) => {
  const radius = 2.8;
  const strokeWidth = 0.12;

  return (
    <group position={[0, -2.0, 0]}>
      {/* Background ring */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <ringGeometry args={[radius, radius + strokeWidth, 128]} />
        <meshBasicMaterial
          color="#d4af37"
          transparent
          opacity={0.15}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Progress ring */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <ringGeometry
          args={[radius, radius + strokeWidth, 128, 1, 0, progress * Math.PI * 2]}
        />
        <meshBasicMaterial
          color="#d4af37"
          side={THREE.DoubleSide}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Breath counter */}
      {breathCount > 0 && (
        <Text
          color="#d4af37"
          fontSize={0.3}
          position={[0, -0.5, 0]}
          anchorX="center"
        >
          {breathCount} Souls Kindled
        </Text>
      )}
    </group>
  );
};


// --- Timer Component (runs inside Canvas) ---
const BreathingTimer = ({
  isRunning,
  isPaused,
  rite,
  onPhaseChange,
  onTimeUpdate,
  onSessionTimeUpdate,
  onBreathComplete
}) => {
  const timer = useRef({
    phaseIndex: 0,
    timeInPhase: 0,
    phases: [],
    phaseDurations: [],
    lastPhase: null,
    sessionTime: 0,
    animationFrameId: null, // Store animation frame ID
  });

  useEffect(() => {
    // Reset timer when not running or when rite changes
    if (!isRunning || !rite) {
      timer.current.sessionTime = 0;
      timer.current.phaseIndex = 0;
      timer.current.timeInPhase = 0;
      timer.current.lastPhase = null;
      if (timer.current.animationFrameId) {
        cancelAnimationFrame(timer.current.animationFrameId);
        timer.current.animationFrameId = null;
      }
    }
  }, [isRunning, rite]);

  useEffect(() => {
    // Update phases and durations when the rite changes
    if (rite) {
        const phases = ['inhale', 'hold', 'exhale', 'holdAfter'];
        const phaseDurations = phases.map(p => rite[p]);
        timer.current.phases = phases;
        timer.current.phaseDurations = phaseDurations;
        timer.current.phaseIndex = 0; // Reset index on rite change
        timer.current.timeInPhase = 0; // Reset time in phase
        timer.current.lastPhase = null; // Reset last phase
    }
  }, [rite]);

  useFrame((state, delta) => {
    if (!isRunning || isPaused || !rite || !timer.current.phases.length) return;

    timer.current.timeInPhase += delta;
    timer.current.sessionTime += delta;
    onSessionTimeUpdate(timer.current.sessionTime);

    const { timeInPhase, phaseIndex, phases, phaseDurations, lastPhase } = timer.current;

    const currentPhaseName = phases[phaseIndex];
    const currentPhaseDuration = phaseDurations[phaseIndex];

    // Notify phase change
    if (currentPhaseName !== lastPhase) {
      onPhaseChange(currentPhaseName);
      timer.current.lastPhase = currentPhaseName;
    }

    onTimeUpdate(
      Math.max(0, currentPhaseDuration - timeInPhase),
      currentPhaseDuration > 0 ? Math.min(1, timeInPhase / currentPhaseDuration) : 1
    );

    if (timeInPhase >= currentPhaseDuration) {
      let nextPhaseIndex = (phaseIndex + 1) % phases.length;

      // Skip phases with 0 duration
      while(phaseDurations[nextPhaseIndex] <= 0 && nextPhaseIndex !== phaseIndex) { // Added check to prevent infinite loop if all are 0
        nextPhaseIndex = (nextPhaseIndex + 1) % phases.length;
      }

      // Check if we completed a full breath cycle (transitioned back to inhale or the first non-zero phase)
      if (nextPhaseIndex === 0 || (phaseIndex === phases.length - 1 && phaseDurations[0] > 0)) {
        onBreathComplete();
      }

      timer.current.phaseIndex = nextPhaseIndex;
      timer.current.timeInPhase = 0; // Reset time for the new phase
    }
  });

  return null;
};

// --- Main App Component ---
const EnhancedBonfireOfBreath = () => {
  const [selectedRiteKey, setSelectedRiteKey] = useState('Estus Breath');
  const [rite, setRite] = useState(breathingRites[selectedRiteKey].rite);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showRiteScribe, setShowRiteScribe] = useState(false);

  const [phase, setPhase] = useState('idle');
  const [timeLeft, setTimeLeft] = useState(0);
  const [phaseProgress, setPhaseProgress] = useState(0);
  const [breathCount, setBreathCount] = useState(0);
  const [sessionTime, setSessionTime] = useState(0);

  const [audioEnabled, setAudioEnabled] = useState(true);
  const [audioInitialized, setAudioInitialized] = useState(false);

  const { initialize: initializeAudio, playPhaseTransition, setVolume } = useBreathingAudio(audioEnabled);
  const lastPhaseRef = useRef(null);

  // Initialize audio on first user interaction
  useEffect(() => {
    const handleFirstInteraction = async () => {
      if (!audioInitialized && audioEnabled) {
        await initializeAudio();
        setAudioInitialized(true);
      }
    };

    document.addEventListener('click', handleFirstInteraction, { once: true });
    return () => document.removeEventListener('click', handleFirstInteraction);
  }, [audioInitialized, audioEnabled, initializeAudio]);

  // Play audio on phase change
  useEffect(() => {
    if (isRunning && !isPaused && phase !== lastPhaseRef.current && phase !== 'idle') {
      playPhaseTransition(phase);
      lastPhaseRef.current = phase;
    }
  }, [phase, isRunning, isPaused, playPhaseTransition]);

  // Haptic feedback
  useEffect(() => {
    if (isRunning && !isPaused && phase !== 'idle' && rite) {
      const duration = rite[phase] * 1000;
      if ('vibrate' in navigator && duration > 0) {
        // Gentle pulse pattern
        const pattern = phase === 'hold' || phase === 'holdAfter'
          ? [100, 100, 100]
          : [50];
        navigator.vibrate(pattern);
      }
    }
  }, [phase, isRunning, isPaused, rite]);

  const handlePhaseChange = (newPhase) => {
    setPhase(newPhase);
  };

  const handleTimeUpdate = (timeRemaining, progress) => {
    setTimeLeft(timeRemaining);
    setPhaseProgress(progress);
  };

  const handleSessionTimeUpdate = (newTime) => {
    setSessionTime(newTime);
  };

  const handleBreathComplete = () => {
    setBreathCount(prev => prev + 1);
  };

  const start = () => {
    if (rite) { // Only start if a rite is selected
      setIsRunning(true);
      setIsPaused(false);
      setPhase('inhale'); // Start with inhale
      setTimeLeft(rite.inhale);
      setPhaseProgress(0);
      setBreathCount(0);
      setSessionTime(0);
      lastPhaseRef.current = null; // Reset last phase on start
    }
  };

  const pause = () => {
    if (!isRunning) return;
    setIsPaused(true);
    if ('vibrate' in navigator) navigator.vibrate(0);
  };

  const resume = () => {
    if (!isRunning) return;
    setIsPaused(false);
  };

  const reset = () => {
    setIsRunning(false);
    setIsPaused(false);
    setPhase('idle');
    setTimeLeft(0);
    setPhaseProgress(0);
    setBreathCount(0);
    setSessionTime(0);
    if ('vibrate' in navigator) navigator.vibrate(0);
    lastPhaseRef.current = null;
  };

  const selectRite = (key) => {
    if (breathingRites[key]) {
      setSelectedRiteKey(key);
      setRite(breathingRites[key].rite);
      reset(); // Reset the state when selecting a new rite
    }
  };

  const handleSaveCustomRite = (name, riteData) => {
    // Add to breathingRites dynamically (consider making this stateful if needed)
    breathingRites[name] = {
      icon: Flame,
      rite: riteData,
      description: 'Custom breathing pattern'
    };
  };

  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled);
    if (!audioEnabled) {
      setVolume(0.3); // Set volume when enabling
    } else {
      setVolume(0); // Mute when disabling
    }
  };

  const phaseText = useMemo(() => {
    if (!isRunning) return "Ready to Begin";
    if (isPaused) return "Paused";
    switch (phase) {
      case 'inhale': return "INHALE";
      case 'hold': return "HOLD";
      case 'exhale': return "EXHALE";
      case 'holdAfter': return "REST";
      default: return "Initializing..."; // Or some other initial state text
    }
  }, [isRunning, isPaused, phase]);

  const formatTime = (timeInSeconds) => {
    const totalSeconds = Math.floor(timeInSeconds);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <Helmet>
        <title>The Bonfire of Breath - The Citadel</title>
        <meta name="description" content="A meditative breathing ritual to rekindle your inner flame." />
      </Helmet>

      <div className="fixed inset-0 bg-black">
        <Canvas
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
          camera={{ position: [0, 0, 7], fov: 60 }}
          gl={{
              antialias: true,
              alpha: true
          }}
          onCreated={({ gl }) => {
              gl.setClearColor(new THREE.Color(0x000000), 1);
              gl.outputEncoding = THREE.sRGBEncoding;
          }}
        >
          <ambientLight intensity={0.1} />
          {/* Point light is now inside PremiumSoulFlame */}
          <Suspense fallback={null}>
            <ProceduralStarfield />
            <PremiumSoulFlame
              phase={phase}
              phaseProgress={phaseProgress}
              isRunning={isRunning}
            />
            <GeometricOverlay phase={phase} phaseProgress={phaseProgress} isRunning={isRunning} />
            <BreathingParticles // Assuming this component exists and is imported
              phase={phase}
              phaseProgress={phaseProgress}
              isRunning={isRunning}
            />

            <BreathingTimer
              isRunning={isRunning}
              isPaused={isPaused}
              rite={rite}
              onPhaseChange={handlePhaseChange}
              onTimeUpdate={handleTimeUpdate}
              onSessionTimeUpdate={handleSessionTimeUpdate}
              onBreathComplete={handleBreathComplete}
            />

            {/* UI Elements inside the Canvas */}
            <AnimatePresence>
              {(isRunning || phase === 'idle') && (
                <motion.group
                  key="ui-elements" // Added key for AnimatePresence
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Text
                    color="#d4af37"
                    fontSize={0.5}
                    position={[0, 1.8, 0]}
                    anchorX="center"
                    letterSpacing={0.05}
                  >
                    {phaseText}
                  </Text>

                  {isRunning && !isPaused && (
                    <>
                      <Text
                        color="#FFE8B3"
                        fontSize={1.5}
                        position={[0, -0.6, 0]}
                        anchorX="center"
                      >
                        {Math.ceil(timeLeft)}
                      </Text>
                      <CircularProgress
                        progress={phaseProgress}
                        breathCount={breathCount}
                      />
                    </>
                  )}
                </motion.group>
              )}
            </AnimatePresence>
          </Suspense>

          {/* Post-processing (re-enabled) with conservative settings */}
          <EffectComposer>
            <Bloom
              intensity={
                isRunning
                  ? (phase === 'hold' || phase === 'holdAfter'
                      ? 0.5
                      : phase === 'inhale'
                        ? 0.3 + (phaseProgress * 0.2)
                        : phase === 'exhale'
                          ? 0.5 - (phaseProgress * 0.2)
                          : 0.3)
                  : 0.3
              }
              luminanceThreshold={0.85}
              luminanceSmoothing={0.9}
              mipmapBlur
              radius={0.6}
            />
            <Vignette
              eskil={false}
              offset={0.1}
              darkness={
                isRunning && (phase === 'hold' || phase === 'holdAfter')
                  ? 1.4
                  : 1.2
              }
            />
            <ChromaticAberration
              blendFunction={BlendFunction.NORMAL}
              offset={[0.0001, 0.0001]}
            />
          </EffectComposer>
        </Canvas>

        {/* HTML UI Overlay */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Top bar - Session info */}
          <AnimatePresence>
            {isRunning && (
              <motion.div
                key="session-info"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute top-8 left-0 right-0 flex justify-center pointer-events-auto"
              >
                <div className="bg-black/40 backdrop-blur-md border border-yellow-400/20 rounded-full px-6 py-3 flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-xs text-slate-400 font-cinzel">Session Time</p>
                    <p className="text-lg text-yellow-400 font-semibold">{formatTime(sessionTime)}</p>
                  </div>
                  <div className="w-px h-8 bg-yellow-400/20" />
                  <div className="text-center">
                    <p className="text-xs text-slate-400 font-cinzel">Breaths</p>
                    <p className="text-lg text-yellow-400 font-semibold">{breathCount}</p>
                  </div>
                  <div className="w-px h-8 bg-yellow-400/20" />
                  <div className="text-center">
                    <p className="text-xs text-slate-400 font-cinzel">Current Rite</p>
                    <p className="text-sm text-yellow-400">{selectedRiteKey}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Audio toggle */}
          <div className="absolute top-8 right-8 pointer-events-auto">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleAudio}
              className="text-slate-400 hover:text-yellow-400 bg-black/40 backdrop-blur-md border border-yellow-400/20 rounded-full"
            >
              {audioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </Button>
          </div>

          {/* Bottom controls */}
          <div className="absolute bottom-8 left-0 right-0 p-8 flex flex-col items-center justify-center">
            <div className="flex gap-4 md:gap-8 items-center pointer-events-auto">
              {!isRunning ? (
                <>
                  {Object.entries(breathingRites).map(([key, { icon: Icon, description }]) => (
                    <div
                      key={key}
                      className="flex flex-col items-center gap-2 text-center cursor-pointer group relative"
                      onClick={() => selectRite(key)}
                    >
                      {/* Tooltip */}
                      <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <div className="bg-black/90 backdrop-blur-sm border border-yellow-400/30 rounded px-3 py-2 whitespace-nowrap">
                          <p className="text-xs text-slate-300">{description}</p>
                        </div>
                      </div>

                      <div className={`p-3 rounded-full border-2 transition-all duration-300 ${
                        selectedRiteKey === key
                          ? 'border-yellow-400 bg-yellow-400/20 shadow-lg shadow-yellow-400/20'
                          : 'border-slate-600 bg-black/40 backdrop-blur-sm group-hover:border-yellow-400/50 group-hover:bg-yellow-400/10'
                      }`}>
                        <Icon className={`w-8 h-8 transition-colors duration-300 ${
                          selectedRiteKey === key
                            ? 'text-yellow-400'
                            : 'text-slate-400 group-hover:text-yellow-300'
                        }`} />
                      </div>
                      <span className={`text-xs md:text-sm transition-colors duration-300 font-cinzel ${
                        selectedRiteKey === key
                          ? 'text-yellow-400'
                          : 'text-slate-500 group-hover:text-slate-300'
                      }`}>
                        {key}
                      </span>
                    </div>
                  ))}

                  <Button
                    onClick={start}
                    size="lg"
                    className="bg-yellow-400/10 border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black rounded-full w-20 h-20 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-yellow-400/50"
                  >
                    <Play className="w-8 h-8" />
                  </Button>

                  <Button
                    onClick={() => setShowRiteScribe(true)}
                    size="lg"
                    variant="ghost"
                    className="text-slate-400 hover:text-yellow-400 border-2 border-slate-600 hover:border-yellow-400/50 rounded-full w-20 h-20 transition-all duration-300"
                  >
                    <Settings className="w-8 h-8" />
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={reset}
                    size="lg"
                    variant="ghost"
                    className="text-slate-400 hover:text-red-400 border-2 border-slate-600 hover:border-red-400/50 rounded-full w-20 h-20 transition-all duration-300 bg-black/40 backdrop-blur-sm"
                  >
                    <RotateCw className="w-8 h-8" />
                  </Button>

                  <Button
                    onClick={isPaused ? resume : pause}
                    size="lg"
                    className="bg-yellow-400 text-black hover:bg-yellow-400/80 rounded-full w-24 h-24 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-yellow-400/50"
                  >
                    {isPaused ? <Play className="w-10 h-10"/> : <Pause className="w-10 h-10" />}
                  </Button>

                  <Button
                    size="lg"
                    variant="ghost"
                    className="text-slate-400 hover:text-yellow-400 border-2 border-slate-600 hover:border-yellow-400/50 rounded-full w-20 h-20 transition-all duration-300 bg-black/40 backdrop-blur-sm"
                    onClick={() => setShowRiteScribe(true)}
                  >
                    <Settings className="w-8 h-8" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Rite Scribe Modal */}
        {/* Make sure RiteScribe is imported and handled correctly */}
        {/* <RiteScribe
          isOpen={showRiteScribe}
          onClose={() => setShowRiteScribe(false)}
          onSaveRite={handleSaveCustomRite}
          existingRites={breathingRites}
        /> */}
      </div>
    </>
  );
};

export default EnhancedBonfireOfBreath;
