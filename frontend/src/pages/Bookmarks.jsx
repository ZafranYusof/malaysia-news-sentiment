import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ArticleCard from '../components/ArticleCard';
import ArticlePreviewModal from '../components/ArticlePreviewModal';
import { getHistory } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Bookmark, BookmarkX } from 'lucide-react';

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
    setArticles(prev => prev.filter(a => (a._id || a.id) !== id));
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.25 } }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <div className="h-8 w-40 bg-[#f0f0f0] dark:bg-[#2a2a2a] rounded animate-pulse mb-2" />
          <div className="h-4 w-56 bg-[#f0f0f0] dark:bg-[#2a2a2a] rounded animate-pulse" />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Bookmark size={24} className="text-blue-600" />
          Bookmarks
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Articles you've saved for later
        </p>
      </motion.div>

      {/* Content */}
      {articles.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-20 bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] rounded-2xl"
        >
          <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
            <BookmarkX size={48} className="text-gray-300 dark:text-gray-600" />
          </motion.div>
          <h3 className="mt-4 text-base font-semibold text-gray-700 dark:text-gray-300">No bookmarks yet</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Start saving articles to see them here.</p>
        </motion.div>
      ) : (
        <motion.div
          className="grid gap-3 md:grid-cols-2"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {articles.map(art => (
            <motion.div key={art._id || art.id} variants={itemVariants}>
              <ArticleCard 
                article={art} 
                onPreview={handlePreview}
                onBookmark={handleToggle}
                isBookmarked={user?.bookmarks?.includes(art._id || art.id)}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      <ArticlePreviewModal 
        key={selectedArticle?._id || selectedArticle?.id || 'bookmark-preview'}
        article={selectedArticle} 
        isOpen={!!selectedArticle} 
        onClose={() => setSelectedArticle(null)}
      />
    </motion.div>
  );
};

export default Bookmarks;
