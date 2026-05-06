import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { Newspaper, Sun, Moon, Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const toggleTheme = () => setTheme(isDark ? 'light' : 'dark');

  return (
    <div className="min-h-screen bg-[#fafaf9] dark:bg-[#0f0f0f] transition-colors flex flex-col">
      {/* Navbar */}
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-[#0f0f0f]/80 border-b border-[#eee] dark:border-[#2a2a2a]"
        initial={{ y: -80 }} animate={{ y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
            <Newspaper className="w-5 h-5 text-accent" />
            <span>MY News <span className="text-accent">Sentiment</span></span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-600 dark:text-gray-400">
            <Link to="/features" className="hover:text-accent transition-colors">Features</Link>
            <Link to="/pricing" className="hover:text-accent transition-colors">Pricing</Link>
            <Link to="/about" className="hover:text-accent transition-colors">About</Link>
            <Link to="/contact" className="hover:text-accent transition-colors">Contact</Link>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1a1a1a] transition-colors">
              {isDark ? <Sun className="w-4 h-4 text-gray-400" /> : <Moon className="w-4 h-4 text-gray-600" />}
            </button>
            <Link to="/login" className="hidden sm:inline-flex text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-accent transition-colors">
              Log in
            </Link>
            <motion.button
              onClick={() => navigate('/register')}
              className="px-4 py-2 text-sm font-medium text-white bg-accent rounded-lg hover:bg-blue-700 transition-colors"
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
            >
              Get Started
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* 404 Content */}
      <div className="flex-1 flex items-center justify-center px-6 pt-16">
        <motion.div
          className="text-center max-w-md"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Big 404 */}
          <motion.div
            className="text-[120px] sm:text-[160px] font-black text-transparent bg-clip-text bg-gradient-to-br from-accent to-secondary leading-none select-none"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            404
          </motion.div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-4 mb-3">Page not found</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <motion.button
              onClick={() => navigate('/')}
              className="px-6 py-3 text-sm font-semibold text-white bg-accent rounded-xl shadow-lg shadow-accent/25 hover:shadow-accent/40 transition-all flex items-center gap-2"
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
            >
              <Home className="w-4 h-4" /> Go Home
            </motion.button>
            <motion.button
              onClick={() => navigate(-1)}
              className="px-6 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 border border-[#eee] dark:border-[#2a2a2a] rounded-xl hover:border-accent hover:text-accent transition-all flex items-center gap-2"
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            >
              <ArrowLeft className="w-4 h-4" /> Go Back
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Floating particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-accent/20"
            style={{ left: `${15 + i * 15}%`, top: `${25 + (i % 3) * 20}%` }}
            animate={{ y: [0, -20, 0], opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.4 }}
          />
        ))}
      </div>
    </div>
  );
};

export default NotFound;
