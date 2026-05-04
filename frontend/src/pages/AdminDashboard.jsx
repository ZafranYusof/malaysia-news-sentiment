/* eslint-disable no-irregular-whitespace */
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAdminStats } from '../services/api';
import toast from 'react-hot-toast';
import ScrollToTop from '../components/ScrollToTop';
import LoadingScreen from '../components/LoadingScreen';
import { useSocket } from '../context/SocketContext';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [metrics, setMetrics] = useState(null);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const socket = useSocket();

  const loadData = useCallback(async () => {
    try {
      const statsData = await getAdminStats();
      setStats(statsData);
    } catch {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const loadMetrics = async () => {
    setMetricsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5001/api/v1/admin/metrics', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setMetrics(await res.json());
      else setMetrics({ totalCalls: 0, methods: {}, statusCodes: {}, avgResponseTime: 0, topEndpoints: [], errors: 0, errorRate: '0', uptime: '0h 0m', startedAt: new Date().toISOString(), requestsPerMinute: '0', hourlyDistribution: {} });
    } catch { setMetrics({ totalCalls: 0, methods: {}, statusCodes: {}, avgResponseTime: 0, topEndpoints: [], errors: 0, errorRate: '0', uptime: '0h 0m', startedAt: new Date().toISOString(), requestsPerMinute: '0', hourlyDistribution: {} }); }
    finally { setMetricsLoading(false); }
  };

  const loadInsights = async () => {
    setInsightsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const API = import.meta.env.VITE_API_BASE || 'http://localhost:5001/api/v1';
      const res = await fetch(`${API}/news/admin/insights`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setInsights(await res.json());
      else setInsights({ risk: 'Could not load insights', opportunity: 'Try again later' });
    } catch { setInsights({ risk: 'Connection error', opportunity: 'Check if backend is running' }); }
    finally { setInsightsLoading(false); }
  };

  // Real-time updates
  useEffect(() => {
    if (!socket) return;
    socket.on('user_activity', (data) => {
      setStats(prev => {
        if (!prev) return prev;
        const updatedUsers = prev.recentUsers.map(u =>
          u._id === data.userId ? { ...u, analysisCount: data.analysisCount } : u
        );
        return { ...prev, recentUsers: updatedUsers };
      });
      toast.success(`${data.userName} completed analysis`, { icon: '⚡', duration: 3000 });
    });
    socket.on('system_stats_updated', (data) => {
      setStats(prev => prev ? {
        ...prev,
        overview: { ...prev.overview, totalArticles: prev.overview.totalArticles + (data.count || 0), totalUnique: prev.overview.totalUnique + (data.count || 0) }
      } : prev);
    });
    return () => { socket.off('user_activity'); socket.off('system_stats_updated'); };
  }, [socket]);

  if (loading) return <LoadingScreen message="Loading Admin Dashboard..." />;
  if (!stats) return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <h2 style={{ color: 'var(--text-400)' }}>Dashboard Unavailable</h2>
      <button onClick={() => window.location.reload()} style={{ marginTop: 16, padding: '10px 24px', background: '#F54E00', color: 'var(--text-primary)', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>Retry</button>
    </div>
  );

  const totalUnique = stats.overview?.totalUnique || 1;
  const sentimentData = stats.sentiment || { Positive: 0, Negative: 0, Neutral: 0 };
  const totalSentiment = sentimentData.Positive + sentimentData.Negative + sentimentData.Neutral || 1;

  return (
    <div className="admin-dashboard-page">
      <style>{`
        .admin-dashboard-page {
          min-height: 100vh;
          padding: 32px 40px;
          background: var(--bg, #EEEFE9);
          color: var(--text-primary, #151515);
          font-family: 'Inter', -apple-system, sans-serif;
          position: relative;
        }
        .admin-dashboard-page::before {
          content: '';
          position: fixed;
          top: -200px;
          right: -200px;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(245,78,0,0.06) 0%, transparent 70%);
          pointer-events: none;
        }
        .admin-dashboard-page::after {
          content: '';
          position: fixed;
          bottom: -200px;
          left: -100px;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(48,207,121,0.04) 0%, transparent 70%);
          pointer-events: none;
        }

        .adm-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; }
        .adm-title { font-size: 28px; font-weight: 800; color: var(--text-primary, #151515); letter-spacing: -0.5px; margin: 0; }
        .adm-subtitle { font-size: 13px; color: var(--text-muted, #8c8d8f); margin-top: 4px; font-weight: 500; }

        .adm-status-bar { display: flex; gap: 10px; align-items: center; }
        .adm-status-pill { display: flex; align-items: center; gap: 6px; padding: 5px 12px; border-radius: 20px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
        .adm-status-dot { width: 6px; height: 6px; border-radius: 50%; animation: pulse-dot 2s infinite; }
        @keyframes pulse-dot { 0%,100% { opacity:1; } 50% { opacity:0.4; } }

        .adm-tabs { display: flex; gap: 4px; margin-bottom: 28px; background: var(--surface, #fff); padding: 4px; border-radius: 12px; width: fit-content; border: 1px solid var(--border); }
        .adm-tab { padding: 8px 18px; border-radius: 8px; border: none; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s; color: var(--text-muted); background: transparent; }
        .adm-tab.active { background: rgba(245,78,0,0.1); color: #F54E00; }
        .adm-tab:hover:not(.active) { color: var(--text-secondary); }

        .adm-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
        @media (max-width: 1200px) { .adm-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 768px) { .adm-grid { grid-template-columns: 1fr; } }

        .adm-stat-card { background: var(--card, #fff); border: 1px solid var(--border); border-radius: 14px; padding: 20px; transition: all 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
        .adm-stat-card:hover { border-color: rgba(245,78,0,0.3); transform: translateY(-2px); box-shadow: 0 4px 16px rgba(245,78,0,0.08); }
        .adm-stat-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-bottom: 14px; }
        .adm-stat-label { font-size: 11px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
        .adm-stat-value { font-size: 26px; font-weight: 800; color: var(--text-primary); line-height: 1; }
        .adm-stat-sub { font-size: 11px; color: var(--text-muted); margin-top: 6px; font-weight: 500; }

        .adm-section-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
        @media (max-width: 1024px) { .adm-section-grid { grid-template-columns: 1fr; } }

        .adm-card { background: var(--card, #fff); border: 1px solid var(--border); border-radius: 14px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
        .adm-card-title { font-size: 14px; font-weight: 700; color: var(--text-primary); margin: 0 0 18px 0; display: flex; align-items: center; gap: 8px; }
        .adm-card-badge { font-size: 9px; font-weight: 700; padding: 2px 8px; border-radius: 4px; text-transform: uppercase; }

        .adm-bar-row { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
        .adm-bar-label { font-size: 11px; color: var(--text-secondary); width: 80px; font-weight: 500; }
        .adm-bar-track { flex: 1; height: 8px; background: var(--border); border-radius: 4px; overflow: hidden; }
        .adm-bar-fill { height: 100%; border-radius: 4px; transition: width 0.8s ease; }
        .adm-bar-val { font-size: 11px; color: var(--text-primary); font-weight: 700; width: 40px; text-align: right; }

        .adm-table { width: 100%; border-collapse: separate; border-spacing: 0 6px; }
        .adm-table th { text-align: left; padding: 8px 14px; font-size: 10px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
        .adm-table td { padding: 12px 14px; background: var(--surface); font-size: 12px; color: var(--text-secondary); }
        .adm-table tr td:first-child { border-radius: 8px 0 0 8px; }
        .adm-table tr td:last-child { border-radius: 0 8px 8px 0; }

        .adm-role-badge { font-size: 9px; font-weight: 800; padding: 3px 8px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.3px; }

        .adm-insight-card { background: linear-gradient(135deg, rgba(245,78,0,0.06), rgba(48,207,121,0.04)); border: 1px solid rgba(245,78,0,0.15); border-radius: 12px; padding: 18px; margin-bottom: 12px; }
        .adm-insight-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }

        .adm-source-item { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--border); }
        .adm-source-item:last-child { border-bottom: none; }

        .adm-topic-chip { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; background: rgba(245,78,0,0.08); border: 1px solid rgba(245,78,0,0.15); border-radius: 8px; margin: 4px; font-size: 11px; font-weight: 600; color: #F54E00; }

        .adm-refresh-btn { padding: 8px 16px; background: rgba(245,78,0,0.08); border: 1px solid rgba(245,78,0,0.2); border-radius: 8px; color: #F54E00; font-size: 11px; font-weight: 700; cursor: pointer; transition: all 0.2s; }
        .adm-refresh-btn:hover { background: rgba(245,78,0,0.15); }
      `}</style>

      {/* Header */}
      <div className="adm-header">
        <div>
          <h1 className="adm-title">Admin Dashboard</h1>
          <p className="adm-subtitle">System overview and analytics management</p>
        </div>
        <div className="adm-status-bar">
          <div className="adm-status-pill" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#10b981' }}>
            <div className="adm-status-dot" style={{ background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
            All Systems Online
          </div>
          <button className="adm-refresh-btn" onClick={loadData}>Refresh</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="adm-tabs">
        {['overview', 'users', 'content', 'api', 'insights'].map(tab => (
          <button key={tab} className={`adm-tab ${activeTab === tab ? 'active' : ''}`} onClick={() => { setActiveTab(tab); if (tab === 'insights' && !insights) loadInsights(); if (tab === 'api') loadMetrics(); }}>
            {tab === 'api' ? 'API Metrics' : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            {/* Stats Cards */}
            <div className="adm-grid">
              <div className="adm-stat-card">
                <div className="adm-stat-icon" style={{ background: 'rgba(245,78,0,0.12)' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F54E00" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
                </div>
                <div className="adm-stat-label">Total Articles</div>
                <div className="adm-stat-value">{stats.overview.totalUnique.toLocaleString()}</div>
                <div className="adm-stat-sub">In database</div>
              </div>
              <div className="adm-stat-card">
                <div className="adm-stat-icon" style={{ background: 'rgba(16,185,129,0.12)' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                </div>
                <div className="adm-stat-label">Analyses Run</div>
                <div className="adm-stat-value">{stats.overview.totalArticles.toLocaleString()}</div>
                <div className="adm-stat-sub">Total processed</div>
              </div>
              <div className="adm-stat-card">
                <div className="adm-stat-icon" style={{ background: 'rgba(245,158,11,0.12)' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </div>
                <div className="adm-stat-label">Registered Users</div>
                <div className="adm-stat-value">{stats.overview.totalUsers}</div>
                <div className="adm-stat-sub">Active accounts</div>
              </div>
              <div className="adm-stat-card">
                <div className="adm-stat-icon" style={{ background: 'rgba(139,92,246,0.12)' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                </div>
                <div className="adm-stat-label">Total Views</div>
                <div className="adm-stat-value">{(stats.overview.totalViews || 0).toLocaleString()}</div>
                <div className="adm-stat-sub">Article views</div>
              </div>
            </div>

            {/* Sentiment + Sources */}
            <div className="adm-section-grid">
              <div className="adm-card">
                <h3 className="adm-card-title">
                  Sentiment Distribution
                  <span className="adm-card-badge" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>Live</span>
                </h3>
                {[
                  { label: 'Positive', color: '#10b981', count: sentimentData.Positive },
                  { label: 'Neutral', color: '#F54E00', count: sentimentData.Neutral },
                  { label: 'Negative', color: '#ef4444', count: sentimentData.Negative },
                ].map(s => (
                  <div key={s.label} className="adm-bar-row">
                    <span className="adm-bar-label">{s.label}</span>
                    <div className="adm-bar-track">
                      <div className="adm-bar-fill" style={{ width: `${(s.count / totalSentiment * 100)}%`, background: s.color, boxShadow: `0 0 8px ${s.color}44` }} />
                    </div>
                    <span className="adm-bar-val">{Math.round(s.count / totalSentiment * 100)}%</span>
                  </div>
                ))}
                <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                  {[
                    { label: 'Positive', count: sentimentData.Positive, color: '#10b981' },
                    { label: 'Neutral', count: sentimentData.Neutral, color: '#F54E00' },
                    { label: 'Negative', count: sentimentData.Negative, color: '#ef4444' },
                  ].map(s => (
                    <div key={s.label} style={{ flex: 1, padding: '10px 12px', background: `${s.color}08`, border: `1px solid ${s.color}20`, borderRadius: 8, textAlign: 'center' }}>
                      <div style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.count}</div>
                      <div style={{ fontSize: 9, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="adm-card">
                <h3 className="adm-card-title">Top Sources</h3>
                {stats.topSources?.length > 0 ? stats.topSources.map((s, i) => (
                  <div key={i} className="adm-source-item">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)', width: 18 }}>#{i + 1}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{s.source || 'Unknown'}</span>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#F54E00', background: 'rgba(245,78,0,0.1)', padding: '3px 10px', borderRadius: 12 }}>{s.count} articles</span>
                  </div>
                )) : <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>No source data available</p>}
              </div>
            </div>

            {/* Topics + Recent Articles */}
            <div className="adm-section-grid">
              <div className="adm-card">
                <h3 className="adm-card-title">Popular Topics</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {stats.popularTopics?.length > 0 ? stats.popularTopics.map((t, i) => (
                    <span key={i} className="adm-topic-chip">
                      {t.topic || 'General'}
                      <span style={{ color: '#F54E00', fontWeight: 800 }}>{t.count}</span>
                    </span>
                  )) : <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>No topic data</p>}
                </div>
              </div>

              <div className="adm-card">
                <h3 className="adm-card-title">Recent Articles</h3>
                {stats.recentArticles?.slice(0, 5).map((a, i) => (
                  <div key={i} style={{ padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4, marginBottom: 4 }}>
                      {a.title?.slice(0, 70)}{a.title?.length > 70 ? '...' : ''}
                    </div>
                    <div style={{ display: 'flex', gap: 8, fontSize: 10 }}>
                      <span style={{ color: a.sentiment === 'Positive' ? '#10b981' : a.sentiment === 'Negative' ? '#ef4444' : '#6366f1', fontWeight: 700 }}>{a.sentiment}</span>
                      <span style={{ color: 'var(--text-muted)' }}>{a.source}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Activity Timeline */}
            {stats.activityTimeline?.length > 0 && (
              <div className="adm-card" style={{ marginBottom: 24 }}>
                <h3 className="adm-card-title">Activity by Hour</h3>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 100 }}>
                  {Array.from({ length: 24 }, (_, h) => {
                    const entry = stats.activityTimeline.find(a => a._id === h);
                    const count = entry?.count || 0;
                    const maxCount = Math.max(...stats.activityTimeline.map(a => a.count), 1);
                    return (
                      <div key={h} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                        <div style={{ width: '100%', height: `${Math.max(4, (count / maxCount) * 80)}px`, background: count > 0 ? 'linear-gradient(to top, #6366f1, #a78bfa)' : 'rgba(255,255,255,0.03)', borderRadius: 3, transition: 'height 0.5s ease' }} />
                        {h % 4 === 0 && <span style={{ fontSize: 8, color: 'var(--text-muted)' }}>{h}h</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'users' && (
          <motion.div key="users" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <div className="adm-card">
              <h3 className="adm-card-title">
                Registered Users
                <span className="adm-card-badge" style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}>{stats.overview.totalUsers} total</span>
              </h3>
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Analyses</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentUsers?.map((u, i) => (
                    <tr key={i}>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 12 }}>{u.name}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{u.email}</div>
                      </td>
                      <td>
                        <span className="adm-role-badge" style={{
                          background: u.role === 'admin' ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.04)',
                          color: u.role === 'admin' ? '#a5b4fc' : '#64748b',
                          border: `1px solid ${u.role === 'admin' ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.06)'}`
                        }}>{u.role}</span>
                      </td>
                      <td style={{ fontWeight: 700, color: '#10b981' }}>{u.analysisCount || 0}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: 11 }}>{new Date(u.createdAt).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === 'content' && (
          <motion.div key="content" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <div className="adm-section-grid">
              <div className="adm-card">
                <h3 className="adm-card-title">High Impact Articles</h3>
                {stats.topImpactArticles?.length > 0 ? stats.topImpactArticles.map((a, i) => (
                  <div key={i} style={{ padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                      {a.title?.slice(0, 80)}{a.title?.length > 80 ? '...' : ''}
                    </div>
                    <div style={{ display: 'flex', gap: 10, fontSize: 10 }}>
                      <span style={{ color: a.sentiment === 'Positive' ? '#10b981' : a.sentiment === 'Negative' ? '#ef4444' : '#6366f1', fontWeight: 700 }}>{a.sentiment}</span>
                      <span style={{ color: 'var(--text-muted)' }}>{a.source}</span>
                      {a.impactScore && <span style={{ color: '#f59e0b', fontWeight: 700 }}>Impact: {a.impactScore}</span>}
                    </div>
                  </div>
                )) : <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>No impact data available</p>}
              </div>

              <div className="adm-card">
                <h3 className="adm-card-title">Source Distribution</h3>
                {stats.topSources?.map((s, i) => {
                  const maxSource = stats.topSources[0]?.count || 1;
                  return (
                    <div key={i} className="adm-bar-row">
                      <span className="adm-bar-label" style={{ width: 100 }}>{s.source || 'Unknown'}</span>
                      <div className="adm-bar-track">
                        <div className="adm-bar-fill" style={{ width: `${(s.count / maxSource) * 100}%`, background: 'linear-gradient(to right, #6366f1, #8b5cf6)' }} />
                      </div>
                      <span className="adm-bar-val">{s.count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'api' && (
          <motion.div key="api" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            {metricsLoading || !metrics ? (
              <div className="adm-card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                <div style={{ width: 32, height: 32, border: '3px solid rgba(245,78,0,0.2)', borderTopcolor: '#F54E00', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
                Loading API metrics...
              </div>
            ) : (
              <>
                {/* API Stats Cards */}
                <div className="adm-grid">
                  <div className="adm-stat-card">
                    <div className="adm-stat-icon" style={{ background: 'rgba(245,78,0,0.12)' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F54E00" strokeWidth="2.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                    </div>
                    <div className="adm-stat-label">Total API Calls</div>
                    <div className="adm-stat-value">{metrics.totalCalls.toLocaleString()}</div>
                    <div className="adm-stat-sub">{metrics.requestsPerMinute} req/min</div>
                  </div>
                  <div className="adm-stat-card">
                    <div className="adm-stat-icon" style={{ background: 'rgba(16,185,129,0.12)' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                    </div>
                    <div className="adm-stat-label">Avg Response Time</div>
                    <div className="adm-stat-value">{metrics.avgResponseTime}ms</div>
                    <div className="adm-stat-sub">Server latency</div>
                  </div>
                  <div className="adm-stat-card">
                    <div className="adm-stat-icon" style={{ background: 'rgba(239,68,68,0.12)' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                    </div>
                    <div className="adm-stat-label">Error Rate</div>
                    <div className="adm-stat-value">{metrics.errorRate}%</div>
                    <div className="adm-stat-sub">{metrics.errors} total errors</div>
                  </div>
                  <div className="adm-stat-card">
                    <div className="adm-stat-icon" style={{ background: 'rgba(139,92,246,0.12)' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2.5"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                    </div>
                    <div className="adm-stat-label">Uptime</div>
                    <div className="adm-stat-value">{metrics.uptime}</div>
                    <div className="adm-stat-sub">Since {new Date(metrics.startedAt).toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                </div>

                <div className="adm-section-grid">
                  {/* HTTP Methods */}
                  <div className="adm-card">
                    <h3 className="adm-card-title">HTTP Methods</h3>
                    {Object.entries(metrics.methods).filter(([_, v]) => v > 0).map(([method, count]) => {
                      const colors = { GET: '#10b981', POST: '#6366f1', PUT: '#f59e0b', DELETE: '#ef4444', PATCH: '#8b5cf6' };
                      const maxMethod = Math.max(...Object.values(metrics.methods));
                      return (
                        <div key={method} className="adm-bar-row">
                          <span className="adm-bar-label" style={{ fontFamily: 'monospace', fontWeight: 700, color: colors[method] || '#94a3b8' }}>{method}</span>
                          <div className="adm-bar-track">
                            <div className="adm-bar-fill" style={{ width: `${(count / maxMethod) * 100}%`, background: colors[method] || '#6366f1' }} />
                          </div>
                          <span className="adm-bar-val">{count}</span>
                        </div>
                      );
                    })}

                    <h3 className="adm-card-title" style={{ marginTop: 24 }}>Status Codes</h3>
                    {Object.entries(metrics.statusCodes).sort((a, b) => b[1] - a[1]).map(([code, count]) => {
                      const color = code.startsWith('2') ? '#10b981' : code.startsWith('3') ? '#6366f1' : code.startsWith('4') ? '#f59e0b' : '#ef4444';
                      return (
                        <div key={code} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                          <span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color }}>{code}</span>
                          <span style={{ fontSize: 11, color: 'var(--text-primary)', fontWeight: 600 }}>{count} requests</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Top Endpoints */}
                  <div className="adm-card">
                    <h3 className="adm-card-title">
                      Top Endpoints
                      <span className="adm-card-badge" style={{ background: 'rgba(245,78,0,0.1)', color: '#F54E00' }}>{metrics.topEndpoints.length} tracked</span>
                    </h3>
                    {metrics.topEndpoints.map((ep, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', width: 20 }}>#{i + 1}</span>
                          <code style={{ fontSize: 11, color: 'var(--text-primary)', fontWeight: 500, background: 'rgba(255,255,255,0.03)', padding: '2px 8px', borderRadius: 4 }}>{ep.endpoint}</code>
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#F54E00' }}>{ep.count}x</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ textAlign: 'right', marginTop: 12 }}>
                  <button className="adm-refresh-btn" onClick={loadMetrics}>Refresh Metrics</button>
                </div>
              </>
            )}
          </motion.div>
        )}

        {activeTab === 'insights' && (
          <motion.div key="insights" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <div className="adm-card">
              <h3 className="adm-card-title">
                AI Strategic Insights
                <span className="adm-card-badge" style={{ background: 'rgba(139,92,246,0.1)', color: '#a78bfa' }}>GPT-4o</span>
              </h3>
              {insightsLoading ? (
                <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
                  <div style={{ width: 32, height: 32, border: '3px solid rgba(245,78,0,0.2)', borderTopcolor: '#F54E00', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
                  Generating insights...
                </div>
              ) : insights ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div className="adm-insight-card">
                    <div className="adm-insight-label" style={{ color: '#ef4444' }}>Risk Assessment</div>
                    <p style={{ color: 'var(--text-primary)', fontSize: 13, margin: 0, lineHeight: 1.5 }}>{insights.risk}</p>
                  </div>
                  <div className="adm-insight-card" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(99,102,241,0.05))', borderColor: 'rgba(16,185,129,0.15)' }}>
                    <div className="adm-insight-label" style={{ color: '#10b981' }}>Opportunity</div>
                    <p style={{ color: 'var(--text-primary)', fontSize: 13, margin: 0, lineHeight: 1.5 }}>{insights.opportunity}</p>
                  </div>
                  <button className="adm-refresh-btn" onClick={loadInsights} style={{ alignSelf: 'flex-start', marginTop: 8 }}>Regenerate Insights</button>
                </div>
              ) : (
                <div style={{ padding: 30, textAlign: 'center' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Click to generate AI-powered strategic insights from recent news data</p>
                  <button className="adm-refresh-btn" onClick={loadInsights}>Generate Insights</button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ScrollToTop />
    </div>
  );
};

export default AdminDashboard;


