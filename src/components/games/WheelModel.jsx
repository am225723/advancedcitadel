import React from 'react';
import { Cylinder, Box } from '@react-three/drei';

const WheelModel = ({ onLugNutClick }) => {
  const lugNutPositions = [
    [0.3, 0.15, 0.3],
    [-0.3, 0.15, 0.3],
    [0.3, -0.15, 0.3],
    [-0.3, -0.15, 0.3],
    [0, 0.35, 0.3]
  ];

  return (
    <group>
      {/* Tire */}
      <Cylinder args={[0.5, 0.5, 0.3, 64]}>
        <meshStandardMaterial color="black" />
      </Cylinder>
      {/* Rim */}
      <Cylinder args={[0.4, 0.4, 0.32, 32]}>
        <meshStandardMaterial color="silver" />
      </Cylinder>
      {/* Lug Nuts */}
      {lugNutPositions.map((pos, i) => (
        <Box
          key={i}
          args={[0.05, 0.05, 0.05]}
          position={pos}
          onClick={() => onLugNutClick(i)}
          onPointerOver={(e) => e.object.material.color.set('hotpink')}
          onPointerOut={(e) => e.object.material.color.set('grey')}
        >
          <meshStandardMaterial color="grey" />
        </Box>
      ))}
    </group>
  );
};

export default WheelModel;
