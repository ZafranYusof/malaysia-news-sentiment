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

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sentiment-report-${topic || 'all'}-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

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
      className="max-w-3xl mx-auto space-y-6"
    >
      {/* Header */}
      <div className="border-b-2 border-gray-900 dark:border-white pb-3">
        <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight uppercase">
          Reports
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 tracking-wide">
          Generate and download sentiment analysis reports as PDF
        </p>
      </div>

      {/* Generate Form */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
              Topic
            </label>
            <input
              type="text"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="e.g. economy, politics (leave empty for all)"
              className="w-full px-3 py-2.5 border border-gray-200 dark:border-[#333] bg-white dark:bg-[#111] text-sm text-gray-900 dark:text-white rounded-lg focus:outline-none focus:border-gray-400 dark:focus:border-gray-500 placeholder-gray-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
              Report Type
            </label>
            <select
              value={reportType}
              onChange={e => setReportType(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 dark:border-[#333] bg-white dark:bg-[#111] text-sm text-gray-900 dark:text-white rounded-lg focus:outline-none focus:border-gray-400 dark:focus:border-gray-500"
            >
              <option value="full">Full Report</option>
              <option value="topic">Topic-Specific</option>
              <option value="comparison">Comparison</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
              From
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 dark:border-[#333] bg-white dark:bg-[#111] text-sm text-gray-900 dark:text-white rounded-lg focus:outline-none focus:border-gray-400 dark:focus:border-gray-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
              To
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 dark:border-[#333] bg-white dark:bg-[#111] text-sm text-gray-900 dark:text-white rounded-lg focus:outline-none focus:border-gray-400 dark:focus:border-gray-500"
            />
          </div>
        </div>

        {/* What's included */}
        <div className="border-t border-gray-100 dark:border-[#2a2a2a] pt-4">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Includes</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs text-gray-600 dark:text-gray-400">
            <span>Title page</span>
            <span>Executive summary</span>
            <span>Sentiment breakdown</span>
            <span>Source analysis</span>
            <span>Article listing</span>
            <span>Methodology</span>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="px-5 py-2.5 text-sm font-medium bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-40 transition-all flex items-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white dark:border-gray-900 border-t-transparent rounded-full animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Download PDF
            </>
          )}
        </button>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="border-t border-gray-200 dark:border-[#2a2a2a] pt-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide">
              History
            </h2>
            <button
              onClick={clearHistory}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors"
            >
              Clear
            </button>
          </div>

          <div className="space-y-0 divide-y divide-gray-100 dark:divide-[#2a2a2a]">
            {history.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between py-2.5"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{entry.topic}</p>
                  <p className="text-xs text-gray-400">
                    {entry.type} / {entry.dateFrom} to {entry.dateTo}
                  </p>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(entry.generatedAt).toLocaleDateString('en-MY')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Reports;
