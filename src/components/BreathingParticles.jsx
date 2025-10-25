import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const BreathingParticles = ({ phase, phaseProgress }) => {
  const embersRef = useRef();
  const sparksRef = useRef();
  const emberTimeRef = useRef(0);
  const sparkTimeRef = useRef(0);

  const emberCount = 300; // Can increase for denser effect
  const sparkCount = 200; // Can increase for denser effect

  // Enhanced ember particle shader for soft, glowing appearance
  const emberShader = useMemo(() => ({
    vertexShader: `
      attribute float size;
      attribute float lifetime;
      // attribute vec3 velocity; // Not directly used in VS, but passed as attribute

      varying float vLifetime;

      void main() {
        vLifetime = lifetime;

        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

        // size attenuation based on distance and lifetime
        float fadeIn = smoothstep(0.0, 0.15, lifetime);
        float fadeOut = smoothstep(0.0, 0.3, 1.0 - lifetime);
        float finalSize = size * fadeIn * fadeOut;

        gl_PointSize = finalSize * (200.0 / -mvPosition.z); // Scale size based on distance
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      varying float vLifetime;

      void main() {
        // Soft circular gradient
        vec2 center = gl_PointCoord - vec2(0.5);
        float dist = length(center);

        // Soft edge falloff and extra falloff for a more circular shape
        float alpha = 1.0 - smoothstep(0.2, 0.55, dist);
        alpha *= 1.0 - smoothstep(0.4, 0.5, dist);

        // Lifetime-based fade (slightly longer fade out)
        float lifeFade = smoothstep(0.0, 0.25, vLifetime) * smoothstep(0.0, 0.5, 1.0 - vLifetime);
        alpha *= lifeFade;

        // More intense core glow
        float glow = exp(-dist * 8.0); // Increased glow intensity

        // Rich amber-orange color with bright core
        vec3 coreColor = vec3(1.0, 0.98, 0.9); // Almost white-gold core
        vec3 midColor = vec3(1.0, 0.8, 0.5);   // Vibrant amber
        vec3 edgeColor = vec3(1.0, 0.55, 0.2); // Fiery orange

        vec3 color = mix(edgeColor, midColor, glow);
        color = mix(color, coreColor, pow(glow, 2.0)); // Stronger core color contribution

        // Brightness modulation
        color *= (0.8 + glow * 0.8); // Brighter overall

        gl_FragColor = vec4(color, alpha * 0.8); // Slightly reduce overall alpha for more ethereal feel
      }
    `
  }), []);

  // Enhanced spark shader for bright, energetic sparks
  const sparkShader = useMemo(() => ({
    vertexShader: `
      attribute float size;
      attribute float lifetime;
      // attribute vec3 velocity; // Not directly used in VS

      varying float vLifetime;
      // varying float vVelocity; // If you plan to use velocity in FS

      void main() {
        vLifetime = lifetime;
        // vVelocity = length(velocity); // If used

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
      // varying float vVelocity; // If used

      void main() {
        vec2 center = gl_PointCoord - vec2(0.5);
        float dist = length(center);

        // Bright, sharp core with soft halo
        float alpha = 1.0 - smoothstep(0.1, 0.45, dist); // Sharper core, softer halo
        alpha *= 1.0 - smoothstep(0.4, 0.5, dist); // Extra falloff

        // Lifetime fade (quick fade in, longer fade out)
        float lifeFade = smoothstep(0.0, 0.15, vLifetime) * smoothstep(0.0, 0.5, 1.0 - vLifetime);
        alpha *= lifeFade;

        // Intense core
        float intensity = exp(-dist * 10.0); // More intense core glow

        // Brilliant white-gold to orange
        vec3 coreColor = vec3(1.0, 1.0, 1.0); // Pure white core
        vec3 glowColor = vec3(1.0, 0.95, 0.8); // Lighter yellow-gold
        vec3 edgeColor = vec3(1.0, 0.7, 0.4); // Softer orange edge

        vec3 color = mix(edgeColor, glowColor, intensity);
        color = mix(color, coreColor, pow(intensity, 2.0)); // Stronger pure white core

        // Extra brightness
        color *= (1.2 + intensity * 0.8); // Significantly brighter

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
      const distance = 6 + Math.random() * 3; // Start further out
      const heightOffset = (Math.random() - 0.5) * 4; // Wider height range

      positions[i3] = Math.cos(angle) * distance;
      positions[i3 + 1] = heightOffset;
      positions[i3 + 2] = Math.sin(angle) * distance;

      velocities[i3] = -Math.cos(angle) * (1.0 + Math.random() * 0.5); // Initial velocity towards center
      velocities[i3 + 1] = (0.5 - heightOffset * 0.1) + (Math.random() - 0.5) * 0.1; // Gentle vertical nudge
      velocities[i3 + 2] = -Math.sin(angle) * (1.0 + Math.random() * 0.5);

      sizes[i] = 8 + Math.random() * 12;
      lifetimes[i] = Math.random() * 0.8 + 0.2; // Start with some life
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
      const offsetFactor = 0.3; // Closer to center of flame top
      const offsetx = (Math.random() - 0.5) * offsetFactor;
      const offsetz = (Math.random() - 0.5) * offsetFactor;
      positions[i3] = offsetx;
      positions[i3 + 1] = 0.8 + Math.random() * 0.4; // Slightly lower initial height for a more "released" look
      positions[i3 + 2] = offsetz;

      // Upward and outward velocity with variation
      const angle = Math.random() * Math.PI * 2;
      const spread = 0.2 + Math.random() * 0.3; // Less initial spread
      velocities[i3] = Math.cos(angle) * spread;
      velocities[i3 + 1] = 0.8 + Math.random() * 0.5; // Slower initial upward velocity
      velocities[i3 + 2] = Math.sin(angle) * spread;

      sizes[i] = 6 + Math.random() * 10;
      lifetimes[i] = Math.random() * 0.8 + 0.2; // Start with some life
    }
    return [positions, velocities, sizes, lifetimes];
  }, []);

  useFrame((state, delta) => {
    // Ember particles (inhale phase)
    if (embersRef.current && phase === 'inhale') {
      emberTimeRef.current += delta;
      const positions = embersRef.current.geometry.attributes.position.array;
      const velocities = embersRef.current.geometry.attributes.velocity.array;
      const lifetimes = embersRef.current.geometry.attributes.lifetime.array;

      for (let i = 0; i < emberCount; i++) {
        const i3 = i * 3;

        // Decay lifetime
        lifetimes[i] -= delta * 0.4; // Slower decay

        if (lifetimes[i] <= 0) {
          // Respawn at edge
          const angle = Math.random() * Math.PI * 2;
          const distance = 6 + Math.random() * 3; // Start further out
          const heightOffset = (Math.random() - 0.5) * 4; // Wider height range

          positions[i3] = Math.cos(angle) * distance;
          positions[i3 + 1] = heightOffset;
          positions[i3 + 2] = Math.sin(angle) * distance;

          velocities[i3] = -Math.cos(angle) * (1.0 + Math.random() * 0.5);
          velocities[i3 + 1] = (0.5 - heightOffset * 0.1) + (Math.random() - 0.5) * 0.1;
          velocities[i3 + 2] = -Math.sin(angle) * (1.0 + Math.random() * 0.5);

          lifetimes[i] = 1.0; // Full lifetime on respawn
        } else {
          // Move toward flame center (slightly above origin)
          const targetX = 0;
          const targetY = 0.5;
          const targetZ = 0;

          const toCenter = new THREE.Vector3(
            targetX - positions[i3],
            targetY - positions[i3 + 1],
            targetZ - positions[i3 + 2]
          );
          const distToCenter = toCenter.length();

          if (distToCenter > 0.1) {
            toCenter.normalize();

            // Accelerate as they get closer, influenced by phaseProgress
            const accelerationFactor = (1.0 - lifetimes[i]) * 8 * (0.5 + phaseProgress * 0.5); // Stronger acceleration
            velocities[i3] += toCenter.x * accelerationFactor * delta;
            velocities[i3 + 1] += toCenter.y * accelerationFactor * delta;
            velocities[i3 + 2] += toCenter.z * accelerationFactor * delta;
          }

          // Apply velocity with drag
          const drag = 0.985; // Less drag
          positions[i3] += velocities[i3] * delta;
          positions[i3 + 1] += velocities[i3 + 1] * delta;
          positions[i3 + 2] += velocities[i3 + 2] * delta;

          velocities[i3] *= drag;
          velocities[i3 + 1] *= drag;
          velocities[i3 + 2] *= drag;

          // Add swirl - tie magnitude to phaseProgress and distance
          const swirlMagnitude = 0.3 * (0.5 + phaseProgress * 0.5) * (1.0 - Math.min(distToCenter / 6.0, 1.0)); // Stronger swirl closer to flame
          positions[i3] += Math.sin(emberTimeRef.current * 4 + i * 0.2) * swirlMagnitude * delta;
          positions[i3 + 2] += Math.cos(emberTimeRef.current * 4 + i * 0.2) * swirlMagnitude * delta;
        }
      }

      embersRef.current.geometry.attributes.position.needsUpdate = true;
      embersRef.current.geometry.attributes.lifetime.needsUpdate = true;
      embersRef.current.geometry.attributes.velocity.needsUpdate = true; // Also update velocity
    }

    // Spark particles (exhale phase)
    if (sparksRef.current && phase === 'exhale') {
      sparkTimeRef.current += delta;
      const positions = sparksRef.current.geometry.attributes.position.array;
      const velocities = sparksRef.current.geometry.attributes.velocity.array;
      const lifetimes = sparksRef.current.geometry.attributes.lifetime.array;

      for (let i = 0; i < sparkCount; i++) {
        const i3 = i * 3;

        // Faster decay
        lifetimes[i] -= delta * 0.6;

        if (lifetimes[i] <= 0) {
          // Respawn at flame top
          const offsetFactor = 0.3; // Closer to center of flame top
          const offsetx = (Math.random() - 0.5) * offsetFactor;
          const offsetz = (Math.random() - 0.5) * offsetFactor;
          positions[i3] = offsetx;
          positions[i3 + 1] = 0.8 + Math.random() * 0.4; // Slightly lower initial height for a more "released" look
          positions[i3 + 2] = offsetz;

          const angle = Math.random() * Math.PI * 2;
          const spread = 0.2 + Math.random() * 0.3; // Less initial spread
          velocities[i3] = Math.cos(angle) * spread;
          velocities[i3 + 1] = 0.8 + Math.random() * 0.5; // Slower initial upward velocity
          velocities[i3 + 2] = Math.sin(angle) * spread;

          lifetimes[i] = 1.0; // Full lifetime on respawn
        } else {
          // Physics simulation
          positions[i3] += velocities[i3] * delta;
          positions[i3 + 1] += velocities[i3 + 1] * delta;
          positions[i3 + 2] += velocities[i3 + 2] * delta;

          // Gravity - reduce slightly for floating effect
          velocities[i3 + 1] -= delta * 0.6; // Reduced gravity

          // Air resistance - very subtle drag for floating
          const drag = 0.99; // Less drag
          velocities[i3] *= drag;
          velocities[i3 + 1] *= drag;
          velocities[i3 + 2] *= drag;

          // Gentle turbulence - more drift-like
          const turbulenceMagnitude = 0.1 * (1.0 - phaseProgress); // Less turbulence as exhale progresses
          positions[i3] += Math.sin(sparkTimeRef.current * 3 + i * 0.5) * turbulenceMagnitude * delta;
          positions[i3 + 2] += Math.cos(sparkTimeRef.current * 3 + i * 0.5) * turbulenceMagnitude * delta;
        }
      }

      sparksRef.current.geometry.attributes.position.needsUpdate = true;
      sparksRef.current.geometry.attributes.velocity.needsUpdate = true;
      sparksRef.current.geometry.attributes.lifetime.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Ember particles - inhale */}
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
            uniforms={{ /* Add any uniforms here if needed */ }}
          />
        </points>
      )}

      {/* Spark particles - exhale */}
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
            uniforms={{ /* Add any uniforms here if needed */ }}
          />
        </points>
      )}
    </group>
  );
};

export default BreathingParticles;
