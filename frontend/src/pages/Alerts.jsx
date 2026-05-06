import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api';

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAlert, setEditingAlert] = useState(null);
  const [form, setForm] = useState({
    type: 'email',
    sentiment: 'any',
    threshold: 0.7,
    topics: '',
    sources: '',
    telegramChatId: '',
  });

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const { data } = await api.get('/alerts');
      setAlerts(data.alerts || []);
    } catch (err) {
      toast.error('Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const payload = {
        type: form.type,
        conditions: {
          sentiment: form.sentiment,
          threshold: parseFloat(form.threshold),
          topics: form.topics ? form.topics.split(',').map(t => t.trim()).filter(Boolean) : [],
          sources: form.sources ? form.sources.split(',').map(s => s.trim()).filter(Boolean) : [],
        },
        telegramChatId: form.type === 'telegram' ? form.telegramChatId : undefined,
      };

      if (editingAlert) {
        const { data } = await api.put(`/alerts/${editingAlert._id}`, payload);
        setAlerts(prev => prev.map(a => a._id === editingAlert._id ? data.alert : a));
        toast.success('Alert updated');
      } else {
        const { data } = await api.post('/alerts', payload);
        setAlerts(prev => [data.alert, ...prev]);
        toast.success('Alert created');
      }

      closeModal();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save alert');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/alerts/${id}`);
      setAlerts(prev => prev.filter(a => a._id !== id));
      toast.success('Alert deleted');
    } catch (err) {
      toast.error('Failed to delete alert');
    }
  };

  const handleToggle = async (alert) => {
    try {
      const { data } = await api.put(`/alerts/${alert._id}`, { enabled: !alert.enabled });
      setAlerts(prev => prev.map(a => a._id === alert._id ? data.alert : a));
    } catch (err) {
      toast.error('Failed to toggle alert');
    }
  };

  const handleTest = async (alertId) => {
    try {
      await api.post('/alerts/test', { alertId });
      toast.success('Test notification sent!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Test failed');
    }
  };

  const openEdit = (alert) => {
    setEditingAlert(alert);
    setForm({
      type: alert.type,
      sentiment: alert.conditions?.sentiment || 'any',
      threshold: alert.conditions?.threshold || 0.7,
      topics: (alert.conditions?.topics || []).join(', '),
      sources: (alert.conditions?.sources || []).join(', '),
      telegramChatId: alert.telegramChatId || '',
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingAlert(null);
    setForm({ type: 'email', sentiment: 'any', threshold: 0.7, topics: '', sources: '', telegramChatId: '' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Alerts</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Get notified when news matches your criteria</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 bg-accent text-white rounded-xl text-sm font-medium hover:bg-accent/90 transition-colors flex items-center gap-2"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Create Alert
        </button>
      </motion.div>

      {/* Alerts List */}
      {alerts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] rounded-2xl p-12 text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No alerts yet</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Create your first alert to get notified about news sentiment changes</p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {alerts.map((alert, i) => (
              <motion.div
                key={alert._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] rounded-2xl p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${
                        alert.type === 'email'
                          ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'
                          : 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400'
                      }`}>
                        {alert.type === 'email' ? '📧' : '✈️'} {alert.type}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${
                        alert.conditions?.sentiment === 'negative'
                          ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400'
                          : alert.conditions?.sentiment === 'positive'
                          ? 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400'
                          : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400'
                      }`}>
                        {alert.conditions?.sentiment || 'any'} sentiment
                      </span>
                      <span className="text-xs text-gray-400">≥{Math.round((alert.conditions?.threshold || 0.7) * 100)}%</span>
                    </div>

                    {(alert.conditions?.topics?.length > 0 || alert.conditions?.sources?.length > 0) && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {alert.conditions.topics?.map(t => (
                          <span key={t} className="px-2 py-0.5 bg-accent/10 text-accent rounded-md text-xs">{t}</span>
                        ))}
                        {alert.conditions.sources?.map(s => (
                          <span key={s} className="px-2 py-0.5 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-md text-xs">{s}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Toggle */}
                    <button
                      onClick={() => handleToggle(alert)}
                      className={`relative w-10 h-5 rounded-full transition-colors ${
                        alert.enabled ? 'bg-accent' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                        alert.enabled ? 'translate-x-5' : 'translate-x-0.5'
                      }`} />
                    </button>

                    {/* Test */}
                    <button
                      onClick={() => handleTest(alert._id)}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 hover:text-accent transition-colors"
                      title="Send test"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="5 3 19 12 5 21 5 3"/>
                      </svg>
                    </button>

                    {/* Edit */}
                    <button
                      onClick={() => openEdit(alert)}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(alert._id)}
                      className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={closeModal}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={(e) => e.target === e.currentTarget && closeModal()}
            >
              <div className="bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] rounded-2xl p-6 w-full max-w-md shadow-xl">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  {editingAlert ? 'Edit Alert' : 'Create Alert'}
                </h2>

                <div className="space-y-4">
                  {/* Type */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Alert Type</label>
                    <div className="flex gap-2">
                      {['email', 'telegram'].map(t => (
                        <button
                          key={t}
                          onClick={() => setForm(f => ({ ...f, type: t }))}
                          className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                            form.type === t
                              ? 'bg-accent text-white'
                              : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'
                          }`}
                        >
                          {t === 'email' ? '📧 Email' : '✈️ Telegram'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Telegram Chat ID */}
                  {form.type === 'telegram' && (
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Telegram Chat ID</label>
                      <input
                        type="text"
                        value={form.telegramChatId}
                        onChange={(e) => setForm(f => ({ ...f, telegramChatId: e.target.value }))}
                        placeholder="e.g. 123456789"
                        className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-[#eee] dark:border-[#2a2a2a] text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent/30"
                      />
                    </div>
                  )}

                  {/* Sentiment */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Sentiment Filter</label>
                    <select
                      value={form.sentiment}
                      onChange={(e) => setForm(f => ({ ...f, sentiment: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-[#eee] dark:border-[#2a2a2a] text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent/30"
                    >
                      <option value="any">Any sentiment</option>
                      <option value="negative">Negative only</option>
                      <option value="positive">Positive only</option>
                    </select>
                  </div>

                  {/* Threshold */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                      Confidence Threshold: {Math.round(form.threshold * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={form.threshold}
                      onChange={(e) => setForm(f => ({ ...f, threshold: parseFloat(e.target.value) }))}
                      className="w-full accent-accent"
                    />
                  </div>

                  {/* Topics */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Topics (comma-separated)</label>
                    <input
                      type="text"
                      value={form.topics}
                      onChange={(e) => setForm(f => ({ ...f, topics: e.target.value }))}
                      placeholder="e.g. economy, politics, education"
                      className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-[#eee] dark:border-[#2a2a2a] text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent/30"
                    />
                  </div>

                  {/* Sources */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Sources (comma-separated)</label>
                    <input
                      type="text"
                      value={form.sources}
                      onChange={(e) => setForm(f => ({ ...f, sources: e.target.value }))}
                      placeholder="e.g. The Star, Malaysiakini"
                      className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-[#eee] dark:border-[#2a2a2a] text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent/30"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={closeModal}
                    className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreate}
                    className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-accent text-white hover:bg-accent/90 transition-colors"
                  >
                    {editingAlert ? 'Update' : 'Create'}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Alerts;
