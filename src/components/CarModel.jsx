import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useFBX } from '@react-three/drei';

const Model = () => {
  const fbx = useFBX('https://brywmjhsrnebfmhrhlmi.supabase.co/storage/v1/object/public/Citadel/FINAL_MODEL.fbx');
  return <primitive object={fbx} scale={0.01} />;
};

const CarModel = () => {
  return (
    <Canvas>
      <Suspense fallback={null}>
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
        <Model />
        <OrbitControls />
      </Suspense>
    </Canvas>
  );
};

export default CarModel;
