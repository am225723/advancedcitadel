import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const ProceduralStarfield = () => {
  const starsRef = useRef();
  const timeRef = useRef(0);

  const [positions, colors, sizes] = useMemo(() => {
    const count = 8000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const radius = 80 + Math.random() * 40;

      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);

      const colorChoice = Math.random();
      if (colorChoice < 0.3) {
        colors[i3] = 0.6 + Math.random() * 0.4;
        colors[i3 + 1] = 0.7 + Math.random() * 0.3;
        colors[i3 + 2] = 1.0;
      } else if (colorChoice < 0.6) {
        colors[i3] = 1.0;
        colors[i3 + 1] = 0.95 + Math.random() * 0.05;
        colors[i3 + 2] = 0.8 + Math.random() * 0.2;
      } else {
        colors[i3] = 0.9 + Math.random() * 0.1;
        colors[i3 + 1] = 0.9 + Math.random() * 0.1;
        colors[i3 + 2] = 0.9 + Math.random() * 0.1;
      }

      sizes[i] = Math.random() * 1.5 + 0.5;
    }

    return [positions, colors, sizes];
  }, []);

  const starShader = useMemo(() => ({
    vertexShader: `
      attribute float size;
      attribute vec3 color;
      attribute float randomOffset;
      varying vec3 vColor;
      varying float vAlpha;
      uniform float uTime;

      void main() {
        vColor = color;
        
        float twinkle = sin(uTime * 2.0 + randomOffset * 10.0) * 0.3 + 0.7;
        vAlpha = twinkle;

        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * (300.0 / -mvPosition.z) * twinkle;
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      varying float vAlpha;

      void main() {
        float distanceFromCenter = length(gl_PointCoord - 0.5);
        float alpha = 1.0 - smoothstep(0.3, 0.5, distanceFromCenter);
        
        vec3 finalColor = vColor;
        gl_FragColor = vec4(finalColor, alpha * vAlpha * 0.8);
      }
    `
  }), []);

  const randomOffsets = useMemo(() => {
    const offsets = new Float32Array(8000);
    for (let i = 0; i < 8000; i++) {
      offsets[i] = Math.random() * Math.PI * 2;
    }
    return offsets;
  }, []);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 }
  }), []);

  useFrame((state, delta) => {
    timeRef.current += delta;
    
    if (starsRef.current) {
      starsRef.current.rotation.y += delta * 0.01;
      starsRef.current.rotation.x = Math.sin(timeRef.current * 0.005) * 0.05;
      starsRef.current.material.uniforms.uTime.value = timeRef.current;
    }
  });

  return (
    <points ref={starsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={sizes.length}
          array={sizes}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-randomOffset"
          count={randomOffsets.length}
          array={randomOffsets}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={starShader.vertexShader}
        fragmentShader={starShader.fragmentShader}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export default ProceduralStarfield;
