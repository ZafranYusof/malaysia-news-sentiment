import React, { useState, useEffect } from 'react';
import ArticleCard from '../components/ArticleCard';
import ArticlePreviewModal from '../components/ArticlePreviewModal';
import { getHistory } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import LoadingScreen from '../components/LoadingScreen';

const Bookmarks = () => {
  const { user, toggleBookmark } = useAuth();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState(null);

  useEffect(() => {
    const loadBookmarks = async () => {
      try {
        const data = await getHistory({ bookmarked: true });
        setArticles(data.articles || []);
      } catch {
        toast.error('Failed to load bookmarks');
      } finally {
        setLoading(false);
      }
    };
    loadBookmarks();
  }, []);

  const handlePreview = (article) => setSelectedArticle(article);

  const handleToggle = async (id) => {
    await toggleBookmark(id);
    // If it was removed, hide it from the list locally too
    setArticles(prev => prev.filter(a => (a._id || a.id) !== id));
  };

  if (loading) return <LoadingScreen message="Opening Personal Intelligence Vault..." />;

  return (
    <div className="bookmarks-page">
      <div className="page-header" style={{ marginBottom: 20 }}>
         <h2 className="section-title">Your Reading List</h2>
         <p className="section-subtitle">Articles you have saved for later.</p>
      </div>

      {articles.length === 0 ? (
        <div className="state-panel">
          <div className="state-icon">🔖</div>
          <h3 className="state-title">No bookmarks yet</h3>
          <p className="state-sub">Start saving articles to see them here.</p>
        </div>
      ) : (
        <div className="articles-list">
          {articles.map(art => (
            <ArticleCard 
              key={art._id || art.id} 
              article={art} 
              onPreview={handlePreview}
              onBookmark={handleToggle}
              isBookmarked={user?.bookmarks?.includes(art._id || art.id)}
            />
          ))}
        </div>
      )}

      <ArticlePreviewModal 
        key={selectedArticle?._id || selectedArticle?.id || 'bookmark-preview'}
        article={selectedArticle} 
        isOpen={!!selectedArticle} 
        onClose={() => setSelectedArticle(null)}
      />
    </div>
  );
};

export default Bookmarks;
