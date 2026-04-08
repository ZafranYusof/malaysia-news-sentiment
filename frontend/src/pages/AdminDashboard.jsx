import React, { useState, useEffect } from 'react';
import { getAdminStats, getAdminInsights } from '../services/api';
import toast from 'react-hot-toast';
import ScrollToTop from '../components/ScrollToTop';
import LoadingScreen from '../components/LoadingScreen';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Operational States
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isSourceModalOpen, setIsSourceModalOpen] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [maintenanceActive, setMaintenanceActive] = useState(false);
  const [archivalActive, setArchivalActive] = useState(true);
  const [isForecasting, setIsForecasting] = useState(false);
  const [isSnapshotting, setIsSnapshotting] = useState(false);
  const [newSourceName, setNewSourceName] = useState('');
  const [isAddingSource, setIsAddingSource] = useState(false);

  // Operational States Persistence
  const [sources, setSources] = useState(() => {
    const saved = localStorage.getItem('admin_sources');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'The Star Online', score: 98, status: 'Active' },
      { id: 2, name: 'Malaysiakini', score: 94, status: 'Active' },
      { id: 3, name: 'Free Malaysia Today', score: 92, status: 'Warning' }
    ];
  });

  const [anomalyLogs, setAnomalyLogs] = useState(() => {
    const saved = localStorage.getItem('admin_anomalies');
    return saved ? JSON.parse(saved) : [
      { id: 1, type: 'GAP', loc: 'Sabah Region', info: 'Missing Scraping Nodes', severity: 'High' },
      { id: 2, type: 'LAG', loc: 'The Star API', info: 'Latency > 2.5s', severity: 'Med' },
      { id: 3, type: 'DRIFT', loc: 'Sentiment Engine', info: 'Negative bias spike anomaly', severity: 'High' }
    ];
  });

  useEffect(() => {
    localStorage.setItem('admin_sources', JSON.stringify(sources));
  }, [sources]);

  useEffect(() => {
    localStorage.setItem('admin_anomalies', JSON.stringify(anomalyLogs));
  }, [anomalyLogs]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsData, insightsData] = await Promise.all([
          getAdminStats(),
          getAdminInsights().catch(() => ({ risk: 'Stable', opportunity: 'Growth' }))
        ]);
        setStats(statsData);
        setInsights(insightsData);
      } catch {
        toast.error('Failed to load command data');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return <LoadingScreen message="Accessing Command Console..." />;

  if (!stats) return (
    <div className="admin-page" style={{ padding: 40, textAlign: 'center' }}>
       <h2 style={{ color: 'var(--text-400)' }}>System Command Unavailable</h2>
       <p style={{ color: 'var(--text-500)' }}>Please check your network and refresh the page.</p>
       <button className="btn-primary" onClick={() => window.location.reload()}>Retry Connection</button>
    </div>
  );

  const totalArts = stats.overview?.totalArticles || 1;
  const totalUnique = stats.overview?.totalUnique || 1;

  return (
    <div className="admin-page yak-theme">
      <style>{`
        .yak-theme {
          background-color: #020617;
          min-height: 100vh;
          padding: 40px;
          color: #f8fafc;
          font-family: 'Inter', sans-serif;
          position: relative;
          overflow-x: hidden;
        }
        .yak-theme::before {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%);
          filter: blur(100px);
          pointer-events: none;
        }

        .admin-header-glow {
          margin-bottom: 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .admin-title-yak {
          font-size: 32px;
          font-weight: 900;
          background: linear-gradient(to right, #fff, #94a3b8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          letter-spacing: -1px;
        }
        .live-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 16px;
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.2);
          border-radius: 99px;
          color: #10b981;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
        }
        .live-dot {
          width: 6px;
          height: 6px;
          background: #10b981;
          border-radius: 50%;
          box-shadow: 0 0 12px #10b981;
          animation: pulseDot 2s infinite;
        }
        @keyframes pulseDot { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.2); } }

        .yak-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 24px;
          margin-bottom: 24px;
        }

        .yak-card {
           position: relative;
           background: #0f172a;
           border: 1px solid rgba(255, 255, 255, 0.05);
           border-radius: 16px;
           padding: 24px;
           transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
           overflow: hidden;
        }
        .yak-card::before {
           content: '';
           position: absolute;
           inset: 0;
           background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), transparent);
           opacity: 0;
           transition: opacity 0.3s;
           pointer-events: none;
        }
        .yak-card:hover {
           transform: translateY(-5px) scale(1.01);
           border-color: rgba(99, 102, 241, 0.3);
           box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4), 0 0 20px rgba(99, 102, 241, 0.1);
        }
        .yak-card:hover::before { opacity: 1; }

        .yak-card-header {
           display: flex;
           align-items: center;
           justify-content: space-between;
           margin-bottom: 24px;
           position: relative;
           z-index: 1;
        }
        .yak-icon-box {
           width: 40px;
           height: 40px;
           background: linear-gradient(135deg, #6366f1, #a855f7);
           border-radius: 10px;
           display: flex;
           align-items: center;
           justify-content: center;
           color: #fff;
           box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }
        .yak-card-title {
           font-size: 15px;
           font-weight: 700;
           color: #fff;
           margin-left: 12px;
        }

        .yak-stat-row {
           display: grid;
           grid-template-columns: repeat(2, 1fr);
           gap: 16px;
           margin-bottom: 24px;
        }
        .yak-stat-box {
           background: rgba(30, 41, 59, 0.5);
           padding: 16px;
           border-radius: 12px;
           border: 1px solid rgba(255, 255, 255, 0.03);
        }
        .yak-stat-label { font-size: 11px; font-weight: 600; color: #94a3b8; text-transform: uppercase; margin-bottom: 4px; }
        .yak-stat-val { font-size: 22px; font-weight: 800; color: #fff; }
        .yak-stat-change { font-size: 11px; font-weight: 700; color: #10b981; }

        .yak-chart-stub {
           height: 80px;
           display: flex;
           align-items: flex-end;
           gap: 6px;
           margin-bottom: 20px;
        }
        .yak-chart-bar {
           flex: 1;
           background: rgba(99, 102, 241, 0.2);
           border-radius: 4px;
           position: relative;
        }
        .yak-chart-fill {
           position: absolute;
           bottom: 0;
           left: 0;
           right: 0;
           background: #6366f1;
           border-radius: 4px;
           transition: height 1s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .yak-btn {
           width: 100%;
           padding: 12px;
           background: linear-gradient(to right, #6366f1, #a855f7);
           border: none;
           border-radius: 10px;
           color: #fff;
           font-weight: 700;
           font-size: 13px;
           cursor: pointer;
           transition: all 0.2s;
           display: flex;
           align-items: center;
           justify-content: center;
           gap: 8px;
        }
        .yak-btn:hover {
           opacity: 0.9;
           transform: scale(0.98);
        }

        .yak-table {
           width: 100%;
           border-collapse: separate;
           border-spacing: 0 8px;
        }
        .yak-table tr { background: rgba(30, 41, 59, 0.3); }
        .yak-table td { padding: 12px 16px; border-top: 1px solid rgba(255, 255, 255, 0.02); border-bottom: 1px solid rgba(255, 255, 255, 0.02); }
        .yak-table td:first-child { border-left: 1px solid rgba(255, 255, 255, 0.02); border-top-left-radius: 12px; border-bottom-left-radius: 12px; }
        .yak-table td:last-child { border-right: 1px solid rgba(255, 255, 255, 0.02); border-top-right-radius: 12px; border-bottom-right-radius: 12px; }

        .pulse-text { animation: pulseOpacity 2s infinite; }
        @keyframes pulseOpacity { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }

        /* Cinematic Report Modal */
        .modal-overlay-yak {
          position: fixed;
          inset: 0;
          background: rgba(2, 6, 23, 0.85);
          backdrop-filter: blur(12px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: fadeIn 0.3s ease;
        }
        .modal-content-yak {
          width: 500px;
          background: #0f172a;
          border: 1px solid rgba(99, 102, 241, 0.3);
          border-radius: 20px;
          padding: 32px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 30px rgba(99, 102, 241, 0.1);
          position: relative;
        }
        .modal-title-yak {
          font-size: 20px;
          font-weight: 800;
          margin-bottom: 8px;
          background: linear-gradient(to right, #fff, #94a3b8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .form-group-yak { margin-bottom: 20px; }
        .form-label-yak { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; display: block; margin-bottom: 8px; }
        .form-input-yak { 
          width: 100%; 
          padding: 12px; 
          background: rgba(30, 41, 59, 0.5); 
          border: 1px solid rgba(255,255,255,0.05); 
          border-radius: 10px; 
          color: #fff; 
          font-size: 13px;
        }
        .progress-bar-yak {
          height: 4px;
          background: rgba(255,255,255,0.05);
          border-radius: 10px;
          overflow: hidden;
          margin-top: 12px;
        }
        .progress-fill-yak {
          height: 100%;
          background: linear-gradient(to right, #6366f1, #a855f7);
          transition: width 0.3s ease;
        }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        /* Multi-column Grid Layout */
        .dashboard-layout-yak {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 24px;
        }

        @media (max-width: 1200px) {
          .dashboard-layout-yak { grid-template-columns: 1fr; }
        }

        .alert-item-yak {
          padding: 12px;
          border-radius: 10px;
          background: rgba(255,255,255,0.02);
          border-left: 3px solid #6366f1;
          margin-bottom: 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .alert-item-yak.high { border-left-color: #ef4444; background: rgba(239, 68, 68, 0.05); }

        .system-gauge-yak {
          height: 60px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

      `}</style>

      {/* Modern High-Tech Header */}
      <div className="admin-header-glow">
        <div>
          <h2 className="admin-title-yak">Command Dashboard</h2>
          <p style={{ color: '#94a3b8', fontSize: 14, marginTop: 4, fontWeight: 500 }}>Global Systems & News Intelligence Architecture</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div className="live-indicator" style={{ background: 'rgba(99, 102, 241, 0.1)', borderColor: 'rgba(99, 102, 241, 0.2)', color: '#6366f1' }}>
            <div className="live-dot" style={{ background: '#6366f1', boxShadow: '0 0 12px #6366f1' }} />
            Operational Mode: Active
          </div>
          <div className="live-indicator">
            <div className="live-dot" />
            Systems Synchronized
          </div>
        </div>
      </div>

      <div className="yak-grid">
         {/* System Pulse Card */}
         <div className="yak-card">
            <div className="yak-card-header">
               <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div className="yak-icon-box">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                  </div>
                  <h3 className="yak-card-title">Processing Pulse</h3>
               </div>
               <span style={{ fontSize: 10, fontWeight: 800, color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: 20 }}>OPERATIONAL</span>
            </div>

            <div className="yak-stat-row">
               <div className="yak-stat-box">
                  <div className="yak-stat-label">Total Articles</div>
                  <div className="yak-stat-val">{stats.overview.totalArticles.toLocaleString()}</div>
                  <span className="yak-stat-change">+2.4k processed</span>
               </div>
               <div className="yak-stat-box">
                  <div className="yak-stat-label">Active Users</div>
                  <div className="yak-stat-val">{stats.overview.totalUsers}</div>
                  <span className="yak-stat-change">12 active sessions</span>
               </div>
            </div>

            <div className="yak-chart-stub">
               {[60, 40, 80, 50, 90, 70, 85].map((h, i) => (
                  <div key={i} className="yak-chart-bar">
                     <div className="yak-chart-fill" style={{ height: `${h}%` }} />
                  </div>
               ))}
            </div>

            <button className="yak-btn" onClick={() => toast.success('Initializing Neural Archive Stream...')}>
               View Performance Logs
               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
         </div>

         {/* Sentiment Matrix Card */}
         <div className="yak-card">
            <div className="yak-card-header">
               <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div className="yak-icon-box" style={{ background: 'linear-gradient(135deg, #10b981, #3b82f6)' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9"/></svg>
                  </div>
                  <h3 className="yak-card-title">Sentiment Distribution</h3>
               </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
               {['Positive', 'Neutral', 'Negative'].map((s, i) => {
                  const val = Math.round((stats.sentiment[s] / totalUnique) * 100);
                  const color = s === 'Positive' ? '#10b981' : (s === 'Neutral' ? '#6366f1' : '#ef4444');
                  return (
                    <div key={s} className="sentiment-yak">
                       <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13, fontWeight: 700 }}>
                          <span style={{ color: '#94a3b8' }}>{s} Benchmarks</span>
                          <span style={{ color: '#fff' }}>{val}%</span>
                       </div>
                       <div style={{ height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 10, overflow: 'hidden' }}>
                          <div style={{ width: `${val}%`, height: '100%', background: color, boxShadow: `0 0 12px ${color}66` }} />
                       </div>
                    </div>
                  );
               })}
            </div>

            <div style={{ marginTop: 32, padding: 16, background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
               <div style={{ fontSize: 11, fontWeight: 800, color: '#6366f1', textTransform: 'uppercase', marginBottom: 8 }}>AI Narrative Insight</div>
               <p style={{ fontSize: 13, color: '#f1f5f9', margin: 0, lineHeight: 1.5 }}>
                  Analysis indicates a move toward <strong>national stability</strong> with minimal volatility across core topics.
               </p>
            </div>
         </div>

         {/* Operational Health Card */}
         <div className="yak-card">
            <div className="yak-card-header">
               <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div className="yak-icon-box" style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                  </div>
                  <h3 className="yak-card-title">Operational Health</h3>
               </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
               {[
                  { label: 'Backend API Response', val: stats.operational?.latency || '24ms', level: 85 },
                  { label: 'OpenAI GPT-4o Gateway', val: 'Connected', level: 100 },
                  { label: 'MongoDB Atlas Cluster', val: 'Operational', level: 98 }
               ].map((item, i) => (
                  <div key={i}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12, fontWeight: 700 }}>
                        <span style={{ color: '#94a3b8' }}>{item.label}</span>
                        <span style={{ color: '#fff' }}>{item.val}</span>
                     </div>
                     <div style={{ height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 10, overflow: 'hidden' }}>
                        <div style={{ width: `${item.level}%`, height: '100%', background: 'linear-gradient(to right, #6366f1, #10b981)' }} />
                     </div>
                  </div>
               ))}
            </div>

            <div style={{ marginTop: 24, display: 'flex', gap: 10 }}>
               <div style={{ flex: 1, padding: 12, background: 'rgba(16, 185, 129, 0.05)', borderRadius: 10, border: '1px solid rgba(16, 185, 129, 0.1)', textAlign: 'center' }}>
                  <div style={{ fontSize: 9, fontWeight: 900, color: '#10b981', textTransform: 'uppercase' }}>Uptime</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#10b981' }}>99.99%</div>
               </div>
               <div style={{ flex: 1, padding: 12, background: 'rgba(99, 102, 241, 0.05)', borderRadius: 10, border: '1px solid rgba(99, 102, 241, 0.1)', textAlign: 'center' }}>
                  <div style={{ fontSize: 9, fontWeight: 900, color: '#6366f1', textTransform: 'uppercase' }}>Security</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#6366f1' }}>L3 Grade</div>
               </div>
            </div>
         </div>
      </div>

      <div className="dashboard-layout-yak">
        {/* Geographic Intelligence Stub */}
        <div className="yak-card">
           <div className="yak-card-header">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                 <div className="yak-icon-box" style={{ background: '#3b82f6' }}>
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                 </div>
                 <h3 className="yak-card-title">Geographic Sentiment Heatmap</h3>
              </div>
              <span className="live-indicator">LIVE VISUALIZATION</span>
           </div>
           
           <div style={{ height: 350, background: 'rgba(30, 41, 59, 0.5)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 40% 60%, rgba(16, 185, 129, 0.1) 0%, transparent 40%)' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 70% 30%, rgba(239, 68, 68, 0.1) 0%, transparent 40%)' }} />
              <div style={{ zIndex: 1, textAlign: 'center' }}>
                 <div style={{ fontSize: 48, filter: 'grayscale(1)', opacity: 0.3, marginBottom: 12 }}>ÃƒÂ°Ã…Â¸Ã…â€™Ã‚Â</div>
                 <div style={{ fontSize: 14, fontWeight: 700, color: '#94a3b8' }}>Dynamic Heatmap Engine Active</div>
                 <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>Mapping sentiment density across Malaysian territories...</div>
              </div>
           </div>
           
           <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {['Kuala Lumpur', 'Penang', 'Johor'].map(city => (
                <div key={city} style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>{city}</div>
                  <div style={{ fontSize: 18, fontWeight: 800 }}>{Math.floor(60 + Math.random() * 30)}% <span style={{ fontSize: 10, color: '#10b981' }}>High</span></div>
                </div>
              ))}
           </div>
        </div>

        {/* Live Intelligence Alerts */}
        <div className="yak-card">
           <div className="yak-card-header">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                 <div className="yak-icon-box" style={{ background: '#ef4444' }}>
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                 </div>
                 <h3 className="yak-card-title">Live Alerts</h3>
              </div>
           </div>

           <div className="alert-item-yak high">
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#ef4444', marginBottom: 4 }}>SENTIMENT SPIKE</div>
                <div style={{ fontSize: 13, color: '#fff', fontWeight: 600 }}>Volatility detected in Finance sector.</div>
              </div>
              <div style={{ fontSize: 10, color: '#94a3b8' }}>2m ago</div>
           </div>

           <div className="alert-item-yak">
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#6366f1', marginBottom: 4 }}>SYS MONITOR</div>
                <div style={{ fontSize: 13, color: '#fff', fontWeight: 600 }}>OpenAI API latency normal.</div>
              </div>
              <div style={{ fontSize: 10, color: '#94a3b8' }}>15m ago</div>
           </div>

           <div className="alert-item-yak">
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#6366f1', marginBottom: 4 }}>DATA ARCHIVE</div>
                <div style={{ fontSize: 13, color: '#fff', fontWeight: 600 }}>Auto-cleanup node successful.</div>
              </div>
              <div style={{ fontSize: 10, color: '#94a3b8' }}>1h ago</div>
           </div>

           <button className="yak-btn" style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)', marginTop: 12 }} onClick={() => setIsReportModalOpen(true)}>
              Generate Custom Audit Report
           </button>
        </div>
      </div>

      <div className="yak-grid" style={{ marginTop: 24 }}>
         {/* Predictive Node Card */}
         <div className="yak-card">
            <div className="yak-card-header">
               <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div className="yak-icon-box" style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/><path d="M12 7v5l3 3"/></svg>
                  </div>
                  <h3 className="yak-card-title">Predictive Sentiment Node</h3>
               </div>
               <span style={{ fontSize: 10, color: '#f59e0b', fontWeight: 800 }}>{isForecasting ? 'EXECUTING SIMULATION...' : 'ML ENGINE ACTIVE'}</span>
            </div>
            
            <div style={{ marginBottom: 20 }}>
               <div style={{ fontSize: 28, fontWeight: 900, marginBottom: 4 }}>{isForecasting ? 'Recalculating...' : 'High Stability'} <span style={{ fontSize: 14, color: '#10b981', fontWeight: 700 }}>ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬Ëœ 82% confidence</span></div>
               <div style={{ fontSize: 11, color: '#94a3b8' }}>7-day proactive volatility projection.</div>
            </div>

            <div style={{ padding: 16, background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
               <div style={{ fontSize: 11, fontWeight: 800, color: '#ec4899', textTransform: 'uppercase', marginBottom: 12 }}>Proactive Risk Analysis</div>
               <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ padding: '8px 12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 8, color: '#ef4444', fontSize: 11, fontWeight: 800 }}>ECONOMIC DIP (PROBABLE)</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>Detected in Q3 News Clusters</div>
               </div>
            </div>

            <button 
              className="yak-btn" 
              style={{ marginTop: 20, background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', border: '1px solid rgba(139, 92, 246, 0.2)' }}
              onClick={() => {
                setIsForecasting(true);
                setTimeout(() => {
                  setIsForecasting(false);
                  toast.success('Simulation Complete: Confidence Index Optimized');
                }, 3000);
              }}
            >
               {isForecasting ? 'Simulating Neural Pathways...' : 'Execute Full Forecasting Model'}
            </button>
         </div>

         {/* System Maintenance Terminal */}
         <div className="yak-card">
            <div className="yak-card-header">
               <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div className="yak-icon-box" style={{ background: '#374151' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  </div>
                  <h3 className="yak-card-title">Maintenance Node Console</h3>
               </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
               <div 
                 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }}
                 onClick={() => {
                   setMaintenanceActive(!maintenanceActive);
                   toast(maintenanceActive ? 'Maintenance Node Deactivated' : 'Global Maintenance Node Active', { icon: 'ÃƒÂ¯Ã‚Â¸Ã‚Â' });
                 }}
               >
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>Maintenance Mode</div>
                    <div style={{ fontSize: 10, color: '#94a3b8' }}>Schedule global downtime node.</div>
                  </div>
                  <div style={{ width: 44, height: 24, background: maintenanceActive ? 'rgba(239, 68, 68, 0.2)' : '#1e293b', borderRadius: 20, padding: 2, cursor: 'pointer', border: maintenanceActive ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: maintenanceActive ? 'flex-end' : 'flex-start' }}>
                    <div style={{ width: 18, height: 18, background: maintenanceActive ? '#ef4444' : '#475569', borderRadius: '50%' }} />
                  </div>
               </div>

               <div 
                 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }}
                 onClick={() => {
                   setArchivalActive(!archivalActive);
                   toast.success(archivalActive ? 'Archive Mode Suspended' : 'Archive Mode Re-synchronized');
                 }}
               >
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>Data Archival (24h)</div>
                    <div style={{ fontSize: 10, color: '#94a3b8' }}>Auto-archive old intelligence nodes.</div>
                  </div>
                  <div style={{ width: 44, height: 24, background: archivalActive ? 'rgba(16, 185, 129, 0.2)' : '#1e293b', borderRadius: 20, padding: 2, cursor: 'pointer', border: archivalActive ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: archivalActive ? 'flex-end' : 'flex-start' }}>
                    <div style={{ width: 18, height: 18, background: archivalActive ? '#10b981' : '#475569', borderRadius: '50%' }} />
                  </div>
               </div>
            </div>

            <div 
               style={{ marginTop: 24, padding: 16, background: 'rgba(245, 158, 11, 0.05)', borderRadius: 12, border: '1px solid rgba(245, 158, 11, 0.1)' }}
            >
               <div style={{ fontSize: 9, fontWeight: 900, color: '#f59e0b', textTransform: 'uppercase', marginBottom: 4 }}>Next Maintenance Scheduled</div>
               <div style={{ fontSize: 13, fontWeight: 800, color: '#f59e0b' }}>04 April 2026 - 02:00 AM (MYT)</div>
            </div>

            <button 
              className="yak-btn" 
              style={{ marginTop: 20, background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', border: '1px solid rgba(99, 102, 241, 0.2)' }}
              onClick={() => {
                setIsSnapshotting(true);
                setTimeout(() => {
                  setIsSnapshotting(false);
                  toast.success('Global System Snapshot Synchronized');
                }, 2000);
              }}
            >
               {isSnapshotting ? 'Capturing Snapshot...' : 'Trigger Global Backup Node'}
            </button>
         </div>
      </div>

      <div className="yak-grid" style={{ marginTop: 24 }}>
         {/* System Infrastructure Card */}
         <div className="yak-card">
            <div className="yak-card-header">
               <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div className="yak-icon-box" style={{ background: '#64748b' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                  </div>
                  <h3 className="yak-card-title">Infrastructure Cluster</h3>
               </div>
            </div>

            <div style={{ display: 'grid', gap: 20 }}>
               <div className="system-gauge-yak">
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700 }}>
                    <span style={{ color: '#94a3b8' }}>CPU CLUSTER LOAD</span>
                    <span style={{ color: '#fff' }}>24%</span>
                  </div>
                  <div style={{ height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 10, overflow: 'hidden' }}>
                    <div style={{ width: '24%', height: '100%', background: '#10b981' }} />
                  </div>
               </div>

               <div className="system-gauge-yak">
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700 }}>
                    <span style={{ color: '#94a3b8' }}>MEMORY UTILIZATION</span>
                    <span style={{ color: '#fff' }}>4.2 / 16.0 GB</span>
                  </div>
                  <div style={{ height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 10, overflow: 'hidden' }}>
                    <div style={{ width: '26%', height: '100%', background: '#6366f1' }} />
                  </div>
               </div>

               <div className="system-gauge-yak">
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700 }}>
                    <span style={{ color: '#94a3b8' }}>API RATE LIMIT (REMAINING)</span>
                    <span style={{ color: '#fff' }}>84.2%</span>
                  </div>
                  <div style={{ height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 10, overflow: 'hidden' }}>
                    <div style={{ width: '84%', height: '100%', background: '#3b82f6' }} />
                  </div>
               </div>
            </div>
         </div>

         {/* Source Credibility Panel */}
         <div className="yak-card">
            <div className="yak-card-header">
               <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div className="yak-icon-box" style={{ background: '#f59e0b' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  </div>
                  <h3 className="yak-card-title">Source Credibility Index</h3>
               </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
             <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {sources.map(source => (
                  <div key={source.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: source.status === 'Warning' ? '1px solid rgba(245, 158, 11, 0.1)' : '1px solid transparent' }}>
                     <div>
                        <span style={{ fontSize: 13, fontWeight: 700 }}>{source.name}</span>
                        {source.status === 'Warning' && <span style={{ marginLeft: 8, fontSize: 9, background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', padding: '1px 5px', borderRadius: 4 }}>LAG DETECTED</span>}
                     </div>
                     <span style={{ fontSize: 11, fontWeight: 800, color: source.score > 95 ? '#10b981' : '#f59e0b' }}>{source.score}/100</span>
                  </div>
                ))}
             </div>
             
             <button className="yak-btn" style={{ marginTop: 20 }} onClick={() => setIsSourceModalOpen(true)}>
                Source Management Terminal
             </button>
          </div>
       </div>
      </div>
 
       {/* Intelligence Quality Index Expansion */}
       <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: '1fr', gap: 24 }}>
          <div className="yak-card">
             <div className="yak-card-header">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                   <div className="yak-icon-box" style={{ background: '#6366f1' }}>
                     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                   </div>
                   <h3 className="yak-card-title">Intelligence Quality Index</h3>
                </div>
             </div>

             <div style={{ padding: 20, textAlign: 'center' }}>
                <div style={{ fontSize: 44, fontWeight: 900, color: '#10b981' }}>94.2%</div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>System Intelligence Accuracy Benchmarks</div>
             </div>

             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginTop: 10 }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: 12, borderRadius: 12 }}>
                   <div style={{ fontSize: 9, color: '#94a3b8', textTransform: 'uppercase' }}>Duplicate Rate</div>
                   <div style={{ fontSize: 16, fontWeight: 800 }}>0.82%</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: 12, borderRadius: 12 }}>
                   <div style={{ fontSize: 9, color: '#94a3b8', textTransform: 'uppercase' }}>Entity Match</div>
                   <div style={{ fontSize: 16, fontWeight: 800 }}>98.5%</div>
                </div>
             </div>
          </div>
       </div>

       {/* Report Generator Modal */}
       {isReportModalOpen && (
         <div className="modal-overlay-yak" onClick={() => !isExporting && setIsReportModalOpen(false)}>
            <div className="modal-content-yak" onClick={e => e.stopPropagation()}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                     <h3 className="modal-title-yak">Intelligence Report Generator</h3>
                     <p style={{ fontSize: 12, color: '#64748b', marginBottom: 24 }}>Configure audit parameters for sectoral extraction.</p>
                  </div>
                  <button onClick={() => !isExporting && setIsReportModalOpen(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
                  </button>
               </div>

               <div className="form-group-yak">
                  <label className="form-label-yak">Temporal Range</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                     <input type="date" className="form-input-yak" defaultValue="2026-03-01" disabled={isExporting} />
                     <input type="date" className="form-input-yak" defaultValue="2026-04-03" disabled={isExporting} />
                  </div>
               </div>

               <div className="form-group-yak">
                  <label className="form-label-yak">Sector Matrix</label>
                  <select className="form-input-yak" disabled={isExporting}>
                     <option>Finance & Economics</option>
                     <option>Social Issues</option>
                     <option>Infrastructure & Transport</option>
                     <option>National Security</option>
                  </select>
               </div>

               <div className="form-group-yak">
                  <label className="form-label-yak">Extraction Quality</label>
                  <div style={{ display: 'flex', gap: 12 }}>
                     {['L1 Standard', 'L2 Detailed', 'L3 Forensic'].map(opt => (
                       <div key={opt} style={{ flex: 1, padding: '8px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)', fontSize: 10, fontWeight: 700, textAlign: 'center', cursor: 'pointer', color: opt === 'L3 Forensic' ? '#6366f1' : '#64748b', borderColor: opt === 'L3 Forensic' ? '#6366f1' : 'rgba(255,255,255,0.05)' }}>
                         {opt}
                       </div>
                     ))}
                  </div>
               </div>

               {isExporting ? (
                 <div style={{ marginTop: 32 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 800 }}>
                       <span style={{ color: '#6366f1' }}>EXTRACTING INTEL...</span>
                       <span style={{ color: '#fff' }}>{exportProgress}%</span>
                    </div>
                    <div className="progress-bar-yak" style={{ height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 10, overflow: 'hidden', marginTop: 12 }}>
                       <div className="progress-fill-yak" style={{ width: `${exportProgress}%`, height: '100%', background: 'linear-gradient(to right, #6366f1, #a855f7)', transition: 'width 0.3s ease' }} />
                    </div>
                    <p style={{ fontSize: 10, color: '#64748b', marginTop: 12, textAlign: 'center' }}>Neural data structures are being serialized for final encryption.</p>
                 </div>
               ) : (
                 <button 
                   className="yak-btn" 
                   style={{ marginTop: 32 }}
                   onClick={() => {
                     setIsExporting(true);
                     let p = 0;
                     const interval = setInterval(() => {
                       p += 2;
                       setExportProgress(p);
                       if (p >= 100) {
                         clearInterval(interval);
                         setTimeout(() => {
                           setIsExporting(false);
                           setIsReportModalOpen(false);
                           setExportProgress(0);
                           toast.success('Intelligence Report Exported Successfully');
                         }, 500);
                       }
                     }, 50);
                   }}
                 >
                    Initialize Intelligence Export (X)
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                 </button>
               )}
            </div>
         </div>
       )}

       {/* Source Management Modal */}
       {isSourceModalOpen && (
         <div className="modal-overlay-yak" onClick={() => setIsSourceModalOpen(false)}>
            <div className="modal-content-yak" onClick={e => e.stopPropagation()} style={{ width: 600 }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                  <div>
                     <h3 className="modal-title-yak">Source Intelligence Terminal</h3>
                     <p style={{ fontSize: 12, color: '#64748b' }}>Calibrate news ingestion nodes and weighted reliability.</p>
                  </div>
                  <button onClick={() => setIsSourceModalOpen(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
                  </button>
               </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                   {sources.map(src => (
                     <div key={src.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 16, background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                           <div style={{ width: 10, height: 10, background: src.status === 'Active' ? '#10b981' : '#f59e0b', borderRadius: '50%' }} />
                           <div>
                              <div style={{ fontSize: 14, fontWeight: 800 }}>{src.name}</div>
                              <div style={{ fontSize: 10, color: '#94a3b8' }}>INTELLIGENCE WEIGHT: {src.score}%</div>
                           </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                           <button 
                             className="yak-btn" 
                             style={{ padding: '6px 12px', background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', border: '1px solid rgba(99, 102, 241, 0.2)', fontSize: 11, width: 'auto' }} 
                             onClick={() => {
                               setSources(sources.map(s => s.id === src.id ? { ...s, score: Math.min(100, s.score + 1), status: 'Active' } : s));
                               toast.success(`Node ${src.name} Reliability Optimized`, { icon: '🚀' });
                             }}
                           >CALIBRATE</button>
                           <button className="yak-btn" style={{ padding: '6px 12px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', fontSize: 11, width: 'auto' }} onClick={() => {
                             setSources(sources.filter(s => s.id !== src.id));
                             toast.error(`Node ${src.name} Decommissioned`);
                           }}>DECOMMISSION</button>
                        </div>
                     </div>
                   ))}
                </div>

                {isAddingSource ? (
                  <div style={{ marginTop: 24, padding: 20, background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid rgba(99, 102, 241, 0.3)' }}>
                     <div className="form-group-yak">
                        <label className="form-label-yak">New Intelligence Node Primary Key</label>
                        <input 
                          type="text" 
                          className="form-input-yak" 
                          placeholder="e.g. Astro Awani" 
                          value={newSourceName}
                          onChange={(e) => setNewSourceName(e.target.value)}
                          autoFocus
                        />
                     </div>
                     <div style={{ display: 'flex', gap: 12 }}>
                        <button 
                          className="yak-btn" 
                          style={{ flex: 1, background: 'linear-gradient(to right, #6366f1, #a855f7)' }}
                          onClick={() => {
                            if (newSourceName.trim()) {
                              setSources([...sources, { id: Date.now(), name: newSourceName.trim(), score: 95, status: 'Active' }]);
                              toast.success(`Node ${newSourceName} Synchronized`);
                              setNewSourceName('');
                              setIsAddingSource(false);
                            }
                          }}
                        >Synchronize Node</button>
                        <button 
                          className="yak-btn" 
                          style={{ width: 'auto', padding: '0 20px', background: 'rgba(255,255,255,0.05)', color: '#94a3b8' }}
                          onClick={() => setIsAddingSource(false)}
                        >Cancel</button>
                     </div>
                  </div>
                ) : (
                  <button 
                    className="yak-btn" 
                    style={{ marginTop: 24, background: 'linear-gradient(to right, #10b981, #3b82f6)' }} 
                    onClick={() => setIsAddingSource(true)}
                  >
                     Synchronize New News Node (+)
                  </button>
                )}
            </div>
         </div>
       )}
      {/* Analyst Activity Table */}
      <div style={{ marginTop: 24, marginBottom: 40 }} className="yak-card">
         <div className="yak-card-header" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 16 }}>
            <h3 className="yak-card-title" style={{ marginLeft: 0 }}>Active Intelligence Analysts</h3>
            <span style={{ fontSize: 10, color: '#6366f1', fontWeight: 800 }}>LIVE ACTIVITY STREAM</span>
         </div>
         <div style={{ padding: '8px 0' }}>
            <table className="yak-table">
               <thead>
                  <tr style={{ color: '#64748b', fontSize: 11, fontWeight: 800, textTransform: 'uppercase' }}>
                     <th style={{ textAlign: 'left', padding: '12px 16px' }}>Analyst Profile</th>
                     <th style={{ textAlign: 'left', padding: '12px 16px' }}>Security Level</th>
                     <th style={{ textAlign: 'right', padding: '12px 16px' }}>Onboarding Node</th>
                  </tr>
               </thead>
               <tbody>
                  {stats.recentUsers?.map((u, i) => (
                     <tr key={i}>
                        <td>
                           <div style={{ fontWeight: 800, color: '#fff' }}>{u.name}</div>
                           <div style={{ fontSize: 11, color: '#64748b' }}>{u.email}</div>
                        </td>
                        <td>
                           <span style={{ 
                              fontSize: 9, fontWeight: 900, padding: '2px 8px', borderRadius: 6,
                              background: u.role === 'admin' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(255,255,255,0.05)',
                              color: u.role === 'admin' ? '#6366f1' : '#64748b',
                              border: `1px solid ${u.role === 'admin' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.08)'}`,
                              textTransform: 'uppercase'
                           }}>NODE {u.role}</span>
                        </td>
                        <td style={{ textAlign: 'right', color: '#64748b', fontSize: 11, fontWeight: 600 }}>
                           {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

      <ScrollToTop />
    </div>
  );
};

export default AdminDashboard;
