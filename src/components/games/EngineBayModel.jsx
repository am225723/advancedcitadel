import React from 'react';
import { Box } from '@react-three/drei';

const EngineBayModel = ({ onPartClick }) => {
  const parts = {
    'oil_cap': { position: [0, 1, 0], args: [0.5, 0.2, 0.5] },
    'drain_plug': { position: [0, -1.5, 0], args: [0.3, 0.2, 0.3] },
    'oil_filter': { position: [-1, 0, 0], args: [0.5, 1, 0.5] },
  };

  return (
    <group>
      {/* Engine Block */}
      <Box args={[4, 3, 2]}>
        <meshStandardMaterial color="darkgrey" />
      </Box>

      {Object.entries(parts).map(([name, { position, args }]) => (
        <Box
          key={name}
          args={args}
          position={position}
          onClick={() => onPartClick(name)}
          onPointerOver={(e) => e.object.material.color.set('hotpink')}
          onPointerOut={(e) => e.object.material.color.set('blue')}
        >
          <meshStandardMaterial color="blue" />
        </Box>
      ))}
    </group>
  );
};

export default EngineBayModel;
