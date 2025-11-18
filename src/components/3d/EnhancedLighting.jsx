import React from 'react';
import { Environment, ContactShadows, AccumulativeShadows, RandomizedLight } from '@react-three/drei';

export const GarageLighting = ({ intensity = 1.2, shadowOpacity = 0.4 }) => {
  return (
    <>
      <Environment preset="warehouse" />
      
      <ambientLight intensity={0.3 * intensity} />
      
      <directionalLight
        position={[10, 10, 5]}
        intensity={1.5 * intensity}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      
      <spotLight
        position={[0, 15, 0]}
        angle={0.5}
        penumbra={1}
        intensity={0.8 * intensity}
        castShadow
      />
      
      <ContactShadows
        position={[0, -0.5, 0]}
        opacity={shadowOpacity}
        scale={30}
        blur={2}
        far={10}
      />
    </>
  );
};

export const DrivingLighting = ({ timeIntensity = 1, fogColor = '#1a82a1' }) => {
  return (
    <>
      <Environment preset="sunset" />
      
      <ambientLight intensity={0.2 * timeIntensity} />
      
      <directionalLight
        position={[10, 10, 5]}
        intensity={timeIntensity}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      
      <fog attach="fog" args={[fogColor, 15, 60]} />
    </>
  );
};

export const SoftShadows = ({ size = 25, opacity = 0.5 }) => {
  return (
    <AccumulativeShadows
      temporal
      frames={100}
      color="#000"
      colorBlend={2}
      toneMapped={true}
      alphaTest={0.75}
      opacity={opacity}
      scale={size}
      position={[0, -0.5, 0]}
    >
      <RandomizedLight
        amount={8}
        radius={4}
        ambient={0.5}
        intensity={1}
        position={[5, 5, -10]}
        bias={0.001}
      />
    </AccumulativeShadows>
  );
};
