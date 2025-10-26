import React, { useRef, Suspense, useLayoutEffect, useEffect, useState } from 'react';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import { TextureLoader } from 'three';
import * as THREE from 'three';

// A component for each textured flame plane (billboard) - remains mostly the same
const BillboardFlame = ({ texture, position, scale, rotationZ, opacity, emissiveIntensity, color, emissiveColor }) => {
  const meshRef = useRef();
  const { camera } = useThree(); 

  useFrame(() => {
    if (meshRef.current) {
      camera.updateMatrixWorld(); 
      meshRef.current.lookAt(camera.position); 
    }
  });

  return (
    <mesh position={position} scale={scale} rotation-z={rotationZ} ref={meshRef}> 
      <planeGeometry args={[1, 1.5]} />
      <meshStandardMaterial
        transparent
        map={texture}
        emissiveMap={texture} 

        color={color} 
        emissive={emissiveColor} 
        emissiveIntensity={emissiveIntensity} 
        opacity={opacity} 

        blending={THREE.AdditiveBlending} 
        side={THREE.DoubleSide}
        depthWrite={false}
        alphaTest={0.01} 
      />
    </mesh>
  );
};


// Modified PremiumSoulFlame component for minimal debugging
const PremiumSoulFlame = ({ isDebugging }) => { // Accept isDebugging prop
  // --- TEST: Using a simple, publicly available transparent PNG (a checkerboard) ---
  // If even this doesn't show up, there's a deeper WebGL problem.
  const testTextureUrl = 'https://upload.wikimedia.org/wikipedia/commons/4/47/PNG_transparency_demonstration_1.png'; 

  const flameTexture = useLoader(TextureLoader, testTextureUrl);

  useLayoutEffect(() => {
    if (flameTexture) {
      flameTexture.wrapS = flameTexture.wrapT = THREE.RepeatWrapping;
      flameTexture.repeat.set(1, 1); 
      flameTexture.premultiplyAlpha = true; 
      flameTexture.needsUpdate = true;

      console.log("Using TEST texture from:", testTextureUrl);
      console.log("TEST texture loaded successfully:", flameTexture);
    }
  }, [flameTexture, testTextureUrl]); 

  if (isDebugging) {
    // In debug mode, just render one simple BillboardFlame
    return (
      <BillboardFlame 
        texture={flameTexture} 
        position={[0, 0, 0]} // Center it
        scale={[2, 2, 2]} // Make it large
        rotationZ={0} 
        opacity={1.0} 
        emissiveIntensity={2.0} // Ensure it's bright
        color={new THREE.Color(1,1,1)} 
        emissiveColor={new THREE.Color(1,1,1)} 
      />
    );
  }

  // --- Original production code (or a placeholder for it) ---
  // This part would be uncommented once debugging is done
  const coreMeshRef = useRef(); 
  const pointLightRef = useRef();
  const timeRef = useRef(0);

  const [currentFlameScale, setCurrentFlameScale] = useState(0.7);
  const [currentFlameOpacity, setCurrentFlameOpacity] = useState(0.8);
  const [currentFlameEmissiveIntensity, setCurrentFlameEmissiveIntensity] = useState(0.5);
  const [currentFlameColor, setCurrentFlameColor] = useState(new THREE.Color('#FF8000'));
  const [currentFlameEmissiveColor, setCurrentFlameEmissiveColor] = useState(new THREE.Color('#FFA040'));

  const [currentCoreScale, setCurrentCoreScale] = useState(0.3);
  const [currentCoreOpacity, setCurrentCoreOpacity] = useState(0.8);
  const [currentCoreEmissiveIntensity, setCurrentCoreEmissiveIntensity] = useState(0.5);
  const [currentCoreColor, setCurrentCoreColor] = useState(new THREE.Color('#FF8000'));
  const [currentCoreEmissiveColor, setCurrentCoreEmissiveColor] = useState(new THREE.Color('#FFA040'));

  const [currentLightIntensity, setCurrentLightIntensity] = useState(0.8);
  const [currentLightColor, setCurrentLightColor] = useState(new THREE.Color('#FFC080'));

  // Use your Supabase texture here in production mode
  const productionFlameTextureUrl = 'https://brywmjhsrnebfmhrhlmi.supabase.co/storage/v1/object/public/Citadel/flame_texture.png';
  const productionFlameTexture = useLoader(TextureLoader, productionFlameTextureUrl);


  useFrame((state, delta) => {
    timeRef.current += delta;

    let targetCoreScale = 0.3;
    let targetCoreOpacity = 0.8;
    let targetCoreEmissiveIntensity = 0.5;
    let targetCoreColor = new THREE.Color(currentCoreColor); 
    let targetCoreEmissiveColor = new THREE.Color(currentCoreEmissiveColor);

    let targetFlameScale = 0.7; 
    let targetFlameOpacity = 0.8; 
    let targetFlameEmissiveIntensity = 0.5;
    let targetFlameColor = new THREE.Color('#FF8000');
    let targetFlameEmissiveColor = new THREE.Color('#FFA040');

    let targetLightIntensity = 0.8;
    let targetLightColor = new THREE.Color(currentLightColor);

    // ... (rest of your original animation logic, unchanged) ...

    const lerpSpeed = delta * 5;

    setCurrentCoreScale(THREE.MathUtils.lerp(currentCoreScale, targetCoreScale, lerpSpeed));
    setCurrentCoreOpacity(THREE.MathUtils.lerp(currentCoreOpacity, targetCoreOpacity, lerpSpeed));
    setCurrentCoreEmissiveIntensity(THREE.MathUtils.lerp(currentCoreEmissiveIntensity, targetCoreEmissiveIntensity, lerpSpeed));
    setCurrentCoreColor(currentCoreColor.lerp(targetCoreColor, lerpSpeed));
    setCurrentCoreEmissiveColor(currentCoreEmissiveColor.lerp(targetCoreEmissiveColor, lerpSpeed));

    setCurrentFlameScale(THREE.MathUtils.lerp(currentFlameScale, targetFlameScale, lerpSpeed));
    setCurrentFlameOpacity(THREE.MathUtils.lerp(currentFlameOpacity, targetFlameOpacity, lerpSpeed));
    setCurrentFlameEmissiveIntensity(THREE.MathUtils.lerp(currentFlameEmissiveIntensity, targetFlameEmissiveIntensity, lerpSpeed));
    setCurrentFlameColor(currentFlameColor.lerp(targetFlameColor, lerpSpeed));
    setCurrentFlameEmissiveColor(currentFlameEmissiveColor.lerp(targetFlameEmissiveColor, lerpSpeed));

    setCurrentLightIntensity(THREE.MathUtils.lerp(currentLightIntensity, targetLightIntensity, delta * 3));
    setCurrentLightColor(currentLightColor.lerp(targetLightColor, lerpSpeed));

    if (coreMeshRef.current) { 
      coreMeshRef.current.scale.set(currentCoreScale, currentCoreScale * 1.5, currentCoreScale);
      if (coreMeshRef.current.material) { 
        coreMeshRef.current.material.opacity = currentCoreOpacity;
        coreMeshRef.current.material.emissiveIntensity = currentCoreEmissiveIntensity;
        coreMeshRef.current.material.color = currentCoreColor;
        coreMeshRef.current.material.emissive = currentCoreEmissiveColor;
      }
    }

    if (pointLightRef.current) {
      pointLightRef.current.intensity = currentLightIntensity;
      pointLightRef.current.color = currentLightColor;
    }
  });


  // Only render this if not in debugging mode
  return (
    <group position={[0, -0.5, 0]}>
      {/* Central Glowing Orb */}
      <mesh ref={coreMeshRef} scale={[currentCoreScale, currentCoreScale * 1.5, currentCoreScale]}>
        <sphereGeometry args={[1, 64, 128]} />
        <meshStandardMaterial
          transparent
          color={currentCoreColor}
          emissive={currentCoreEmissiveColor}
          emissiveIntensity={currentCoreEmissiveIntensity}
          opacity={currentCoreOpacity}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
          depthWrite={false}
          alphaTest={0.1}
        />
      </mesh>

      {/* Textured Flame Billboards - layered for depth */}
      <Suspense fallback={null}> 
        <BillboardFlame 
          texture={productionFlameTexture} // Use production texture here
          position={[0, 0.2, 0]} 
          scale={[currentFlameScale, currentFlameScale * 1.5, currentFlameScale]} 
          rotationZ={0} 
          opacity={currentFlameOpacity} 
          emissiveIntensity={currentFlameEmissiveIntensity} 
          color={currentFlameColor} 
          emissiveColor={currentFlameEmissiveColor} 
          time={timeRef.current} 
        />
        <BillboardFlame 
          texture={productionFlameTexture} 
          position={[0.1, 0.25, 0]} 
          scale={[currentFlameScale * 0.9, currentFlameScale * 1.4, currentFlameScale * 0.9]} 
          rotationZ={Math.PI / 4} 
          opacity={currentFlameOpacity * 0.9} 
          emissiveIntensity={currentFlameEmissiveIntensity * 0.9} 
          color={currentFlameColor} 
          emissiveColor={currentFlameEmissiveColor} 
          time={timeRef.current + 5} 
        />
        <BillboardFlame 
          texture={productionFlameTexture} 
          position={[-0.1, 0.15, 0]} 
          scale={[currentFlameScale * 0.95, currentFlameScale * 1.6, currentFlameScale * 0.95]} 
          rotationZ={-Math.PI / 4} 
          opacity={currentFlameOpacity * 0.95} 
          emissiveIntensity={currentFlameEmissiveIntensity * 0.95} 
          color={currentFlameColor} 
          emissiveColor={currentFlameEmissiveColor} 
          time={timeRef.current + 10} 
        />
      </Suspense>

      <pointLight
        ref={pointLightRef}
        position={[0, 0.3, 0]}
        intensity={currentLightIntensity}
        distance={18}
        color={currentLightColor}
        decay={2}
      />
      {/* <Suspense fallback={null}> 
        <SoulParticles phase={phase} isRunning={isRunning} time={timeRef.current} />
      </Suspense> */} {/* Temporarily disable particles */}
    </group>
  );
};

export default PremiumSoulFlame;