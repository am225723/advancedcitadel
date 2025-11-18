import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Cylinder, Cone, Box, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { createCurvedWorldMaterial, updateCurvedMaterial } from './CurvedWorldShader';

export const EnhancedTree = ({ position, curvature = 0.00008 }) => {
  const groupRef = useRef();
  const trunkMat = useMemo(() => createCurvedWorldMaterial('#4a2e1a', curvature), [curvature]);
  const leavesMat = useMemo(() => createCurvedWorldMaterial('#2d5016', curvature), [curvature]);
  
  useFrame((state, delta) => {
    updateCurvedMaterial(trunkMat, delta);
    updateCurvedMaterial(leavesMat, delta);
  });
  
  return (
    <group ref={groupRef} position={position}>
      <Cylinder args={[0.4, 0.5, 8, 8]} position={[0, 4, 0]}>
        <primitive object={trunkMat} attach="material" />
      </Cylinder>
      
      <Cone args={[2.5, 4, 8]} position={[0, 9, 0]}>
        <primitive object={leavesMat} attach="material" />
      </Cone>
      <Cone args={[2, 3.5, 8]} position={[0, 11, 0]}>
        <primitive object={leavesMat} attach="material" />
      </Cone>
      <Cone args={[1.5, 3, 8]} position={[0, 12.5, 0]}>
        <primitive object={leavesMat} attach="material" />
      </Cone>
    </group>
  );
};

export const EnhancedRock = ({ position, curvature = 0.00008 }) => {
  const rockMat = useMemo(() => createCurvedWorldMaterial('#6b6b6b', curvature), [curvature]);
  
  useFrame((state, delta) => {
    updateCurvedMaterial(rockMat, delta);
  });
  
  const scale = useMemo(() => [
    0.8 + Math.random() * 0.6,
    0.6 + Math.random() * 0.4,
    0.8 + Math.random() * 0.6
  ], []);
  
  return (
    <Box args={[2, 2, 2]} position={position} scale={scale} rotation={[0, Math.random() * Math.PI, 0]}>
      <primitive object={rockMat} attach="material" />
    </Box>
  );
};

export const EnhancedStreetLight = ({ position, curvature = 0.00008 }) => {
  const poleMat = useMemo(() => createCurvedWorldMaterial('#333333', curvature), [curvature]);
  
  useFrame((state, delta) => {
    updateCurvedMaterial(poleMat, delta);
  });
  
  return (
    <group position={position}>
      <Cylinder args={[0.15, 0.15, 12, 8]} position={[0, 6, 0]}>
        <primitive object={poleMat} attach="material" />
      </Cylinder>
      
      <Sphere args={[0.6, 16, 16]} position={[0, 12.5, 0]}>
        <meshStandardMaterial 
          color="#ffeb3b" 
          emissive="#ffeb3b" 
          emissiveIntensity={2}
          toneMapped={false}
        />
      </Sphere>
      
      <pointLight position={[0, 12, 0]} intensity={3} distance={20} color="#ffeb3b" />
    </group>
  );
};

export const EnhancedCloud = ({ position }) => {
  const groupRef = useRef();
  
  useFrame((state) => {
    groupRef.current.position.x = position[0] + Math.sin(state.clock.elapsedTime * 0.1) * 2;
  });
  
  return (
    <group ref={groupRef} position={position}>
      <Sphere args={[3, 16, 16]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#ffffff" opacity={0.7} transparent />
      </Sphere>
      <Sphere args={[2.5, 16, 16]} position={[-2, 0, 0]}>
        <meshStandardMaterial color="#ffffff" opacity={0.6} transparent />
      </Sphere>
      <Sphere args={[2.5, 16, 16]} position={[2, 0, 0]}>
        <meshStandardMaterial color="#ffffff" opacity={0.6} transparent />
      </Sphere>
    </group>
  );
};
