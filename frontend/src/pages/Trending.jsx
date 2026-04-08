import React, { useState, useEffect } from 'react';
import { getTopViewed } from '../services/api';
import ArticleCard from '../components/ArticleCard';
import ArticlePreviewModal from '../components/ArticlePreviewModal';
import toast from 'react-hot-toast';
import LoadingScreen from '../components/LoadingScreen';

const Trending = () => {
  const [articles, setArticles] = useState([]);
  const [timeframe, setTimeframe] = useState('today');
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState(null);

  useEffect(() => {
    const loadTrending = async () => {
      setLoading(true);
      try {
        const data = await getTopViewed({ timeframe });
        setArticles(data);
      } catch {
        toast.error('Failed to load trending news');
      } finally {
        setLoading(false);
      }
    };
    loadTrending();
  }, [timeframe]);

  const handlePreview = (article) => setSelectedArticle(article);

  return (
    <div className="trending-page">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 className="section-title">Trending News</h2>
          <p className="section-subtitle">Most popular stories being read right now.</p>
        </div>
        <div className="filter-group">
          <select 
            className="sidebar-tiny-select" 
            style={{ fontSize: 13, padding: '6px 12px' }}
            value={timeframe} 
            onChange={(e) => setTimeframe(e.target.value)}
          >
            <option value="today">Today</option>
            <option value="week">Past Week</option>
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingScreen message="Scanning Malaysian Sentiment Pulse..." />
      ) : articles.length === 0 ? (
        <div className="state-panel">
          <div className="state-icon">🔥</div>
          <h3 className="state-title">No trending articles yet</h3>
          <p className="state-sub">Check back later once more users have viewed the news.</p>
        </div>
      ) : (
        <div className="articles-list">
          {articles.map((art, idx) => (
            <div key={art._id} style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
               <div style={{ 
                 fontSize: 32, 
                 fontWeight: 900, 
                 color: 'var(--border)', 
                 opacity: 0.5,
                 width: 40,
                 paddingTop: 20,
                 textAlign: 'center'
               }}>
                 {idx + 1}
               </div>
               <div style={{ flex: 1 }}>
                 <ArticleCard 
                   article={art} 
                   onPreview={handlePreview}
                 />
               </div>
            </div>
          ))}
        </div>
      )}

      <ArticlePreviewModal 
        article={selectedArticle} 
        isOpen={!!selectedArticle} 
        onClose={() => setSelectedArticle(null)}
      />
    </div>
  );
};

export default Trending;
