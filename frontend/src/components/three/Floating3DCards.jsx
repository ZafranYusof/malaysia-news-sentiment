import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';

const fallbackArticles = [
  { title: "Malaysia's GDP grows 5.2% in Q1 2026", source: "The Star", sentiment: 'Positive', score: 0.87 },
  { title: "Ringgit weakens against USD amid uncertainty", source: "Malaysiakini", sentiment: 'Negative', score: 0.72 },
  { title: "New MRT line construction ahead of schedule", source: "Bernama", sentiment: 'Neutral', score: 0.51 },
  { title: "Tech sector sees record RM4.2B investment", source: "FMT", sentiment: 'Positive', score: 0.91 },
  { title: "Flood warning issued for east coast states", source: "Astro Awani", sentiment: 'Negative', score: 0.68 },
  { title: "PETRONAS reports strong quarterly earnings", source: "The Edge", sentiment: 'Positive', score: 0.84 },
];

const getSentimentColor = (sentiment) => {
  const s = (sentiment || '').toLowerCase();
  if (s === 'positive') return '#22c55e';
  if (s === 'negative') return '#ef4444';
  return '#f59e0b';
};

const NewsCard = ({ article, position, index }) => {
  const meshRef = useRef();
  const baseY = position[1];

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    meshRef.current.position.y = baseY + Math.sin(t * 0.6 + index * 1.4) * 0.1;
    meshRef.current.rotation.y = Math.sin(t * 0.2 + index * 0.8) * 0.06;
  });

  const color = getSentimentColor(article.sentiment);
  const score = article.score ? Math.round(article.score * 100) : null;

  return (
    <group ref={meshRef} position={position}>
      <mesh>
        <boxGeometry args={[3, 1.6, 0.02]} />
        <meshPhysicalMaterial
          color="#ffffff"
          transparent
          opacity={0.93}
          roughness={0.08}
          metalness={0}
          clearcoat={0.3}
        />
      </mesh>

      {/* Left accent bar */}
      <mesh position={[-1.47, 0, 0.015]}>
        <boxGeometry args={[0.04, 1.6, 0.01]} />
        <meshBasicMaterial color={color} />
      </mesh>

      <Html
        position={[0, 0, 0.02]}
        transform
        occlude
        style={{
          width: '260px',
          padding: '12px 16px',
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        <div style={{ fontFamily: 'Georgia, serif' }}>
          {/* Source + time */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '8px',
          }}>
            <span style={{
              fontSize: '9px',
              fontWeight: 700,
              color: '#555',
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
              fontFamily: 'system-ui, sans-serif',
            }}>
              {article.source}
            </span>
            <span style={{
              display: 'inline-block',
              padding: '1px 7px',
              borderRadius: '3px',
              backgroundColor: color + '15',
              color: color,
              fontSize: '8px',
              fontWeight: 700,
              fontFamily: 'system-ui, sans-serif',
              letterSpacing: '0.3px',
            }}>
              {article.sentiment}{score ? ` · ${score}%` : ''}
            </span>
          </div>

          {/* Headline */}
          <div style={{
            fontSize: '12px',
            fontWeight: 700,
            color: '#111',
            lineHeight: 1.35,
            marginBottom: '6px',
          }}>
            {article.title}
          </div>

          {/* Bottom bar */}
          <div style={{
            height: '2px',
            background: `linear-gradient(to right, ${color}, transparent)`,
            borderRadius: '1px',
            marginTop: '6px',
          }} />
        </div>
      </Html>
    </group>
  );
};

const Floating3DCards = () => {
  const [articles, setArticles] = useState(fallbackArticles);

  useEffect(() => {
    const API = import.meta.env.VITE_API_BASE || 'http://localhost:5001/api/v1';
    fetch(`${API}/news?latest=true&pageSize=6`)
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => {
        const items = (data.articles || data || []).slice(0, 6);
        if (items.length >= 4) {
          setArticles(items.map(a => ({
            title: a.title || a.headline || 'Untitled',
            source: a.source?.name || a.source || 'Unknown',
            sentiment: a.sentiment || 'Neutral',
            score: a.sentimentScore || a.score || null,
          })));
        }
      })
      .catch(() => {}); // Keep fallback
  }, []);

  // Spread cards in a wider, cleaner grid - no overlap
  const cardPositions = [
    [-2.2, 1.2, 0],
    [2.2, 1.2, 0],
    [-2.2, -0.3, -0.5],
    [2.2, -0.3, -0.5],
    [-2.2, -1.8, -1],
    [2.2, -1.8, -1],
  ];

  return (
    <div className="w-full h-[550px] relative">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 45 }}
        style={{ background: 'transparent' }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={1.2} />
        <directionalLight position={[3, 5, 5]} intensity={0.3} />

        {articles.slice(0, 6).map((article, i) => (
          <NewsCard
            key={i}
            article={article}
            position={cardPositions[i]}
            index={i}
          />
        ))}

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.25}
          maxPolarAngle={Math.PI / 1.7}
          minPolarAngle={Math.PI / 2.8}
        />
      </Canvas>
    </div>
  );
};

export default React.memo(Floating3DCards);
