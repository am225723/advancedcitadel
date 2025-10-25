import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const GeometricOverlay = ({ phase, phaseProgress }) => {
  const innerCircleRef = useRef();
  const middleCircleRef = useRef();
  const outerCircleRef = useRef();
  const linesRef = useRef();

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;
    
    if (innerCircleRef.current) {
      innerCircleRef.current.rotation.z = time * 0.1;
      const pulseScale = 1 + Math.sin(time * 2) * 0.02;
      innerCircleRef.current.scale.set(pulseScale, pulseScale, 1);
    }

    if (middleCircleRef.current) {
      middleCircleRef.current.rotation.z = -time * 0.15;
    }

    if (outerCircleRef.current) {
      outerCircleRef.current.rotation.z = time * 0.08;
    }

    if (linesRef.current) {
      linesRef.current.rotation.z = time * 0.05;
    }
  });

  return (
    <group position={[0, -0.5, 0]}>
      <group ref={innerCircleRef}>
        <mesh rotation={[0, 0, 0]}>
          <ringGeometry args={[1.8, 1.85, 128]} />
          <meshBasicMaterial 
            color="#d4af37" 
            transparent 
            opacity={0.4}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      <group ref={middleCircleRef}>
        <mesh rotation={[0, 0, 0]}>
          <ringGeometry args={[2.3, 2.35, 128]} />
          <meshBasicMaterial 
            color="#d4af37" 
            transparent 
            opacity={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      <group ref={outerCircleRef}>
        <mesh rotation={[0, 0, 0]}>
          <ringGeometry args={[2.8, 2.85, 128]} />
          <meshBasicMaterial 
            color="#d4af37" 
            transparent 
            opacity={0.2}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      <group ref={linesRef}>
        {[0, 60, 120, 180, 240, 300].map((angle) => {
          const rad = (angle * Math.PI) / 180;
          const x1 = Math.cos(rad) * 1.6;
          const y1 = Math.sin(rad) * 1.6;
          const x2 = Math.cos(rad) * 3.0;
          const y2 = Math.sin(rad) * 3.0;

          return (
            <line key={angle}>
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  count={2}
                  array={new Float32Array([x1, y1, 0, x2, y2, 0])}
                  itemSize={3}
                />
              </bufferGeometry>
              <lineBasicMaterial 
                color="#d4af37" 
                transparent 
                opacity={0.15}
              />
            </line>
          );
        })}
      </group>
    </group>
  );
};

export default GeometricOverlay;
