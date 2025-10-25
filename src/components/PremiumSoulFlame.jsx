import React, { useRef, useMemo, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
// If you plan to use EffectComposer with Bloom, import them.
// They usually wrap the <Canvas> component, so they're commented out here.
// import { EffectComposer, Bloom } from '@react-three/postprocessing';
// import { useGLTF } from '@react-three/drei'; // For more complex 3D assets if needed

// --- CONCEPTUAL PARTICLE SYSTEM COMPONENT ---
// This would be in its own file (e.g., SoulParticles.jsx)
// You would need to implement the actual particle generation, update, and rendering logic here.
const SoulParticles = ({ phase, isRunning, time }) => {
  const particlesRef = useRef();
  // Example: Use a BufferGeometry and PointsMaterial
  // For production, you'd manage particle positions, velocities, colors, and lifetimes
  // in arrays, update them in useFrame, and set attributes on the BufferGeometry.

  // This is a highly simplified placeholder.
  // A real implementation would involve:
  // 1. Initializing BufferGeometry with attributes for position, size, color, alpha.
  // 2. A custom ShaderMaterial for points, handling blending, glow, and fading.
  // 3. Logic in useFrame to generate new particles, move existing ones, and remove dead ones.
  // 4. Different generation/movement logic based on the 'phase' prop.

  useFrame(() => {
    if (particlesRef.current && isRunning) {
      // Example: Placeholder for particle animation
      // You would update positions based on phase:
      // - 'inhale': particles move inwards towards the flame
      // - 'exhale': particles move outwards from the flame
      // - 'hold': minimal particle activity, maybe some small, slow upward drift
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry attach="geometry">
        {/* Placeholder attributes - replace with actual dynamic particle data */}
        <bufferAttribute
          attach="attributes-position"
          array={new Float32Array([0, 0, 0, 0.1, 0.1, 0.1])} // Example: two points
          itemSize={3}
          count={2}
        />
        <bufferAttribute
          attach="attributes-size"
          array={new Float32Array([1.0, 1.5])} // Example sizes
          itemSize={1}
          count={2}
        />
        <bufferAttribute
          attach="attributes-color"
          array={new Float32Array([1, 1, 0, 1, 0.5, 0])} // Example colors
          itemSize={3}
          count={2}
        />
      </bufferGeometry>
      <pointsMaterial
        attach="material"
        size={0.1}
        color="#ffaa00"
        sizeAttenuation={true}
        transparent={true}
        alphaTest={0.5}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};
// --- END CONCEPTUAL PARTICLE SYSTEM COMPONENT ---


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

      // Simplex Noise (improved for 3D)
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
        const float e = 0.01; // Smaller epsilon for finer curl
        vec3 dx = vec3(e, 0.0, 0.0);
        vec3 dy = vec3(0.0, e, 0.0);
        vec3 dz = vec3(0.0, 0.0, e);

        // Use snoise for 3D curl
        float n_x0 = snoise(p - dx);
        float n_x1 = snoise(p + dx);
        float n_y0 = snoise(p - dy);
        float n_y1 = snoise(p + dy);
        float n_z0 = snoise(p - dz);
        float n_z1 = snoise(p + dz);

        float x = (n_y1 - n_y0) - (n_z1 - n_z0);
        float y = (n_z1 - n_z0) - (n_x1 - n_x0);
        float z = (n_x1 - n_x0) - (n_y1 - n_y0);

        return vec3(x, y, z) / (2.0 * e); // Divide by 2e to approximate derivative
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
        vNormal = normalize(normalMatrix * normal); // Correct normal calculation

        vec3 pos = position;

        // Height-based intensity (more movement at top)
        float heightFactor = (pos.y + 1.0) * 0.5; // Normalized height from 0 to 1
        float heightIntensity = pow(heightFactor, 2.0); // Exponential curve, more influence at top

        // Layer 1: Base curl displacement for overall shape
        vec3 curl1 = curlNoise(vec3(pos.x * 1.5, pos.y * 1.5 + uTime * 0.3, pos.z * 1.5));
        pos += curl1 * uDisplacement * 0.3 * (1.0 + heightIntensity);

        // Layer 2: Medium frequency turbulence
        float turb1 = turbulentNoise(pos * 2.0, uTime * 0.7);
        pos += normal * turb1 * uDisplacement * 0.4 * heightIntensity;

        // Layer 3: High frequency flame tongues
        vec3 curl2 = curlNoise(vec3(pos.x * 3.0, pos.y * 4.0 + uTime * 0.8, pos.z * 3.0));
        pos += curl2 * uTurbulence * 0.3 * heightIntensity;

        // Rising flame effect - more pronounced at top
        // Use simplex noise for more organic rise
        float rise = snoise(vec3(pos.x * 2.0, uTime * 1.5, pos.z * 2.0)) * heightIntensity;
        pos.y += rise * uDisplacement * 0.5 * uPhaseIntensity;

        // Asymmetric distortion for natural look (based on noise)
        float asymmetry = snoise(vec3(pos.x * 1.5 + uTime * 0.2, pos.y * 2.0, pos.z * 1.5));
        pos.x += asymmetry * 0.15 * heightIntensity * uTurbulence; // Increased influence

        vPosition = pos;
        vViewPosition = -(modelViewMatrix * vec4(pos, 1.0)).xyz; // Correct view position

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
      uniform vec3 uOuterWispColor; // NEW uniform
      uniform float uDensity;

      // === 3D Simplex Noise ===
      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 mod289_v4(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 permute(vec4 x) { return mod289_v4(((x*34.0)+1.0)*x); }
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

      // === 2D Simplex Noise ===
      vec3 mod289_2d(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec2 mod289_2d_vec2(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec3 permute_2d(vec3 x) { return mod289_2d(((x*34.0)+1.0)*x); }

      float snoise_2d(vec2 v) {
        const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy));
        vec2 x0 = v - i + dot(i, C.xx);
        vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod289_2d_vec2(i);
        vec3 p = permute_2d(permute_2d(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
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

      // Worley/Voronoi noise for cellular flame structure (optimized)
      float worleyNoise(vec2 uv, float time) {
        vec2 i_uv = floor(uv);
        vec2 f_uv = fract(uv);

        float minDist = 1.0;

        for(int y = -1; y <= 1; y++) {
          for(int x = -1; x <= 1; x++) {
            vec2 neighbor = vec2(float(x), float(y));
            vec2 point = fract(sin(i_uv + neighbor + time * 0.1) * vec2(43758.5453, 73156.3287)); // time influence
            point = 0.5 + 0.5 * sin(time + 6.2831 * point); // organic point movement
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
        float heightGradient = (vPosition.y + 1.0) * 0.5; // From -1 to 1, now 0 to 1
        float heightGradientSmooth = smoothstep(0.0, 1.0, heightGradient);

        // Fresnel effect for edge translucency
        vec3 viewDir = normalize(vViewPosition);
        float fresnel = pow(1.0 - abs(dot(viewDir, vNormal)), 2.5); // Stronger fresnel

        // === Layered Density with volumetric noise ===
        // 3D Simplex noise for internal volumetric density variation
        float noiseDensity = snoise(vPosition * 4.0 + vec3(0.0, uTime * 1.5, 0.0)) * 0.5 + 0.5;

        // Core density (bright white-gold center) - expanded
        float coredensity = 1.0 - smoothstep(0.0, 0.4, distFromCenter);
        coredensity *= (1.0 - heightGradientSmooth * 0.7); // Denser at bottom
        coredensity *= uDensity;
        coredensity *= noiseDensity; // Apply volumetric noise

        // Mid layer (amber/orange body) - extended further out
        float middensity = 1.0 - smoothstep(0.3, 0.8, distFromCenter);
        middensity *= (1.0 - heightGradientSmooth * 0.85);
        middensity *= uDensity * 0.9;
        middensity *= noiseDensity * 0.9; // Apply volumetric noise

        // Outer layer (for red/violet/blue hints at very edges and tips)
        float outerdensity = 1.0 - smoothstep(0.7, 1.0, distFromCenter);
        outerdensity *= (1.0 - heightGradientSmooth * 0.95);
        outerdensity *= fresnel * 0.7; // Stronger fresnel influence
        outerdensity *= uDensity * 0.7; // Denser outer wisps
        outerdensity *= noiseDensity * 0.7; // Apply volumetric noise

        // === Cellular structure (Worley noise) ===
        float cells = worleyNoise(vUv * 8.0, uTime * 0.5);
        float cellPattern = smoothstep(0.2, 0.8, cells);

        // High-frequency detail
        float detail = snoise_2d(vUv * 15.0 + vec2(uTime * 2.0, uTime * 1.5)) * 0.5 + 0.5;

        // Combine cellular structure with main density
        float cellInfluence = mix(0.7, 1.0, cellPattern);
        middensity *= cellInfluence;

        // === Turbulent detail (2D for fragment color variation) ===
        float turbulence = snoise_2d(vUv * 12.0 + vec2(uTime * 1.5, uTime * 2.0));
        turbulence = turbulence * 0.5 + 0.5;

        // === Color Gradients (FIXED: Normalized weights instead of additive) ===
        // Isolate each layer's contribution
        float coreWeight = coredensity;
        float midWeight = max(middensity - coreWeight * 0.4, 0.0); // Subtract core overlap
        float outerWeight = max(outerdensity - midWeight * 0.5, 0.0); // Subtract mid overlap
        
        // Normalize weights so they don't exceed 1.0
        float totalWeight = coreWeight + midWeight + outerWeight + 0.001; // Avoid division by zero
        coreWeight /= totalWeight;
        midWeight /= totalWeight;
        outerWeight /= totalWeight;

        // Mid-color blending: more yellow-gold, some orange, darker in cell boundaries
        vec3 midColorBlended = mix(uMidColor, uEdgeColor, heightGradientSmooth * 0.3);
        midColorBlended = mix(midColorBlended, midColorBlended * 0.8, cellPattern * 0.3);

        // Outer-color blending: fiery orange with subtle cool wisps at top/edges
        vec3 edgeColorBlended = mix(uEdgeColor, uOuterWispColor, heightGradientSmooth * 0.8 * fresnel);
        
        // WEIGHTED AVERAGE instead of additive sum
        vec3 finalColor = uCoreColor * coreWeight + midColorBlended * midWeight + edgeColorBlended * outerWeight;

        // Add subtle detail variation
        finalColor *= mix(0.9, 1.1, detail);

        // === Alpha Calculation (FIXED: Corrected smoothstep ranges and weighted sum) ===
        // Radial falloff (FIXED: was backwards)
        float radialFalloff = smoothstep(0.3, 0.85, 1.0 - distFromCenter);
        
        // Height fade (FIXED: proper exponential dissipation at top)
        float heightFade = 1.0 - smoothstep(0.35, 1.0, heightGradientSmooth);
        
        // Weighted alpha from layer contributions
        float alpha = clamp(
          (coreWeight * 0.6 + midWeight * 0.3 + outerWeight * 0.15) * radialFalloff * heightFade * mix(0.7, 1.0, turbulence),
          0.0,
          1.0
        );

        // Flickering effect (more nuanced)
        float flicker = snoise_2d(vUv * 5.0 + uTime * 8.0) * 0.1 + 0.9;
        flicker *= snoise_2d(vUv * 7.0 + uTime * 12.0) * 0.05 + 0.95;
        alpha *= flicker;
        finalColor *= flicker; // Apply flicker to color as well

        // Intensity boost for phase (REDUCED: was causing excessive brightness)
        finalColor *= mix(0.6, 1.0, uPhaseIntensity);
        
        // CRITICAL: Premultiply alpha to prevent bright fringes with additive blending
        finalColor *= alpha;

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
    uCoreColor: { value: new THREE.Color('#FFFEE0') },      // Brighter white-gold
    uMidColor: { value: new THREE.Color('#FFC040') },       // Richer amber
    uEdgeColor: { value: new THREE.Color('#FF6600') },      // Deep, fiery orange-red
    uOuterWispColor: { value: new THREE.Color('#87CEEB') } // Sky Blue for subtle cold wisps
  }), []);

  useFrame((state, delta) => {
    timeRef.current += delta;

    if (flameMeshRef.current) {
      flameMeshRef.current.material.uniforms.uTime.value = timeRef.current;

      let targetScale = 0.3;
      let targetIntensity = 0.3;
      let targetDisplacement = 0.35;
      let targetTurbulence = 0.4;
      let targetDensity = 1.0;
      let coreColor = new THREE.Color('#FFFEE0');
      let midColor = new THREE.Color('#FFC040');
      let edgeColor = new THREE.Color('#FF6600');
      let outerWispColor = new THREE.Color('#87CEEB'); // Default for wisps
      let lightIntensity = 3;
      let lightColor = new THREE.Color('#ff8c42');

      if (isRunning) {
        switch (phase) {
          case 'inhale':
            // Growing, intensifying
            targetScale = 0.3 + (phaseProgress * 0.4); // Scale up to 0.7
            targetIntensity = 0.3 + (phaseProgress * 0.7); // Intensity up to 1.0
            targetDisplacement = 0.35 + (phaseProgress * 0.45); // More displacement
            targetTurbulence = 0.4 + (phaseProgress * 0.5); // More turbulence
            targetDensity = 1.0 + (phaseProgress * 0.3); // Denser

            // Color shift toward bright white-gold
            coreColor.lerpColors(
              new THREE.Color('#FFFEE0'),
              new THREE.Color('#FFFFFF'), // Pure white at peak inhale
              phaseProgress
            );
            midColor.lerpColors(
              new THREE.Color('#FFC040'),
              new THREE.Color('#FFE080'), // Brighter yellow-gold
              phaseProgress
            );
            outerWispColor.lerpColors(
              new THREE.Color('#87CEEB'),
              new THREE.Color('#A0D0FF'), // Slightly brighter blue for wisps
              phaseProgress
            );

            lightIntensity = 3 + (phaseProgress * 5);
            lightColor.lerpColors(
              new THREE.Color('#ff8c42'),
              new THREE.Color('#ffe8b3'),
              phaseProgress
            );
            break;

          case 'hold':
          case 'holdafter':
            // Sustained brilliance with subtle pulse
            const pulse = Math.sin(timeRef.current * 2.5) * 0.03;
            targetScale = 0.7 + pulse; // Holds larger, with pulse
            targetIntensity = 1.0;
            targetDisplacement = 0.8 + pulse * 0.5; // More displacement
            targetTurbulence = 0.9;
            targetDensity = 1.3;

            coreColor = new THREE.Color('#FFFFFF');
            midColor = new THREE.Color('#FFFFE0'); // Very bright yellow
            edgeColor = new THREE.Color('#FFD700'); // Gold
            outerWispColor = new THREE.Color('#ADD8E6'); // Lighter blue for sustained wisps

            lightIntensity = 8 + pulse * 2;
            lightColor = new THREE.Color('#ffebcd');
            break;

          case 'exhale':
            // Cooling, settling
            targetScale = 0.7 - (phaseProgress * 0.4);
            targetIntensity = 1.0 - (phaseProgress * 0.7);
            targetDisplacement = 0.8 - (phaseProgress * 0.45);
            targetTurbulence = 0.9 - (phaseProgress * 0.5);
            targetDensity = 1.3 - (phaseProgress * 0.3);

            // Cool back to base colors
            coreColor.lerpColors(
              new THREE.Color('#FFFFFF'),
              new THREE.Color('#FFFEE0'),
              phaseProgress
            );
            midColor.lerpColors(
              new THREE.Color('#FFFFE0'),
              new THREE.Color('#FFC040'),
              phaseProgress
            );
            edgeColor.lerpColors(
              new THREE.Color('#FFD700'),
              new THREE.Color('#FF6600'),
              phaseProgress
            );
            outerWispColor.lerpColors(
              new THREE.Color('#ADD8E6'),
              new THREE.Color('#87CEEB'),
              phaseProgress
            );

            lightIntensity = 8 - (phaseProgress * 5);
            lightColor.lerpColors(
              new THREE.Color('#ffebcd'),
              new THREE.Color('#ff8c42'),
              phaseProgress
            );
            break;

          default:
            // idle state - calm, small flame
            targetScale = 0.3; // Smaller idle scale
            targetIntensity = 0.3;
            targetTurbulence = 0.3;
            targetDisplacement = 0.35;
            targetDensity = 1.0;
            // Colors remain default
        }
      }

      // Smooth interpolation
      const lerpSpeed = delta * 2.5; // Increased lerp speed for responsiveness

      flameMeshRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale * 1.4, targetScale), // Default slightly taller
        delta * 3 // Faster scale lerp
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
      flameMeshRef.current.material.uniforms.uOuterWispColor.value.lerp(outerWispColor, lerpSpeed); // Lerp new color

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
      <mesh ref={flameMeshRef} scale={[0.3, 0.42, 0.3]}> {/* Initial scale adjusted for slightly taller default */}
        <sphereGeometry args={[1, 64, 128]} /> {/* Increased segments for smoother shape */}
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
        color="#ff8c42"
        decay={2}
      />

      {/* --- Particle System Integration Placeholder --- */}
      {/* You would import and use your actual SoulParticles component here. */}
      {/* It needs phase, isRunning, and potentially current flame uniforms for its behavior. */}
      {/* <Suspense fallback={null}> */}
        <SoulParticles phase={phase} isRunning={isRunning} time={timeRef.current} />
      {/* </Suspense> */}
      {/* --- END Particle System Integration Placeholder --- */}
    </group>
  );
};

export default PremiumSoulFlame;
