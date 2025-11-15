import React, { Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useFBX, Bounds, Center } from '@react-three/drei';
import * as THREE from 'three';

const Model = ({ color }) => {
  const fbx = useFBX('https://brywmjhsrnebfmhrhlmi.supabase.co/storage/v1/object/public/Citadel/FINAL_MODEL.fbx');
  
  useEffect(() => {
    if (!fbx || !color) return;
    
    // Convert color name to hex
    const colorMap = {
      'Rally Red': '#DC2626',
      'Cosmic Blue': '#2563EB',
      'Shadow Black': '#0F172A',
      'Pearl White': '#F8FAFC',
      'Gold Rush': '#EAB308'
    };
    
    const hexColor = colorMap[color] || color;
    const threeColor = new THREE.Color(hexColor);
    
    // Traverse the model and update all mesh materials
    fbx.traverse((child) => {
      if (child.isMesh && child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(mat => {
            if (mat.color) {
              mat.color.set(threeColor);
              mat.needsUpdate = true;
            }
          });
        } else {
          if (child.material.color) {
            child.material.color.set(threeColor);
            child.material.needsUpdate = true;
          }
        }
      }
    });
  }, [fbx, color]);
  
  return <primitive object={fbx} />;
};

const CarModel = ({ color }) => {
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
            <Model color={color} />
          </Center>
        </Bounds>

        <OrbitControls makeDefault />
      </Suspense>
    </Canvas>
  );
};

export default CarModel;
