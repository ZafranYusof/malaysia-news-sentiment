import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SourceCredibility = () => {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSource, setExpandedSource] = useState(null);

  useEffect(() => {
    const fetchCredibility = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5001/api/v1';
        const res = await fetch(`${API_BASE}/sources/credibility`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch credibility data');
        const json = await res.json();
        setSources(json);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCredibility();
  }, []);

  const getScoreColor = (score) => {
    if (score >= 75) return 'var(--pos)';
    if (score >= 50) return 'var(--neu)';
    return 'var(--neg)';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Highly Credible';
    if (score >= 65) return 'Credible';
    if (score >= 50) return 'Moderate';
    if (score >= 35) return 'Questionable';
    return 'Low Credibility';
  };

  const getBiasLabel = (direction, strength) => {
    if (strength < 15) return 'Balanced';
    const intensity = strength > 40 ? 'Strong' : 'Slight';
    return `${intensity} ${direction} bias`;
  };

  if (loading) {
    return (
      <motion.div
        className="source-credibility-panel"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="sc-header">
          <h3 className="sc-title">Source Credibility</h3>
        </div>
        <div className="sc-loading">
          <div className="sc-loading-bar" />
          <div className="sc-loading-bar" style={{ width: '70%' }} />
          <div className="sc-loading-bar" style={{ width: '85%' }} />
        </div>
      </motion.div>
    );
  }

  if (error || !sources.length) {
    return (
      <motion.div
        className="source-credibility-panel"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="sc-header">
          <h3 className="sc-title">Source Credibility</h3>
        </div>
        <div className="sc-empty">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4">
            <path d="M9 12l2 2 4-4"/><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"/>
          </svg>
          <p>{error || 'Not enough data to score sources. Analyze more articles!'}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="source-credibility-panel"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="sc-header">
        <h3 className="sc-title">Source Credibility</h3>
        <span className="sc-subtitle">{sources.length} sources rated</span>
      </div>

      <div className="sc-list">
        {sources.map((source, idx) => (
          <motion.div
            key={source.source}
            className={`sc-item ${expandedSource === idx ? 'expanded' : ''}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => setExpandedSource(expandedSource === idx ? null : idx)}
          >
            <div className="sc-item-main">
              <div className="sc-item-info">
                <span className="sc-source-name">{source.source}</span>
                <span className="sc-bias-label" style={{ color: getScoreColor(source.credibilityScore) }}>
                  {getBiasLabel(source.biasDirection, source.biasStrength)}
                </span>
              </div>
              <div className="sc-score-area">
                <div className="sc-score-bar-bg">
                  <motion.div
                    className="sc-score-bar-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${source.credibilityScore}%` }}
                    transition={{ duration: 0.8, delay: idx * 0.05 }}
                    style={{ background: getScoreColor(source.credibilityScore) }}
                  />
                </div>
                <span className="sc-score-value" style={{ color: getScoreColor(source.credibilityScore) }}>
                  {source.credibilityScore}%
                </span>
              </div>
            </div>

            <AnimatePresence>
              {expandedSource === idx && (
                <motion.div
                  className="sc-item-details"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="sc-detail-grid">
                    <div className="sc-detail-item">
                      <span className="sc-detail-label">Volume</span>
                      <span className="sc-detail-value">{source.volume} articles</span>
                    </div>
                    <div className="sc-detail-item">
                      <span className="sc-detail-label">Consistency</span>
                      <span className="sc-detail-value">{source.consistencyScore}%</span>
                    </div>
                    <div className="sc-detail-item">
                      <span className="sc-detail-label">Confidence</span>
                      <span className="sc-detail-value">{source.avgConfidence}%</span>
                    </div>
                    <div className="sc-detail-item">
                      <span className="sc-detail-label">Alert Rate</span>
                      <span className="sc-detail-value" style={{ color: source.alertRatio > 30 ? 'var(--neg)' : 'inherit' }}>
                        {source.alertRatio}%
                      </span>
                    </div>
                  </div>
                  <div className="sc-sentiment-mini">
                    <div className="sc-mini-bar pos" style={{ width: `${(source.sentimentBreakdown.positive / source.volume) * 100}%` }} />
                    <div className="sc-mini-bar neg" style={{ width: `${(source.sentimentBreakdown.negative / source.volume) * 100}%` }} />
                    <div className="sc-mini-bar neu" style={{ width: `${(source.sentimentBreakdown.neutral / source.volume) * 100}%` }} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default SourceCredibility;
