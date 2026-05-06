import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getTopViewed } from '../services/api';
import ArticleCard from '../components/ArticleCard';
import ArticlePreviewModal from '../components/ArticlePreviewModal';
import toast from 'react-hot-toast';
import { TrendingUp, Flame } from 'lucide-react';

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.06 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } }
  };

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
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <TrendingUp size={24} className="text-blue-600" />
            Trending News
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Most popular stories being read right now
          </p>
        </div>
        <div className="flex gap-1 bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] rounded-xl p-1">
          {[
            { value: 'today', label: 'Today' },
            { value: 'week', label: 'This Week' },
          ].map(opt => (
            <button
              key={opt.value}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                timeframe === opt.value
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
              onClick={() => setTimeframe(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-4 items-start">
              <div className="shrink-0 w-10 pt-4">
                <div className="h-8 w-8 bg-[#f0f0f0] dark:bg-[#2a2a2a] rounded animate-pulse mx-auto" />
              </div>
              <div className="flex-1 h-24 bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] rounded-2xl animate-pulse" />
            </div>
          ))}
        </div>
      ) : articles.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-20 bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] rounded-2xl"
        >
          <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
            <Flame size={48} className="text-gray-300 dark:text-gray-600" />
          </motion.div>
          <h3 className="mt-4 text-base font-semibold text-gray-700 dark:text-gray-300">No trending articles yet</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Check back later once more users have viewed the news.</p>
        </motion.div>
      ) : (
        <motion.div
          className="space-y-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {articles.map((art, idx) => (
            <motion.div
              key={art._id}
              variants={itemVariants}
              className="flex gap-4 items-start"
            >
              <div className="shrink-0 w-10 pt-4 text-center">
                <span className={`text-2xl font-black ${
                  idx === 0 ? 'text-blue-600' : idx === 1 ? 'text-blue-400' : idx === 2 ? 'text-blue-300' : 'text-gray-300 dark:text-gray-600'
                }`}>
                  {idx + 1}
                </span>
              </div>
              <div className="flex-1">
                <ArticleCard 
                  article={art} 
                  onPreview={handlePreview}
                />
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      <ArticlePreviewModal 
        key={selectedArticle?._id || 'trending-preview'}
        article={selectedArticle} 
        isOpen={!!selectedArticle} 
        onClose={() => setSelectedArticle(null)}
      />
    </motion.div>
  );
};

export default Trending;
