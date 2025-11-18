import React, { useRef, useState, useMemo, useEffect, Suspense } from 'react';
import { Helmet } from 'react-helmet';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Plane } from '@react-three/drei';
import * as THREE from 'three';
import SoulEmber from '@/components/SoulEmber';
import XP_Embers from '@/components/XP_Embers';
import PostProcessingEffects from '@/components/3d/PostProcessingEffects';
import { DrivingLighting } from '@/components/3d/EnhancedLighting';
import { EnhancedTree, EnhancedRock, EnhancedStreetLight, EnhancedCloud } from '@/components/3d/EnhancedScenery';
import { SparkleParticles } from '@/components/3d/ParticleEffects';
import { createCurvedWorldMaterial, updateCurvedMaterial } from '@/components/3d/CurvedWorldShader';

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

const CurvedRoad = ({ roadRef }) => {
  const roadMaterial = useMemo(() => createCurvedWorldMaterial('#2a2a2a', 0.00012, 5), []);
  const lineMaterial = useMemo(() => createCurvedWorldMaterial('#ffeb3b', 0.00012, 5), []);

  useFrame((state, delta) => {
    if (roadRef.current) {
      roadRef.current.position.z += delta * 20;
      if (roadRef.current.position.z > 20) {
        roadRef.current.position.z = -480;
      }
    }
    updateCurvedMaterial(roadMaterial, delta);
    updateCurvedMaterial(lineMaterial, delta);
  });

  const roadSegments = useMemo(() => {
    const segments = [];
    for (let i = 0; i < 50; i++) {
      segments.push(-i * 10);
    }
    return segments;
  }, []);

  return (
    <group ref={roadRef}>
      {roadSegments.map((z, i) => (
        <group key={i} position={[0, -0.5, z]}>
          <Plane args={[12, 10]} rotation={[-Math.PI / 2, 0, 0]}>
            <primitive object={roadMaterial} attach="material" />
          </Plane>
          
          <Plane args={[0.3, 8]} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
            <primitive object={lineMaterial} attach="material" />
          </Plane>
        </group>
      ))}
    </group>
  );
};

const EnhancedScenery = () => {
  const groupRef = useRef();

  const sceneryElements = useMemo(() => {
    const elements = [];
    for (let i = 0; i < 40; i++) {
      const side = Math.random() > 0.5 ? 1 : -1;
      const distance = 15 + Math.random() * 15;
      const type = Math.random();
      
      elements.push({
        position: [side * distance, 0, -i * 50],
        type: type > 0.6 ? 'tree' : type > 0.3 ? 'rock' : 'light',
      });
    }
    return elements;
  }, []);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.position.z += delta * 20;
      if (groupRef.current.position.z > 50) {
        groupRef.current.position.z = -1950;
      }
    }
  });

  return (
    <group ref={groupRef}>
      {sceneryElements.map((el, i) => {
        if (el.type === 'tree') {
          return <EnhancedTree key={i} position={el.position} curvature={0.00012} />;
        } else if (el.type === 'rock') {
          return <EnhancedRock key={i} position={el.position} curvature={0.00012} />;
        } else {
          return <EnhancedStreetLight key={i} position={el.position} curvature={0.00012} />;
        }
      })}
    </group>
  );
};

const DynamicSky = ({ timeIntensity }) => {
  const clouds = useMemo(() => [
    { position: [-30, 25, -100] },
    { position: [40, 30, -150] },
    { position: [-20, 35, -200] },
    { position: [50, 28, -250] },
  ], []);

  return (
    <>
      {clouds.map((cloud, i) => (
        <EnhancedCloud key={i} position={cloud.position} />
      ))}
    </>
  );
};

const ResponsiveCamera = ({ roadRef, phase, phaseProgress }) => {
  useFrame((state) => {
    const roadX = roadRef.current ? roadRef.current.position.x : 0;
    const targetX = roadX + Math.sin(state.clock.elapsedTime * 0.2) * 3 + state.mouse.x * 5;
    
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, targetX, 0.05);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, 1.5, 0.05);
    state.camera.position.z = 5;
    
    const breathingOffset = phase === 'inhale' ? phaseProgress * 0.3 : 0;
    state.camera.position.y += breathingOffset;
    
    state.camera.lookAt(targetX, 1, 0);
  });

  return null;
};

