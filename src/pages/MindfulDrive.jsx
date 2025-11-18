import React, { useRef, useState, useMemo, useEffect, Suspense } from 'react';
import { Helmet } from 'react-helmet';
import { Canvas, useFrame } from '@react-three/fiber';
import { Box, Plane, Text, Tube, Environment, Stars, Cloud } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import * as THREE from 'three';
import SoulEmber from '@/components/SoulEmber';
import XP_Embers from '@/components/XP_Embers';

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

const Road = ({ roadRef, curve }) => {
  const roadMaterialRef = useRef();
  
  useFrame((state, delta) => {
    if (roadMaterialRef.current) {
      roadMaterialRef.current.emissiveIntensity = 0.05 + Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
    }
  });

  return (
    <group ref={roadRef}>
      <Tube args={[curve, 512, 10, 8, false]}>
        <meshStandardMaterial 
          ref={roadMaterialRef}
          color="#1a1a1a"
          roughness={0.8}
          metalness={0.3}
          emissive="#00ffff"
          emissiveIntensity={0.05}
        />
      </Tube>
      {/* Lane markers */}
      <Tube args={[curve, 512, 0.3, 4, false]}>
        <meshStandardMaterial 
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={0.5}
          transparent
          opacity={0.8}
        />
      </Tube>
    </group>
  )
}

const Scenery = () => {
  const groupRef = useRef();

  const sceneryElements = useMemo(() => {
    const elements = [];
    for (let i = 0; i < 50; i++) {
      elements.push({
        position: [Math.random() > 0.5 ? -15 - Math.random() * 10 : 15 + Math.random() * 10, 0, -i * 40],
        type: Math.random() > 0.3 ? 'tree' : 'rock',
      });
    }
    return elements;
  }, []);

  useFrame((state, delta) => {
    groupRef.current.position.z += delta * 15;
    if (groupRef.current.position.z > 40) {
      groupRef.current.position.z = -1960; // Loop back to the beginning of the scenery array
    }
  });

  return (
    <group ref={groupRef}>
      {sceneryElements.map((el, i) =>
        el.type === 'tree' ? (
          <Tree key={i} position={el.position} />
        ) : (
          <Rock key={i} position={el.position} />
        )
      )}
    </group>
  );
};

const Tree = (props) => (
  <group {...props}>
    {/* Trunk with realistic bark material */}
    <mesh position={[0, 2.5, 0]} castShadow>
      <cylinderGeometry args={[0.5, 0.8, 5, 8]} />
      <meshStandardMaterial 
        color="#3d2817"
        roughness={0.95}
        metalness={0.0}
      />
    </mesh>
    {/* Foliage - layered cones for depth */}
    <mesh position={[0, 6, 0]} castShadow>
      <coneGeometry args={[3, 6, 8]} />
      <meshStandardMaterial 
        color="#0f2e17"
        roughness={0.9}
        metalness={0.0}
      />
    </mesh>
    <mesh position={[0, 8, 0]} castShadow>
      <coneGeometry args={[2.5, 5, 8]} />
      <meshStandardMaterial 
        color="#1a4d26"
        roughness={0.85}
        metalness={0.0}
      />
    </mesh>
    <mesh position={[0, 9.5, 0]} castShadow>
      <coneGeometry args={[1.8, 4, 8]} />
      <meshStandardMaterial 
        color="#2d6a3e"
        roughness={0.8}
        metalness={0.0}
      />
    </mesh>
  </group>
);

const Rock = (props) => (
  <mesh {...props} castShadow receiveShadow>
    <dodecahedronGeometry args={[1.5, 0]} />
    <meshStandardMaterial 
      color="#5a5a5a"
      roughness={0.9}
      metalness={0.1}
    />
  </mesh>
);

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

