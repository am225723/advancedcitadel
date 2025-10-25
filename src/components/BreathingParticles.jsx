import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const BreathingParticles = ({ phase, phaseProgress }) => {
  const embersRef = useRef();
  const sparksRef = useRef();
  const embersTimeRef = useRef(0);
  const sparksTimeRef = useRef(0);

  const emberCount = 300;
  const sparkCount = 200;

  // Enhanced ember particle shader for soft, glowing appearance
  const emberShader = useMemo(() => ({
    vertexShader: `
      attribute float size;
      attribute float lifetime;
      attribute vec3 velocity;
      
      varying float vLifetime;
      varying vec2 vUv;
      
      void main() {
        vLifetime = lifetime;
        vUv = uv;
        
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        
        // Size attenuation based on distance and lifetime
        float fadeIn = smoothstep(0.0, 0.15, lifetime);
        float fadeOut = smoothstep(0.0, 0.3, 1.0 - lifetime);
        float finalSize = size * fadeIn * fadeOut;
        
        gl_PointSize = finalSize * (200.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      varying float vLifetime;
      
      void main() {
        // Soft circular gradient
        vec2 center = gl_PointCoord - vec2(0.5);
        float dist = length(center);
        
        // Soft edge falloff
        float alpha = 1.0 - smoothstep(0.2, 0.5, dist);
        
        // Lifetime-based fade
        float lifeFade = smoothstep(0.0, 0.2, vLifetime) * smoothstep(0.0, 0.4, 1.0 - vLifetime);
        alpha *= lifeFade;
        
        // Core glow
        float glow = exp(-dist * 6.0);
        
        // Rich amber-orange color with bright core
        vec3 coreColor = vec3(1.0, 0.95, 0.85);
        vec3 midColor = vec3(1.0, 0.7, 0.35);
        vec3 edgeColor = vec3(1.0, 0.4, 0.2);
        
        vec3 color = mix(edgeColor, midColor, glow);
        color = mix(color, coreColor, glow * glow);
        
        // Brightness modulation
        color *= (0.7 + glow * 0.6);
        
        gl_FragColor = vec4(color, alpha * 0.9);
      }
    `
  }), []);

  // Enhanced spark shader for bright, energetic sparks
  const sparkShader = useMemo(() => ({
    vertexShader: `
      attribute float size;
      attribute float lifetime;
      attribute vec3 velocity;
      
      varying float vLifetime;
      varying float vVelocity;
      
      void main() {
        vLifetime = lifetime;
        vVelocity = length(velocity);
        
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        
        // Quick fade in, longer fade out
        float fadeIn = smoothstep(0.0, 0.1, lifetime);
        float fadeOut = smoothstep(0.0, 0.6, 1.0 - lifetime);
        float finalSize = size * fadeIn * fadeOut;
        
        gl_PointSize = finalSize * (250.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      varying float vLifetime;
      varying float vVelocity;
      
      void main() {
        vec2 center = gl_PointCoord - vec2(0.5);
        float dist = length(center);
        
        // Bright, sharp core with soft halo
        float alpha = 1.0 - smoothstep(0.15, 0.5, dist);
        
        // Lifetime fade
        float lifeFade = smoothstep(0.0, 0.15, vLifetime) * smoothstep(0.0, 0.5, 1.0 - vLifetime);
        alpha *= lifeFade;
        
        // Intense core
        float intensity = exp(-dist * 8.0);
        
        // Brilliant yellow-white to orange
        vec3 coreColor = vec3(1.0, 1.0, 0.95);
        vec3 glowColor = vec3(1.0, 0.85, 0.5);
        vec3 edgeColor = vec3(1.0, 0.6, 0.3);
        
        vec3 color = mix(edgeColor, glowColor, intensity);
        color = mix(color, coreColor, intensity * intensity);
        
        // Extra brightness
        color *= (1.0 + intensity * 0.5);
        
        gl_FragColor = vec4(color, alpha);
      }
    `
  }), []);

  const [emberPositions, emberVelocities, emberSizes, emberLifetimes] = useMemo(() => {
    const positions = new Float32Array(emberCount * 3);
    const velocities = new Float32Array(emberCount * 3);
    const sizes = new Float32Array(emberCount);
    const lifetimes = new Float32Array(emberCount);

    for (let i = 0; i < emberCount; i++) {
      const i3 = i * 3;
      const angle = Math.random() * Math.PI * 2;
      const distance = 4 + Math.random() * 4;
      const heightOffset = (Math.random() - 0.5) * 3;
      
      positions[i3] = Math.cos(angle) * distance;
      positions[i3 + 1] = heightOffset;
      positions[i3 + 2] = Math.sin(angle) * distance;

      velocities[i3] = -Math.cos(angle) * (1.5 + Math.random() * 0.5);
      velocities[i3 + 1] = -heightOffset * 0.2 + (Math.random() - 0.5) * 0.3;
      velocities[i3 + 2] = -Math.sin(angle) * (1.5 + Math.random() * 0.5);

      sizes[i] = 8 + Math.random() * 12;
      lifetimes[i] = Math.random();
    }

    return [positions, velocities, sizes, lifetimes];
  }, []);

  const [sparkPositions, sparkVelocities, sparkSizes, sparkLifetimes] = useMemo(() => {
    const positions = new Float32Array(sparkCount * 3);
    const velocities = new Float32Array(sparkCount * 3);
    const sizes = new Float32Array(sparkCount);
    const lifetimes = new Float32Array(sparkCount);

    for (let i = 0; i < sparkCount; i++) {
      const i3 = i * 3;
      
      // Start from top of flame
      const offsetX = (Math.random() - 0.5) * 0.4;
      const offsetZ = (Math.random() - 0.5) * 0.4;
      positions[i3] = offsetX;
      positions[i3 + 1] = 1.2 + Math.random() * 0.3;
      positions[i3 + 2] = offsetZ;

      // Upward and outward velocity with variation
      const angle = Math.random() * Math.PI * 2;
      const spread = 0.3 + Math.random() * 0.4;
      velocities[i3] = Math.cos(angle) * spread;
      velocities[i3 + 1] = 1.2 + Math.random() * 0.8;
      velocities[i3 + 2] = Math.sin(angle) * spread;

      sizes[i] = 6 + Math.random() * 10;
      lifetimes[i] = Math.random();
    }

    return [positions, velocities, sizes, lifetimes];
  }, []);

  useFrame((state, delta) => {
    // EMBER PARTICLES (Inhale phase)
    if (embersRef.current && phase === 'inhale') {
      embersTimeRef.current += delta;
      const positions = embersRef.current.geometry.attributes.position.array;
      const velocities = embersRef.current.geometry.attributes.velocity.array;
      const lifetimes = embersRef.current.geometry.attributes.lifetime.array;

      for (let i = 0; i < emberCount; i++) {
        const i3 = i * 3;
        
        // Decay lifetime
        lifetimes[i] -= delta * 0.4;
        
        if (lifetimes[i] <= 0) {
          // Respawn at edge
          const angle = Math.random() * Math.PI * 2;
          const distance = 4 + Math.random() * 4;
          const heightOffset = (Math.random() - 0.5) * 3;
          
          positions[i3] = Math.cos(angle) * distance;
          positions[i3 + 1] = heightOffset;
          positions[i3 + 2] = Math.sin(angle) * distance;
          
          velocities[i3] = -Math.cos(angle) * (1.5 + Math.random() * 0.5);
          velocities[i3 + 1] = -heightOffset * 0.2 + (Math.random() - 0.5) * 0.3;
          velocities[i3 + 2] = -Math.sin(angle) * (1.5 + Math.random() * 0.5);
          
          lifetimes[i] = 1.0;
        } else {
          // Move toward flame center
          const toCenter = new THREE.Vector3(
            -positions[i3],
            0.5 - positions[i3 + 1],
            -positions[i3 + 2]
          );
          const dist = toCenter.length();
          toCenter.normalize();
          
          // Accelerate as they get closer
          const acceleration = (1 - lifetimes[i]) * 4;
          velocities[i3] += toCenter.x * acceleration * delta;
          velocities[i3 + 1] += toCenter.y * acceleration * delta;
          velocities[i3 + 2] += toCenter.z * acceleration * delta;
          
          // Apply velocity with drag
          const drag = 0.98;
          positions[i3] += velocities[i3] * delta;
          positions[i3 + 1] += velocities[i3 + 1] * delta;
          positions[i3 + 2] += velocities[i3 + 2] * delta;
          
          velocities[i3] *= drag;
          velocities[i3 + 1] *= drag;
          velocities[i3 + 2] *= drag;
          
          // Add swirl
          const swirl = Math.sin(embersTimeRef.current * 2 + i * 0.1) * 0.3;
          positions[i3] += swirl * delta;
          positions[i3 + 2] += Math.cos(embersTimeRef.current * 2 + i * 0.1) * 0.3 * delta;
        }
      }

      embersRef.current.geometry.attributes.position.needsUpdate = true;
      embersRef.current.geometry.attributes.lifetime.needsUpdate = true;
    }

    // SPARK PARTICLES (Exhale phase)
    if (sparksRef.current && phase === 'exhale') {
      sparksTimeRef.current += delta;
      const positions = sparksRef.current.geometry.attributes.position.array;
      const velocities = sparksRef.current.geometry.attributes.velocity.array;
      const lifetimes = sparksRef.current.geometry.attributes.lifetime.array;

      for (let i = 0; i < sparkCount; i++) {
        const i3 = i * 3;
        
        // Faster decay
        lifetimes[i] -= delta * 0.6;
        
        if (lifetimes[i] <= 0) {
          // Respawn at flame top
          const offsetX = (Math.random() - 0.5) * 0.4;
          const offsetZ = (Math.random() - 0.5) * 0.4;
          positions[i3] = offsetX;
          positions[i3 + 1] = 1.2 + Math.random() * 0.3;
          positions[i3 + 2] = offsetZ;
          
          const angle = Math.random() * Math.PI * 2;
          const spread = 0.3 + Math.random() * 0.4;
          velocities[i3] = Math.cos(angle) * spread;
          velocities[i3 + 1] = 1.2 + Math.random() * 0.8;
          velocities[i3 + 2] = Math.sin(angle) * spread;
          
          lifetimes[i] = 1.0;
        } else {
          // Physics simulation
          positions[i3] += velocities[i3] * delta;
          positions[i3 + 1] += velocities[i3 + 1] * delta;
          positions[i3 + 2] += velocities[i3 + 2] * delta;
          
          // Gravity
          velocities[i3 + 1] -= delta * 0.8;
          
          // Air resistance
          const drag = 0.97;
          velocities[i3] *= drag;
          velocities[i3 + 1] *= drag;
          velocities[i3 + 2] *= drag;
          
          // Gentle turbulence
          const turbulence = Math.sin(sparksTimeRef.current * 5 + i * 0.5) * 0.2;
          positions[i3] += turbulence * delta;
          positions[i3 + 2] += Math.cos(sparksTimeRef.current * 5 + i * 0.5) * 0.2 * delta;
        }
      }

      sparksRef.current.geometry.attributes.position.needsUpdate = true;
      sparksRef.current.geometry.attributes.velocity.needsUpdate = true;
      sparksRef.current.geometry.attributes.lifetime.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* EMBER PARTICLES - Inhale */}
      {phase === 'inhale' && (
        <points ref={embersRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={emberCount}
              array={emberPositions}
              itemSize={3}
            />
            <bufferAttribute
              attach="attributes-velocity"
              count={emberCount}
              array={emberVelocities}
              itemSize={3}
            />
            <bufferAttribute
              attach="attributes-size"
              count={emberCount}
              array={emberSizes}
              itemSize={1}
            />
            <bufferAttribute
              attach="attributes-lifetime"
              count={emberCount}
              array={emberLifetimes}
              itemSize={1}
            />
          </bufferGeometry>
          <shaderMaterial
            vertexShader={emberShader.vertexShader}
            fragmentShader={emberShader.fragmentShader}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>
      )}

      {/* SPARK PARTICLES - Exhale */}
      {phase === 'exhale' && (
        <points ref={sparksRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={sparkCount}
              array={sparkPositions}
              itemSize={3}
            />
            <bufferAttribute
              attach="attributes-velocity"
              count={sparkCount}
              array={sparkVelocities}
              itemSize={3}
            />
            <bufferAttribute
              attach="attributes-size"
              count={sparkCount}
              array={sparkSizes}
              itemSize={1}
            />
            <bufferAttribute
              attach="attributes-lifetime"
              count={sparkCount}
              array={sparkLifetimes}
              itemSize={1}
            />
          </bufferGeometry>
          <shaderMaterial
            vertexShader={sparkShader.vertexShader}
            fragmentShader={sparkShader.fragmentShader}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>
      )}
    </group>
  );
};

export default BreathingParticles;
