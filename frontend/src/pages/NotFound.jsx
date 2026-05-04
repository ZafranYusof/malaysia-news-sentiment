import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import '../scss/NotFound.scss';

const NotFound = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const toggleTheme = () => setTheme(isDark ? 'light' : 'dark');

  return (
    <div className="ph-notfound" data-theme={isDark ? 'dark' : 'light'}>
      {/* Navbar */}
      <nav className="ph-nav">
        <div className="ph-nav__inner">
          <Link to="/" className="ph-nav__logo"><span className="ph-nav__logo-icon">📰</span><span>MY News <b>Sentiment</b></span></Link>
          <div className="ph-nav__links">
            <Link to="/features">Features</Link>
            <Link to="/pricing">Pricing</Link>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
          </div>
          <div className="ph-nav__actions">
            <button className="ph-nav__theme" onClick={toggleTheme}>{isDark ? '☀️' : '🌙'}</button>
            <Link to="/login" className="ph-btn ph-btn--ghost">Log in</Link>
            <motion.button className="ph-btn ph-btn--primary" onClick={() => navigate('/register')} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>Get started free</motion.button>
          </div>
        </div>
      </nav>

      {/* 404 Content */}
      <div className="ph-notfound__content">
        <motion.div className="ph-notfound__inner" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
          <motion.span className="ph-notfound__code" animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
            404
          </motion.span>
          <h1 className="ph-notfound__title">Page not found</h1>
          <p className="ph-notfound__sub">The page you're looking for doesn't exist or has been moved.</p>
          <div className="ph-notfound__actions">
            <motion.button className="ph-btn ph-btn--primary ph-btn--lg" onClick={() => navigate('/')} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              Go home →
            </motion.button>
            <motion.button className="ph-btn ph-btn--outline ph-btn--lg" onClick={() => navigate(-1)} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              Go back
            </motion.button>
          </div>
        </motion.div>

        {/* Floating particles */}
        <div className="ph-notfound__particles">
          {[...Array(8)].map((_, i) => (
            <motion.div key={i} className="ph-notfound__particle" style={{ left: `${10 + i * 12}%`, top: `${20 + (i % 3) * 25}%` }} animate={{ y: [0, -20, 0], opacity: [0.2, 0.6, 0.2] }} transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.3 }} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotFound;