// Audio controller component that runs inside Canvas
const AudioController = ({ phase, phaseProgress }) => {
  const audioRef = useRef();

  useEffect(() => {
    const audio = new Audio('/audio/ambient-drive.mp3');
    audio.loop = true;
    audio.volume = 0.1;
    audio.play().catch(e => console.log("Audio autoplay blocked - user interaction required"));
    audioRef.current = audio;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useFrame(() => {
    if (!audioRef.current) return;
    let targetVolume = 0.1;
    if (phase === 'inhale') {
      targetVolume = 0.1 + phaseProgress * 0.3;
    } else if (phase === 'exhale') {
      targetVolume = 0.1 + (1 - phaseProgress) * 0.3;
    }
    audioRef.current.volume = Math.max(0, Math.min(0.5, THREE.MathUtils.lerp(audioRef.current.volume, targetVolume, 0.1)));
  });

  return null;
};

// Scene controller for camera, lighting, and road movement
const SceneController = ({ sunRef, roadRef, roadCurve }) => {
  // Cache curve points to avoid per-frame allocation
  const curvePoints = useMemo(() => roadCurve.getPoints(512), [roadCurve]);
  
  useFrame((state, delta) => {
    if (sunRef.current) {
      const cycleSpeed = 0.05;
      sunRef.current.position.y = Math.sin(state.clock.elapsedTime * cycleSpeed) * 20;
      sunRef.current.position.x = Math.cos(state.clock.elapsedTime * cycleSpeed) * 20;
      const intensity = (Math.sin(state.clock.elapsedTime * cycleSpeed) + 1) / 2 * 0.9 + 0.1;
      sunRef.current.intensity = intensity;
    }

    if(roadRef.current) {
        roadRef.current.position.z += delta * 15;
        if (roadRef.current.position.z > 20) {
            roadRef.current.position.z = -3980;
        }
    }

    // Find closest point on curve for camera positioning (reuse cached points)
    let closestPoint = null;
    let minDz = Infinity;
    const lookAtZ = 10 - (roadRef.current ? roadRef.current.position.z : 0);

    for (let i = 0; i < curvePoints.length; i++) {
        const dz = Math.abs(curvePoints[i].z - lookAtZ);
        if (dz < minDz) {
            minDz = dz;
            closestPoint = curvePoints[i];
        }
    }

    const roadCenterX = closestPoint ? closestPoint.x : 0;

    // Steering
    const targetX = roadCenterX + state.mouse.x * 8;
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, targetX, 0.1);

    if (closestPoint) {
      state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, closestPoint.y + 1.5, 0.1);
    }
  });

  return null;
};

const MindfulDrive = () => {
  const [isRunning, setIsRunning] = useState(true);
  const [phase, setPhase] = useState('inhale');
  const [phaseProgress, setPhaseProgress] = useState(0);
  const [timeOfDay, setTimeOfDay] = useState('day');

  const sunRef = useRef();
  const roadRef = useRef();

  const roadCurve = useMemo(() => {
      const points = [];
      const segments = 200;
      const segmentLength = 20;
      const curveAmplitude = 15;

      for (let i = 0; i < segments; i++) {
          const x = Math.sin((i / segments) * Math.PI * 10) * curveAmplitude;
          const z = -i * segmentLength;
          points.push(new THREE.Vector3(x, -0.5, z));
      }
      return new THREE.CatmullRomCurve3(points);
  }, []);

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
      <div style={{ height: '80vh', width: '100%', background: '#050505' }}>
        <Canvas 
          camera={{ position: [0, 1, 10], fov: 60 }}
          shadows
          gl={{ 
            antialias: true,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.0
          }}
        >
          <Suspense fallback={null}>
            {/* HDRI Environment for realistic lighting */}
            <Environment preset="sunset" background blur={0.6} />
            
            {/* Stars for atmospheric depth */}
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            
            {/* Clouds for atmosphere */}
            <Cloud opacity={0.3} speed={0.4} width={10} depth={1.5} segments={20} position={[0, 15, -30]} color="#1a1a2e" />
            <Cloud opacity={0.25} speed={0.3} width={12} depth={1.8} segments={20} position={[20, 12, -50]} color="#1a1a2e" />

            {/* Enhanced Lighting Setup */}
            <ambientLight intensity={0.2} />
            <directionalLight 
              ref={sunRef} 
              position={[10, 10, 5]} 
              intensity={1.5}
              castShadow
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
              shadow-camera-far={50}
              shadow-camera-left={-20}
              shadow-camera-right={20}
              shadow-camera-top={20}
              shadow-camera-bottom={-20}
            />
            
            {/* Rim lights for cinematic effect */}
            <pointLight position={[-10, 2, 5]} intensity={1.5} color="#00ffff" distance={30} decay={2} />
            <pointLight position={[10, 2, 5]} intensity={1.2} color="#ff6b35" distance={30} decay={2} />
            <spotLight 
              position={[0, 15, 10]} 
              angle={0.3} 
              penumbra={1} 
              intensity={2}
              color="#ffffff"
              castShadow
            />

            {/* Game Scene */}
            <Road roadRef={roadRef} curve={roadCurve} />
            <Scenery />
            <XP_Embers />
            <DashboardLight phase={phase} phaseProgress={phaseProgress} />
            <AudioController phase={phase} phaseProgress={phaseProgress} />
            <SceneController sunRef={sunRef} roadRef={roadRef} roadCurve={roadCurve} />

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

            <Text 
              color="white" 
              fontSize={0.5} 
              position={[0, 2, 0]}
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.02}
              outlineColor="#000000"
            >
              {phaseText}
            </Text>

            {/* Post-Processing Effects */}
            <EffectComposer disableNormalPass>
              <Bloom 
                luminanceThreshold={0.2} 
                mipmapBlur 
                intensity={1.5} 
                radius={0.6}
                levels={8}
              />
              <Noise opacity={0.025} />
              <Vignette eskil={false} offset={0.15} darkness={1.0} />
            </EffectComposer>
          </Suspense>
        </Canvas>
      </div>
    </>
  );
};

export default MindfulDrive;
