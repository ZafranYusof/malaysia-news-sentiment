import React, { useState } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';

const Reports = () => {
  const [topic, setTopic] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [reportType, setReportType] = useState('full');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem('report-history') || '[]'); } catch { return []; }
  });

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const endpoint = reportType === 'topic' ? '/reports/topic' : '/reports/generate';
      const response = await api.post(endpoint, { topic, dateFrom, dateTo }, { responseType: 'blob' });

      // Download PDF
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sentiment-report-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      // Save to history
      const entry = {
        id: Date.now(),
        topic: topic || 'All Topics',
        dateFrom: dateFrom || 'All time',
        dateTo: dateTo || 'Present',
        type: reportType,
        generatedAt: new Date().toISOString(),
      };
      const newHistory = [entry, ...history].slice(0, 20);
      setHistory(newHistory);
      localStorage.setItem('report-history', JSON.stringify(newHistory));
    } catch (err) {
      console.error('Report generation failed:', err);
      alert('Failed to generate report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('report-history');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">PDF Reports</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Generate downloadable sentiment analysis reports</p>
      </div>

      {/* Generate Form */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] rounded-2xl p-6"
      >
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Generate Report</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Topic</label>
            <input
              type="text"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="e.g. economy, politics (leave empty for all)"
              className="w-full px-3 py-2.5 rounded-xl border border-[#eee] dark:border-[#333] bg-gray-50 dark:bg-[#111] text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Report Type</label>
            <select
              value={reportType}
              onChange={e => setReportType(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-[#eee] dark:border-[#333] bg-gray-50 dark:bg-[#111] text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            >
              <option value="full">Full Report</option>
              <option value="topic">Topic-Specific</option>
              <option value="comparison">Comparison</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">From Date</label>
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-[#eee] dark:border-[#333] bg-gray-50 dark:bg-[#111] text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">To Date</label>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-[#eee] dark:border-[#333] bg-gray-50 dark:bg-[#111] text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>
        </div>

        {/* Preview */}
        <div className="mt-4 p-4 rounded-xl bg-gray-50 dark:bg-[#111] border border-[#eee] dark:border-[#2a2a2a]">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Report will include:</p>
          <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
            <li>• Title page with report metadata</li>
            <li>• AI-generated executive summary</li>
            <li>• Sentiment distribution charts</li>
            <li>• Source breakdown analysis</li>
            <li>• Article listing (up to 50)</li>
            <li>• Methodology notes</li>
          </ul>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleGenerate}
          disabled={loading}
          className="mt-4 w-full md:w-auto px-6 py-3 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Generating...
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
              </svg>
              Generate PDF
            </>
          )}
        </motion.button>
      </motion.div>

      {/* History */}
      {history.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Report History</h2>
            <button
              onClick={clearHistory}
              className="text-xs text-red-500 hover:text-red-600 transition-colors"
            >
              Clear All
            </button>
          </div>

          <div className="space-y-3">
            {history.map((entry, i) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ x: 3, scale: 1.01 }}
                className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-[#111] border border-[#eee] dark:border-[#2a2a2a] hover:shadow-md transition-shadow cursor-pointer"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{entry.topic}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {entry.type} • {entry.dateFrom} to {entry.dateTo}
                  </p>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(entry.generatedAt).toLocaleDateString('en-MY')}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Reports;
