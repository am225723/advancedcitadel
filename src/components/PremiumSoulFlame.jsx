import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const PremiumSoulFlame = ({ phase, phaseProgress, isRunning }) => {
  const flameMeshRef = useRef();
  const pointLightRef = useRef();
  const timeRef = useRef(0);

  const flameShader = useMemo(() => ({
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vPosition;
      uniform float uTime;
      uniform float uDisplacement;
      uniform float uPhaseIntensity;

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

      vec3 curlNoise(vec3 p) {
        const float e = 0.1;
        vec3 dx = vec3(e, 0.0, 0.0);
        vec3 dy = vec3(0.0, e, 0.0);
        vec3 dz = vec3(0.0, 0.0, e);
        
        vec3 p_x0 = snoise(p - dx) * vec3(1.0);
        vec3 p_x1 = snoise(p + dx) * vec3(1.0);
        vec3 p_y0 = snoise(p - dy) * vec3(1.0);
        vec3 p_y1 = snoise(p + dy) * vec3(1.0);
        vec3 p_z0 = snoise(p - dz) * vec3(1.0);
        vec3 p_z1 = snoise(p + dz) * vec3(1.0);
        
        float x = (p_y1.z - p_y0.z) - (p_z1.y - p_z0.y);
        float y = (p_z1.x - p_z0.x) - (p_x1.z - p_x0.z);
        float z = (p_x1.y - p_x0.y) - (p_y1.x - p_y0.x);
        
        return normalize(vec3(x, y, z));
      }

      void main() {
        vUv = uv;
        vPosition = position;
        
        vec3 pos = position;
        float noise = snoise(vec3(pos.x * 2.0, pos.y * 2.0 + uTime, pos.z * 2.0)) * uDisplacement;
        
        vec3 curl = curlNoise(vec3(pos.x, pos.y + uTime * 0.5, pos.z)) * uDisplacement * 0.5;
        
        pos += curl;
        pos.y += noise * (1.0 + pos.y) * uPhaseIntensity;
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      varying vec3 vPosition;
      uniform float uTime;
      uniform float uPhaseIntensity;
      uniform vec3 uCoreColor;
      uniform vec3 uEdgeColor;
      
      void main() {
        float distanceFromCenter = length(vUv - 0.5) * 2.0;
        float heightFactor = (vPosition.y + 1.0) * 0.5;
        
        float alpha = 1.0 - distanceFromCenter;
        alpha *= (1.0 - heightFactor * 0.7);
        alpha = smoothstep(0.0, 0.8, alpha);
        
        float coreMask = 1.0 - smoothstep(0.0, 0.4, distanceFromCenter);
        coreMask *= uPhaseIntensity;
        
        vec3 color = mix(uEdgeColor, uCoreColor, coreMask);
        
        float flicker = sin(uTime * 10.0 + vPosition.y * 5.0) * 0.1 + 0.9;
        alpha *= flicker;
        
        gl_FragColor = vec4(color, alpha * 0.9);
      }
    `
  }), []);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uDisplacement: { value: 0.3 },
    uPhaseIntensity: { value: 0.5 },
    uCoreColor: { value: new THREE.Color('#FFE8B3') },
    uEdgeColor: { value: new THREE.Color('#FF6B35') }
  }), []);

  useFrame((state, delta) => {
    timeRef.current += delta;
    
    if (flameMeshRef.current) {
      flameMeshRef.current.material.uniforms.uTime.value = timeRef.current;

      let targetScale = 0.5;
      let targetIntensity = 0.3;
      let targetDisplacement = 0.3;
      let coreColor = '#FFD700';
      let edgeColor = '#FF6B35';
      let lightIntensity = 3;
      let lightColor = new THREE.Color('#FF6B35');

      if (isRunning) {
        switch (phase) {
          case 'inhale':
            targetScale = 0.5 + (phaseProgress * 0.8);
            targetIntensity = 0.3 + (phaseProgress * 0.7);
            targetDisplacement = 0.3 + (phaseProgress * 0.4);
            coreColor = THREE.MathUtils.lerp(0xFFD700, 0xFFFFFF, phaseProgress);
            lightIntensity = 3 + (phaseProgress * 7);
            lightColor = new THREE.Color().lerpColors(
              new THREE.Color('#FF6B35'),
              new THREE.Color('#FFE8B3'),
              phaseProgress
            );
            break;
          case 'hold':
          case 'holdAfter':
            targetScale = 1.3 + Math.sin(timeRef.current * 2) * 0.05;
            targetIntensity = 1.0;
            targetDisplacement = 0.5;
            coreColor = '#FFFFFF';
            edgeColor = '#FFD700';
            lightIntensity = 10;
            lightColor = new THREE.Color('#FFE8B3');
            break;
          case 'exhale':
            targetScale = 1.3 - (phaseProgress * 0.8);
            targetIntensity = 1.0 - (phaseProgress * 0.7);
            targetDisplacement = 0.7 - (phaseProgress * 0.4);
            coreColor = THREE.MathUtils.lerp(0xFFFFFF, 0xFFD700, phaseProgress);
            edgeColor = THREE.MathUtils.lerp(0xFFD700, 0xFF6B35, phaseProgress);
            lightIntensity = 10 - (phaseProgress * 7);
            lightColor = new THREE.Color().lerpColors(
              new THREE.Color('#FFE8B3'),
              new THREE.Color('#FF6B35'),
              phaseProgress
            );
            break;
          default:
            targetScale = 0.5;
            targetIntensity = 0.3;
        }
      }

      flameMeshRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        delta * 3
      );

      flameMeshRef.current.material.uniforms.uPhaseIntensity.value = THREE.MathUtils.lerp(
        flameMeshRef.current.material.uniforms.uPhaseIntensity.value,
        targetIntensity,
        delta * 2
      );

      flameMeshRef.current.material.uniforms.uDisplacement.value = THREE.MathUtils.lerp(
        flameMeshRef.current.material.uniforms.uDisplacement.value,
        targetDisplacement,
        delta * 2
      );

      flameMeshRef.current.material.uniforms.uCoreColor.value.lerp(
        new THREE.Color(coreColor),
        delta * 2
      );
      
      flameMeshRef.current.material.uniforms.uEdgeColor.value.lerp(
        new THREE.Color(edgeColor),
        delta * 2
      );

      if (pointLightRef.current) {
        pointLightRef.current.intensity = THREE.MathUtils.lerp(
          pointLightRef.current.intensity,
          lightIntensity,
          delta * 3
        );
        pointLightRef.current.color.lerp(lightColor, delta * 2);
      }
    }
  });

  return (
    <group position={[0, -0.5, 0]}>
      <mesh ref={flameMeshRef}>
        <sphereGeometry args={[1, 32, 64]} />
        <shaderMaterial
          uniforms={uniforms}
          vertexShader={flameShader.vertexShader}
          fragmentShader={flameShader.fragmentShader}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <pointLight 
        ref={pointLightRef}
        position={[0, 0, 0]}
        intensity={3}
        distance={15}
        color="#FF6B35"
      />
    </group>
  );
};

export default PremiumSoulFlame;
