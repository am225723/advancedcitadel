import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Canvas, useFrame } from '@react-three/fiber';
import { Box, Plane, Text } from '@react-three/drei';
import * as THREE from 'three';
import SoulEmber from '@/components/SoulEmber'; // Assuming SoulEmber is adaptable

// Breathing Timer component, adapted from BonfireOfBreath
const BreathingTimer = ({ isRunning, rite, onPhaseChange, onTimeUpdate }) => {
  const timer = useRef({
    phaseIndex: 0,
    timeInPhase: 0,
    phases: ['inhale', 'hold', 'exhale', 'holdAfter'],
    phaseDurations: [rite.inhale, rite.hold, rite.exhale, rite.holdAfter],
  });

  useFrame((state, delta) => {
    if (!isRunning) return;

    timer.current.timeInPhase += delta;
    const { timeInPhase, phaseIndex, phases, phaseDurations } = timer.current;

    const currentPhaseName = phases[phaseIndex];
    const currentPhaseDuration = phaseDurations[phaseIndex];

    onPhaseChange(currentPhaseName);
    onTimeUpdate(
      Math.max(0, currentPhaseDuration - timeInPhase),
      currentPhaseDuration > 0 ? Math.min(1, timeInPhase / currentPhaseDuration) : 1
    );

    if (timeInPhase >= currentPhaseDuration) {
      let nextPhaseIndex = (phaseIndex + 1) % phases.length;
      while (phaseDurations[nextPhaseIndex] <= 0) {
        nextPhaseIndex = (nextPhaseIndex + 1) % phases.length;
      }
      timer.current.phaseIndex = nextPhaseIndex;
      timer.current.timeInPhase = 0;
    }
  });

  return null;
};


const Road = () => {
  const roadRef = useRef();

  return (
    <Plane ref={roadRef} args={[20, 2000]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, -1000]}>
      <meshStandardMaterial color="#444" />
    </Plane>
  );
};

const Scenery = () => {
  const groupRef = useRef();

  useFrame((state, delta) => {
    groupRef.current.position.z += delta * 15;
    if (groupRef.current.position.z > 20) {
      groupRef.current.position.z = -180;
    }
  });

  return (
    <group ref={groupRef}>
      {[...Array(20)].map((_, i) => (
        <Box key={i} position={[-12, 0, -i * 20]}>
          <meshStandardMaterial color="purple" />
        </Box>
      ))}
      {[...Array(20)].map((_, i) => (
        <Box key={i} position={[12, 0, -i * 20]}>
          <meshStandardMaterial color="purple" />
        </Box>
      ))}
    </group>
  );
};

const DashboardLight = ({ phase, phaseProgress }) => {
  const lightRef = useRef();

  useFrame(() => {
    if (!lightRef.current) return;
    let targetIntensity = 0.5;
    if (phase === 'inhale') {
      targetIntensity = 0.5 + phaseProgress * 1.5;
    } else if (phase === 'exhale') {
      targetIntensity = 0.5 + (1 - phaseProgress) * 1.5;
    }
    lightRef.current.intensity = THREE.MathUtils.lerp(lightRef.current.intensity, targetIntensity, 0.1);
  });

  return <pointLight ref={lightRef} color="#00ffff" position={[0, 0.5, 2]} intensity={0.5} distance={5} decay={2} />;
};

const MindfulDrive = () => {
  const [isRunning, setIsRunning] = useState(true); // Auto-start for this experience
  const [phase, setPhase] = useState('inhale');
  const [phaseProgress, setPhaseProgress] = useState(0);
  const audioRef = useRef();

  useEffect(() => {
    const audio = new Audio('/audio/engine-hum.mp3');
    audio.loop = true;
    audio.volume = 0;
    audio.play().catch(e => console.error("Audio play failed:", e));
    audioRef.current = audio;

    return () => {
      audio.pause();
    };
  }, []);

  useFrame(() => {
    if (!audioRef.current) return;
    let targetVolume = 0.1;
    if (phase === 'inhale') {
      targetVolume = 0.1 + phaseProgress * 0.4;
    } else if (phase === 'exhale') {
      targetVolume = 0.1 + (1 - phaseProgress) * 0.4;
    }
    audioRef.current.volume = THREE.MathUtils.lerp(audioRef.current.volume, targetVolume, 0.1);
  });

  const rite = { inhale: 5.5, hold: 0, exhale: 5.5, holdAfter: 0 };

  const phaseText = useMemo(() => {
    switch (phase) {
      case 'inhale': return "INHALE";
      case 'exhale': return "EXHALE";
      default: return "";
    }
  }, [phase]);

  return (
    <>
      <Helmet>
        <title>Mindful Drive - Therapeutic Garage</title>
        <meta name="description" content="A serene driving experience for relaxation and mindfulness." />
      </Helmet>
      <div style={{ height: '80vh', width: '100%', background: '#111' }}>
        <Canvas camera={{ position: [0, 1, 10], fov: 75 }}>
          <fog attach="fog" args={['#111', 10, 50]} />
          <ambientLight intensity={0.1} />
          <directionalLight position={[10, 10, 5]} intensity={0.5} />

          <Road />
          <Scenery />
          <DashboardLight phase={phase} phaseProgress={phaseProgress} />

          <BreathingTimer
            isRunning={isRunning}
            rite={rite}
            onPhaseChange={setPhase}
            onTimeUpdate={(_, progress) => setPhaseProgress(progress)}
          />

          {/* Position the SoulEmber to act as a dashboard light/HUD */}
          <group position={[0, -0.5, -2]}>
            <SoulEmber phase={phase} phaseProgress={phaseProgress} isRunning={isRunning} />
          </group>

          <Text color="white" fontSize={0.5} position={[0, 2, 0]}>
            {phaseText}
          </Text>

        </Canvas>
      </div>
    </>
  );
};

export default MindfulDrive;
