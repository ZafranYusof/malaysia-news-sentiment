import React from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';

const EmptyState = ({ onSearchFocus }) => {
  const handleClick = () => {
    const searchInput = document.getElementById('news-search-input');
    if (searchInput) {
      searchInput.focus();
      searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    if (onSearchFocus) onSearchFocus();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      className="flex flex-col items-center justify-center py-20 px-6"
    >
      {/* SVG Illustration */}
      <motion.svg
        width="180"
        height="160"
        viewBox="0 0 180 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        {/* Background circle */}
        <circle cx="90" cy="80" r="60" className="fill-blue-50 dark:fill-blue-500/10" />
        
        {/* Newspaper/document stack */}
        <rect x="55" y="50" width="70" height="55" rx="6" className="fill-white dark:fill-[#2a2a2a] stroke-gray-200 dark:stroke-gray-700" strokeWidth="1.5" />
        <rect x="50" y="55" width="70" height="55" rx="6" className="fill-white dark:fill-[#1e1e1e] stroke-gray-200 dark:stroke-gray-700" strokeWidth="1.5" />
        <rect x="45" y="60" width="70" height="55" rx="6" className="fill-white dark:fill-[#1a1a1a] stroke-gray-300 dark:stroke-gray-600" strokeWidth="1.5" />
        
        {/* Lines on top document */}
        <rect x="53" y="70" width="35" height="3" rx="1.5" className="fill-gray-200 dark:fill-gray-600" />
        <rect x="53" y="78" width="50" height="3" rx="1.5" className="fill-gray-200 dark:fill-gray-600" />
        <rect x="53" y="86" width="42" height="3" rx="1.5" className="fill-gray-200 dark:fill-gray-600" />
        <rect x="53" y="94" width="28" height="3" rx="1.5" className="fill-gray-200 dark:fill-gray-600" />
        
        {/* Magnifying glass */}
        <motion.g
          animate={{ rotate: [0, -5, 5, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <circle cx="125" cy="55" r="18" className="stroke-blue-500 dark:stroke-blue-400" strokeWidth="3" fill="none" />
          <line x1="138" y1="68" x2="148" y2="78" className="stroke-blue-500 dark:stroke-blue-400" strokeWidth="3" strokeLinecap="round" />
          <circle cx="125" cy="55" r="12" className="fill-blue-50/50 dark:fill-blue-500/5" />
        </motion.g>

        {/* Sparkles */}
        <motion.circle
          cx="40" cy="45"
          r="3"
          className="fill-amber-400"
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0 }}
        />
        <motion.circle
          cx="145" cy="100"
          r="2.5"
          className="fill-emerald-400"
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.7 }}
        />
        <motion.circle
          cx="35" cy="95"
          r="2"
          className="fill-purple-400"
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 2, repeat: Infinity, delay: 1.4 }}
        />
      </motion.svg>

      {/* Text */}
      <motion.div
        className="text-center mt-6 space-y-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          No articles yet
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
          Search for a topic to analyze Malaysian news sentiment in real-time
        </p>
      </motion.div>

      {/* CTA Button */}
      <motion.button
        onClick={handleClick}
        className="mt-6 flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl shadow-lg shadow-blue-600/20 transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Search size={16} />
        Search your first topic
      </motion.button>
    </motion.div>
  );
};

export default EmptyState;
