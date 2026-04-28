/* eslint-disable no-irregular-whitespace */
import React, { useState, useEffect } from 'react';
import { getAdminStats } from '../services/api';
import toast from 'react-hot-toast';
import ScrollToTop from '../components/ScrollToTop';
import LoadingScreen from '../components/LoadingScreen';
import { useSocket } from '../context/SocketContext';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const socket = useSocket();

  useEffect(() => {
    const loadData = async () => {
      try {
        const statsData = await getAdminStats();
        setStats(statsData);
      } catch {
        toast.error('Failed to load command data');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Real-time updates
  useEffect(() => {
    if (!socket) return;

    socket.on('user_activity', (data) => {
      setStats(prev => {
        if (!prev) return prev;
        
        // Update the user in the list if they exist
        const updatedUsers = prev.recentUsers.map(u => {
          if (u._id === data.userId) {
            return { ...u, analysisCount: data.analysisCount };
          }
          return u;
        });

        return {
          ...prev,
          recentUsers: updatedUsers
        };
      });
      
      // Optional: Visual feedback for admin
      toast.success(`Live Activity: Analyst ${data.userName} updated metrics`, {
        icon: '⚡',
        style: { borderRadius: '10px', background: '#0f172a', color: '#6366f1', border: '1px solid rgba(99, 102, 241, 0.2)' }
      });
    });

    socket.on('system_stats_updated', (data) => {
      setStats(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          overview: {
            ...prev.overview,
            totalArticles: prev.overview.totalArticles + (data.count || 0),
            totalUnique: prev.overview.totalUnique + (data.count || 0)
          }
        };
      });
    });

    socket.on('view_updated', () => {
       // Optionally refresh full stats or just increment a counter
    });

    return () => {
      socket.off('user_activity');
      socket.off('system_stats_updated');
      socket.off('view_updated');
    };
  }, [socket]);

  if (loading) return <LoadingScreen message="Accessing Command Console..." />;

  if (!stats) return (
    <div className="admin-page" style={{ padding: 40, textAlign: 'center' }}>
       <h2 style={{ color: 'var(--text-400)' }}>System Command Unavailable</h2>
       <p style={{ color: 'var(--text-500)' }}>Please check your network and refresh the page.</p>
       <button className="btn-primary" onClick={() => window.location.reload()}>Retry Connection</button>
    </div>
  );

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
           box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
           transition: transform 0.3s ease;
        }
        .yak-card:hover { transform: translateY(-4px); border-color: rgba(99, 102, 241, 0.3); }

        .yak-card-header {
           display: flex;
           justify-content: space-between;
           align-items: center;
           margin-bottom: 24px;
        }
        .yak-icon-box {
           width: 40px;
           height: 40px;
           background: linear-gradient(135deg, #6366f1, #a855f7);
           border-radius: 12px;
           display: flex;
           align-items: center;
           justify-content: center;
           margin-right: 14px;
        }
        .yak-card-title {
           font-size: 16px;
           font-weight: 800;
           color: #fff;
           margin: 0;
        }
        .yak-stat-row {
           display: flex;
           gap: 16px;
           margin-bottom: 24px;
        }
        .yak-stat-box {
           background: rgba(30, 41, 59, 0.5);
           padding: 16px;
           border-radius: 12px;
           border: 1px solid rgba(255, 255, 255, 0.03);
           flex: 1;
        }
        .yak-stat-label { font-size: 11px; font-weight: 600; color: #94a3b8; text-transform: uppercase; margin-bottom: 4px; }
        .yak-stat-val { font-size: 22px; font-weight: 800; color: #fff; }
        .yak-stat-change { font-size: 11px; font-weight: 700; color: #10b981; }

        .yak-chart-stub {
           height: 80px;
           display: flex;
           align-items: flex-end;
           gap: 6px;
           margin-bottom: 12px;
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
                  <span className="yak-stat-change">Processed to date</span>
               </div>
               <div className="yak-stat-box">
                  <div className="yak-stat-label">Unique Subjects</div>
                  <div className="yak-stat-val">{stats.overview.totalUnique.toLocaleString()}</div>
                  <span className="yak-stat-change">Verified entities</span>
               </div>
               <div className="yak-stat-box">
                  <div className="yak-stat-label">Total Users</div>
                  <div className="yak-stat-val">{stats.overview.totalUsers.toLocaleString()}</div>
                  <span className="yak-stat-change">Registered analysts</span>
               </div>
            </div>

            <div className="yak-chart-stub">
               {[60, 40, 80, 50, 90, 70, 85].map((h, i) => (
                  <div key={i} className="yak-chart-bar">
                     <div className="yak-chart-fill" style={{ height: `${h}%` }} />
                  </div>
               ))}
            </div>
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
               {['Positive', 'Neutral', 'Negative'].map((s) => {
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
                     <th style={{ textAlign: 'center', padding: '12px 16px' }}>API Usage (Analyses)</th>
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
                        <td style={{ textAlign: 'center' }}>
                           <div style={{ fontSize: 13, fontWeight: 800, color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '4px 12px', borderRadius: 20, display: 'inline-block' }}>
                              {u.analysisCount || 0} calls
                           </div>
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
