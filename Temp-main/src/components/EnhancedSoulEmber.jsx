import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, extend, useThree } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';

// --- Enhanced Flame Shader Material with Advanced Physics ---
const EnhancedFlameMaterial = shaderMaterial(
  // Uniforms
  {
    uTime: 0,
    uNoiseScale: 3.0,
    uSpeed: 0.6,
    uIntensity: 1.0,
    uBrightness: 2.0,
    uDistortion: 1.2,
    uFlameHeight: 2.0,
    uTurbulence: 0.5,
    uCoreColor: new THREE.Color('#E8F4FF'),
    uMidColor: new THREE.Color('#FFE8B3'),
    uFlameColor1: new THREE.Color('#FFD700'),
    uFlameColor2: new THREE.Color('#FF8C00'),
    uOuterColor: new THREE.Color('#FF4500'),
  },
  // Vertex Shader
  `
    varying vec2 vUv;
    varying vec3 vPosition;
    void main() {
      vUv = uv;
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment Shader with Advanced Noise
  `
    varying vec2 vUv;
    varying vec3 vPosition;
    uniform float uTime;
    uniform float uNoiseScale;
    uniform float uSpeed;
    uniform float uIntensity;
    uniform float uBrightness;
    uniform float uDistortion;
    uniform float uFlameHeight;
    uniform float uTurbulence;
    uniform vec3 uCoreColor;
    uniform vec3 uMidColor;
    uniform vec3 uFlameColor1;
    uniform vec3 uFlameColor2;
    uniform vec3 uOuterColor;
    
    // Improved Simplex 3D noise
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
    
    float snoise(vec3 v) {
      const vec2 C = vec2(1.0/6.0, 1.0/3.0);
      const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
      
      vec3 i  = floor(v + dot(v, C.yyy));
      vec3 x0 = v - i + dot(i, C.xxx);
      
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min(g.xyz, l.zxy);
      vec3 i2 = max(g.xyz, l.zxy);
      
      vec3 x1 = x0 - i1 + C.xxx;
      vec3 x2 = x0 - i2 + C.yyy;
      vec3 x3 = x0 - D.yyy;
      
      i = mod289(i);
      vec4 p = permute(permute(permute(
                i.z + vec4(0.0, i1.z, i2.z, 1.0))
              + i.y + vec4(0.0, i1.y, i2.y, 1.0))
              + i.x + vec4(0.0, i1.x, i2.x, 1.0));
      
      float n_ = 0.142857142857;
      vec3 ns = n_ * D.wyz - D.xzx;
      
      vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
      
      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_);
      
      vec4 x = x_ *ns.x + ns.yyyy;
      vec4 y = y_ *ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);
      
      vec4 b0 = vec4(x.xy, y.xy);
      vec4 b1 = vec4(x.zw, y.zw);
      
      vec4 s0 = floor(b0)*2.0 + 1.0;
      vec4 s1 = floor(b1)*2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));
      
      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
      vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
      
      vec3 p0 = vec3(a0.xy, h.x);
      vec3 p1 = vec3(a0.zw, h.y);
      vec3 p2 = vec3(a1.xy, h.z);
      vec3 p3 = vec3(a1.zw, h.w);
      
      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
      p0 *= norm.x;
      p1 *= norm.y;
      p2 *= norm.z;
      p3 *= norm.w;
      
      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
    }
    
    // Turbulent FBM for realistic flame movement
    float turbulentFbm(vec3 p, float time) {
      float f = 0.0;
      float amplitude = 1.0;
      float frequency = 1.0;
      
      // Add swirling motion
      p.x += sin(time * 0.3 + p.y * 2.0) * 0.1;
      p.z += cos(time * 0.3 + p.y * 2.0) * 0.1;
      
      for(int i = 0; i < 5; i++) {
        f += amplitude * abs(snoise(p * frequency + vec3(0.0, time * 0.5, 0.0)));
        amplitude *= 0.5;
        frequency *= 2.0;
      }
      return f;
    }

    void main() {
      vec2 uv = vUv;
      float time = uTime * uSpeed;
      
      // Create flame shape - teardrop with pointed top
      vec2 centered = uv - vec2(0.5, 0.0);
      float dist = length(centered);
      
      // Base flame shape with height falloff
      float heightFactor = pow(1.0 - uv.y, 0.3);
      float widthFactor = smoothstep(0.5, 0.0, dist) * heightFactor;
      
      // Add turbulent noise for realistic flame movement
      vec3 noisePos = vec3(uv * uNoiseScale, time);
      float turbulence = turbulentFbm(noisePos, time);
      
      // Distort the flame shape
      float distortedY = uv.y + turbulence * uDistortion * (1.0 - uv.y) * 0.3;
      float flameShape = smoothstep(0.0, 1.0, distortedY / uFlameHeight);
      flameShape *= widthFactor;
      
      // Add flickering at the top
      float flicker = sin(time * 10.0 + uv.x * 20.0) * 0.1 + 0.9;
      flameShape *= mix(1.0, flicker, pow(uv.y, 2.0));
      
      // Multi-layer color gradient
      float coreMix = smoothstep(0.3, 0.0, dist * (1.0 + flameShape * 0.5));
      float midMix = smoothstep(0.5, 0.2, dist);
      
      // Color blending from core to outer flame
      vec3 color = uOuterColor;
      color = mix(color, uFlameColor2, flameShape);
      color = mix(color, uFlameColor1, pow(flameShape, 0.7));
      color = mix(color, uMidColor, midMix * flameShape);
      color = mix(color, uCoreColor, coreMix);
      
      // Add brightness variation
      float brightness = uBrightness * (0.8 + turbulence * 0.2);
      color *= brightness;
      
      // Enhanced alpha with soft edges
      float alpha = flameShape * uIntensity;
      alpha *= smoothstep(0.0, 0.1, uv.y); // Fade at bottom
      alpha *= smoothstep(1.0, 0.8, uv.y); // Fade at top
      
      gl_FragColor = vec4(color, alpha);
    }
  `
);
extend({ EnhancedFlameMaterial });

// --- Enhanced Embers with Multiple Particle Types ---
const EnhancedEmbersMaterial = shaderMaterial(
  { 
    uTime: 0, 
    uColor: new THREE.Color('#FFE8B3'), 
    uPixelRatio: 1, 
    uSize: 60.0, 
    uOpacity: 0.0,
    uGlowIntensity: 1.5
  },
  `
    uniform float uTime;
    uniform float uPixelRatio;
    uniform float uSize;
    uniform float uGlowIntensity;
    attribute float aScale;
    attribute vec3 aVelocity;
    attribute float aStartTime;
    attribute float aType;
    varying float vAlpha;
    varying float vType;
    varying float vGlow;

    void main() {
      float lifeTime = 3.0;
      float elapsedTime = mod(uTime - aStartTime, lifeTime);
      
      // Physics simulation
      vec3 pos = position + aVelocity * elapsedTime;
      
      // Add gravity and turbulence
      pos.y += 0.5 * (-9.8) * elapsedTime * elapsedTime * 0.03;
      pos.x += sin(elapsedTime * 2.0 + aStartTime) * 0.1;
      pos.z += cos(elapsedTime * 2.0 + aStartTime) * 0.1;

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      
      // Size variation based on type
      float sizeMultiplier = mix(0.8, 1.5, aType);
      gl_PointSize = aScale * uSize * sizeMultiplier * (1.0 / -mvPosition.z) * uPixelRatio;
      gl_Position = projectionMatrix * mvPosition;

      // Fade out with pulsing effect
      float fadeProgress = elapsedTime / lifeTime;
      vAlpha = 1.0 - pow(fadeProgress, 1.5);
      vAlpha *= (0.8 + sin(elapsedTime * 10.0) * 0.2); // Pulsing
      
      vType = aType;
      vGlow = uGlowIntensity * (1.0 - fadeProgress);
    }
  `,
  `
    uniform vec3 uColor;
    uniform float uOpacity;
    varying float vAlpha;
    varying float vType;
    varying float vGlow;

    void main() {
      vec2 center = gl_PointCoord - vec2(0.5);
      float d = length(center);
      
      // Different particle shapes based on type
      float strength;
      if(vType < 0.33) {
        // Soft circular glow
        strength = 1.0 - smoothstep(0.3, 0.5, d);
      } else if(vType < 0.66) {
        // Star-like sparkle
        float angle = atan(center.y, center.x);
        float rays = abs(sin(angle * 4.0));
        strength = (1.0 - smoothstep(0.2, 0.5, d)) * (0.7 + rays * 0.3);
      } else {
        // Bright core with glow
        strength = 1.0 - smoothstep(0.1, 0.5, d);
        strength += (1.0 - smoothstep(0.3, 0.6, d)) * 0.3;
      }
      
      if(vAlpha <= 0.0 || strength <= 0.0 || uOpacity <= 0.0) discard;
      
      // Color variation
      vec3 color = uColor;
      color = mix(color, vec3(1.0, 0.9, 0.7), vGlow * 0.3);
      
      float finalAlpha = vAlpha * strength * uOpacity;
      gl_FragColor = vec4(color, finalAlpha);
    }
  `
);
extend({ EnhancedEmbersMaterial });

// --- Sparks Material for Intense Moments ---
const SparksMaterial = shaderMaterial(
  { 
    uTime: 0, 
    uColor: new THREE.Color('#FFFFFF'), 
    uPixelRatio: 1, 
    uSize: 40.0, 
    uOpacity: 0.0 
  },
  `
    uniform float uTime;
    uniform float uPixelRatio;
    uniform float uSize;
    attribute float aScale;
    attribute vec3 aVelocity;
    attribute float aStartTime;
    varying float vAlpha;

    void main() {
      float lifeTime = 1.5;
      float elapsedTime = mod(uTime - aStartTime, lifeTime);
      
      // Fast, explosive movement
      vec3 pos = position + aVelocity * elapsedTime * 2.0;
      pos.y += 0.5 * (-9.8) * elapsedTime * elapsedTime * 0.1;

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_PointSize = aScale * uSize * (1.0 / -mvPosition.z) * uPixelRatio;
      gl_Position = projectionMatrix * mvPosition;

      // Quick fade
      vAlpha = 1.0 - pow(elapsedTime / lifeTime, 2.0);
    }
  `,
  `
    uniform vec3 uColor;
    uniform float uOpacity;
    varying float vAlpha;

    void main() {
      vec2 center = gl_PointCoord - vec2(0.5);
      float d = length(center);
      
      // Sharp, bright point
      float strength = 1.0 - smoothstep(0.0, 0.4, d);
      strength = pow(strength, 3.0);
      
      if(vAlpha <= 0.0 || strength <= 0.0 || uOpacity <= 0.0) discard;
      
      gl_FragColor = vec4(uColor, vAlpha * strength * uOpacity);
    }
  `
);
extend({ SparksMaterial });

// --- Main Enhanced 3D Component ---
const EnhancedSoulEmber = ({ phase, phaseProgress, isRunning }) => {
  const flameMaterialRef = useRef();
  const flameMeshRef = useRef();
  const lightRef = useRef();
  const embersMaterialRef = useRef();
  const sparksMaterialRef = useRef();
  const { viewport } = useThree();

  const numEmbers = 800;
  const numSparks = 300;

  // Enhanced ember attributes
  const emberAttributes = useMemo(() => {
    const positions = new Float32Array(numEmbers * 3);
    const scales = new Float32Array(numEmbers);
    const velocities = new Float32Array(numEmbers * 3);
    const startTimes = new Float32Array(numEmbers);
    const types = new Float32Array(numEmbers);

    for (let i = 0; i < numEmbers; i++) {
      // Start from flame center
      positions.set([
        (Math.random() - 0.5) * 0.3, 
        Math.random() * 0.3, 
        (Math.random() - 0.5) * 0.3
      ], i * 3);
      
      scales[i] = Math.random() * 0.6 + 0.3;
      
      // Varied velocities for natural movement
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 2.0 + 0.8;
      const upwardBias = Math.random() * 0.5 + 1.0;
      
      velocities.set([
        Math.cos(angle) * speed * 0.4, 
        speed * upwardBias, 
        Math.sin(angle) * speed * 0.4
      ], i * 3);
      
      startTimes[i] = Math.random() * 3.0;
      types[i] = Math.random();
    }
    return { positions, scales, velocities, startTimes, types };
  }, [numEmbers]);

  // Spark attributes for intense moments
  const sparkAttributes = useMemo(() => {
    const positions = new Float32Array(numSparks * 3);
    const scales = new Float32Array(numSparks);
    const velocities = new Float32Array(numSparks * 3);
    const startTimes = new Float32Array(numSparks);

    for (let i = 0; i < numSparks; i++) {
      positions.set([
        (Math.random() - 0.5) * 0.2, 
        Math.random() * 0.2, 
        (Math.random() - 0.5) * 0.2
      ], i * 3);
      
      scales[i] = Math.random() * 0.4 + 0.2;
      
      // Explosive outward velocities
      const angle = Math.random() * Math.PI * 2;
      const elevation = Math.random() * Math.PI * 0.5;
      const speed = Math.random() * 3.0 + 2.0;
      
      velocities.set([
        Math.cos(angle) * Math.cos(elevation) * speed, 
        Math.sin(elevation) * speed, 
        Math.sin(angle) * Math.cos(elevation) * speed
      ], i * 3);
      
      startTimes[i] = Math.random() * 1.5;
    }
    return { positions, scales, velocities, startTimes };
  }, [numSparks]);

  // Animation loop
  useFrame((state, delta) => {
    const { clock } = state;
    
    if (flameMaterialRef.current) {
      flameMaterialRef.current.uTime = clock.getElapsedTime();

      // Dynamic flame behavior based on phase
      let targetIntensity = 1.0;
      let targetScale = 0.8;
      let targetTurbulence = 0.3;

      if (isRunning) {
        if (phase === 'inhale') {
          targetScale = THREE.MathUtils.lerp(0.2, 1.2, phaseProgress);
          targetIntensity = THREE.MathUtils.lerp(0.5, 1.5, phaseProgress);
          targetTurbulence = THREE.MathUtils.lerp(0.3, 0.8, phaseProgress);
        } else if (phase === 'hold') {
          targetScale = 1.15 + Math.sin(clock.elapsedTime * 6) * 0.08;
          targetIntensity = 1.6 + Math.sin(clock.elapsedTime * 6) * 0.15;
          targetTurbulence = 0.9;
        } else if (phase === 'exhale') {
          targetScale = THREE.MathUtils.lerp(1.2, 0.2, phaseProgress);
          targetIntensity = THREE.MathUtils.lerp(1.5, 0.5, phaseProgress);
          targetTurbulence = THREE.MathUtils.lerp(0.8, 0.3, phaseProgress);
        } else if (phase === 'holdAfter') {
          targetScale = 0.25 + Math.sin(clock.elapsedTime * 4) * 0.05;
          targetIntensity = 0.6 + Math.sin(clock.elapsedTime * 4) * 0.1;
          targetTurbulence = 0.4;
        }
      }

      // Smooth transitions
      flameMaterialRef.current.uIntensity = THREE.MathUtils.damp(
        flameMaterialRef.current.uIntensity, 
        targetIntensity, 
        0.1,
        delta
      );
      flameMaterialRef.current.uTurbulence = THREE.MathUtils.damp(
        flameMaterialRef.current.uTurbulence, 
        targetTurbulence, 
        0.1,
        delta
      );
      
      const currentScale = flameMeshRef.current.scale.y;
      const newScale = THREE.MathUtils.damp(currentScale, targetScale, 0.1, delta);
      flameMeshRef.current.scale.set(newScale, newScale, newScale);
    }

    // Dynamic lighting
    if (lightRef.current && flameMaterialRef.current) {
      lightRef.current.intensity = flameMaterialRef.current.uIntensity * 2.5;
      
      // Color shift based on intensity
      const intensity = flameMaterialRef.current.uIntensity;
      if (intensity > 1.2) {
        lightRef.current.color.setHex(0xFFE8B3);
      } else if (intensity > 0.8) {
        lightRef.current.color.setHex(0xFFD700);
      } else {
        lightRef.current.color.setHex(0xFF8C00);
      }
    }

    // Embers animation
    if (embersMaterialRef.current) {
      embersMaterialRef.current.uTime = clock.getElapsedTime();
      
      let targetEmberOpacity = 0;
      if (isRunning) {
        if (phase === 'exhale') {
          targetEmberOpacity = Math.sin(phaseProgress * Math.PI) * 1.2;
        } else if (phase === 'hold') {
          targetEmberOpacity = 0.3;
        }
      }
      
      embersMaterialRef.current.uOpacity = THREE.MathUtils.damp(
        embersMaterialRef.current.uOpacity, 
        targetEmberOpacity, 
        6, 
        delta
      );
    }

    // Sparks animation (only during intense inhale)
    if (sparksMaterialRef.current) {
      sparksMaterialRef.current.uTime = clock.getElapsedTime();
      
      let targetSparkOpacity = 0;
      if (isRunning && phase === 'inhale' && phaseProgress > 0.7) {
        targetSparkOpacity = (phaseProgress - 0.7) / 0.3;
      }
      
      sparksMaterialRef.current.uOpacity = THREE.MathUtils.damp(
        sparksMaterialRef.current.uOpacity, 
        targetSparkOpacity, 
        8, 
        delta
      );
    }
  });

  return (
    <>
      {/* Dynamic point light */}
      <pointLight 
        ref={lightRef} 
        color="#FFD700" 
        intensity={1.5} 
        distance={25} 
        decay={2} 
      />
      
      {/* Enhanced flame mesh */}
      <mesh ref={flameMeshRef} position={[0, 0.2, 0]} scale={0.3}>
        <planeGeometry args={[1.2, 2.2, 128, 256]} />
        <enhancedFlameMaterial 
          ref={flameMaterialRef} 
          transparent 
          depthWrite={false} 
          blending={THREE.AdditiveBlending} 
        />
      </mesh>

      {/* Enhanced embers */}
      <points>
        <bufferGeometry>
          <bufferAttribute 
            attach="attributes-position" 
            count={numEmbers} 
            array={emberAttributes.positions} 
            itemSize={3} 
          />
          <bufferAttribute 
            attach="attributes-aScale" 
            count={numEmbers} 
            array={emberAttributes.scales} 
            itemSize={1} 
          />
          <bufferAttribute 
            attach="attributes-aVelocity" 
            count={numEmbers} 
            array={emberAttributes.velocities} 
            itemSize={3} 
          />
          <bufferAttribute 
            attach="attributes-aStartTime" 
            count={numEmbers} 
            array={emberAttributes.startTimes} 
            itemSize={1} 
          />
          <bufferAttribute 
            attach="attributes-aType" 
            count={numEmbers} 
            array={emberAttributes.types} 
            itemSize={1} 
          />
        </bufferGeometry>
        <enhancedEmbersMaterial 
          ref={embersMaterialRef} 
          transparent 
          depthWrite={false} 
          uPixelRatio={viewport.dpr}
        />
      </points>

      {/* Sparks for intense moments */}
      <points>
        <bufferGeometry>
          <bufferAttribute 
            attach="attributes-position" 
            count={numSparks} 
            array={sparkAttributes.positions} 
            itemSize={3} 
          />
          <bufferAttribute 
            attach="attributes-aScale" 
            count={numSparks} 
            array={sparkAttributes.scales} 
            itemSize={1} 
          />
          <bufferAttribute 
            attach="attributes-aVelocity" 
            count={numSparks} 
            array={sparkAttributes.velocities} 
            itemSize={3} 
          />
          <bufferAttribute 
            attach="attributes-aStartTime" 
            count={numSparks} 
            array={sparkAttributes.startTimes} 
            itemSize={1} 
          />
        </bufferGeometry>
        <sparksMaterial 
          ref={sparksMaterialRef} 
          transparent 
          depthWrite={false} 
          blending={THREE.AdditiveBlending}
          uPixelRatio={viewport.dpr}
        />
      </points>
    </>
  );
};

export default EnhancedSoulEmber;