import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, extend, useThree } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';

// --- Custom Flame Shader Material ---
const FlameMaterial = shaderMaterial(
  // Uniforms
  {
    uTime: 0,
    uNoiseScale: 2.5,
    uSpeed: 0.5,
    uIntensity: 1.0,
    uBrightness: 1.5,
    uDistortion: 0.8,
    uFlameHeight: 1.8,
    uCoreColor: new THREE.Color('#AACCFF'),
    uFlameColor1: new THREE.Color('#FFDDBB'),
    uFlameColor2: new THREE.Color('#FFB400'),
  },
  // Vertex Shader
  `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment Shader (with Simplex Noise)
  `
    varying vec2 vUv;
    uniform float uTime;
    uniform float uNoiseScale;
    uniform float uSpeed;
    uniform float uIntensity;
    uniform float uBrightness;
    uniform float uDistortion;
    uniform float uFlameHeight;
    uniform vec3 uCoreColor;
    uniform vec3 uFlameColor1;
    uniform vec3 uFlameColor2;
    
    // Simplex 2D noise function (for organic movement)
    vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
    float snoise(vec2 v) {
      const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy) );
      vec2 x0 = v -   i + dot(i, C.xx);
      vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod(i, 289.0);
      vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
      m = m*m;
      m = m*m;
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
    
    // Fractal Brownian Motion (fbm) to layer noise for detail
    float fbm(vec2 p, float time) {
      float f = 0.0;
      p += vec2(sin(time * 0.2), cos(time * 0.2)) * 0.1;
      f += 0.5000 * snoise(p * 1.0 + time * 0.1);
      f += 0.2500 * snoise(p * 2.0 + time * 0.2);
      f += 0.1250 * snoise(p * 4.0 + time * 0.3);
      f += 0.0625 * snoise(p * 8.0 + time * 0.4);
      return f / 0.9375;
    }

    void main() {
      vec2 uv = vUv;
      float time = uTime * uSpeed;
      
      // Basic teardrop shape for the flame
      float d = length(uv - vec2(0.5, 0.0));
      float flameShape = smoothstep(0.5, 0.0, d);
      flameShape *= pow(uv.y, 0.5);
      
      // Distort the Y-coordinate with noise to create the flicker
      float noise = fbm(uv * uNoiseScale, time);
      float distortedY = uv.y - noise * uDistortion * (1.0 - uv.y);
      float finalShape = smoothstep(0.0, 1.0, distortedY / uFlameHeight);
      finalShape *= flameShape;

      // Color mixing based on shape and intensity
      float coreMix = smoothstep(0.5, 0.0, d * (1.0 + finalShape * 0.5));
      vec3 color = mix(uFlameColor1, uFlameColor2, finalShape);
      color = mix(color, uCoreColor, coreMix);
      color = mix(vec3(0.0), color, finalShape);

      // Final output color and alpha
      gl_FragColor = vec4(color * uBrightness * uIntensity, finalShape);
    }
  `
);
extend({ FlameMaterial });

// --- Custom Embers Shader Material ---
const EmbersMaterial = shaderMaterial(
  { uTime: 0, uColor: new THREE.Color('#FFDDAA'), uPixelRatio: 1, uSize: 50.0, uOpacity: 0.0 },
  `
    uniform float uTime;
    uniform float uPixelRatio;
    uniform float uSize;
    attribute float aScale;
    attribute vec3 aVelocity;
    attribute float aStartTime;
    varying float vAlpha;

    void main() {
      float lifeTime = 2.5;
      float elapsedTime = mod(uTime - aStartTime, lifeTime);
      
      // Basic physics for particle movement
      vec3 pos = position + aVelocity * elapsedTime;
      pos.y += 0.5 * (-9.8) * elapsedTime * elapsedTime * 0.05;

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_PointSize = aScale * uSize * (1.0 / -mvPosition.z) * uPixelRatio;
      gl_Position = projectionMatrix * mvPosition;

      // Fade out over lifetime
      vAlpha = 1.0 - (elapsedTime / lifeTime);
      vAlpha = pow(vAlpha, 2.0); // Use pow for a quicker fade
    }
  `,
  `
    uniform vec3 uColor;
    uniform float uOpacity;
    varying float vAlpha;

    void main() {
      float d = length(gl_PointCoord - vec2(0.5));
      float strength = 1.0 - smoothstep(0.4, 0.5, d); // Soft circular particle
      if(vAlpha <= 0.0 || strength <= 0.0 || uOpacity <= 0.0) discard;
      
      gl_FragColor = vec4(uColor, vAlpha * strength * uOpacity);
    }
  `
);
extend({ EmbersMaterial });

// --- Main 3D Component ---
const SoulEmber = ({ phase, phaseProgress, isRunning }) => {
  const flameMaterialRef = useRef();
  const flameMeshRef = useRef();
  const lightRef = useRef();
  const embersMaterialRef = useRef();
  const { viewport } = useThree();

  const numEmbers = 500;
  // useMemo to create particle attributes only once
  const emberAttributes = useMemo(() => {
    const positions = new Float32Array(numEmbers * 3);
    const scales = new Float32Array(numEmbers);
    const velocities = new Float32Array(numEmbers * 3);
    const startTimes = new Float32Array(numEmbers);

    for (let i = 0; i < numEmbers; i++) {
      positions.set([(Math.random() - 0.5) * 0.2, Math.random() * 0.2, (Math.random() - 0.5) * 0.2], i * 3);
      scales[i] = Math.random() * 0.5 + 0.2;
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 1.5 + 0.5;
      velocities.set([Math.cos(angle) * speed * 0.5, speed, Math.sin(angle) * speed * 0.5], i * 3);
      startTimes[i] = Math.random() * 2.5; // Randomize start times for continuous effect
    }
    return { positions, scales, velocities, startTimes };
  }, [numEmbers]);
  
  // Effect to trigger ember burst on exhale
  useEffect(() => {
    if (phase === 'exhale' && embersMaterialRef.current) {
        // By updating the time uniform, we can trigger a visual "burst"
        embersMaterialRef.current.uTime = Math.random() * 10;
    }
  }, [phase]);

  // The main animation loop, tied to the component's lifecycle
  useFrame((state, delta) => {
    const { clock } = state;
    if (flameMaterialRef.current) {
      flameMaterialRef.current.uTime = clock.getElapsedTime();

      // Determine target values based on phase
      let targetIntensity = 0.5;
      let targetScale = 0.2;
      if (isRunning) {
        if (phase === 'inhale') {
          targetScale = THREE.MathUtils.lerp(0.2, 1.0, phaseProgress);
          targetIntensity = THREE.MathUtils.lerp(0.5, 1.2, phaseProgress);
        } else if (phase === 'hold') {
          targetScale = 1.05 + Math.sin(clock.elapsedTime * 8) * 0.05;
          targetIntensity = 1.3 + Math.sin(clock.elapsedTime * 8) * 0.1;
        } else if (phase === 'exhale') {
          targetScale = THREE.MathUtils.lerp(1.0, 0.2, phaseProgress);
          targetIntensity = THREE.MathUtils.lerp(1.2, 0.5, phaseProgress);
        }
      }
      
      // Smoothly animate towards target values using damp for framerate independence
      flameMaterialRef.current.uIntensity = THREE.MathUtils.damp(flameMaterialRef.current.uIntensity, targetIntensity, 4, delta);
      const currentScale = flameMeshRef.current.scale.y;
      const newScale = THREE.MathUtils.damp(currentScale, targetScale, 4, delta);
      flameMeshRef.current.scale.set(newScale, newScale, newScale);
    }
    
    // Animate light intensity to match the flame
    if (lightRef.current && flameMaterialRef.current) {
      lightRef.current.intensity = flameMaterialRef.current.uIntensity * 2;
    }

    // Animate embers
    if (embersMaterialRef.current) {
      embersMaterialRef.current.uTime = clock.getElapsedTime();
      let targetOpacity = 0;
      // Embers are only visible during the exhale phase
      if (isRunning && phase === 'exhale') {
          // Fade in quickly, fade out slowly
          targetOpacity = Math.sin(phaseProgress * Math.PI); 
      }
      embersMaterialRef.current.uOpacity = THREE.MathUtils.damp(embersMaterialRef.current.uOpacity, targetOpacity, 8, delta);
    }
  });

  return (
    <>
      <pointLight ref={lightRef} color="#FFB400" intensity={1} distance={20} decay={2} />
      <mesh ref={flameMeshRef} position={[0, 0.2, 0]} scale={0.3}>
        {/* FIX: Removed incorrect rotation that made the flame invisible */}
        <planeGeometry args={[1, 1.8, 64, 128]} />
        <flameMaterial ref={flameMaterialRef} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <points>
        <bufferGeometry>
            <bufferAttribute attach="attributes-position" count={numEmbers} array={emberAttributes.positions} itemSize={3} />
            <bufferAttribute attach="attributes-aScale" count={numEmbers} array={emberAttributes.scales} itemSize={1} />
            <bufferAttribute attach="attributes-aVelocity" count={numEmbers} array={emberAttributes.velocities} itemSize={3} />
            <bufferAttribute attach="attributes-aStartTime" count={numEmbers} array={emberAttributes.startTimes} itemSize={1} />
        </bufferGeometry>
        <embersMaterial ref={embersMaterialRef} transparent depthWrite={false} uPixelRatio={viewport.dpr}/>
      </points>
    </>
  );
};

export default SoulEmber;
