import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const headlines = [
  { text: "GDP grows 5.2%", sentiment: 'positive', color: '#22c55e' },
  { text: "Ringgit weakens", sentiment: 'negative', color: '#ef4444' },
  { text: "MRT on schedule", sentiment: 'neutral', color: '#f59e0b' },
  { text: "Tech investment record", sentiment: 'positive', color: '#22c55e' },
  { text: "Flood warning issued", sentiment: 'negative', color: '#ef4444' },
  { text: "New policy announced", sentiment: 'neutral', color: '#f59e0b' },
];

const NewsCard = ({ headline, position, rotation, index }) => {
  const meshRef = useRef();
  const baseY = position[1];

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    // Floating bob
    meshRef.current.position.y = baseY + Math.sin(t * 0.8 + index * 1.2) * 0.15;
    // Gentle rotation
    meshRef.current.rotation.y = Math.sin(t * 0.3 + index) * 0.12;
    meshRef.current.rotation.x = Math.sin(t * 0.2 + index * 0.5) * 0.05;
  });

  const cardColor = useMemo(() => new THREE.Color(headline.color), [headline.color]);

  return (
    <group ref={meshRef} position={position} rotation={rotation}>
      {/* Card body - frosted glass look */}
      <mesh>
        <boxGeometry args={[2.2, 1.1, 0.04]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={0.75}
          roughness={0.15}
          metalness={0.02}
          clearcoat={0.3}
          clearcoatRoughness={0.2}
        />
      </mesh>

      {/* Top accent bar */}
      <mesh position={[0, 0.52, 0.025]}>
        <boxGeometry args={[2.2, 0.04, 0.01]} />
        <meshBasicMaterial color={headline.color} />
      </mesh>

      {/* Sentiment dot */}
      <mesh position={[-0.85, 0.3, 0.025]}>
        <circleGeometry args={[0.06, 16]} />
        <meshBasicMaterial color={headline.color} />
      </mesh>

      {/* Glow ring around dot */}
      <mesh position={[-0.85, 0.3, 0.024]}>
        <ringGeometry args={[0.07, 0.1, 16]} />
        <meshBasicMaterial color={headline.color} transparent opacity={0.3} />
      </mesh>

      {/* Placeholder lines representing text */}
      <mesh position={[0.1, 0.15, 0.025]}>
        <boxGeometry args={[1.6, 0.06, 0.005]} />
        <meshBasicMaterial color="#333333" transparent opacity={0.7} />
      </mesh>
      <mesh position={[-0.1, 0, 0.025]}>
        <boxGeometry args={[1.2, 0.04, 0.005]} />
        <meshBasicMaterial color="#666666" transparent opacity={0.5} />
      </mesh>
      <mesh position={[0, -0.15, 0.025]}>
        <boxGeometry args={[0.8, 0.03, 0.005]} />
        <meshBasicMaterial color="#999999" transparent opacity={0.4} />
      </mesh>

      {/* Bottom sentiment bar */}
      <mesh position={[0, -0.4, 0.025]}>
        <boxGeometry args={[1.8, 0.03, 0.005]} />
        <meshBasicMaterial color={headline.color} transparent opacity={0.5} />
      </mesh>
    </group>
  );
};

const Floating3DCards = () => {
  const cardPositions = [
    { pos: [-2.5, 0.8, -0.5], rot: [0, 0.2, 0] },
    { pos: [2.5, 0.3, -0.8], rot: [0, -0.15, 0] },
    { pos: [-1.2, -0.8, 0.3], rot: [0, 0.1, 0.03] },
    { pos: [1.5, -0.6, -1.2], rot: [0, -0.2, -0.02] },
    { pos: [0, 1.3, -1.5], rot: [0.03, 0, 0] },
    { pos: [-2, -0.2, -2], rot: [0, 0.25, 0] },
  ];

  return (
    <div className="w-full h-[500px] relative">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        style={{ background: 'transparent' }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.9} />
        <directionalLight position={[5, 5, 5]} intensity={0.4} />
        <pointLight position={[-3, 2, 4]} intensity={0.2} color="#2563eb" />
        <pointLight position={[3, -1, 3]} intensity={0.15} color="#22c55e" />

        {headlines.map((headline, i) => (
          <NewsCard
            key={i}
            headline={headline}
            position={cardPositions[i].pos}
            rotation={cardPositions[i].rot}
            index={i}
          />
        ))}

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.4}
          maxPolarAngle={Math.PI / 1.8}
          minPolarAngle={Math.PI / 2.5}
        />
      </Canvas>
    </div>
  );
};

export default React.memo(Floating3DCards);
