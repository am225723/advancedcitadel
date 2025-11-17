import React, { useRef } from 'react';
import { Box } from '@react-three/drei';

const EngineModel = ({ highlightedPart, onPartClick }) => {
  const parts = {
    'Spark Plugs': { position: [0, 1.5, 0], args: [1, 0.5, 1] },
    'Injectors': { position: [1.5, 0.5, 0], args: [0.5, 1, 1] },
    'Camshaft': { position: [-1.5, 0.5, 0], args: [0.5, 1, 1] },
    'Turbo': { position: [0, -1, 0], args: [1, 1, 1] },
  };

  const handleClick = (partName) => {
    if (onPartClick) {
      onPartClick(partName);
    }
  };

  return (
    <group>
      {/* Engine Block */}
      <Box args={[4, 3, 2]}>
        <meshStandardMaterial color="gray" />
      </Box>

      {Object.entries(parts).map(([name, { position, args }]) => (
        <Box
          key={name}
          args={args}
          position={position}
          onClick={() => handleClick(name)}
          onPointerOver={(e) => e.object.material.color.set('hotpink')}
          onPointerOut={(e) => e.object.material.color.set(highlightedPart === name ? 'yellow' : 'blue')}
        >
          <meshStandardMaterial color={highlightedPart === name ? 'yellow' : 'blue'} />
        </Box>
      ))}
    </group>
  );
};

export default EngineModel;
