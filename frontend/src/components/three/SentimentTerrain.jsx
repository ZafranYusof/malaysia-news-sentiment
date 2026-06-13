import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const Terrain = () => {
  const meshRef = useRef();
  const wireRef = useRef();
  const segments = 64;

  const colorArray = useMemo(() => {
    const colors = new Float32Array((segments + 1) * (segments + 1) * 3);
    return colors;
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const geo = meshRef.current.geometry;
    const posArray = geo.attributes.position.array;
    const colArray = geo.attributes.color.array;
    const time = state.clock.elapsedTime * 0.4;

    for (let i = 0; i <= segments; i++) {
      for (let j = 0; j <= segments; j++) {
        const idx = (i * (segments + 1) + j);
        const posIdx = idx * 3;

        const x = posArray[posIdx];
        const z = posArray[posIdx + 2];

        // Multi-layered wave displacement
        const height =
          Math.sin(x * 0.8 + time) * 0.4 +
          Math.cos(z * 0.6 + time * 0.7) * 0.3 +
          Math.sin((x + z) * 0.5 + time * 1.2) * 0.2 +
          Math.sin(x * 1.5 + z * 1.2 + time * 0.5) * 0.15;

        posArray[posIdx + 1] = height;

        // Color based on height: green (high), neutral gray (mid), red (low)
        const normalized = (height + 1) / 2; // 0 to 1
        if (normalized > 0.6) {
          // Positive - green
          const t = (normalized - 0.6) / 0.4;
          colArray[posIdx] = 0.133 * (1 - t) + 0.133 * t;
          colArray[posIdx + 1] = 0.5 + t * 0.273;
          colArray[posIdx + 2] = 0.2 + t * 0.169;
        } else if (normalized < 0.4) {
          // Negative - red
          const t = normalized / 0.4;
          colArray[posIdx] = 0.937 - t * 0.4;
          colArray[posIdx + 1] = 0.15 + t * 0.15;
          colArray[posIdx + 2] = 0.15 + t * 0.05;
        } else {
          // Neutral - muted gray-blue
          colArray[posIdx] = 0.4;
          colArray[posIdx + 1] = 0.45;
          colArray[posIdx + 2] = 0.5;
        }
      }
    }

    geo.attributes.position.needsUpdate = true;
    geo.attributes.color.needsUpdate = true;
    geo.computeVertexNormals();

    // Update wireframe too
    if (wireRef.current) {
      wireRef.current.geometry.attributes.position.array.set(posArray);
      wireRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <group rotation={[-Math.PI / 3.5, 0, 0]}>
      {/* Solid terrain */}
      <mesh ref={meshRef}>
        <planeGeometry args={[12, 12, segments, segments]} />
        <meshPhongMaterial
          vertexColors
          shininess={30}
          transparent
          opacity={0.85}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Wireframe overlay */}
      <mesh ref={wireRef}>
        <planeGeometry args={[12, 12, segments, segments]} />
        <meshBasicMaterial
          wireframe
          color="#2563eb"
          transparent
          opacity={0.15}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
};

const SentimentTerrain = () => {
  return (
    <div className="w-full h-[450px] relative overflow-hidden">
      <Canvas
        camera={{ position: [0, 5, 8], fov: 45 }}
        style={{ background: 'transparent' }}
        gl={{ alpha: true, antialias: true }}
      >
        <fog attach="fog" args={['#fafaf9', 8, 18]} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 8, 5]} intensity={0.8} />
        <pointLight position={[-3, 3, -3]} intensity={0.3} color="#22c55e" />
        <pointLight position={[3, 3, 3]} intensity={0.3} color="#ef4444" />

        <Terrain />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.3}
          maxPolarAngle={Math.PI / 2.2}
          minPolarAngle={Math.PI / 4}
        />
      </Canvas>

      {/* Legend overlay */}
      <div className="absolute bottom-4 left-4 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          Positive
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-gray-400" />
          Neutral
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          Negative
        </span>
      </div>
    </div>
  );
};

export default React.memo(SentimentTerrain);
