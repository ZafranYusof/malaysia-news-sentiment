import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Graph } from '@antv/g6';
import { useTheme } from '../context/ThemeContext';

const SENTIMENT_COLORS = { Positive: '#10B981', Negative: '#EF4444', Neutral: '#F59E0B' };
const SENTIMENT_GLOW = { Positive: 'rgba(16,185,129,0.4)', Negative: 'rgba(239,68,68,0.4)', Neutral: 'rgba(245,158,11,0.4)' };
const TYPE_LABELS = { politicians: 'Politicians', parties: 'Parties', organizations: 'Organizations', locations: 'Locations' };
const TYPE_ICONS = { politicians: '👤', parties: '🏛️', organizations: '🏢', locations: '📍' };
const TYPE_COLORS = { politicians: '#6366f1', parties: '#8b5cf6', organizations: '#06b6d4', locations: '#f59e0b' };

export default function EntityGraphPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const [data, setData] = useState({ nodes: [], edges: [] });
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [timeframe, setTimeframe] = useState('');
  const [viewMode, setViewMode] = useState('graph');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const graphRef = useRef(null);
  const containerRef = useRef(null);
  const graphInstance = useRef(null);

  // Detect mobile and set default view
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
    };
    checkMobile();
    if (window.innerWidth <= 768) setViewMode('list');
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const fetchGraph = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const API = import.meta.env.VITE_API_BASE || 'http://localhost:5001/api/v1';
      const params = new URLSearchParams();
      if (search) params.set('query', search);
      if (timeframe) params.set('timeframe', timeframe);
      if (typeFilter) params.set('type', typeFilter);
      const res = await fetch(`${API}/entities/graph?${params}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed');
      setData(await res.json());
    } catch { setData({ nodes: [], edges: [] }); }
    finally { setLoading(false); }
  }, [search, timeframe, typeFilter]);

  useEffect(() => { fetchGraph(); }, [fetchGraph]);

  const fetchDetail = async (name) => {
    setDetailLoading(true);
    try {
      const token = localStorage.getItem('token');
      const API = import.meta.env.VITE_API_BASE || 'http://localhost:5001/api/v1';
      const res = await fetch(`${API}/entities/${encodeURIComponent(name)}`, { headers: { Authorization: `Bearer ${token}` } });
      setDetail(res.ok ? await res.json() : null);
    } catch { setDetail(null); }
    finally { setDetailLoading(false); }
  };

  const handleNodeClick = (name) => {
    if (selectedNode === name) { setSelectedNode(null); setDetail(null); }
    else { setSelectedNode(name); fetchDetail(name); }
  };

  // Initialize/update G6 graph
  useEffect(() => {
    if (loading || !data.nodes.length || !graphRef.current) return;
    // Don't render graph if mobile list view is active
    if (isMobile && viewMode === 'list') {
      if (graphInstance.current) {
        graphInstance.current.destroy();
        graphInstance.current = null;
      }
      return;
    }

    // Destroy previous instance
    if (graphInstance.current) {
      graphInstance.current.destroy();
      graphInstance.current = null;
    }

    const container = graphRef.current;
    const width = container.offsetWidth || 800;
    const height = container.offsetHeight || 600;

    // On mobile graph mode, limit to top 15 nodes by mentions
    const mobileGraphMode = isMobile && viewMode === 'graph';
    let graphNodes = data.nodes;
    let graphEdges = data.edges;
    if (mobileGraphMode) {
      const sorted = [...data.nodes].sort((a, b) => b.mentions - a.mentions);
      graphNodes = sorted.slice(0, 15);
      const nodeIds = new Set(graphNodes.map(n => n.id));
      graphEdges = data.edges.filter(e => nodeIds.has(e.source) && nodeIds.has(e.target));
    }

    const maxMentions = Math.max(...graphNodes.map(n => n.mentions), 1);
    const maxNodeSize = mobileGraphMode ? 40 : 80;
    const baseNodeSize = mobileGraphMode ? 20 : 28;
    const sizeRange = mobileGraphMode ? 20 : 52;

    const g6Data = {
      nodes: graphNodes.map(n => {
        const color = SENTIMENT_COLORS[n.sentiment] || SENTIMENT_COLORS.Neutral;
        const nodeSize = baseNodeSize + (n.mentions / maxMentions) * sizeRange;
        return {
          id: n.id,
          data: {
            label: n.label,
            mentions: n.mentions,
            sentiment: n.sentiment,
            category: n.category,
          },
          style: {
            size: nodeSize,
            fill: color,
            fillOpacity: 0.35,
            stroke: color,
            lineWidth: 2.5,
            shadowColor: SENTIMENT_GLOW[n.sentiment] || SENTIMENT_GLOW.Neutral,
            shadowBlur: 12,
            labelText: mobileGraphMode ? '' : (n.label.length > 18 ? n.label.slice(0, 16) + '…' : n.label),
            labelFill: isDark ? '#f1f5f9' : '#0f172a',
            labelFontSize: mobileGraphMode ? 10 : 12,
            labelFontWeight: 600,
            labelPlacement: 'bottom',
            labelOffsetY: 6,
            labelBackground: !mobileGraphMode,
            labelBackgroundFill: isDark ? 'rgba(15,23,42,0.8)' : 'rgba(255,255,255,0.85)',
            labelBackgroundRadius: 4,
            labelBackgroundPadding: [2, 6, 2, 6],
          },
        };
      }),
      edges: graphEdges.map((e, i) => ({
        id: `edge-${i}`,
        source: e.source,
        target: e.target,
        data: { weight: e.weight },
        style: {
          stroke: isDark ? 'rgba(99,140,255,0.35)' : 'rgba(59,100,240,0.25)',
          lineWidth: Math.min(5, 1.5 + e.weight * 0.6),
          endArrow: false,
        },
      })),
    };

    const graph = new Graph({
      container,
      width,
      height,
      data: g6Data,
      layout: {
        type: 'force',
        preventOverlap: true,
        nodeSpacing: mobileGraphMode ? 100 : 80,
        linkDistance: (edge) => (mobileGraphMode ? 120 : 180) + (edge.data?.weight || 1) * 12,
        nodeStrength: mobileGraphMode ? -800 : -1200,
        edgeStrength: 0.25,
        collideStrength: 1,
        alphaDecay: 0.015,
        alphaMin: 0.001,
      },
      behaviors: ['drag-canvas', 'zoom-canvas', 'drag-element', 'hover-activate'],
      node: {
        style: {
          cursor: 'pointer',
        },
        state: {
          active: {
            lineWidth: 4,
            fillOpacity: 0.6,
            shadowBlur: 24,
          },
          inactive: {
            fillOpacity: 0.08,
            strokeOpacity: 0.2,
            labelOpacity: 0.25,
            shadowBlur: 0,
          },
        },
      },
      edge: {
        state: {
          active: {
            stroke: '#6366F1',
            lineWidth: 3.5,
            strokeOpacity: 0.9,
          },
          inactive: {
            strokeOpacity: 0.06,
          },
        },
      },
      animation: true,
      autoFit: 'view',
      padding: 60,
    });

    graph.on('node:click', (evt) => {
      const nodeId = evt.target?.id;
      if (nodeId) handleNodeClick(nodeId);
    });

    graph.render();
    graphInstance.current = graph;

    return () => {
      if (graphInstance.current) {
        graphInstance.current.destroy();
        graphInstance.current = null;
      }
    };
  }, [data, loading, isDark, viewMode, isMobile]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (graphInstance.current && graphRef.current) {
        const w = graphRef.current.offsetWidth;
        const h = graphRef.current.offsetHeight;
        graphInstance.current.resize(w, h);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const border = isDark ? 'rgba(77,122,255,0.15)' : '#e2e8f0';
  const card = isDark ? 'rgba(21,23,32,0.9)' : '#fff';
  const text1 = isDark ? '#e2e8f0' : '#1e293b';
  const text2 = isDark ? '#94a3b8' : '#64748b';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="eg-page-root" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Toolbar */}
      <div className="eg-toolbar" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 0', flexWrap: 'wrap' }}>
        <input className="eg-search-input" placeholder="Search entities..." value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && fetchGraph()}
          style={{ padding: '10px 16px', borderRadius: 10, border: `1px solid ${border}`, background: card, color: text1, fontSize: 13, outline: 'none', width: 220, transition: 'border-color 0.2s', boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 1px 4px rgba(0,0,0,0.06)' }} />
        <div className="eg-filter-group" style={{ display: 'flex', gap: 5 }}>
          {['', 'politicians', 'parties', 'organizations', 'locations'].map(t => (
            <button key={t} className="eg-filter-btn" onClick={() => setTypeFilter(t)} style={{ padding: '6px 12px', borderRadius: 8, border: 'none', fontSize: 11, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
              background: typeFilter === t ? (isDark ? 'rgba(99,102,241,0.25)' : '#e0e7ff') : (isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9'),
              color: typeFilter === t ? '#6366F1' : text2 }}>{t ? `${TYPE_ICONS[t]} ${TYPE_LABELS[t]}` : '🌐 All'}</button>
          ))}
        </div>
        <div className="eg-filter-group" style={{ display: 'flex', gap: 5 }}>
          {[{ k: '', l: 'All Time' }, { k: '24h', l: '24H' }, { k: '7d', l: '7D' }, { k: '30d', l: '30D' }].map(o => (
            <button key={o.k} className="eg-filter-btn" onClick={() => setTimeframe(o.k)} style={{ padding: '6px 12px', borderRadius: 8, border: 'none', fontSize: 11, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
              background: timeframe === o.k ? (isDark ? 'rgba(99,102,241,0.25)' : '#e0e7ff') : (isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9'),
              color: timeframe === o.k ? '#6366F1' : text2 }}>{o.l}</button>
          ))}
        </div>
        {/* Stats */}
        {!loading && data.nodes.length > 0 && (
          <div className="eg-stats" style={{ marginLeft: 'auto', display: 'flex', gap: 16, alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: text2, fontWeight: 500 }}>{data.nodes.length} entities</span>
            <span style={{ fontSize: 11, color: text2, fontWeight: 500 }}>{data.edges.length} connections</span>
          </div>
        )}
        {/* Legend */}
        <div className="eg-legend" style={{ display: 'flex', gap: 14, fontSize: 11, color: text2, marginLeft: data.nodes.length ? 0 : 'auto' }}>
          {Object.entries(SENTIMENT_COLORS).map(([k, v]) => (
            <span key={k} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: v, boxShadow: `0 0 6px ${v}` }} />{k}
            </span>
          ))}
        </div>
        {/* Mobile View Toggle */}
        {isMobile && data.nodes.length > 0 && (
          <div className="view-toggle">
            <button className={`view-toggle-btn${viewMode === 'list' ? ' active' : ''}`} onClick={() => setViewMode('list')} title="List View">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
            </button>
            <button className={`view-toggle-btn${viewMode === 'graph' ? ' active' : ''}`} onClick={() => setViewMode('graph')} title="Graph View">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><circle cx="4" cy="6" r="2"/><circle cx="20" cy="18" r="2"/><line x1="6" y1="7" x2="10" y2="10"/><line x1="14" y1="14" x2="18" y2="17"/></svg>
            </button>
          </div>
        )}
      </div>

      {/* Graph + Sidebar */}
      <div className="eg-graph-container" style={{ flex: 1, display: 'flex', borderRadius: 16, overflow: 'hidden', border: `1px solid ${border}`, background: isDark ? 'rgba(8,10,18,0.7)' : '#fafbfc', boxShadow: isDark ? '0 4px 24px rgba(0,0,0,0.4)' : '0 2px 12px rgba(0,0,0,0.06)', position: 'relative' }}>
        {/* Background gradient */}
        {isDark && <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 30% 40%, rgba(99,102,241,0.06) 0%, transparent 60%), radial-gradient(ellipse at 70% 60%, rgba(16,185,129,0.04) 0%, transparent 50%)', pointerEvents: 'none', zIndex: 0 }} />}

        {/* Mobile List View */}
        {isMobile && viewMode === 'list' && !loading && data.nodes.length > 0 && (
          <div className="entity-list-view">
            {[...data.nodes]
              .sort((a, b) => b.mentions - a.mentions)
              .slice(0, 20)
              .map(node => {
                const connectedCount = data.edges.filter(e => e.source === node.id || e.target === node.id).length;
                return (
                  <div key={node.id} className="entity-card" onClick={() => handleNodeClick(node.id)}>
                    <div className="entity-card-top">
                      <div className="entity-card-info">
                        <span className="entity-card-name">{node.label}</span>
                        <span className="entity-card-badge" style={{ background: `${TYPE_COLORS[node.category] || '#6366f1'}20`, color: TYPE_COLORS[node.category] || '#6366f1' }}>
                          {TYPE_ICONS[node.category] || '📊'} {TYPE_LABELS[node.category] || node.category}
                        </span>
                      </div>
                      <div className="entity-card-mentions">{node.mentions}</div>
                    </div>
                    <div className="entity-card-bottom">
                      <div className="entity-card-sentiment">
                        <span className="entity-card-sentiment-dot" style={{ background: SENTIMENT_COLORS[node.sentiment] || SENTIMENT_COLORS.Neutral, boxShadow: `0 0 6px ${SENTIMENT_COLORS[node.sentiment] || SENTIMENT_COLORS.Neutral}` }} />
                        <span className="entity-card-sentiment-label">{node.sentiment}</span>
                      </div>
                      <span className="entity-card-connections">{connectedCount} connection{connectedCount !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                );
              })}
          </div>
        )}

        {/* Graph View */}
        {(!isMobile || viewMode === 'graph') && (
          <div ref={graphRef} className="eg-graph-area" style={{ flex: 1, minHeight: isMobile ? 350 : 550, position: 'relative', zIndex: 1 }}>
            {loading && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: text2, gap: 12 }}>
                <div style={{ width: 40, height: 40, border: `3px solid ${isDark ? 'rgba(99,102,241,0.3)' : '#e0e7ff'}`, borderTopColor: '#6366F1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <span style={{ fontSize: 13 }}>Mapping entity connections...</span>
              </div>
            )}
            {!loading && !data.nodes.length && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: text2, gap: 16 }}>
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.3"><circle cx="12" cy="12" r="3" /><circle cx="4" cy="6" r="2" /><circle cx="20" cy="6" r="2" /><circle cx="4" cy="18" r="2" /><circle cx="20" cy="18" r="2" /><line x1="6" y1="7" x2="10" y2="10" /><line x1="18" y1="7" x2="14" y2="10" /></svg>
                <p style={{ fontSize: 14, fontWeight: 500 }}>No entity data yet</p>
                <p style={{ fontSize: 12, opacity: 0.7 }}>Analyze some articles to see the relationship graph</p>
              </div>
            )}
          </div>
        )}

        {/* Loading state for list view */}
        {isMobile && viewMode === 'list' && loading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 300, color: text2, gap: 12, width: '100%' }}>
            <div style={{ width: 40, height: 40, border: `3px solid ${isDark ? 'rgba(99,102,241,0.3)' : '#e0e7ff'}`, borderTopColor: '#6366F1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <span style={{ fontSize: 13 }}>Loading entities...</span>
          </div>
        )}

        {/* Sidebar */}
        <AnimatePresence>
          {selectedNode && (
            <motion.div className="eg-detail-sidebar" initial={{ width: 0, opacity: 0 }} animate={{ width: 340, opacity: 1 }} exit={{ width: 0, opacity: 0 }} transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              style={{ borderLeft: `1px solid ${border}`, background: isDark ? 'rgba(15,17,28,0.95)' : 'rgba(255,255,255,0.97)', backdropFilter: 'blur(20px)', padding: 24, overflowY: 'auto', overflowX: 'hidden', zIndex: 2 }}>
              {detailLoading ? <div style={{ color: text2 }}>Loading...</div> : detail ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 20 }}>{TYPE_ICONS[detail.category] || '📊'}</span>
                      <h3 style={{ fontSize: 18, fontWeight: 700, color: text1, margin: 0 }}>{detail.name}</h3>
                    </div>
                    <span style={{ fontSize: 11, color: '#6366F1', fontWeight: 600, textTransform: 'capitalize', background: isDark ? 'rgba(99,102,241,0.15)' : '#eef2ff', padding: '2px 8px', borderRadius: 4, marginTop: 6, display: 'inline-block' }}>{detail.category}</span>
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: text1 }}>{detail.totalMentions} <span style={{ fontSize: 12, fontWeight: 500, color: text2 }}>mentions</span></div>
                  {/* Sentiment bars */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: text1, marginBottom: 2 }}>Sentiment Distribution</div>
                    {Object.entries(detail.sentimentBreakdown || {}).map(([k, v]) => (
                      <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 10, width: 58, color: text2, fontWeight: 500 }}>{k}</span>
                        <div style={{ flex: 1, height: 8, borderRadius: 4, background: isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9', overflow: 'hidden' }}>
                          <motion.div initial={{ width: 0 }} animate={{ width: `${detail.totalMentions ? (v / detail.totalMentions * 100) : 0}%` }} transition={{ duration: 0.6, ease: 'easeOut' }} style={{ height: '100%', borderRadius: 4, background: SENTIMENT_COLORS[k], boxShadow: `0 0 8px ${SENTIMENT_GLOW[k]}` }} />
                        </div>
                        <span style={{ fontSize: 11, color: text1, width: 24, textAlign: 'right', fontWeight: 600 }}>{v}</span>
                      </div>
                    ))}
                  </div>
                  {/* Connected */}
                  {detail.connectedEntities?.length > 0 && (
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: text1, marginBottom: 6 }}>Connected Entities</div>
                      {detail.connectedEntities.slice(0, 8).map(c => (
                        <div key={c.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 11, color: text2, borderBottom: `1px solid ${border}` }}>
                          <span style={{ cursor: 'pointer', color: '#4D7AFF' }} onClick={() => handleNodeClick(c.name)}>{c.name}</span>
                          <span>{c.coOccurrences}x</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Articles */}
                  {detail.articles?.length > 0 && (
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: text1, marginBottom: 6 }}>Recent Articles</div>
                      {detail.articles.slice(0, 8).map((a, i) => (
                        <div key={i} style={{ padding: '6px 0', borderBottom: `1px solid ${border}`, fontSize: 11 }}>
                          <div style={{ color: text1, fontWeight: 500, lineHeight: 1.3 }}>{a.title?.slice(0, 60)}{a.title?.length > 60 ? '...' : ''}</div>
                          <div style={{ display: 'flex', gap: 8, marginTop: 3 }}>
                            <span style={{ color: SENTIMENT_COLORS[a.sentiment], fontWeight: 600, fontSize: 10 }}>{a.sentiment}</span>
                            <span style={{ color: text2, fontSize: 10 }}>{a.source}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Trend */}
                  {detail.trend?.length > 1 && (
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: text1, marginBottom: 6 }}>Trend</div>
                      <div style={{ display: 'flex', alignItems: 'end', gap: 2, height: 50 }}>
                        {detail.trend.slice(-14).map((d, i) => {
                          const total = d.Positive + d.Negative + d.Neutral;
                          return <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1, height: '100%', justifyContent: 'flex-end' }}>
                            <div style={{ background: SENTIMENT_COLORS.Positive, height: `${total ? (d.Positive / total * 100) : 0}%`, borderRadius: 2, minHeight: d.Positive ? 2 : 0 }} />
                            <div style={{ background: SENTIMENT_COLORS.Neutral, height: `${total ? (d.Neutral / total * 100) : 0}%`, borderRadius: 2, minHeight: d.Neutral ? 2 : 0 }} />
                            <div style={{ background: SENTIMENT_COLORS.Negative, height: `${total ? (d.Negative / total * 100) : 0}%`, borderRadius: 2, minHeight: d.Negative ? 2 : 0 }} />
                          </div>;
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : <div style={{ color: text2 }}>No data</div>}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
