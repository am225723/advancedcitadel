import React from 'react';
import { EffectComposer, Bloom, DepthOfField, Vignette, Noise } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';

const PostProcessingEffects = ({ 
  enableBloom = true,
  enableDepthOfField = false,
  enableVignette = true,
  enableNoise = true,
  bloomIntensity = 0.8,
  bloomLuminanceThreshold = 0.9,
  vignetteDarkness = 0.5,
  vignetteOffset = 0.3,
  noiseOpacity = 0.015,
  focusDistance = 0,
  focalLength = 0.02,
  bokehScale = 2
}) => {
  return (
    <EffectComposer disableNormalPass>
      {enableBloom && (
        <Bloom
          luminanceThreshold={bloomLuminanceThreshold}
          mipmapBlur
          intensity={bloomIntensity}
          levels={8}
          blendFunction={BlendFunction.ADD}
        />
      )}
      
      {enableDepthOfField && (
        <DepthOfField
          focusDistance={focusDistance}
          focalLength={focalLength}
          bokehScale={bokehScale}
          height={480}
        />
      )}
      
      {enableVignette && (
        <Vignette
          offset={vignetteOffset}
          darkness={vignetteDarkness}
          eskil={false}
        />
      )}
      
      {enableNoise && (
        <Noise 
          opacity={noiseOpacity}
          blendFunction={BlendFunction.OVERLAY}
        />
      )}
    </EffectComposer>
  );
};

export default PostProcessingEffects;
