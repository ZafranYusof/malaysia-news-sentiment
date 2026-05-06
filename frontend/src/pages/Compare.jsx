import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { fetchAndAnalyzeNews } from '../services/api';
import SentimentPieChart from '../components/SentimentPieChart';
import SentimentBarChart from '../components/SentimentBarChart';
import toast from 'react-hot-toast';
import { Scale, ArrowRight } from 'lucide-react';

const ComparePage = () => {
  const { t } = useLanguage();
  const [topicA, setTopicA] = useState('Ringgit');
  const [topicB, setTopicB] = useState('US Dollar');
  const [dataA, setDataA]   = useState(null);
  const [dataB, setDataB]   = useState(null);
  const [loading, setLoading] = useState(false);

  const calcDistribution = (arts) => ({
    Positive: arts.filter(a => a.sentiment === 'Positive').length,
    Negative: arts.filter(a => a.sentiment === 'Negative').length,
    Neutral:  arts.filter(a => a.sentiment === 'Neutral').length,
  });

  const handleCompare = async () => {
    if (!topicA.trim() || !topicB.trim()) {
      toast.error('Please enter two topics to compare');
      return;
    }

    setLoading(true);
    const compareToast = toast.loading('Comparing topics...');
    
    try {
      const [resA, resB] = await Promise.all([
        fetchAndAnalyzeNews(topicA.trim(), 15),
        fetchAndAnalyzeNews(topicB.trim(), 15)
      ]);

      setDataA({
        articles: resA.articles,
        dist: resA.sentimentDistribution || calcDistribution(resA.articles)
      });
      setDataB({
        articles: resB.articles,
        dist: resB.sentimentDistribution || calcDistribution(resB.articles)
      });

      toast.success('Comparison calculated!', { id: compareToast });
    } catch {
      toast.error('Failed to compare topics', { id: compareToast });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Scale size={24} className="text-blue-600" />
          Compare
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Compare sentiment between two topics side-by-side
        </p>
      </motion.div>

      {/* Search Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] rounded-2xl p-5 mb-6"
      >
        <div className="flex flex-col md:flex-row items-center gap-3">
          <input 
            type="text" 
            className="flex-1 w-full px-4 py-3 text-sm bg-gray-50 dark:bg-white/5 border border-[#eee] dark:border-[#2a2a2a] rounded-xl outline-none focus:border-blue-500 text-gray-900 dark:text-white placeholder:text-gray-400 transition-colors"
            placeholder="Topic A (e.g. Ringgit)"
            value={topicA}
            onChange={(e) => setTopicA(e.target.value)}
          />
          <div className="shrink-0 w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-sm font-bold text-gray-400">
            vs
          </div>
          <input 
            type="text" 
            className="flex-1 w-full px-4 py-3 text-sm bg-gray-50 dark:bg-white/5 border border-[#eee] dark:border-[#2a2a2a] rounded-xl outline-none focus:border-blue-500 text-gray-900 dark:text-white placeholder:text-gray-400 transition-colors"
            placeholder="Topic B (e.g. US Dollar)"
            value={topicB}
            onChange={(e) => setTopicB(e.target.value)}
          />
          <button
            className="shrink-0 flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleCompare}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Comparing...
              </>
            ) : (
              <>
                <ArrowRight size={16} />
                {t('compareMode')}
              </>
            )}
          </button>
        </div>
      </motion.div>

      {/* Results */}
      {dataA && dataB && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid md:grid-cols-2 gap-4"
        >
          {/* Topic A */}
          <div className="bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] rounded-2xl p-5 space-y-4">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              📊 {topicA}
            </h2>
            <SentimentPieChart distribution={dataA.dist} />
            <SentimentBarChart distribution={dataA.dist} />
            <div className="space-y-2 pt-2 border-t border-[#eee] dark:border-[#2a2a2a]">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Top Articles</h3>
              {dataA.articles.slice(0, 5).map(a => (
                <div key={a.url} className="flex items-start gap-2 py-1.5">
                  <span className={`shrink-0 w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold text-white ${
                    a.sentiment === 'Positive' ? 'bg-emerald-500' : a.sentiment === 'Negative' ? 'bg-red-500' : 'bg-amber-500'
                  }`}>
                    {a.sentiment[0]}
                  </span>
                  <span className="text-xs text-gray-700 dark:text-gray-300 leading-snug line-clamp-2">{a.title}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Topic B */}
          <div className="bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] rounded-2xl p-5 space-y-4">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              📊 {topicB}
            </h2>
            <SentimentPieChart distribution={dataB.dist} />
            <SentimentBarChart distribution={dataB.dist} />
            <div className="space-y-2 pt-2 border-t border-[#eee] dark:border-[#2a2a2a]">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Top Articles</h3>
              {dataB.articles.slice(0, 5).map(a => (
                <div key={a.url} className="flex items-start gap-2 py-1.5">
                  <span className={`shrink-0 w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold text-white ${
                    a.sentiment === 'Positive' ? 'bg-emerald-500' : a.sentiment === 'Negative' ? 'bg-red-500' : 'bg-amber-500'
                  }`}>
                    {a.sentiment[0]}
                  </span>
                  <span className="text-xs text-gray-700 dark:text-gray-300 leading-snug line-clamp-2">{a.title}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {!dataA && !loading && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-20 bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] rounded-2xl"
        >
          <Scale size={48} className="text-gray-300 dark:text-gray-600" />
          <h3 className="mt-4 text-base font-semibold text-gray-700 dark:text-gray-300">Topic Comparison Mode</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Enter two different topics to visualize their sentiment side-by-side.</p>
        </motion.div>
      )}
    </div>
  );
};

export default ComparePage;
