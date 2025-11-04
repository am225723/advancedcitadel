import React, { useRef, Suspense, useLayoutEffect, useEffect, useState } from 'react'; // Added useState
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import { TextureLoader } from 'three';
import * as THREE from 'three';

const SoulParticles = () => null;

// BillboardFlame component remains unchanged
const BillboardFlame = ({ texture, position, scale, rotationZ, opacity, emissiveIntensity, color, emissiveColor, time }) => {
  const meshRef = useRef();
  const { camera } = useThree();

  useFrame(() => {
    if (meshRef.current) {
      camera.updateMatrixWorld();
      meshRef.current.lookAt(camera.position);

      if (texture) {
        texture.offset.y = (-time * 0.2 + (position.y * 0.1)) % 1;
      }
    }
  });

  return (
    <mesh position={position} scale={scale} rotation-z={rotationZ} ref={meshRef}>
      <planeGeometry args={[0.8, 2.5]} /> {/* Taller, narrower plane */}
      <meshStandardMaterial
        transparent
        map={texture}
        emissiveMap={texture}
        color={color}
        emissive={emissiveColor}
        emissiveIntensity={emissiveIntensity}
        opacity={opacity}
        blending={THREE.NormalBlending}
        side={THREE.DoubleSide}
        depthWrite={false}
        alphaTest={0.01}
      />
    </mesh>
  );
};


