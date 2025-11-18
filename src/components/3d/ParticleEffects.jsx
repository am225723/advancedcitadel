import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const SparkleParticles = ({ count = 50, color = '#ffeb3b' }) => {
  const pointsRef = useRef();
  
  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = Math.random() * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 40;
    }
    return positions;
  }, [count]);
  
  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.05;
      
      const positions = pointsRef.current.geometry.attributes.position.array;
      for (let i = 0; i < count; i++) {
        positions[i * 3 + 1] = Math.abs(Math.sin(state.clock.elapsedTime + i) * 10);
      }
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });
  
  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.length / 3}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial 
        size={0.15}
        color={color}
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export const WaterDroplets = ({ count = 100, active = false }) => {
  const pointsRef = useRef();
  
  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 1] = Math.random() * 10 + 5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
      
      velocities[i * 3] = 0;
      velocities[i * 3 + 1] = -0.1 - Math.random() * 0.05;
      velocities[i * 3 + 2] = 0;
    }
    
    return { positions, velocities };
  }, [count]);
  
  useFrame((state, delta) => {
    if (pointsRef.current && active) {
      const positions = pointsRef.current.geometry.attributes.position.array;
      const { velocities } = particles;
      
      for (let i = 0; i < count; i++) {
        positions[i * 3 + 1] += velocities[i * 3 + 1];
        
        if (positions[i * 3 + 1] < -2) {
          positions[i * 3 + 1] = 15;
        }
      }
      
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });
  
  return active ? (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.positions.length / 3}
          array={particles.positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial 
        size={0.08}
        color="#4fc3f7"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  ) : null;
};
