import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

function ParticleField() {
  const ref = useRef();
  const count = 800;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 2.5 + Math.random() * 1.5;
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y += 0.002;
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
    }
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#F54E00"
        size={0.035}
        sizeAttenuation
        depthWrite={false}
        opacity={0.7}
      />
    </Points>
  );
}

function InnerRing() {
  const ref = useRef();
  const count = 200;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const r = 1.8 + Math.random() * 0.2;
      pos[i * 3] = r * Math.cos(angle);
      pos[i * 3 + 1] = (Math.random() - 0.5) * 0.3;
      pos[i * 3 + 2] = r * Math.sin(angle);
    }
    return pos;
  }, []);

  useFrame(() => {
    if (ref.current) ref.current.rotation.y -= 0.004;
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#30CF79"
        size={0.04}
        sizeAttenuation
        depthWrite={false}
        opacity={0.6}
      />
    </Points>
  );
}

function CoreGlow() {
  const ref = useRef();

  useFrame((state) => {
    if (ref.current) {
      const s = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      ref.current.scale.set(s, s, s);
    }
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.3, 32, 32]} />
      <meshBasicMaterial color="#F54E00" transparent opacity={0.4} />
    </mesh>
  );
}

const HeroScene3D = () => {
  return (
    <div className="ph-hero__3d">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        style={{ width: '100%', height: '100%' }}
        dpr={[1, 1.5]}
      >
        <ambientLight intensity={0.5} />
        <ParticleField />
        <InnerRing />
        <CoreGlow />
      </Canvas>
    </div>
  );
};

export default HeroScene3D;