const PremiumSoulFlame = ({ phase, phaseProgress, isRunning }) => {
  const coreMeshRef = useRef();
  const pointLightRef = useRef();
  const timeRef = useRef(0);

  // --- CRITICAL FIX: Declare state variables with useState ---
  const [currentFlameScaleX, setCurrentFlameScaleX] = useState(0.6); // Initialize X scale
  const [currentFlameScaleY, setCurrentFlameScaleY] = useState(0.6); // Initialize Y scale
  // --- END CRITICAL FIX ---

  const [currentFlameOpacity, setCurrentFlameOpacity] = useState(0.85);
  const [currentFlameEmissiveIntensity, setCurrentFlameEmissiveIntensity] = useState(0.3);
  const [currentFlameColor, setCurrentFlameColor] = useState(new THREE.Color('#FFFAF0'));
  const [currentFlameEmissiveColor, setCurrentFlameEmissiveColor] = useState(new THREE.Color('#FFE8B8'));

  const [currentCoreScale, setCurrentCoreScale] = useState(0.4);
  const [currentCoreOpacity, setCurrentCoreOpacity] = useState(0.7);
  const [currentCoreEmissiveIntensity, setCurrentCoreEmissiveIntensity] = useState(0.4);
  const [currentCoreColor, setCurrentCoreColor] = useState(new THREE.Color('#FFFAF0'));
  const [currentCoreEmissiveColor, setCurrentCoreEmissiveColor] = useState(new THREE.Color('#FFE8B8'));

  const [currentLightIntensity, setCurrentLightIntensity] = useState(1.0);
  const [currentLightColor, setCurrentLightColor] = useState(new THREE.Color('#FFE8B8'));

  const flameTextureUrl = 'https://brywmjhsrnebfmhrhlmi.supabase.co/storage/v1/object/public/Citadel/flame_texture.png';
  const flameTexture = useLoader(TextureLoader, flameTextureUrl);

  useLayoutEffect(() => {
    if (flameTexture) {
      flameTexture.wrapS = flameTexture.wrapT = THREE.RepeatWrapping;
      flameTexture.repeat.set(1, 2); // Repeat vertically
      flameTexture.premultiplyAlpha = true;
      flameTexture.needsUpdate = true;
      console.log("Using flame texture from YOUR Supabase:", flameTextureUrl);
      console.log("Supabase Flame texture loaded successfully:", flameTexture);
    }
  }, [flameTexture, flameTextureUrl]);

  useFrame((state, delta) => {
    timeRef.current += delta;

    let targetCoreScale = 0.4;
    let targetCoreOpacity = 0.7;
    let targetCoreEmissiveIntensity = 0.4;
    let targetCoreColor = new THREE.Color(currentCoreColor);
    let targetCoreEmissiveColor = new THREE.Color(currentCoreEmissiveColor);

    let targetFlameScaleX = 0.7;
    let targetFlameScaleY = 0.8;
    let targetFlameOpacity = 0.85;
    let targetFlameEmissiveIntensity = 0.3;
    let targetFlameColor = new THREE.Color(currentFlameColor);
    let targetFlameEmissiveColor = new THREE.Color(currentFlameEmissiveColor);

    let targetLightIntensity = 1.0;
    let targetLightColor = new THREE.Color(currentLightColor);

    if (isRunning) {
      switch (phase) {
        case 'inhale':
          targetCoreScale = 0.4 + (phaseProgress * 0.6);
          targetCoreOpacity = 0.7 + (phaseProgress * 0.15);
          targetCoreEmissiveIntensity = 0.4 + (phaseProgress * 0.4);
          targetCoreColor.lerpColors(new THREE.Color('#FFFAF0'), new THREE.Color('#FFFFFF'), phaseProgress);
          targetCoreEmissiveColor.lerpColors(new THREE.Color('#FFE8B8'), new THREE.Color('#FFF4D0'), phaseProgress);

          targetFlameScaleX = 0.7 + (phaseProgress * 0.3);
          targetFlameScaleY = 0.8 + (phaseProgress * 1.0);
          targetFlameOpacity = 0.85 + (phaseProgress * 0.1);
          targetFlameEmissiveIntensity = 0.3 + (phaseProgress * 0.4);
          targetFlameColor.lerpColors(new THREE.Color('#FFFAF0'), new THREE.Color('#FFFFFF'), phaseProgress);
          targetFlameEmissiveColor.lerpColors(new THREE.Color('#FFE8B8'), new THREE.Color('#FFF4D0'), phaseProgress);

          targetLightIntensity = 1.0 + (phaseProgress * 0.8);
          targetLightColor.lerpColors(new THREE.Color('#FFE8B8'), new THREE.Color('#FFF4D0'), phaseProgress);
          break;
        case 'hold':
        case 'holdAfter':
          const pulse = Math.sin(timeRef.current * 2.5) * 0.03;
          targetCoreScale = 1.0 + pulse;
          targetCoreOpacity = 0.85;
          targetCoreEmissiveIntensity = 0.8 + pulse * 0.1;
          targetCoreColor = new THREE.Color('#FFFFFF');
          targetCoreEmissiveColor = new THREE.Color('#FFF4D0');

          targetFlameScaleX = 1.0 + pulse * 0.05;
          targetFlameScaleY = 1.8 + pulse * 0.1;
          targetFlameOpacity = 0.95;
          targetFlameEmissiveIntensity = 0.7 + pulse * 0.1;
          targetFlameColor = new THREE.Color('#FFFFFF');
          targetFlameEmissiveColor = new THREE.Color('#FFF4D0');

          targetLightIntensity = 1.8 + pulse * 0.2;
          targetLightColor = new THREE.Color('#FFF4D0');
          break;
        case 'exhale':
          targetCoreScale = 1.0 - (phaseProgress * 0.6);
          targetCoreOpacity = 0.85 - (phaseProgress * 0.15);
          targetCoreEmissiveIntensity = 0.8 - (phaseProgress * 0.4);
          targetCoreColor.lerpColors(new THREE.Color('#FFFFFF'), new THREE.Color('#FFFAF0'), phaseProgress);
          targetCoreEmissiveColor.lerpColors(new THREE.Color('#FFF4D0'), new THREE.Color('#FFE8B8'), phaseProgress);

          targetFlameScaleX = 1.0 - (phaseProgress * 0.3);
          targetFlameScaleY = 1.8 - (phaseProgress * 1.0);
          targetFlameOpacity = 0.95 - (phaseProgress * 0.1);
          targetFlameEmissiveIntensity = 0.7 - (phaseProgress * 0.4);
          targetFlameColor.lerpColors(new THREE.Color('#FFFFFF'), new THREE.Color('#FFFAF0'), phaseProgress);
          targetFlameEmissiveColor.lerpColors(new THREE.Color('#FFF4D0'), new THREE.Color('#FFE8B8'), phaseProgress);

          targetLightIntensity = 1.8 - (phaseProgress * 0.8);
          targetLightColor.lerpColors(new THREE.Color('#FFF4D0'), new THREE.Color('#FFE8B8'), phaseProgress);
          break;
        default:
          break;
      }
    }

    const lerpSpeed = delta * 3;

    // Update state variables
    setCurrentCoreScale(THREE.MathUtils.lerp(currentCoreScale, targetCoreScale, lerpSpeed));
    setCurrentCoreOpacity(THREE.MathUtils.lerp(currentCoreOpacity, targetCoreOpacity, lerpSpeed));
    setCurrentCoreEmissiveIntensity(THREE.MathUtils.lerp(currentCoreEmissiveIntensity, targetCoreEmissiveIntensity, lerpSpeed));
    setCurrentCoreColor(currentCoreColor.lerp(targetCoreColor, lerpSpeed));
    setCurrentCoreEmissiveColor(currentCoreEmissiveColor.lerp(targetCoreEmissiveColor, lerpSpeed));

    setCurrentFlameScaleX(THREE.MathUtils.lerp(currentFlameScaleX, targetFlameScaleX, lerpSpeed));
    setCurrentFlameScaleY(THREE.MathUtils.lerp(currentFlameScaleY, targetFlameScaleY, lerpSpeed));
    setCurrentFlameOpacity(THREE.MathUtils.lerp(currentFlameOpacity, targetFlameOpacity, lerpSpeed));
    setCurrentFlameEmissiveIntensity(THREE.MathUtils.lerp(currentFlameEmissiveIntensity, targetFlameEmissiveIntensity, lerpSpeed));
    setCurrentFlameColor(currentFlameColor.lerp(targetFlameColor, lerpSpeed));
    setCurrentFlameEmissiveColor(currentFlameEmissiveColor.lerp(targetFlameEmissiveColor, lerpSpeed));

    setCurrentLightIntensity(THREE.MathUtils.lerp(currentLightIntensity, targetLightIntensity, delta * 3));
    setCurrentLightColor(currentLightColor.lerp(targetLightColor, lerpSpeed));

    // Apply updated properties directly (optional, but can be smoother)
    if (coreMeshRef.current && coreMeshRef.current.material) {
      coreMeshRef.current.scale.set(currentCoreScale, currentCoreScale * 1.5, currentCoreScale);
      coreMeshRef.current.material.opacity = currentCoreOpacity;
      coreMeshRef.current.material.emissiveIntensity = currentCoreEmissiveIntensity;
      coreMeshRef.current.material.color = currentCoreColor;
      coreMeshRef.current.material.emissive = currentCoreEmissiveColor;
    }

    if (pointLightRef.current) {
      pointLightRef.current.intensity = currentLightIntensity;
      pointLightRef.current.color = currentLightColor;
    }
  });

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
          blending={THREE.NormalBlending}
          side={THREE.DoubleSide}
          depthWrite={false}
          alphaTest={0.1}
        />
      </mesh>

      {/* Textured Flame Billboards - layered for depth */}
      <Suspense fallback={null}>
        <BillboardFlame
          texture={flameTexture}
          position={[0, 0.2, 0]}
          // --- CRITICAL FIX: Use state variables for scale ---
          scale={[currentFlameScaleX, currentFlameScaleY, 1]}
          rotationZ={0}
          opacity={currentFlameOpacity}
          emissiveIntensity={currentFlameEmissiveIntensity}
          color={currentFlameColor}
          emissiveColor={currentFlameEmissiveColor}
          time={timeRef.current}
        />
        <BillboardFlame
          texture={flameTexture}
          position={[0.1, 0.25, 0]}
          scale={[currentFlameScaleX * 0.9, currentFlameScaleY * 0.9, 1]}
          rotationZ={Math.PI / 4}
          opacity={currentFlameOpacity * 0.9}
          emissiveIntensity={currentFlameEmissiveIntensity * 0.9}
          color={currentFlameColor}
          emissiveColor={currentFlameEmissiveColor}
          time={timeRef.current + 5}
        />
        <BillboardFlame
          texture={flameTexture}
          position={[-0.1, 0.15, 0]}
          scale={[currentFlameScaleX * 0.95, currentFlameScaleY * 0.95, 1]}
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
      <Suspense fallback={null}>
        <SoulParticles phase={phase} isRunning={isRunning} time={timeRef.current} />
      </Suspense>
    </group>
  );
};

export default PremiumSoulFlame;
