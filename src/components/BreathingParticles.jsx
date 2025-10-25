import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const BreathingParticles = ({ phase, phaseProgress }) => {
  const embersRef = useRef();
  const sparksRef = useRef();
  const embersTimeRef = useRef(0);
  const sparksTimeRef = useRef(0);

  const emberCount = 200;
  const sparkCount = 150;

  const [emberPositions, emberVelocities, emberLifetimes] = useMemo(() => {
    const positions = new Float32Array(emberCount * 3);
    const velocities = new Float32Array(emberCount * 3);
    const lifetimes = new Float32Array(emberCount);

    for (let i = 0; i < emberCount; i++) {
      const i3 = i * 3;
      const angle = Math.random() * Math.PI * 2;
      const distance = 5 + Math.random() * 3;
      
      positions[i3] = Math.cos(angle) * distance;
      positions[i3 + 1] = Math.sin(angle) * distance;
      positions[i3 + 2] = (Math.random() - 0.5) * 2;

      velocities[i3] = -Math.cos(angle) * 2;
      velocities[i3 + 1] = -Math.sin(angle) * 2;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.5;

      lifetimes[i] = Math.random();
    }

    return [positions, velocities, lifetimes];
  }, []);

  const [sparkPositions, sparkVelocities, sparkLifetimes] = useMemo(() => {
    const positions = new Float32Array(sparkCount * 3);
    const velocities = new Float32Array(sparkCount * 3);
    const lifetimes = new Float32Array(sparkCount);

    for (let i = 0; i < sparkCount; i++) {
      const i3 = i * 3;
      positions[i3] = 0;
      positions[i3 + 1] = 0.5;
      positions[i3 + 2] = 0;

      const angle = Math.random() * Math.PI * 2;
      const spread = 0.5;
      velocities[i3] = Math.cos(angle) * spread;
      velocities[i3 + 1] = 1.5 + Math.random() * 0.5;
      velocities[i3 + 2] = Math.sin(angle) * spread;

      lifetimes[i] = Math.random();
    }

    return [positions, velocities, lifetimes];
  }, []);

  useFrame((state, delta) => {
    if (embersRef.current && phase === 'inhale') {
      embersTimeRef.current += delta;
      const positions = embersRef.current.geometry.attributes.position.array;
      const lifetimes = embersRef.current.geometry.attributes.lifetime.array;

      for (let i = 0; i < emberCount; i++) {
        const i3 = i * 3;
        
        lifetimes[i] -= delta * 0.5;
        
        if (lifetimes[i] <= 0) {
          const angle = Math.random() * Math.PI * 2;
          const distance = 5 + Math.random() * 3;
          positions[i3] = Math.cos(angle) * distance;
          positions[i3 + 1] = Math.sin(angle) * distance;
          positions[i3 + 2] = (Math.random() - 0.5) * 2;
          lifetimes[i] = 1.0;
        } else {
          const toCenter = new THREE.Vector3(
            -positions[i3],
            -0.5 - positions[i3 + 1],
            -positions[i3 + 2]
          ).normalize();
          
          const speed = (1 - lifetimes[i]) * 3;
          positions[i3] += toCenter.x * speed * delta;
          positions[i3 + 1] += toCenter.y * speed * delta;
          positions[i3 + 2] += toCenter.z * speed * delta;
        }
      }

      embersRef.current.geometry.attributes.position.needsUpdate = true;
      embersRef.current.geometry.attributes.lifetime.needsUpdate = true;
    }

    if (sparksRef.current && phase === 'exhale') {
      sparksTimeRef.current += delta;
      const positions = sparksRef.current.geometry.attributes.position.array;
      const velocities = sparksRef.current.geometry.attributes.velocity.array;
      const lifetimes = sparksRef.current.geometry.attributes.lifetime.array;

      for (let i = 0; i < sparkCount; i++) {
        const i3 = i * 3;
        
        lifetimes[i] -= delta * 0.8;
        
        if (lifetimes[i] <= 0) {
          positions[i3] = 0;
          positions[i3 + 1] = 0.5;
          positions[i3 + 2] = 0;
          
          const angle = Math.random() * Math.PI * 2;
          const spread = 0.5;
          velocities[i3] = Math.cos(angle) * spread;
          velocities[i3 + 1] = 1.5 + Math.random() * 0.5;
          velocities[i3 + 2] = Math.sin(angle) * spread;
          
          lifetimes[i] = 1.0;
        } else {
          positions[i3] += velocities[i3] * delta;
          positions[i3 + 1] += velocities[i3 + 1] * delta;
          positions[i3 + 2] += velocities[i3 + 2] * delta;
          
          velocities[i3 + 1] -= delta * 0.5;
        }
      }

      sparksRef.current.geometry.attributes.position.needsUpdate = true;
      sparksRef.current.geometry.attributes.lifetime.needsUpdate = true;
    }
  });

  return (
    <>
      {phase === 'inhale' && (
        <points ref={embersRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={emberCount}
              array={emberPositions}
              itemSize={3}
            />
            <bufferAttribute
              attach="attributes-velocity"
              count={emberCount}
              array={emberVelocities}
              itemSize={3}
            />
            <bufferAttribute
              attach="attributes-lifetime"
              count={emberCount}
              array={emberLifetimes}
              itemSize={1}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.08}
            color="#FFD700"
            transparent
            opacity={0.8}
            sizeAttenuation
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </points>
      )}

      {phase === 'exhale' && (
        <points ref={sparksRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={sparkCount}
              array={sparkPositions}
              itemSize={3}
            />
            <bufferAttribute
              attach="attributes-velocity"
              count={sparkCount}
              array={sparkVelocities}
              itemSize={3}
            />
            <bufferAttribute
              attach="attributes-lifetime"
              count={sparkCount}
              array={sparkLifetimes}
              itemSize={1}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.05}
            color="#FFE8B3"
            transparent
            opacity={0.6}
            sizeAttenuation
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </points>
      )}
    </>
  );
};

export default BreathingParticles;
