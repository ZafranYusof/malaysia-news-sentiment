import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAdminStats } from '../services/api';
import toast from 'react-hot-toast';
import ScrollToTop from '../components/ScrollToTop';
import { useSocket } from '../context/SocketContext';
import { Shield, RefreshCw, FileText, Activity, Users, Eye, TrendingUp, AlertTriangle, Clock, Cpu, Zap, Search, ArrowUpDown, ChevronUp, ChevronDown, MoreVertical, Trash2, UserX, Crown } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [metrics, setMetrics] = useState(null);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const socket = useSocket();
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

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
      const API = import.meta.env.VITE_API_BASE || 'http://localhost:5001/api/v1';
      const res = await fetch(`${API}/admin/metrics`, { headers: { Authorization: `Bearer ${token}` } });
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


  // Filter and sort users
  const filteredUsers = useMemo(() => {
    if (!stats?.recentUsers) return [];
    
    let filtered = stats.recentUsers.filter(u => {
      const matchSearch = u.name.toLowerCase().includes(userSearch.toLowerCase()) || 
                         u.email.toLowerCase().includes(userSearch.toLowerCase());
      const matchRole = roleFilter === 'all' || u.role === roleFilter;
      return matchSearch && matchRole;
    });

    filtered.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      
      if (sortField === 'createdAt') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      } else if (sortField === 'analysisCount') {
        aVal = aVal || 0;
        bVal = bVal || 0;
      } else if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      if (sortOrder === 'asc') return aVal > bVal ? 1 : -1;
      return aVal < bVal ? 1 : -1;
    });

    return filtered;
  }, [stats?.recentUsers, userSearch, roleFilter, sortField, sortOrder]);

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent border-2 animate-spin" />
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Loading Admin Dashboard...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Dashboard Unavailable</h2>
        <button onClick={() => window.location.reload()} className="mt-4 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium border-2 hover:bg-blue-700 transition-colors">
          Retry
        </button>
      </div>
    );
  }

  const totalUnique = stats.overview?.totalUnique || 1;
  const sentimentData = stats.sentiment || { Positive: 0, Negative: 0, Neutral: 0 };
  const totalSentiment = sentimentData.Positive + sentimentData.Negative + sentimentData.Neutral || 1;

  const TABS = ['overview', 'users', 'content', 'api', 'insights'];

  return (
    <div className="relative">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between mb-6"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Shield size={24} className="text-blue-600" />
            Admin Dashboard
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">System overview and analytics management</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 border-2">
            <div className="w-1.5 h-1.5 border-2 bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide">All Systems Online</span>
          </div>
          <button onClick={loadData} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 rounded-lg transition-colors">
            <RefreshCw size={12} /> Refresh
          </button>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] border-2 p-1 w-fit mb-6">
        {TABS.map(tab => (
          <button
            key={tab}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all capitalize ${
              activeTab === tab
                ? 'bg-blue-50 dark:bg-blue-500/15 text-blue-600'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
            onClick={() => { setActiveTab(tab); if (tab === 'insights' && !insights) loadInsights(); if (tab === 'api') loadMetrics(); }}
          >
            {tab === 'api' ? 'API Metrics' : tab}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Total Articles', value: stats.overview.totalUnique.toLocaleString(), sub: 'In database', icon: <FileText size={18} />, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-500/10' },
                { label: 'Analyses Run', value: stats.overview.totalArticles.toLocaleString(), sub: 'Total processed', icon: <Activity size={18} />, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
                { label: 'Registered Users', value: stats.overview.totalUsers, sub: 'Active accounts', icon: <Users size={18} />, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10' },
                { label: 'Total Views', value: (stats.overview.totalViews || 0).toLocaleString(), sub: 'Article views', icon: <Eye size={18} />, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-500/10' },
              ].map(card => (
                <div key={card.label} className="bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] border-2 p-5 hover:shadow-md transition-shadow">
                  <div className={`w-9 h-9 border-2 ${card.bg} ${card.color} flex items-center justify-center mb-3`}>
                    {card.icon}
                  </div>
                  <div className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{card.label}</div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{card.value}</div>
                  <div className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">{card.sub}</div>
                </div>
              ))}
            </div>

            {/* Sentiment + Sources */}
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] border-2 p-5">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                  Sentiment Distribution
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 uppercase">Live</span>
                </h3>
                <div className="space-y-3">
                  {[
                    { label: 'Positive', color: '#10b981', count: sentimentData.Positive },
                    { label: 'Neutral', color: '#f59e0b', count: sentimentData.Neutral },
                    { label: 'Negative', color: '#ef4444', count: sentimentData.Negative },
                  ].map(s => (
                    <div key={s.label} className="flex items-center gap-3">
                      <span className="text-[11px] text-gray-500 dark:text-gray-400 w-16 font-medium">{s.label}</span>
                      <div className="flex-1 h-2 border-2 bg-gray-100 dark:bg-white/5 overflow-hidden">
                        <div className="h-full border-2 transition-all duration-700" style={{ width: `${(s.count / totalSentiment * 100)}%`, background: s.color }} />
                      </div>
                      <span className="text-[11px] font-bold text-gray-900 dark:text-white w-8 text-right">{Math.round(s.count / totalSentiment * 100)}%</span>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-2 mt-4">
                  {[
                    { label: 'Positive', count: sentimentData.Positive, color: '#10b981' },
                    { label: 'Neutral', count: sentimentData.Neutral, color: '#f59e0b' },
                    { label: 'Negative', count: sentimentData.Negative, color: '#ef4444' },
                  ].map(s => (
                    <div key={s.label} className="text-center p-2.5 border-2" style={{ background: `${s.color}08`, border: `1px solid ${s.color}20` }}>
                      <div className="text-lg font-bold" style={{ color: s.color }}>{s.count}</div>
                      <div className="text-[9px] font-semibold text-gray-500 uppercase">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] border-2 p-5">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Top Sources</h3>
                <div className="space-y-1">
                  {stats.topSources?.length > 0 ? stats.topSources.map((s, i) => (
                    <div key={i} className="flex items-center justify-between py-2.5 border-b border-[#eee] dark:border-[#2a2a2a] last:border-0">
                      <div className="flex items-center gap-2.5">
                        <span className="text-[11px] font-bold text-gray-400 w-5">#{i + 1}</span>
                        <span className="text-xs font-semibold text-gray-900 dark:text-white">{s.source || 'Unknown'}</span>
                      </div>
                      <span className="text-[11px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-500/10 px-2.5 py-0.5 border-2">{s.count} articles</span>
                    </div>
                  )) : <p className="text-xs text-gray-500">No source data available</p>}
                </div>
              </div>
            </div>

            {/* Topics + Recent Articles */}
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] border-2 p-5">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Popular Topics</h3>
                <div className="flex flex-wrap gap-2">
                  {stats.popularTopics?.length > 0 ? stats.popularTopics.map((t, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-lg text-[11px] font-semibold text-blue-600">
                      {t.topic || 'General'}
                      <span className="font-bold">{t.count}</span>
                    </span>
                  )) : <p className="text-xs text-gray-500">No topic data</p>}
                </div>
              </div>

              <div className="bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] border-2 p-5">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Recent Articles</h3>
                <div className="space-y-2">
                  {stats.recentArticles?.slice(0, 5).map((a, i) => (
                    <div key={i} className="py-2 border-b border-[#eee] dark:border-[#2a2a2a] last:border-0">
                      <div className="text-xs font-medium text-gray-900 dark:text-white leading-snug">
                        {a.title?.slice(0, 70)}{a.title?.length > 70 ? '...' : ''}
                      </div>
                      <div className="flex gap-2 mt-1 text-[10px]">
                        <span className="font-bold" style={{ color: a.sentiment === 'Positive' ? '#10b981' : a.sentiment === 'Negative' ? '#ef4444' : '#6366f1' }}>{a.sentiment}</span>
                        <span className="text-gray-400">{a.source}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Activity Timeline */}
            {stats.activityTimeline?.length > 0 && (
              <div className="bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] border-2 p-5 mb-6">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Activity by Hour</h3>
                <div className="flex items-end gap-1 h-28 px-2">
                  {Array.from({ length: 24 }, (_, h) => {
                    const entry = stats.activityTimeline.find(a => a._id === h);
                    const count = entry?.count || 0;
                    const maxCount = Math.max(...stats.activityTimeline.map(a => a.count), 1);
                    const heightPct = Math.max(4, (count / maxCount) * 100);
                    return (
                      <div key={h} title={`${String(h).padStart(2,'0')}:00 - ${count} activities`} className="flex-1 flex flex-col items-center justify-end h-full gap-1">
                        <div className="w-full rounded-sm transition-all duration-500" style={{ height: `${heightPct}%`, background: count > 0 ? '#2563eb' : undefined, opacity: count > 0 ? 0.7 : 0.2, backgroundColor: count === 0 ? '#e5e7eb' : undefined }} />
                        {h % 6 === 0 && <span className="text-[9px] text-gray-400 font-medium">{String(h).padStart(2,'0')}</span>}
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
            <div className="bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] border-2 p-5">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                Registered Users
                <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-500/10 text-amber-600 uppercase">{stats.overview.totalUsers} total</span>
              </h3>
              {/* Search & Filter Controls */}
              <div className="flex flex-wrap gap-3 mb-4">
                <div className="flex-1 min-w-[200px] relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border-2 border-gray-900 dark:border-gray-700 bg-white dark:bg-zinc-900 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-red-700 dark:focus:border-red-500"
                  />
                </div>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-4 py-2 border-2 border-gray-900 dark:border-gray-700 bg-white dark:bg-zinc-900 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-red-700"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                </select>
                {(userSearch || roleFilter !== 'all') && (
                  <button
                    onClick={() => { setUserSearch(''); setRoleFilter('all'); }}
                    className="px-3 py-2 text-xs font-bold bg-red-600 text-white border-2 border-red-700 hover:bg-red-700 transition-colors uppercase tracking-wide"
                  >
                    Clear Filters
                  </button>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-900 dark:border-gray-700">
                      <th 
                        onClick={() => toggleSort('name')}
                        className="text-left py-4 px-4 text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          Name
                          {sortField === 'name' ? (
                            sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                          ) : (
                            <ArrowUpDown size={14} className="opacity-30" />
                          )}
                        </div>
                      </th>
                      <th className="text-left py-4 px-4 text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Email</th>
                      <th 
                        onClick={() => toggleSort('role')}
                        className="text-left py-4 px-4 text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          Role
                          {sortField === 'role' ? (
                            sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                          ) : (
                            <ArrowUpDown size={14} className="opacity-30" />
                          )}
                        </div>
                      </th>
                      <th 
                        onClick={() => toggleSort('analysisCount')}
                        className="text-left py-4 px-4 text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Activity size={14} />
                          Analyses
                          {sortField === 'analysisCount' ? (
                            sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                          ) : (
                            <ArrowUpDown size={14} className="opacity-30" />
                          )}
                        </div>
                      </th>
                      <th 
                        onClick={() => toggleSort('createdAt')}
                        className="text-left py-4 px-4 text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          Joined
                          {sortField === 'createdAt' ? (
                            sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                          ) : (
                            <ArrowUpDown size={14} className="opacity-30" />
                          )}
                        </div>
                      </th>
                      <th className="text-right py-4 px-4 text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="py-8 text-center">
                          <UserX size={40} className="mx-auto text-gray-300 dark:text-gray-700 mb-2" />
                          <p className="text-sm font-medium text-gray-500">No users found</p>
                          <p className="text-xs text-gray-400 mt-1">Try adjusting your filters</p>
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u, i) => (
                        <tr key={i} className="border-b-2 border-gray-200 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              {u.role === 'admin' && <Crown size={14} className="text-red-600 dark:text-red-500" />}
                              <div className="text-sm font-bold text-gray-900 dark:text-white">{u.name}</div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-xs text-gray-600 dark:text-gray-400">{u.email}</div>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`text-xs font-bold px-3 py-1 border-2 uppercase tracking-wide ${
                              u.role === 'admin' 
                                ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-600 dark:border-red-700' 
                                : 'bg-gray-50 dark:bg-white/5 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700'
                            }`}>{u.role}</span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <Activity size={14} className="text-emerald-600" />
                              <span className="text-sm font-bold text-emerald-600">{u.analysisCount || 0}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-xs text-gray-500 dark:text-gray-400">
                            {new Date(u.createdAt).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                className="p-2 border-2 border-gray-300 dark:border-gray-700 hover:border-gray-900 dark:hover:border-gray-500 transition-colors group"
                                title="More Actions"
                              >
                                <MoreVertical size={16} className="text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
                              </button>
                              <button
                                className="p-2 border-2 border-red-300 dark:border-red-800 hover:border-red-600 dark:hover:border-red-600 transition-colors group"
                                title="Delete User"
                              >
                                <Trash2 size={16} className="text-red-600 dark:text-red-500 group-hover:text-red-700 dark:group-hover:text-red-400" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Table Footer */}
              <div className="mt-4 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 border-t-2 border-gray-200 dark:border-gray-800 pt-3">
                <div className="flex items-center gap-4">
                  <span>
                    Showing <span className="font-bold text-gray-900 dark:text-white">{filteredUsers.length}</span> of{' '}
                    <span className="font-bold text-gray-900 dark:text-white">{stats.overview.totalUsers}</span> users
                  </span>
                  {(userSearch || roleFilter !== 'all') && (
                    <span className="text-amber-600 dark:text-amber-500 font-medium">Filtered</span>
                  )}
                </div>
                <div className="text-gray-400">
                  Sort: <span className="font-bold text-gray-600 dark:text-gray-300 capitalize">{sortField}</span> ({sortOrder === 'asc' ? '↑' : '↓'})
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'content' && (
          <motion.div key="content" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] border-2 p-5">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">High Impact Articles</h3>
                <div className="space-y-2">
                  {stats.topImpactArticles?.length > 0 ? stats.topImpactArticles.map((a, i) => (
                    <div key={i} className="py-2.5 border-b border-[#eee] dark:border-[#2a2a2a] last:border-0">
                      <div className="text-xs font-medium text-gray-900 dark:text-white leading-snug">
                        {a.title?.slice(0, 80)}{a.title?.length > 80 ? '...' : ''}
                      </div>
                      <div className="flex gap-2 mt-1 text-[10px]">
                        <span className="font-bold" style={{ color: a.sentiment === 'Positive' ? '#10b981' : a.sentiment === 'Negative' ? '#ef4444' : '#6366f1' }}>{a.sentiment}</span>
                        <span className="text-gray-400">{a.source}</span>
                        {a.impactScore && <span className="font-bold text-amber-500">Impact: {a.impactScore}</span>}
                      </div>
                    </div>
                  )) : <p className="text-xs text-gray-500">No impact data available</p>}
                </div>
              </div>

              <div className="bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] border-2 p-5">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Source Distribution</h3>
                <div className="space-y-3">
                  {stats.topSources?.map((s, i) => {
                    const maxSource = stats.topSources[0]?.count || 1;
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-[11px] text-gray-500 w-24 font-medium truncate">{s.source || 'Unknown'}</span>
                        <div className="flex-1 h-2 border-2 bg-gray-100 dark:bg-white/5 overflow-hidden">
                          <div className="h-full border-2 bg-gradient-to-r from-indigo-500 to-purple-500" style={{ width: `${(s.count / maxSource) * 100}%` }} />
                        </div>
                        <span className="text-[11px] font-bold text-gray-900 dark:text-white w-8 text-right">{s.count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'api' && (
          <motion.div key="api" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            {metricsLoading || !metrics ? (
              <div className="bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] border-2 p-10 text-center">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent border-2 animate-spin mx-auto mb-3" />
                <p className="text-sm text-gray-500">Loading API metrics...</p>
              </div>
            ) : (
              <>
                {/* API Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {[
                    { label: 'Total API Calls', value: metrics.totalCalls.toLocaleString(), sub: `${metrics.requestsPerMinute} req/min`, icon: <Zap size={18} />, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-500/10' },
                    { label: 'Avg Response Time', value: `${metrics.avgResponseTime}ms`, sub: 'Server latency', icon: <Clock size={18} />, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
                    { label: 'Error Rate', value: `${metrics.errorRate}%`, sub: `${metrics.errors} total errors`, icon: <AlertTriangle size={18} />, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-500/10' },
                    { label: 'Uptime', value: metrics.uptime, sub: `Since ${new Date(metrics.startedAt).toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit' })}`, icon: <Cpu size={18} />, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-500/10' },
                  ].map(card => (
                    <div key={card.label} className="bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] border-2 p-5">
                      <div className={`w-9 h-9 border-2 ${card.bg} ${card.color} flex items-center justify-center mb-3`}>
                        {card.icon}
                      </div>
                      <div className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{card.label}</div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{card.value}</div>
                      <div className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">{card.sub}</div>
                    </div>
                  ))}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* HTTP Methods */}
                  <div className="bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] border-2 p-5">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">HTTP Methods</h3>
                    <div className="space-y-3">
                      {Object.entries(metrics.methods).filter(([_, v]) => v > 0).map(([method, count]) => {
                        const colors = { GET: '#10b981', POST: '#6366f1', PUT: '#f59e0b', DELETE: '#ef4444', PATCH: '#8b5cf6' };
                        const maxMethod = Math.max(...Object.values(metrics.methods));
                        return (
                          <div key={method} className="flex items-center gap-3">
                            <span className="text-[11px] font-mono font-bold w-12" style={{ color: colors[method] || '#94a3b8' }}>{method}</span>
                            <div className="flex-1 h-2 border-2 bg-gray-100 dark:bg-white/5 overflow-hidden">
                              <div className="h-full border-2" style={{ width: `${(count / maxMethod) * 100}%`, background: colors[method] || '#6366f1' }} />
                            </div>
                            <span className="text-[11px] font-bold text-gray-900 dark:text-white w-8 text-right">{count}</span>
                          </div>
                        );
                      })}
                    </div>

                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mt-6 mb-3">Status Codes</h3>
                    <div className="space-y-1">
                      {Object.entries(metrics.statusCodes).sort((a, b) => b[1] - a[1]).map(([code, count]) => {
                        const color = code.startsWith('2') ? '#10b981' : code.startsWith('3') ? '#6366f1' : code.startsWith('4') ? '#f59e0b' : '#ef4444';
                        return (
                          <div key={code} className="flex justify-between items-center py-1.5 border-b border-[#eee] dark:border-[#2a2a2a] last:border-0">
                            <span className="text-xs font-mono font-bold" style={{ color }}>{code}</span>
                            <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-300">{count} requests</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Top Endpoints */}
                  <div className="bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] border-2 p-5">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                      Top Endpoints
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-500/10 text-blue-600 uppercase">{metrics.topEndpoints.length} tracked</span>
                    </h3>
                    <div className="space-y-1">
                      {metrics.topEndpoints.map((ep, i) => (
                        <div key={i} className="flex justify-between items-center py-2 border-b border-[#eee] dark:border-[#2a2a2a] last:border-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-gray-400 w-5">#{i + 1}</span>
                            <code className="text-[11px] text-gray-700 dark:text-gray-300 font-medium bg-gray-50 dark:bg-white/5 px-2 py-0.5 rounded">{ep.endpoint}</code>
                          </div>
                          <span className="text-[11px] font-bold text-blue-600">{ep.count}x</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="text-right mt-4">
                  <button onClick={loadMetrics} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 rounded-lg transition-colors ml-auto">
                    <RefreshCw size={12} /> Refresh Metrics
                  </button>
                </div>
              </>
            )}
          </motion.div>
        )}

        {activeTab === 'insights' && (
          <motion.div key="insights" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <div className="bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] border-2 p-5">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                AI Strategic Insights
                <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-500/10 text-purple-600 uppercase">GPT-4o</span>
              </h3>
              {insightsLoading ? (
                <div className="py-10 text-center">
                  <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent border-2 animate-spin mx-auto mb-3" />
                  <p className="text-sm text-gray-500">Generating insights...</p>
                </div>
              ) : insights ? (
                <div className="space-y-4">
                  <div className="p-4 border-2 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-500/5 dark:to-orange-500/5 border border-red-200 dark:border-red-500/15">
                    <div className="text-[10px] font-bold text-red-500 uppercase tracking-wide mb-1.5">Risk Assessment</div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{insights.risk}</p>
                  </div>
                  <div className="p-4 border-2 bg-gradient-to-br from-emerald-50 to-cyan-50 dark:from-emerald-500/5 dark:to-cyan-500/5 border border-emerald-200 dark:border-emerald-500/15">
                    <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-wide mb-1.5">Opportunity</div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{insights.opportunity}</p>
                  </div>
                  <button onClick={loadInsights} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 rounded-lg transition-colors">
                    <RefreshCw size={12} /> Regenerate Insights
                  </button>
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-sm text-gray-500 mb-3">Click to generate AI-powered strategic insights from recent news data</p>
                  <button onClick={loadInsights} className="px-4 py-2 text-xs font-medium bg-blue-600 text-white border-2 hover:bg-blue-700 transition-colors">
                    Generate Insights
                  </button>
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
