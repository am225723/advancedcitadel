import React, { useRef, Suspense, useLayoutEffect, useEffect } from 'react'; // Added useEffect
import { useFrame, useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei'; // Import useGLTF from drei

// SoulParticles is still a placeholder
const SoulParticles = () => null; 

// A small component to render each textured plane
const BillboardFlame = ({ texture, position, scale, rotationY, opacity, emissiveIntensity, color, emissiveColor, time }) => {
  const meshRef = useRef();

  useFrame(() => {
    if (meshRef.current) {
      // Make the plane always face the camera (billboard effect)
      meshRef.current.lookAt(new THREE.Vector3(0, 0, 7)); // Camera position, adjust as needed

      // Animate texture offset for a rising flame effect
      if (texture) {
        texture.offset.y = (time * 0.2 + (position.y * 0.1)) % 1; // Different scroll speed based on position
      }
    }
  });

  return (
    <mesh position={position} scale={scale} rotation-y={rotationY} ref={meshRef}>
      <planeGeometry args={[1, 1.5]} /> {/* A rectangular plane */}
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
        alphaTest={0.01} // Very low alpha test for smooth fade from black
      />
    </mesh>
  );
};


const PremiumSoulFlame = ({ phase, phaseProgress, isRunning }) => {
  const coreMeshRef = useRef(); // Ref for the central glowing orb
  const pointLightRef = useRef();
  const timeRef = useRef(0);

  // Load the flame texture from the Supabase URL
  const flameTexture = useLoader(TextureLoader, 'https://brywmjhsrnebfmhrhlmi.supabase.co/storage/v1/object/public/Citadel/flame_texture.png');

  useLayoutEffect(() => {
    if (flameTexture) {
      flameTexture.wrapS = flameTexture.wrapT = THREE.RepeatWrapping;
      flameTexture.repeat.set(1, 1); // Only repeat once per plane, if planes are stacked
    }
  }, [flameTexture]);

  useFrame((state, delta) => {
    timeRef.current += delta;

    let targetCoreScale = 0.3;
    let targetCoreOpacity = 0.8;
    let targetCoreEmissiveIntensity = 0.5;
    let targetCoreColor = new THREE.Color('#FF8000');
    let targetCoreEmissiveColor = new THREE.Color('#FFA040');

    let targetFlameOpacity = 0.8; // For the textured billboards
    let targetFlameEmissiveIntensity = 0.5;
    let targetFlameColor = new THREE.Color('#FF8000');
    let targetFlameEmissiveColor = new THREE.Color('#FFA040');

    let lightIntensity = 0.8;
    let lightColor = new THREE.Color('#FFC080');

    if (isRunning) {
      switch (phase) {
        case 'inhale':
          targetCoreScale = 0.3 + (phaseProgress * 0.3); 
          targetCoreOpacity = 0.8 + (phaseProgress * 0.2); 
          targetCoreEmissiveIntensity = 0.5 + (phaseProgress * 0.8); 
          targetCoreColor.lerpColors(new THREE.Color('#FF8000'), new THREE.Color('#FFD0A0'), phaseProgress);
          targetCoreEmissiveColor.lerpColors(new THREE.Color('#FFA040'), new THREE.Color('#FFFFB0'), phaseProgress);

          targetFlameOpacity = 0.8 + (phaseProgress * 0.2);
          targetFlameEmissiveIntensity = 0.5 + (phaseProgress * 0.8);
          targetFlameColor.lerpColors(new THREE.Color('#FF8000'), new THREE.Color('#FFD0A0'), phaseProgress);
          targetFlameEmissiveColor.lerpColors(new THREE.Color('#FFA040'), new THREE.Color('#FFFFB0'), phaseProgress);

          lightIntensity = 0.8 + (phaseProgress * 0.7); 
          lightColor.lerpColors(new THREE.Color('#FFC080'), new THREE.Color('#FFFFE0'), phaseProgress);
          break;
        case 'hold':
        case 'holdAfter':
          const pulse = Math.sin(timeRef.current * 2.5) * 0.03;
          targetCoreScale = 0.6 + pulse;
          targetCoreOpacity = 1.0;
          targetCoreEmissiveIntensity = 1.3 + pulse * 0.2;
          targetCoreColor = new THREE.Color('#FFD0A0');
          targetCoreEmissiveColor = new THREE.Color('#FFFFB0');

          targetFlameOpacity = 1.0;
          targetFlameEmissiveIntensity = 1.3 + pulse * 0.2;
          targetFlameColor = new THREE.Color('#FFD0A0');
          targetFlameEmissiveColor = new THREE.Color('#FFFFB0');

          lightIntensity = 1.5 + pulse * 0.1;
          lightColor = new THREE.Color('#FFFFE0');
          break;
        case 'exhale':
          targetCoreScale = 0.6 - (phaseProgress * 0.3);
          targetCoreOpacity = 1.0 - (phaseProgress * 0.2);
          targetCoreEmissiveIntensity = 1.3 - (phaseProgress * 0.8);
          targetCoreColor.lerpColors(new THREE.Color('#FFD0A0'), new THREE.Color('#FF8000'), phaseProgress);
          targetCoreEmissiveColor.lerpColors(new THREE.Color('#FFFFB0'), new THREE.Color('#FFA040'), phaseProgress);

          targetFlameOpacity = 1.0 - (phaseProgress * 0.2);
          targetFlameEmissiveIntensity = 1.3 - (phaseProgress * 0.8);
          targetFlameColor.lerpColors(new THREE.Color('#FFD0A0'), new THREE.Color('#FF8000'), phaseProgress);
          targetFlameEmissiveColor.lerpColors(new THREE.Color('#FFFFB0'), new THREE.Color('#FFA040'), phaseProgress);

          lightIntensity = 1.5 - (phaseProgress * 0.7);
          lightColor.lerpColors(new THREE.Color('#FFFFE0'), new THREE.Color('#FFC080'), phaseProgress);
          break;
        default:
          break;
      }
    }

    const lerpSpeed = delta * 5;

    // Animate central glowing orb
    if (coreMeshRef.current && coreMeshRef.current.material) {
      coreMeshRef.current.scale.lerp(
        new THREE.Vector3(targetCoreScale, targetCoreScale * 1.5, targetCoreScale),
        delta * 3
      );
      coreMeshRef.current.material.opacity = THREE.MathUtils.lerp(
        coreMeshRef.current.material.opacity,
        targetCoreOpacity,
        lerpSpeed
      );
      coreMeshRef.current.material.emissiveIntensity = THREE.MathUtils.lerp(
        coreMeshRef.current.material.emissiveIntensity,
        targetCoreEmissiveIntensity,
        lerpSpeed
      );
      coreMeshRef.current.material.color.lerp(targetCoreColor, lerpSpeed);
      coreMeshRef.current.material.emissive.lerp(targetCoreEmissiveColor, lerpSpeed);
    }

    // Animate point light
    if (pointLightRef.current) {
      pointLightRef.current.intensity = THREE.MathUtils.lerp(
        pointLightRef.current.intensity,
        lightIntensity,
        delta * 3
      );
      pointLightRef.current.color.lerp(lightColor, lerpSpeed);
    }
  });

  return (
    <group position={[0, -0.5, 0]}>
      {/* Central Glowing Orb */}
      <mesh ref={coreMeshRef} scale={[0.3, 0.45, 0.3]}>
        <sphereGeometry args={[1, 64, 128]} />
        <meshStandardMaterial
          transparent
          color="#FF8000"
          emissive="#FFA040"
          emissiveIntensity={0.5}
          opacity={0.8}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
          depthWrite={false}
          alphaTest={0.1}
        />
      </mesh>

      {/* Textured Flame Billboards - layered for depth */}
      <Suspense fallback={null}> {/* Suspense for texture loading */}
        {flameTexture && ( // Only render billboards if texture is loaded
          <>
            <BillboardFlame 
              texture={flameTexture} 
              position={[0, 0.0, 0]} 
              scale={[0.7, 0.7, 0.7]} 
              rotationY={0} 
              opacity={0.8} 
              emissiveIntensity={0.7} 
              color="#FFD0A0" 
              emissiveColor="#FFFFB0" 
              time={timeRef.current} 
            />
            <BillboardFlame 
              texture={flameTexture} 
              position={[0, 0.05, 0]} 
              scale={[0.65, 0.65, 0.65]} 
              rotationY={Math.PI / 3} // Rotate slightly
              opacity={0.7} 
              emissiveIntensity={0.6} 
              color="#FFB080" 
              emissiveColor="#FFE0C0" 
              time={timeRef.current + 10} // Offset time for different animation
            />
            <BillboardFlame 
              texture={flameTexture} 
              position={[0, 0.02, 0]} 
              scale={[0.75, 0.75, 0.75]} 
              rotationY={-Math.PI / 3} // Rotate opposite
              opacity={0.9} 
              emissiveIntensity={0.8} 
              color="#FF8000" 
              emissiveColor="#FFA040" 
              time={timeRef.current + 20}
            />
          </>
        )}
      </Suspense>

      <pointLight
        ref={pointLightRef}
        position={[0, 0.3, 0]}
        intensity={0.8}
        distance={18}
        color="#FFC080"
        decay={2}
      />
      <Suspense fallback={null}> 
        <SoulParticles phase={phase} isRunning={isRunning} time={timeRef.current} />
      </Suspense>
    </group>
  );
};

export default PremiumSoulFlame;
