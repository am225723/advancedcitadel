import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshStandardMaterial } from 'three'; // Import for standard material

function TestScene() {
  const meshRef = useRef();

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <>
      {/* Basic Red Box */}
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="hotpink" /> {/* A simple, visible material */}
      </mesh>
      
      {/* Light to illuminate the box */}
      <pointLight position={[5, 5, 5]} intensity={100} /> 
      <ambientLight intensity={1} /> {/* Even brighter ambient */}
    </>
  );
}

export default TestScene;
