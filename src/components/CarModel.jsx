import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useFBX, Bounds, Center } from '@react-three/drei';

const Model = () => {
  const fbx = useFBX('https://brywmjhsrnebfmhrhlmi.supabase.co/storage/v1/object/public/Citadel/FINAL_MODEL.fbx');
  // The manual scale prop is removed.
  return <primitive object={fbx} />;
};

const CarModel = () => {
  return (
    <Canvas>
      <Suspense fallback={null}>
        {/* Improved lighting for better visibility */}
        <ambientLight intensity={0.7} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} />
        <directionalLight position={[-10, -10, -5]} intensity={0.8} />

        {/* Bounds and Center will automatically handle scale and position */}
        <Bounds fit clip observe margin={1.2}>
          <Center>
            <Model />
          </Center>
        </Bounds>

        <OrbitControls makeDefault />
      </Suspense>
    </Canvas>
  );
};

export default CarModel;
