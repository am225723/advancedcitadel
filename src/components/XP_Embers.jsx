import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { useUser } from '@/contexts/UserContext';
import { toast } from '@/components/ui/use-toast';

const XP_Embers = ({ onCollect }) => {
  const groupRef = useRef();
  const { addXP } = useUser();

  const embers = useMemo(() => {
    const elements = [];
    for (let i = 0; i < 50; i++) {
      elements.push({
        position: [THREE.MathUtils.randFloat(-8, 8), 0.5, -i * 40],
        collected: false,
      });
    }
    return elements;
  }, []);

  useFrame((state, delta) => {
    groupRef.current.position.z += delta * 15;
    if (groupRef.current.position.z > 40) {
      groupRef.current.position.z = -1960;
    }

    groupRef.current.children.forEach((ember, i) => {
      if (!embers[i].collected && state.camera.position.distanceTo(ember.position.add(groupRef.current.position)) < 2) {
        embers[i].collected = true;
        ember.visible = false;
        addXP(5);
        toast({
          title: 'XP Gained!',
          description: '+5 XP for collecting a soul ember.',
        });
      }
    });
  });

  return (
    <group ref={groupRef}>
      {embers.map((ember, i) => (
        <Ember key={i} position={ember.position} />
      ))}
    </group>
  );
};

const Ember = (props) => {
  const ref = useRef();
  useFrame((state) => {
    if(ref.current) {
        ref.current.rotation.x = ref.current.rotation.y += 0.01;
        ref.current.position.y = Math.sin(state.clock.elapsedTime + props.position[2]) * 0.5 + 0.5;
    }
  });

  return (
    <Sphere ref={ref} {...props} args={[0.5, 16, 16]}>
      <meshStandardMaterial color="orange" emissive="orange" emissiveIntensity={2} />
    </Sphere>
  );
};

export default XP_Embers;
