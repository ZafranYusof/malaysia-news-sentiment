import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Text, OrbitControls, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

const headlines = [
  { text: "GDP grows 5.2%", sentiment: 'positive', color: '#22c55e' },
  { text: "Ringgit weakens", sentiment: 'negative', color: '#ef4444' },
  { text: "MRT on schedule", sentiment: 'neutral', color: '#f59e0b' },
  { text: "Tech investment record", sentiment: 'positive', color: '#22c55e' },
  { text: "Flood warning issued", sentiment: 'negative', color: '#ef4444' },
  { text: "New policy announced", sentiment: 'neutral', color: '#f59e0b' },
];

const NewsCard = ({ headline, position, rotation }) => {
  const meshRef = useRef();
  const glowRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3 + position[0]) * 0.1;
    }
  });

  return (
    <Float
      speed={1.5 + Math.random()}
      rotationIntensity={0.3}
      floatIntensity={0.8}
      floatingRange={[-0.2, 0.2]}
    >
      <group ref={meshRef} position={position} rotation={rotation}>
        {/* Card body */}
        <RoundedBox args={[2.4, 1.2, 0.05]} radius={0.08} smoothness={4}>
          <meshPhysicalMaterial
            color="#ffffff"
            transparent
            opacity={0.85}
            roughness={0.1}
            metalness={0.05}
            transmission={0.3}
            thickness={0.1}
            envMapIntensity={0.5}
          />
        </RoundedBox>

        {/* Sentiment dot */}
        <mesh position={[-0.9, 0.35, 0.03]}>
          <circleGeometry args={[0.06, 16]} />
          <meshBasicMaterial color={headline.color} />
        </mesh>

        {/* Headline text */}
        <Text
          position={[0.1, 0.1, 0.04]}
          fontSize={0.14}
          maxWidth={2}
          color="#1a1a1a"
          anchorX="center"
          anchorY="middle"
          font="/fonts/inter-medium.woff"
        >
          {headline.text}
        </Text>

        {/* Source label */}
        <Text
          position={[0, -0.35, 0.04]}
          fontSize={0.08}
          color="#666666"
          anchorX="center"
          anchorY="middle"
        >
          Malaysian News
        </Text>

        {/* Bottom accent line */}
        <mesh position={[0, -0.55, 0.03]}>
          <planeGeometry args={[2, 0.02]} />
          <meshBasicMaterial color={headline.color} opacity={0.6} transparent />
        </mesh>
      </group>
    </Float>
  );
};

const Floating3DCards = () => {
  const cardPositions = [
    { pos: [-2.5, 1, -1], rot: [0, 0.2, 0] },
    { pos: [2.5, 0.5, -0.5], rot: [0, -0.15, 0] },
    { pos: [-1, -1, 0.5], rot: [0, 0.1, 0.05] },
    { pos: [1.5, -0.8, -1.5], rot: [0, -0.2, -0.03] },
    { pos: [0, 1.5, -2], rot: [0.05, 0, 0] },
    { pos: [-2, 0, -2.5], rot: [0, 0.3, 0] },
  ];

  return (
    <div className="w-full h-[500px] relative">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        style={{ background: 'transparent' }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 5, 5]} intensity={0.5} />
        <pointLight position={[-3, 2, 4]} intensity={0.3} color="#2563eb" />

        {headlines.map((headline, i) => (
          <NewsCard
            key={i}
            headline={headline}
            position={cardPositions[i].pos}
            rotation={cardPositions[i].rot}
          />
        ))}

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
          maxPolarAngle={Math.PI / 1.8}
          minPolarAngle={Math.PI / 2.5}
        />
      </Canvas>
    </div>
  );
};

export default React.memo(Floating3DCards);
