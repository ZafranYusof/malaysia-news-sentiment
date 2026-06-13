import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';

const defaultHeadlines = [
  { text: "Malaysia's GDP grows 5.2% in Q1 2026", source: "The Star", sentiment: 'positive', color: '#22c55e' },
  { text: "Ringgit weakens against USD amid uncertainty", source: "Malaysiakini", sentiment: 'negative', color: '#ef4444' },
  { text: "New MRT line construction ahead of schedule", source: "Bernama", sentiment: 'neutral', color: '#f59e0b' },
  { text: "Tech sector sees record RM4.2B investment", source: "FMT", sentiment: 'positive', color: '#22c55e' },
  { text: "Flood warning issued for east coast states", source: "Astro Awani", sentiment: 'negative', color: '#ef4444' },
  { text: "PETRONAS reports strong quarterly earnings", source: "The Edge", sentiment: 'positive', color: '#22c55e' },
];

const NewsCard = ({ headline, position, index }) => {
  const meshRef = useRef();
  const baseY = position[1];
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    meshRef.current.position.y = baseY + Math.sin(t * 0.7 + index * 1.3) * 0.12;
    meshRef.current.rotation.y = Math.sin(t * 0.25 + index) * 0.08;
    meshRef.current.rotation.x = Math.sin(t * 0.15 + index * 0.7) * 0.03;
  });

  const sentimentLabel = headline.sentiment === 'positive' ? 'Positive' : headline.sentiment === 'negative' ? 'Negative' : 'Neutral';

  return (
    <group ref={meshRef} position={position}>
      {/* Card with HTML overlay for real text */}
      <mesh
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <boxGeometry args={[2.6, 1.4, 0.03]} />
        <meshPhysicalMaterial
          color={hovered ? '#f8f8f8' : '#ffffff'}
          transparent
          opacity={0.92}
          roughness={0.1}
          metalness={0.01}
          clearcoat={0.2}
        />
      </mesh>

      {/* Top accent bar */}
      <mesh position={[0, 0.67, 0.02]}>
        <boxGeometry args={[2.6, 0.04, 0.01]} />
        <meshBasicMaterial color={headline.color} />
      </mesh>

      {/* HTML content overlay */}
      <Html
        position={[0, 0, 0.03]}
        transform
        occlude
        style={{
          width: '220px',
          padding: '10px 14px',
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
          {/* Sentiment badge */}
          <div style={{
            display: 'inline-block',
            padding: '2px 8px',
            borderRadius: '10px',
            backgroundColor: headline.color + '20',
            color: headline.color,
            fontSize: '9px',
            fontWeight: 600,
            marginBottom: '6px',
            letterSpacing: '0.5px',
          }}>
            {sentimentLabel}
          </div>
          {/* Headline */}
          <div style={{
            fontSize: '11px',
            fontWeight: 600,
            color: '#1a1a1a',
            lineHeight: 1.3,
            marginBottom: '6px',
          }}>
            {headline.text}
          </div>
          {/* Source */}
          <div style={{
            fontSize: '9px',
            color: '#888',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}>
            <span style={{
              width: '5px',
              height: '5px',
              borderRadius: '50%',
              backgroundColor: headline.color,
              display: 'inline-block',
            }} />
            {headline.source}
          </div>
        </div>
      </Html>
    </group>
  );
};

const Floating3DCards = () => {
  const cardPositions = [
    [-2.4, 0.9, -0.3],
    [2.4, 0.5, -0.6],
    [-1.0, -0.9, 0.2],
    [1.6, -0.7, -1.0],
    [0.1, 1.4, -1.3],
    [-2.0, -0.1, -1.8],
  ];

  return (
    <div className="w-full h-[500px] relative">
      <Canvas
        camera={{ position: [0, 0, 6.5], fov: 48 }}
        style={{ background: 'transparent' }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={1} />
        <directionalLight position={[5, 5, 5]} intensity={0.3} />
        <pointLight position={[-3, 2, 4]} intensity={0.2} color="#2563eb" />

        {defaultHeadlines.map((headline, i) => (
          <NewsCard
            key={i}
            headline={headline}
            position={cardPositions[i]}
            index={i}
          />
        ))}

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.35}
          maxPolarAngle={Math.PI / 1.8}
          minPolarAngle={Math.PI / 2.5}
        />
      </Canvas>
    </div>
  );
};

export default React.memo(Floating3DCards);
