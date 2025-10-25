import React, { useState, useEffect, Suspense } from 'react';
import { Helmet } from 'react-helmet';
import { Canvas } from '@react-three/fiber';
import PremiumSoulFlame from '@/components/PremiumSoulFlame'; 

const EnhancedBonfireOfBreath = () => {
  const [sessionTime, setSessionTime] = useState(0);
  const [breaths, setBreaths] = useState(0);
  const [phase, setPhase] = useState('exhale'); 
  const [phaseProgress, setPhaseProgress] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [currentBPM, setCurrentBPM] = useState(6);
  const [currentBreathRateText, setCurrentBreathRateText] = useState('Estus Breath');

  useEffect(() => {
    let intervalId;
    let animationFrameId; // To keep track of the animation frame for cleanup

    const startBreathingCycle = () => { // Renamed to avoid confusion with internal loop
      setIsRunning(true);

      const inhaleDuration = 4000; // 4 seconds
      const holdDuration = 1000;  // 1 second
      const exhaleDuration = 6000; // 6 seconds
      const holdAfterDuration = 1000; // 1 second

      let currentPhaseStartTime = Date.now();
      let currentPhase = 'inhale'; // Start with inhale

      const runPhase = (targetPhase, duration) => {
        currentPhase = targetPhase;
        currentPhaseStartTime = Date.now();
        setPhase(targetPhase); // Update React state for current phase

        const animate = () => {
          const elapsed = Date.now() - currentPhaseStartTime;
          const progress = Math.min(elapsed / duration, 1);
          setPhaseProgress(progress); // Update React state for progress

          if (progress < 1) {
            animationFrameId = requestAnimationFrame(animate); // Continue animating current phase
          } else {
            // Phase completed, transition to the next
            switch (currentPhase) {
              case 'inhale':
                runPhase('hold', holdDuration);
                break;
              case 'hold':
                runPhase('exhale', exhaleDuration);
                break;
              case 'exhale':
                setBreaths(prev => prev + 1); // Increment breaths once per full cycle
                runPhase('holdAfter', holdAfterDuration);
                break;
              case 'holdAfter':
                runPhase('inhale', inhaleDuration); // Loop back to inhale to start next breath
                break;
              default:
                break;
            }
          }
        };
        animationFrameId = requestAnimationFrame(animate); // Start animation for this phase
      };

      // Kick off the first phase
      runPhase('inhale', inhaleDuration); 
    };

    // --- CRITICAL FIX: Only call the initial cycle start ONCE ---
    // The previous code had `startCycle()` at the end of the useEffect and
    // also potentially recursively inside itself.
    // We call `startBreathingCycle` once here. The internal `runPhase` handles subsequent looping.
    startBreathingCycle(); 
    // --- END CRITICAL FIX ---


    // Session timer
    intervalId = setInterval(() => {
      setSessionTime(prev => prev + 1);
    }, 1000);

    return () => {
      clearInterval(intervalId);
      cancelAnimationFrame(animationFrameId); // Clean up animation frame
      setIsRunning(false); // Reset running state on unmount
    };
  }, []); // Run once on mount

  return (
    <>
      <Helmet>
        <title>The Bonfire of Breath - The Citadel</title>
        <meta name="description" content="A meditative breathing ritual to rekindle your inner flame." />
      </Helmet>

      <div className="fixed inset-0 bg-black">
        <Canvas camera={{ position: [0, 0, 7], fov: 60 }}>
          <ambientLight intensity={0.2} /> 
          <Suspense fallback={null}> 
            <PremiumSoulFlame 
              phase={phase} 
              phaseProgress={phaseProgress} 
              isRunning={isRunning} 
            />
          </Suspense>
        </Canvas>

        {/* Debug UI */}
        <div className="absolute top-8 left-8 text-white">
          <p>Debug State:</p>
          <p>Running: {isRunning ? 'true' : 'false'}</p>
          <p>Phase: {phase}</p>
          <p>Phase Progress: {phaseProgress.toFixed(2)}</p>
          <p>Session Time: {sessionTime}</p>
          <p>Breaths: {breaths}</p>
        </div>
      </div>
    </>
  );
};

export default EnhancedBonfireOfBreath;
