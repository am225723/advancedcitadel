import * as THREE from 'three';

export const curvedWorldVertexShader = `
  uniform float uCurvature;
  uniform float uCurvatureStart;
  
  varying vec3 vWorldPosition;
  varying vec3 vNormal;
  
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    
    float distanceFromCamera = -worldPosition.z;
    
    if (distanceFromCamera > uCurvatureStart) {
      float bendAmount = (distanceFromCamera - uCurvatureStart) * (distanceFromCamera - uCurvatureStart);
      worldPosition.y -= bendAmount * uCurvature;
    }
    
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

export const curvedWorldFragmentShader = `
  uniform vec3 uColor;
  uniform float uTime;
  uniform sampler2D uTexture;
  
  varying vec3 vWorldPosition;
  varying vec3 vNormal;
  
  void main() {
    vec3 normal = normalize(vNormal);
    vec3 lightDir = normalize(vec3(5.0, 10.0, 5.0));
    
    float diffuse = max(dot(normal, lightDir), 0.0);
    
    vec3 baseColor = uColor;
    
    vec3 finalColor = baseColor * (0.3 + 0.7 * diffuse);
    
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

export const createCurvedWorldMaterial = (color = '#444', curvature = 0.00008, curvatureStart = 0) => {
  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(color) },
      uCurvature: { value: curvature },
      uCurvatureStart: { value: curvatureStart },
      uTime: { value: 0 }
    },
    vertexShader: curvedWorldVertexShader,
    fragmentShader: curvedWorldFragmentShader,
    side: THREE.DoubleSide
  });
};

export const updateCurvedMaterial = (material, deltaTime) => {
  if (material.uniforms && material.uniforms.uTime) {
    material.uniforms.uTime.value += deltaTime;
  }
};
