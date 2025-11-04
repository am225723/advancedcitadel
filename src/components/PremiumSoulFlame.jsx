import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const PremiumSoulFlame = ({ phase, phaseProgress, isRunning }) => {
  const flameMeshRef = useRef();
  const shaderMaterialRef = useRef();
  const timeRef = useRef(0);

  // Custom shader with locked orange-amber colors
  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uIntensity: { value: 0.4 },
        uHeight: { value: 0.8 },
        uFlicker: { value: 0.0 },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vPosition;
        
        void main() {
          vUv = uv;
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uIntensity;
        uniform float uHeight;
        uniform float uFlicker;
        
        varying vec2 vUv;
        varying vec3 vPosition;
        
        // Simplex 2D noise
        vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
        
        float snoise(vec2 v) {
          const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                   -0.577350269189626, 0.024390243902439);
          vec2 i  = floor(v + dot(v, C.yy) );
          vec2 x0 = v -   i + dot(i, C.xx);
          vec2 i1;
          i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
          vec4 x12 = x0.xyxy + C.xxzz;
          x12.xy -= i1;
          i = mod(i, 289.0);
          vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
          + i.x + vec3(0.0, i1.x, 1.0 ));
          vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
            dot(x12.zw,x12.zw)), 0.0);
          m = m*m ;
          m = m*m ;
          vec3 x = 2.0 * fract(p * C.www) - 1.0;
          vec3 h = abs(x) - 0.5;
          vec3 ox = floor(x + 0.5);
          vec3 a0 = x - ox;
          m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
          vec3 g;
          g.x  = a0.x  * x0.x  + h.x  * x0.y;
          g.yz = a0.yz * x12.xz + h.yz * x12.yw;
          return 130.0 * dot(m, g);
        }
        
        void main() {
          vec2 uv = vUv;
          
          // Create flame shape - taller at bottom, tapers at top
          float flameShape = 1.0 - uv.y;
          flameShape = pow(flameShape, 0.8);
          
          // Add horizontal tapering (narrower at top)
          float horizontalTaper = 1.0 - abs(uv.x - 0.5) * (1.0 + uv.y * 2.0);
          horizontalTaper = smoothstep(0.0, 1.0, horizontalTaper);
          
          // Noise-based distortion
          float noise1 = snoise(vec2(uv.x * 3.0, uv.y * 2.0 - uTime * 0.5)) * 0.5 + 0.5;
          float noise2 = snoise(vec2(uv.x * 5.0 + uTime * 0.3, uv.y * 3.0 - uTime * 0.7)) * 0.5 + 0.5;
          float noise3 = snoise(vec2(uv.x * 7.0, uv.y * 5.0 - uTime * 1.2)) * 0.5 + 0.5;
          
          // Combine noises for organic movement
          float combinedNoise = noise1 * 0.5 + noise2 * 0.3 + noise3 * 0.2;
          
          // Apply noise to flame shape
          float flame = flameShape * horizontalTaper * combinedNoise;
          flame *= uHeight; // Breathing modulation
          
          // Add flicker
          flame += uFlicker * 0.05;
          
          // Soft edges
          flame = smoothstep(0.1, 0.7, flame);
          
          // LOCKED ORANGE-AMBER COLOR GRADIENT
          // Dark chocolate base -> bright orange -> amber gold
          vec3 color1 = vec3(0.82, 0.41, 0.12); // #D2691E - chocolate orange (bottom)
          vec3 color2 = vec3(1.0, 0.55, 0.26);  // #FF8C42 - bright orange (middle)
          vec3 color3 = vec3(1.0, 0.72, 0.30);  // #FFB84D - amber gold (top)
          
          // Gradient based on height and intensity
          vec3 flameColor;
          float gradientPos = uv.y + (1.0 - flame) * 0.3;
          
          if (gradientPos < 0.5) {
            flameColor = mix(color1, color2, gradientPos * 2.0);
          } else {
            flameColor = mix(color2, color3, (gradientPos - 0.5) * 2.0);
          }
          
          // Add brightness variation based on noise (very subtle)
          flameColor *= (0.8 + combinedNoise * 0.1);
          
          // Modulate by intensity (keep darker)
          flameColor *= (0.5 + uIntensity * 0.3);
          
          // Smooth alpha with soft falloff
          float alpha = flame * (1.0 - uv.y * 0.3);
          alpha = clamp(alpha, 0.0, 0.85); // Cap alpha to prevent solid mass
          
          // Output color directly (no premultiplication)
          gl_FragColor = vec4(flameColor, alpha);
        }
      `,
      transparent: true,
      blending: THREE.NormalBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
      premultipliedAlpha: false,
    });
  }, []);

  useFrame((state, delta) => {
    timeRef.current += delta;
    
    if (shaderMaterialRef.current) {
      shaderMaterialRef.current.uniforms.uTime.value = timeRef.current;
      
      let targetIntensity = 0.4;
      let targetHeight = 0.8;
      let targetFlicker = 0.0;
      
      if (isRunning) {
        switch (phase) {
          case 'inhale':
            targetIntensity = 0.4 + (phaseProgress * 0.4);
            targetHeight = 0.8 + (phaseProgress * 1.0);
            targetFlicker = phaseProgress * 0.2;
            break;
          case 'hold':
          case 'holdAfter':
            const pulse = Math.sin(timeRef.current * 2.5);
            targetIntensity = 0.8 + pulse * 0.05;
            targetHeight = 1.8 + pulse * 0.1;
            targetFlicker = 0.2 + pulse * 0.05;
            break;
          case 'exhale':
            targetIntensity = 0.8 - (phaseProgress * 0.4);
            targetHeight = 1.8 - (phaseProgress * 1.0);
            targetFlicker = 0.2 - (phaseProgress * 0.2);
            break;
          default:
            break;
        }
      }
      
      // Smooth transitions
      const lerpSpeed = 2.0 * delta;
      shaderMaterialRef.current.uniforms.uIntensity.value = THREE.MathUtils.lerp(
        shaderMaterialRef.current.uniforms.uIntensity.value,
        targetIntensity,
        lerpSpeed
      );
      shaderMaterialRef.current.uniforms.uHeight.value = THREE.MathUtils.lerp(
        shaderMaterialRef.current.uniforms.uHeight.value,
        targetHeight,
        lerpSpeed
      );
      shaderMaterialRef.current.uniforms.uFlicker.value = THREE.MathUtils.lerp(
        shaderMaterialRef.current.uniforms.uFlicker.value,
        targetFlicker,
        lerpSpeed
      );
    }
  });

  return (
    <group position={[0, -1.5, 0]} scale={0.8}>
      {/* Central core orb - warm orange */}
      <mesh scale={[0.5, 0.8, 0.5]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color="#D2691E"
          transparent
          opacity={0.6}
        />
      </mesh>

      {/* Shader-based flame - positioned directly above core */}
      <mesh ref={flameMeshRef} position={[0, 0.8, 0]}>
        <planeGeometry args={[0.8, 2.0, 32, 64]} />
        <primitive object={shaderMaterial} ref={shaderMaterialRef} attach="material" />
      </mesh>

      {/* Subtle point light */}
      <pointLight
        position={[0, 0.8, 0]}
        intensity={0.4}
        distance={12}
        color="#FF8C42"
        decay={2}
      />
    </group>
  );
};

export default PremiumSoulFlame;
