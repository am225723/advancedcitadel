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
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      uniform float uTime;
      uniform float uDisplacement;
      uniform float uPhaseIntensity;
      uniform float uTurbulence;

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

      // Layered turbulent displacement for realistic flame motion
      float turbulentNoise(vec3 p, float time) {
        float n = 0.0;
        float amp = 1.0;
        float freq = 1.0;
        
        // Multiple octaves for detail
        for(int i = 0; i < 4; i++) {
          n += snoise(p * freq + vec3(0.0, time * 0.5, 0.0)) * amp;
          amp *= 0.5;
          freq *= 2.0;
        }
        
        return n;
      }

      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        
        vec3 pos = position;
        
        // Height-based intensity (more movement at top)
        float heightFactor = (pos.y + 1.0) * 0.5;
        float heightIntensity = pow(heightFactor, 1.5);
        
        // Layer 1: Base curl displacement
        vec3 curl1 = curlNoise(vec3(pos.x * 1.5, pos.y * 1.5 + uTime * 0.3, pos.z * 1.5));
        pos += curl1 * uDisplacement * 0.3 * (1.0 + heightIntensity);
        
        // Layer 2: Medium frequency turbulence
        float turb1 = turbulentNoise(pos * 2.0, uTime);
        pos += normal * turb1 * uDisplacement * 0.4 * heightIntensity;
        
        // Layer 3: High frequency flame tongues
        vec3 curl2 = curlNoise(vec3(pos.x * 3.0, pos.y * 4.0 + uTime * 0.8, pos.z * 3.0));
        pos += curl2 * uTurbulence * 0.3 * heightIntensity;
        
        // Rising flame effect - more pronounced at top
        float rise = snoise(vec3(pos.x * 2.0, uTime * 1.5, pos.z * 2.0)) * heightIntensity;
        pos.y += rise * uDisplacement * 0.5 * uPhaseIntensity;
        
        // Asymmetric distortion for natural look
        float asymmetry = snoise(vec3(pos.x * 1.5 + uTime * 0.2, pos.y, pos.z * 1.5));
        pos.x += asymmetry * 0.15 * heightIntensity * uTurbulence;
        
        vPosition = pos;
        vViewPosition = -(modelViewMatrix * vec4(pos, 1.0)).xyz;
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      varying vec3 vPosition;
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      uniform float uTime;
      uniform float uPhaseIntensity;
      uniform vec3 uCoreColor;
      uniform vec3 uMidColor;
      uniform vec3 uEdgeColor;
      uniform vec3 uTipColor;
      uniform float uDensity;
      
      // Improved simplex noise for fragment shader
      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

      float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy));
        vec2 x0 = v - i + dot(i, C.xx);
        vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod289(i);
        vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
        m = m*m;
        m = m*m;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
        vec3 g;
        g.x  = a0.x  * x0.x  + h.x  * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
      }
      
      // Worley/Voronoi noise for cellular flame structure
      float worleyNoise(vec2 uv, float time) {
        vec2 i_uv = floor(uv);
        vec2 f_uv = fract(uv);
        
        float minDist = 1.0;
        
        for(int y = -1; y <= 1; y++) {
          for(int x = -1; x <= 1; x++) {
            vec2 neighbor = vec2(float(x), float(y));
            vec2 point = fract(sin(i_uv + neighbor) * vec2(43758.5453, 73156.3287));
            point = 0.5 + 0.5 * sin(time + 6.2831 * point);
            vec2 diff = neighbor + point - f_uv;
            float dist = length(diff);
            minDist = min(minDist, dist);
          }
        }
        
        return minDist;
      }
      
      void main() {
        // Normalized position for gradients
        vec2 centeredUv = vUv - 0.5;
        float distFromCenter = length(centeredUv) * 2.0;
        
        // Height-based gradient (0 at bottom, 1 at top)
        float heightGradient = (vPosition.y + 1.0) * 0.5;
        float heightGradientSmooth = smoothstep(0.0, 1.0, heightGradient);
        
        // Fresnel effect for edge translucency
        vec3 viewDir = normalize(vViewPosition);
        float fresnel = pow(1.0 - abs(dot(viewDir, vNormal)), 2.0);
        
        // === LAYERED DENSITY ===
        
        // Core density (bright white-gold center) - EXPANDED
        float coreDensity = 1.0 - smoothstep(0.0, 0.5, distFromCenter);
        coreDensity *= (1.0 - heightGradientSmooth * 0.5); // Denser at bottom
        coreDensity *= uDensity;
        
        // Mid layer (amber/orange body) - EXTENDED further out
        float midDensity = 1.0 - smoothstep(0.3, 0.85, distFromCenter);
        midDensity *= (1.0 - heightGradientSmooth * 0.7);
        midDensity *= uDensity * 0.9;
        
        // Outer layer (only at very edges for red/violet hints)
        float outerDensity = 1.0 - smoothstep(0.75, 1.0, distFromCenter);
        outerDensity *= (1.0 - heightGradientSmooth * 0.9);
        outerDensity *= fresnel * 0.5;
        
        // === CELLULAR STRUCTURE (Worley noise) ===
        float cells = worleyNoise(vUv * 8.0, uTime * 0.5);
        float cellPattern = smoothstep(0.2, 0.8, cells);
        
        // High-frequency detail
        float detail = snoise(vUv * 15.0 + vec2(0.0, uTime * 2.0)) * 0.5 + 0.5;
        
        // Combine cellular structure with main density
        float cellInfluence = mix(0.7, 1.0, cellPattern);
        midDensity *= cellInfluence;
        
        // === TURBULENT DETAIL ===
        float turbulence = snoise(vUv * 12.0 + vec2(uTime * 1.5, uTime * 2.0));
        turbulence = turbulence * 0.5 + 0.5;
        
        // === COLOR GRADIENTS ===
        
        // Temperature-based color (hotter at bottom, cooler at top)
        float temperature = 1.0 - heightGradientSmooth;
        
        // Core: brilliant white-gold - INCREASED contribution
        vec3 coreContribution = uCoreColor * coreDensity * 1.5;
        
        // Mid: mostly amber, subtle orange at tips only
        vec3 midColor = mix(uMidColor, uEdgeColor, heightGradientSmooth * 0.3);
        midColor = mix(midColor, midColor * 0.8, cellPattern * 0.3); // Darker in cell boundaries
        vec3 midContribution = midColor * midDensity * 1.1;
        
        // Outer edges: subtle orange to purple hints at very tips
        vec3 edgeColor = mix(uEdgeColor, uTipColor, heightGradientSmooth * 0.8);
        vec3 outerContribution = edgeColor * outerDensity * 0.5;
        
        // === FINAL COMPOSITION ===
        vec3 finalColor = coreContribution + midContribution + outerContribution;
        
        // Add subtle detail variation
        finalColor *= mix(0.9, 1.1, detail);
        
        // Overall opacity with height falloff
        float baseAlpha = max(coreDensity, max(midDensity, outerDensity));
        
        // Exponential falloff at top for wispy effect
        float heightFalloff = 1.0 - pow(heightGradientSmooth, 2.0);
        float alpha = baseAlpha * heightFalloff;
        
        // Add turbulent transparency for realism
        alpha *= mix(0.85, 1.0, turbulence);
        
        // Fade at very edges
        alpha *= smoothstep(1.0, 0.7, distFromCenter);
        
        // Flickering effect (subtle)
        float flicker = sin(uTime * 8.0 + vPosition.y * 3.0) * 0.05 + 0.95;
        flicker *= sin(uTime * 12.0 + vPosition.x * 5.0) * 0.03 + 0.97;
        alpha *= flicker;
        
        // Intensity boost for phase
        finalColor *= (0.8 + uPhaseIntensity * 0.4);
        
        gl_FragColor = vec4(finalColor, alpha);
      }
    `
  }), []);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uDisplacement: { value: 0.35 },
    uTurbulence: { value: 0.4 },
    uPhaseIntensity: { value: 0.5 },
    uDensity: { value: 1.0 },
    uCoreColor: { value: new THREE.Color('#FFFEF0') },      // Bright white-gold
    uMidColor: { value: new THREE.Color('#FFB347') },       // Amber
    uEdgeColor: { value: new THREE.Color('#FF8C00') },      // Deep fiery orange (not red)
    uTipColor: { value: new THREE.Color('#9370DB') }        // Medium purple for mystical hints
  }), []);

  useFrame((state, delta) => {
    timeRef.current += delta;
    
    if (flameMeshRef.current) {
      flameMeshRef.current.material.uniforms.uTime.value = timeRef.current;

      let targetScale = 0.5;
      let targetIntensity = 0.3;
      let targetDisplacement = 0.35;
      let targetTurbulence = 0.4;
      let targetDensity = 1.0;
      let coreColor = new THREE.Color('#FFFEF0');
      let midColor = new THREE.Color('#FFB347');
      let edgeColor = new THREE.Color('#FF8C00');
      let tipColor = new THREE.Color('#9370DB');
      let lightIntensity = 4;
      let lightColor = new THREE.Color('#FF8C42');

      if (isRunning) {
        switch (phase) {
          case 'inhale':
            // Growing, intensifying
            targetScale = 0.5 + (phaseProgress * 0.85);
            targetIntensity = 0.3 + (phaseProgress * 0.7);
            targetDisplacement = 0.35 + (phaseProgress * 0.45);
            targetTurbulence = 0.4 + (phaseProgress * 0.5);
            targetDensity = 1.0 + (phaseProgress * 0.3);
            
            // Color shift toward bright white-gold
            coreColor.lerpColors(
              new THREE.Color('#FFFEF0'),
              new THREE.Color('#FFFFFF'),
              phaseProgress
            );
            midColor.lerpColors(
              new THREE.Color('#FFB347'),
              new THREE.Color('#FFE4B5'),
              phaseProgress
            );
            
            lightIntensity = 4 + (phaseProgress * 8);
            lightColor.lerpColors(
              new THREE.Color('#FF8C42'),
              new THREE.Color('#FFE8B3'),
              phaseProgress
            );
            break;
            
          case 'hold':
          case 'holdAfter':
            // Sustained brilliance with subtle pulse
            const pulse = Math.sin(timeRef.current * 2.5) * 0.04;
            targetScale = 1.35 + pulse;
            targetIntensity = 1.0;
            targetDisplacement = 0.6 + pulse * 0.5;
            targetTurbulence = 0.9;
            targetDensity = 1.3;
            
            coreColor = new THREE.Color('#FFFFFF');
            midColor = new THREE.Color('#FFE4B5');
            edgeColor = new THREE.Color('#FFD700');
            tipColor = new THREE.Color('#9370DB');
            
            lightIntensity = 12 + pulse * 3;
            lightColor = new THREE.Color('#FFEBCD');
            break;
            
          case 'exhale':
            // Cooling, settling
            targetScale = 1.35 - (phaseProgress * 0.85);
            targetIntensity = 1.0 - (phaseProgress * 0.7);
            targetDisplacement = 0.8 - (phaseProgress * 0.45);
            targetTurbulence = 0.9 - (phaseProgress * 0.5);
            targetDensity = 1.3 - (phaseProgress * 0.3);
            
            // Cool back to base colors
            coreColor.lerpColors(
              new THREE.Color('#FFFFFF'),
              new THREE.Color('#FFFEF0'),
              phaseProgress
            );
            midColor.lerpColors(
              new THREE.Color('#FFE4B5'),
              new THREE.Color('#FFB347'),
              phaseProgress
            );
            edgeColor.lerpColors(
              new THREE.Color('#FFD700'),
              new THREE.Color('#FF8C00'),
              phaseProgress
            );
            
            lightIntensity = 12 - (phaseProgress * 8);
            lightColor.lerpColors(
              new THREE.Color('#FFEBCD'),
              new THREE.Color('#FF8C42'),
              phaseProgress
            );
            break;
            
          default:
            // Idle state - calm, small flame
            targetScale = 0.5;
            targetIntensity = 0.3;
            targetTurbulence = 0.3;
        }
      }

      // Smooth interpolation
      const lerpSpeed = delta * 2.5;
      
      flameMeshRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale * 1.2, targetScale), // Slightly taller
        delta * 3
      );

      flameMeshRef.current.material.uniforms.uPhaseIntensity.value = THREE.MathUtils.lerp(
        flameMeshRef.current.material.uniforms.uPhaseIntensity.value,
        targetIntensity,
        lerpSpeed
      );

      flameMeshRef.current.material.uniforms.uDisplacement.value = THREE.MathUtils.lerp(
        flameMeshRef.current.material.uniforms.uDisplacement.value,
        targetDisplacement,
        lerpSpeed
      );

      flameMeshRef.current.material.uniforms.uTurbulence.value = THREE.MathUtils.lerp(
        flameMeshRef.current.material.uniforms.uTurbulence.value,
        targetTurbulence,
        lerpSpeed
      );

      flameMeshRef.current.material.uniforms.uDensity.value = THREE.MathUtils.lerp(
        flameMeshRef.current.material.uniforms.uDensity.value,
        targetDensity,
        lerpSpeed
      );

      flameMeshRef.current.material.uniforms.uCoreColor.value.lerp(coreColor, lerpSpeed);
      flameMeshRef.current.material.uniforms.uMidColor.value.lerp(midColor, lerpSpeed);
      flameMeshRef.current.material.uniforms.uEdgeColor.value.lerp(edgeColor, lerpSpeed);
      flameMeshRef.current.material.uniforms.uTipColor.value.lerp(tipColor, lerpSpeed);

      if (pointLightRef.current) {
        pointLightRef.current.intensity = THREE.MathUtils.lerp(
          pointLightRef.current.intensity,
          lightIntensity,
          delta * 3
        );
        pointLightRef.current.color.lerp(lightColor, lerpSpeed);
      }
    }
  });

  return (
    <group position={[0, -0.5, 0]}>
      <mesh ref={flameMeshRef}>
        <sphereGeometry args={[1, 48, 96]} />
        <shaderMaterial
          uniforms={uniforms}
          vertexShader={flameShader.vertexShader}
          fragmentShader={flameShader.fragmentShader}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
        />
      </mesh>
      <pointLight 
        ref={pointLightRef}
        position={[0, 0.3, 0]}
        intensity={4}
        distance={18}
        color="#FF8C42"
        decay={2}
      />
    </group>
  );
};

export default PremiumSoulFlame;
