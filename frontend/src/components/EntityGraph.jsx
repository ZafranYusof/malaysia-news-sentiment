import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

const SENTIMENT_COLORS = {
  Positive: '#34D882',
  Negative: '#FF5C5C',
  Neutral: '#FFAD33',
};

const CATEGORY_SHAPES = {
  politicians: 'circle',
  organizations: 'diamond',
  institutions: 'square',
  other: 'circle',
};

// Simple force-directed layout simulation
const useForceSimulation = (nodes, edges, width, height) => {
  const [positions, setPositions] = useState([]);
  const animFrame = useRef(null);

  useEffect(() => {
    if (!nodes.length) { setPositions([]); return; }

    // Initialize positions in a circle
    const initialPositions = nodes.map((node, i) => {
      const angle = (2 * Math.PI * i) / nodes.length;
      const radius = Math.min(width, height) * 0.3;
      return {
        id: node.id,
        x: width / 2 + radius * Math.cos(angle),
        y: height / 2 + radius * Math.sin(angle),
        vx: 0,
        vy: 0,
      };
    });

    let pos = [...initialPositions];
    let iteration = 0;
    const maxIterations = 150;

    const simulate = () => {
      if (iteration >= maxIterations) {
        setPositions([...pos]);
        return;
      }

      const alpha = 1 - iteration / maxIterations;
      const repulsionStrength = 2000 * alpha;
      const attractionStrength = 0.005 * alpha;
      const centerStrength = 0.01 * alpha;

      // Reset forces
      pos.forEach(p => { p.vx = 0; p.vy = 0; });

      // Repulsion between all nodes
      for (let i = 0; i < pos.length; i++) {
        for (let j = i + 1; j < pos.length; j++) {
          const dx = pos[i].x - pos[j].x;
          const dy = pos[i].y - pos[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = repulsionStrength / (dist * dist);
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;
          pos[i].vx += fx;
          pos[i].vy += fy;
          pos[j].vx -= fx;
          pos[j].vy -= fy;
        }
      }

      // Attraction along edges
      edges.forEach(edge => {
        const source = pos.find(p => p.id === edge.source);
        const target = pos.find(p => p.id === edge.target);
        if (!source || !target) return;
        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = dist * attractionStrength * (edge.weight || 1);
        source.vx += (dx / dist) * force;
        source.vy += (dy / dist) * force;
        target.vx -= (dx / dist) * force;
        target.vy -= (dy / dist) * force;
      });

      // Center gravity
      pos.forEach(p => {
        p.vx += (width / 2 - p.x) * centerStrength;
        p.vy += (height / 2 - p.y) * centerStrength;
      });

      // Apply velocities with damping
      pos.forEach(p => {
        p.x += p.vx * 0.8;
        p.y += p.vy * 0.8;
        // Keep within bounds
        p.x = Math.max(40, Math.min(width - 40, p.x));
        p.y = Math.max(40, Math.min(height - 40, p.y));
      });

      iteration++;

      if (iteration % 5 === 0 || iteration >= maxIterations) {
        setPositions([...pos]);
      }

      animFrame.current = requestAnimationFrame(simulate);
    };

    animFrame.current = requestAnimationFrame(simulate);

    return () => {
      if (animFrame.current) cancelAnimationFrame(animFrame.current);
    };
  }, [nodes, edges, width, height]);

  return positions;
};

const EntityGraph = ({ query }) => {
  const [data, setData] = useState({ nodes: [], edges: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 400 });
  
  // Phase 1: Entity type filtering, search, tabs
  const [entityTypeFilter, setEntityTypeFilter] = useState({ PERSON: true, ORGANIZATION: true, LOCATION: true });
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  // Responsive dimensions
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width || 600, height: Math.max(350, rect.width * 0.6) });
      }
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Fetch entity data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = query ? { query } : {};
        const { data: json } = await api.get('/entities/graph', { params });
        setData(json);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [query]);

  const positions = useForceSimulation(filteredNodes, data.edges, dimensions.width, dimensions.height);

  const getNodeRadius = (mentions) => {
    const min = 12, max = 32;
    const maxMentions = Math.max(...data.nodes.map(n => n.mentions), 1);
    return min + ((mentions / maxMentions) * (max - min));
  };
  
  // Phase 1: Calculate edge sentiment color
  const getEdgeColor = (edge) => {
    const sentiment = edge.sentiment || 0; // Expecting sentiment score from backend
    if (sentiment <= -0.3) return '#FF5C5C'; // Red (negative)
    if (sentiment >= 0.3) return '#34D882';  // Green (positive)
    return '#94A3B8'; // Grey (neutral)
  };

  // Phase 1: Filter nodes by type and search
  const filteredNodes = data.nodes.filter(node => {
    // Entity type filter
    const typeMatch = entityTypeFilter[node.type] !== false;
    // Search filter
    const searchMatch = !searchQuery || node.label.toLowerCase().includes(searchQuery.toLowerCase());
    return typeMatch && searchMatch;
  });
  
  const filteredNodeIds = new Set(filteredNodes.map(n => n.id));
  
  const isConnected = (nodeId) => {
    if (!hoveredNode && !selectedNode) return true;
    const active = selectedNode || hoveredNode;
    if (nodeId === active) return true;
    return data.edges.some(
      e => (e.source === active && e.target === nodeId) || (e.target === active && e.source === nodeId)
    );
  };

  const isEdgeHighlighted = (edge) => {
    if (!hoveredNode && !selectedNode) return true;
    const active = selectedNode || hoveredNode;
    return edge.source === active || edge.target === active;
  };

  if (loading) {
    return (
      <motion.div
        className="chart-panel entity-graph-panel"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="chart-panel-header">
          <h3 className="chart-panel-title">Entity Relationship Graph</h3>
        </div>
        <div className="entity-graph-loading">
          <div className="entity-graph-spinner" />
          <span>Mapping entity connections...</span>
        </div>
      </motion.div>
    );
  }

  if (error || !data.nodes.length) {
    return (
      <motion.div
        className="chart-panel entity-graph-panel"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="chart-panel-header">
          <h3 className="chart-panel-title">Entity Relationship Graph</h3>
        </div>
        <div className="entity-graph-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4">
            <circle cx="12" cy="12" r="3"/><circle cx="4" cy="6" r="2"/><circle cx="20" cy="6" r="2"/><circle cx="4" cy="18" r="2"/><circle cx="20" cy="18" r="2"/>
            <line x1="6" y1="7" x2="10" y2="10"/><line x1="18" y1="7" x2="14" y2="10"/><line x1="6" y1="17" x2="10" y2="14"/><line x1="18" y1="17" x2="14" y2="14"/>
          </svg>
          <p>{error || 'No entity data available yet. Analyze some articles first!'}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="chart-panel entity-graph-panel"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      ref={containerRef}
    >
      <div className="chart-panel-header">
        <h3 className="chart-panel-title">Entity Relationship Graph</h3>
        <div className="entity-graph-legend">
          <span className="legend-item"><span className="legend-dot" style={{ background: SENTIMENT_COLORS.Positive }} />Positive</span>
          <span className="legend-item"><span className="legend-dot" style={{ background: SENTIMENT_COLORS.Negative }} />Negative</span>
          <span className="legend-item"><span className="legend-dot" style={{ background: SENTIMENT_COLORS.Neutral }} />Neutral</span>
        </div>
      </div>

      {/* Phase 1: Search and Filter Controls */}
      <div className="entity-graph-controls" style={{ padding: '12px 16px', borderBottom: '2px solid var(--border)', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Search input */}
        <div style={{ flex: '1 1 200px', position: 'relative' }}>
          <input
            type="text"
            placeholder="Search entities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 32px 8px 12px',
              border: '2px solid var(--border)',
              borderRadius: '0',
              fontSize: '13px',
              fontFamily: 'var(--font-sans)',
              background: 'var(--bg)',
              color: 'var(--text-700)'
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                fontSize: '16px',
                color: 'var(--text-500)'
              }}
            >
              ×
            </button>
          )}
        </div>
        
        {/* Entity type filters */}
        <div style={{ display: 'flex', gap: '12px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
          {['PERSON', 'ORGANIZATION', 'LOCATION'].map(type => (
            <label key={type} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', userSelect: 'none' }}>
              <input
                type="checkbox"
                checked={entityTypeFilter[type]}
                onChange={(e) => setEntityTypeFilter(prev => ({ ...prev, [type]: e.target.checked }))}
                style={{ cursor: 'pointer' }}
              />
              <span style={{ color: entityTypeFilter[type] ? 'var(--text-700)' : 'var(--text-400)' }}>{type}</span>
            </label>
          ))}
        </div>
      </div>

      <svg
        width={dimensions.width}
        height={dimensions.height}
        className="entity-graph-svg"
        style={{ display: 'block' }}
      >
        {/* Edges */}
        {data.edges.map((edge, i) => {
          const sourcePos = positions.find(p => p.id === edge.source);
          const targetPos = positions.find(p => p.id === edge.target);
          if (!sourcePos || !targetPos) return null;
          // Phase 1: Skip edge if either node is filtered out
          if (!filteredNodeIds.has(edge.source) || !filteredNodeIds.has(edge.target)) return null;
          const highlighted = isEdgeHighlighted(edge);
          const edgeColor = getEdgeColor(edge);
          return (
            <line
              key={`edge-${i}`}
              x1={sourcePos.x}
              y1={sourcePos.y}
              x2={targetPos.x}
              y2={targetPos.y}
              stroke={highlighted ? edgeColor : 'var(--border)'}
              strokeWidth={Math.min(4, 1 + edge.weight * 0.5)}
              strokeOpacity={highlighted ? 0.6 : 0.15}
              strokeLinecap="round"
            />
          );
        })}

        {/* Nodes */}
        {filteredNodes.map((node) => {
          const pos = positions.find(p => p.id === node.id);
          if (!pos) return null;
          const radius = getNodeRadius(node.mentions);
          const color = SENTIMENT_COLORS[node.sentiment] || SENTIMENT_COLORS.Neutral;
          const connected = isConnected(node.id);
          const isActive = hoveredNode === node.id || selectedNode === node.id;
          // Phase 1: Dim non-matching search results
          const searchMatches = !searchQuery || node.label.toLowerCase().includes(searchQuery.toLowerCase());
          const opacity = connected ? (searchMatches ? 1 : 0.3) : 0.2;

          return (
            <g
              key={node.id}
              transform={`translate(${pos.x}, ${pos.y})`}
              style={{ cursor: 'pointer', transition: 'opacity 0.2s' }}
              opacity={opacity}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
              onClick={() => setSelectedNode(selectedNode === node.id ? null : node.id)}
            >
              {/* Glow effect */}
              {isActive && (
                <circle r={radius + 6} fill={color} opacity={0.15} />
              )}
              {/* Main circle */}
              <circle
                r={radius}
                fill={color}
                fillOpacity={0.2}
                stroke={color}
                strokeWidth={isActive ? 2.5 : 1.5}
              />
              {/* Label */}
              <text
                y={radius + 14}
                textAnchor="middle"
                fill="var(--text-700)"
                fontSize={isActive ? 11 : 9}
                fontWeight={isActive ? 600 : 400}
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >
                {node.label.length > 15 ? node.label.slice(0, 13) + '...' : node.label}
              </text>
              {/* Mention count */}
              <text
                textAnchor="middle"
                dy="0.35em"
                fill={color}
                fontSize={10}
                fontWeight={700}
                style={{ pointerEvents: 'none' }}
              >
                {node.mentions}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Phase 1: Enhanced tabbed detail panel */}
      <AnimatePresence>
        {selectedNode && (() => {
          const node = data.nodes.find(n => n.id === selectedNode);
          if (!node) return null;
          
          return (
            <motion.div
              className="entity-graph-info"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              style={{ 
                position: 'absolute', 
                bottom: '16px', 
                left: '16px', 
                right: '16px',
                background: 'var(--bg)',
                border: '2px solid var(--border)',
                padding: '16px',
                maxHeight: '300px',
                overflow: 'auto'
              }}
            >
              {/* Tab navigation */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', borderBottom: '2px solid var(--border)', paddingBottom: '8px' }}>
                {['overview', 'timeline', 'sentiment', 'articles', 'connections'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      padding: '6px 12px',
                      border: 'none',
                      background: activeTab === tab ? 'var(--brand)' : 'transparent',
                      color: activeTab === tab ? 'white' : 'var(--text-600)',
                      fontSize: '11px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: 'var(--font-sans)'
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              
              {/* Tab content */}
              {activeTab === 'overview' && (
                <div>
                  <strong style={{ fontSize: '16px', display: 'block', marginBottom: '8px' }}>{node.label}</strong>
                  <div style={{ display: 'flex', gap: '12px', fontSize: '13px', color: 'var(--text-600)', marginBottom: '12px' }}>
                    <span className="entity-info-cat" style={{ textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.05em', fontWeight: 600 }}>{node.type || node.category}</span>
                    <span>{node.mentions} mentions</span>
                  </div>
                  <div className="entity-info-breakdown" style={{ display: 'flex', gap: '12px', fontSize: '13px' }}>
                    <span style={{ color: SENTIMENT_COLORS.Positive }}>✓ {node.sentimentBreakdown?.Positive || 0} Positive</span>
                    <span style={{ color: SENTIMENT_COLORS.Negative }}>✗ {node.sentimentBreakdown?.Negative || 0} Negative</span>
                    <span style={{ color: SENTIMENT_COLORS.Neutral }}>~ {node.sentimentBreakdown?.Neutral || 0} Neutral</span>
                  </div>
                </div>
              )}
              
              {activeTab === 'timeline' && (
                <div style={{ fontSize: '13px', color: 'var(--text-600)' }}>
                  <p>Timeline visualization coming soon...</p>
                  <p style={{ marginTop: '8px', fontSize: '12px' }}>Shows mention frequency over time.</p>
                </div>
              )}
              
              {activeTab === 'sentiment' && (
                <div style={{ fontSize: '13px', color: 'var(--text-600)' }}>
                  <p>Sentiment trend coming soon...</p>
                  <p style={{ marginTop: '8px', fontSize: '12px' }}>Line chart showing sentiment evolution.</p>
                </div>
              )}
              
              {activeTab === 'articles' && (
                <div style={{ fontSize: '13px', color: 'var(--text-600)' }}>
                  <p>Related articles coming soon...</p>
                  <p style={{ marginTop: '8px', fontSize: '12px' }}>List of articles mentioning this entity.</p>
                </div>
              )}
              
              {activeTab === 'connections' && (
                <div style={{ fontSize: '13px' }}>
                  <p style={{ marginBottom: '8px', color: 'var(--text-700)', fontWeight: 600 }}>Connected Entities:</p>
                  {data.edges
                    .filter(e => e.source === node.id || e.target === node.id)
                    .slice(0, 5)
                    .map((edge, i) => {
                      const connectedId = edge.source === node.id ? edge.target : edge.source;
                      const connectedNode = data.nodes.find(n => n.id === connectedId);
                      if (!connectedNode) return null;
                      return (
                        <div key={i} style={{ padding: '4px 0', color: 'var(--text-600)', fontSize: '12px' }}>
                          → {connectedNode.label} ({edge.weight} connections)
                        </div>
                      );
                    })}
                </div>
              )}
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </motion.div>
  );
};

export default EntityGraph;
