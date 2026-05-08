import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp } from 'lucide-react';

const DashboardSummary = ({ distribution, keywords, articles }) => {
  const total = (distribution?.Positive || 0) + (distribution?.Negative || 0) + (distribution?.Neutral || 0);
  if (!total || !articles?.length) return null;

  const positivePercent = Math.round((distribution.Positive / total) * 100);
  const negativePercent = Math.round((distribution.Negative / total) * 100);
  
  // Determine dominant sentiment
  let dominantEmoji = '📊';
  let dominantText = '';
  if (positivePercent >= 50) {
    dominantEmoji = '🟢';
    dominantText = `${positivePercent}% positive`;
  } else if (negativePercent >= 50) {
    dominantEmoji = '🔴';
    dominantText = `${negativePercent}% negative`;
  } else {
    dominantEmoji = '🟡';
    dominantText = `${100 - positivePercent - negativePercent}% neutral`;
  }

  // Get top 2-3 keywords/topics
  const topKeywords = (keywords || [])
    .slice(0, 3)
    .map(k => typeof k === 'string' ? k : k.text || k.word || k.keyword)
    .filter(Boolean);

  // Fallback: extract topics from articles
  const topics = topKeywords.length > 0 
    ? topKeywords 
    : [...new Set(articles.map(a => a.topic).filter(Boolean))].slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 flex items-center gap-3 px-4 py-2.5 bg-gradient-to-r from-blue-50/80 to-purple-50/50 dark:from-blue-500/5 dark:to-purple-500/5 border border-blue-100/60 dark:border-blue-500/10 rounded-xl overflow-hidden"
    >
      <BarChart3 size={14} className="text-blue-500 shrink-0" />
      <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300 overflow-x-auto scrollbar-hide whitespace-nowrap">
        <span className="font-medium">
          {dominantEmoji} {dominantText} today
        </span>
        {topics.length > 0 && (
          <>
            <span className="text-gray-300 dark:text-gray-600">•</span>
            <span className="flex items-center gap-1">
              <TrendingUp size={11} className="text-purple-500" />
              <span className="text-gray-500 dark:text-gray-400">Trending:</span>
              <span className="font-medium">{topics.join(', ')}</span>
            </span>
          </>
        )}
        <span className="text-gray-300 dark:text-gray-600">•</span>
        <span className="text-gray-500 dark:text-gray-400">{total} articles analyzed</span>
      </div>
    </motion.div>
  );
};

export default DashboardSummary;
