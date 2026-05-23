import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SentimentPieChart from '../components/SentimentPieChart';
import ArticleCard from '../components/ArticleCard';
import SummaryBanner from '../components/SummaryBanner';
import RecentSearches from '../components/RecentSearches';
import EmptyState from '../components/EmptyState';
import api from '../services/api';
import '../styles/dashboard.scss';

const DashboardSkeleton = () => (
  <div className="dashboard dashboard--loading">
    <div className="dashboard__hero-kpi">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="kpi-card kpi-card--skeleton">
          <div className="skeleton-line skeleton-line--lg" />
          <div className="skeleton-line skeleton-line--sm" />
        </div>
      ))}
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [articles, setArticles] = useState([]);
  const [filter, setFilter] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [filter]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const params = filter ? { sentiment: filter } : {};
      const res = await api.get('/api/news/stats', { params });
      setStats(res.data);
      setArticles(res.data.recentArticles || []);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePieClick = (sentiment) => {
    setFilter(prev => prev === sentiment ? null : sentiment);
  };

  if (loading) return <DashboardSkeleton />;
  if (!stats || stats.total === 0) return <EmptyState />;

  return (
    <div className="dashboard">
      {/* Hero KPI Card */}
      <div className="dashboard__hero-kpi">
        <div className="kpi-card kpi-card--glow">
          <h2 className="kpi-card__value">{stats.total}</h2>
          <p className="kpi-card__label">Total Articles</p>
          <span className={`kpi-card__trend ${stats.trend > 0 ? 'up' : 'down'}`}>
            {stats.trend > 0 ? '↑' : '↓'} {Math.abs(stats.trend)}%
          </span>
        </div>
        <div className="kpi-card">
          <h2 className="kpi-card__value kpi-card--positive">{stats.positivePercent}%</h2>
          <p className="kpi-card__label">Positive</p>
        </div>
        <div className="kpi-card">
          <h2 className="kpi-card__value kpi-card--negative">{stats.negativePercent}%</h2>
          <p className="kpi-card__label">Negative</p>
        </div>
        <div className="kpi-card">
          <h2 className="kpi-card__value kpi-card--neutral">{stats.neutralPercent}%</h2>
          <p className="kpi-card__label">Neutral</p>
        </div>
      </div>

      <SummaryBanner stats={stats} />

      <div className="dashboard__content">
        <div className="dashboard__chart">
          <SentimentPieChart data={stats} onSegmentClick={handlePieClick} activeFilter={filter} />
        </div>
        <div className="dashboard__articles">
          <RecentSearches />
          {articles.map(article => (
            <ArticleCard key={article._id} article={article} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
