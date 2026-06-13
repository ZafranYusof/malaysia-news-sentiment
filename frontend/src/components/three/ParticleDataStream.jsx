import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const PARTICLE_COUNT = 600;

const Particles = () => {
  const meshRef = useRef();
  const { positions, colors, speeds, sizes } = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const speeds = new Float32Array(PARTICLE_COUNT);
    const sizes = new Float32Array(PARTICLE_COUNT);

    const sentimentColors = [
      [0.133, 0.773, 0.369], // green #22c55e
      [0.937, 0.267, 0.267], // red #ef4444
      [0.961, 0.620, 0.043], // amber #f59e0b
    ];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6;

      const colorChoice = sentimentColors[Math.floor(Math.random() * 3)];
      colors[i * 3] = colorChoice[0];
      colors[i * 3 + 1] = colorChoice[1];
      colors[i * 3 + 2] = colorChoice[2];

      speeds[i] = 0.5 + Math.random() * 2.5;
      sizes[i] = 2 + Math.random() * 4;
    }

    return { positions, colors, speeds, sizes };
  }, []);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const posArray = meshRef.current.geometry.attributes.position.array;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const idx = i * 3;
      posArray[idx] += speeds[i] * delta;

      // Accelerate in middle zone
      const x = posArray[idx];
      if (x > -2 && x < 2) {
        posArray[idx] += speeds[i] * delta * 1.5;
      }

      // Wave motion on Y
      posArray[idx + 1] += Math.sin(state.clock.elapsedTime * 0.5 + i * 0.1) * delta * 0.3;

      // Reset when off screen
      if (posArray[idx] > 10) {
        posArray[idx] = -10;
        posArray[idx + 1] = (Math.random() - 0.5) * 8;
        posArray[idx + 2] = (Math.random() - 0.5) * 6;
      }
    }

    meshRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={PARTICLE_COUNT}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={PARTICLE_COUNT}
          array={colors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={PARTICLE_COUNT}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

const ParticleDataStream = () => {
  return (
    <div className="w-full h-[400px] relative">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        style={{ background: 'transparent' }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.5} />
        <Particles />
      </Canvas>
      {/* Fade edges */}
      <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#fafaf9] dark:from-[#0f0f0f] to-transparent pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#fafaf9] dark:from-[#0f0f0f] to-transparent pointer-events-none" />
    </div>
  );
};

export default React.memo(ParticleDataStream);