const DashboardLight = ({ phase, phaseProgress }) => {
  const lightRef = useRef();

  useFrame(() => {
    if (!lightRef.current) return;
    let targetIntensity = 1;
    if (phase === 'inhale') {
      targetIntensity = 1 + phaseProgress * 2;
    } else if (phase === 'exhale') {
      targetIntensity = 1 + (1 - phaseProgress) * 2;
    }
    lightRef.current.intensity = THREE.MathUtils.lerp(lightRef.current.intensity, targetIntensity, 0.1);
  });

  return <pointLight ref={lightRef} color="#00ffff" position={[0, 0.5, 3]} intensity={1} distance={8} decay={2} />;
};

const MindfulDriveEnhanced = () => {
  const [isRunning, setIsRunning] = useState(true);
  const [phase, setPhase] = useState('inhale');
  const [phaseProgress, setPhaseProgress] = useState(0);

  const roadRef = useRef();
  const sunRef = useRef();

  const rite = { inhale: 5.5, hold: 0, exhale: 5.5, holdAfter: 0 };

  const phaseText = useMemo(() => {
    switch (phase) {
      case 'inhale': return "INHALE";
      case 'exhale': return "EXHALE";
      default: return "";
    }
  }, [phase]);

  const timeIntensity = useMemo(() => {
    return 0.7 + Math.sin(Date.now() * 0.0001) * 0.3;
  }, []);

  return (
    <>
      <Helmet>
        <title>Mindful Drive - The Citadel</title>
        <meta name="description" content="Experience a serene, photorealistic driving meditation with curved world visuals and breathing exercises." />
      </Helmet>
      
      <div className="fixed inset-0 bg-black">
        <Canvas
          camera={{ position: [0, 1.5, 5], fov: 75 }}
          gl={{ 
            antialias: true, 
            toneMapping: THREE.ACESFilmicToneMapping, 
            toneMappingExposure: 1.2,
            outputColorSpace: THREE.SRGBColorSpace 
          }}
        >
          <Suspense fallback={null}>
            <DrivingLighting timeIntensity={timeIntensity} fogColor="#0d1117" />
            
            <CurvedRoad roadRef={roadRef} />
            <EnhancedScenery />
            <DynamicSky timeIntensity={timeIntensity} />
            
            <SparkleParticles count={30} color="#00ffff" />
            <XP_Embers />
            
            <DashboardLight phase={phase} phaseProgress={phaseProgress} />
            <ResponsiveCamera roadRef={roadRef} phase={phase} phaseProgress={phaseProgress} />

            <BreathingTimer
              isRunning={isRunning}
              rite={rite}
              onPhaseChange={setPhase}
              onTimeUpdate={(_, progress) => setPhaseProgress(progress)}
            />

            <group position={[0, -0.5, -2]}>
              <SoulEmber phase={phase} phaseProgress={phaseProgress} isRunning={isRunning} />
            </group>

            <Text 
              color="white" 
              fontSize={0.6} 
              position={[0, 3, -5]}
              font="/fonts/Cinzel-Bold.ttf"
              anchorX="center"
              anchorY="middle"
            >
              {phaseText}
            </Text>

            <PostProcessingEffects
              enableBloom={true}
              enableVignette={true}
              enableNoise={true}
              bloomIntensity={1.2}
              bloomLuminanceThreshold={0.7}
              vignetteDarkness={0.6}
              vignetteOffset={0.2}
              noiseOpacity={0.02}
            />
          </Suspense>
        </Canvas>

        <div className="absolute top-8 left-8 text-white font-cinzel">
          <h1 className="text-4xl font-bold mb-2 text-gradient-gold">Mindful Drive</h1>
          <p className="text-lg opacity-80">Breathe. Drive. Be Present.</p>
        </div>

        <div className="absolute bottom-8 right-8 text-white font-garamond">
          <div className="bg-black/50 backdrop-blur-sm border border-gold-accent/30 rounded-lg p-4">
            <p className="text-sm opacity-70">Use mouse to steer</p>
            <p className="text-sm opacity-70">Follow the breathing rhythm</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default MindfulDriveEnhanced;
