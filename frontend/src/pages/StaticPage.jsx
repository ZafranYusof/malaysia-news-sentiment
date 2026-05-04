import React, { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import '../scss/StaticPage.scss';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

const PAGES = {
  '/api': {
    title: 'API Documentation',
    emoji: '⚡',
    sections: [
      { heading: 'Getting Started', content: 'Our REST API allows you to integrate sentiment analysis into your own applications. All endpoints return JSON and require authentication via API key.' },
      { heading: 'Authentication', content: 'Include your API key in the Authorization header: `Authorization: Bearer YOUR_API_KEY`. Get your key from the Settings page after signing up.' },
      { heading: 'Endpoints', content: 'POST /api/analyze — Analyze text sentiment\nGET /api/articles — Fetch analyzed articles\nGET /api/entities — Get entity data\nGET /api/trends — Get sentiment trends' },
      { heading: 'Rate Limits', content: 'Free tier: 100 requests/day. Pro tier: 10,000 requests/day. Enterprise: Unlimited.' },
    ]
  },
  '/jobs': {
    title: 'Careers',
    emoji: '🚀',
    sections: [
      { heading: 'Join Our Team', content: 'We\'re building the future of news intelligence in Malaysia. Join us if you\'re passionate about AI, NLP, and making information accessible.' },
      { heading: 'Open Positions', content: '• Senior AI Engineer — Full-time, Kuantan\n• Rust Backend Developer — Contract, Remote\n• Media Analyst (BM/EN) — Full-time, Cyberjaya\n• Security Ops Architect — Full-time, Remote' },
      { heading: 'Benefits', content: '• Flexible remote work\n• Learning budget\n• Health insurance\n• Equipment allowance\n• Annual team retreats' },
    ]
  },
  '/privacy': {
    title: 'Privacy Policy',
    emoji: '🔒',
    sections: [
      { heading: 'Data Collection', content: 'We collect only the data necessary to provide our service: account information, usage analytics, and article analysis results.' },
      { heading: 'Data Usage', content: 'Your data is used solely to provide and improve our sentiment analysis service. We never sell personal data to third parties.' },
      { heading: 'Data Security', content: 'All data is encrypted in transit (TLS 1.3) and at rest (AES-256). We follow industry best practices for security.' },
      { heading: 'Your Rights', content: 'You can request data export or deletion at any time by contacting support@mynewssentiment.com.' },
    ]
  },
};

const StaticPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const toggleTheme = () => setTheme(isDark ? 'light' : 'dark');

  useEffect(() => { window.scrollTo(0, 0); }, [location.pathname]);

  const page = PAGES[location.pathname] || PAGES['/api'];

  return (
    <div className="ph-static" data-theme={isDark ? 'dark' : 'light'}>
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

      {/* Hero */}
      <header className="ph-static__hero">
        <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
          <motion.span className="ph-static__emoji" variants={staggerItem}>{page.emoji}</motion.span>
          <motion.h1 className="ph-static__title" variants={staggerItem}>{page.title}</motion.h1>
        </motion.div>
      </header>

      {/* Content */}
      <section className="ph-static__content">
        <div className="ph-container">
          <motion.div className="ph-static__sections" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
            {page.sections.map((sec, i) => (
              <motion.div key={i} className="ph-static__section" variants={staggerItem}>
                <h2>{sec.heading}</h2>
                <p>{sec.content}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="ph-footer">
        <div className="ph-footer__inner">
          <div className="ph-footer__brand"><span className="ph-footer__logo">📰 MY News <b>Sentiment</b></span><p>AI-powered sentiment analysis for Malaysian news.</p></div>
          <div className="ph-footer__links">
            <div className="ph-footer__col"><h4>Product</h4><Link to="/features">Features</Link><Link to="/pricing">Pricing</Link><Link to="/api">API</Link></div>
            <div className="ph-footer__col"><h4>Company</h4><Link to="/about">About</Link><Link to="/contact">Contact</Link><Link to="/jobs">Careers</Link></div>
            <div className="ph-footer__col"><h4>Legal</h4><Link to="/privacy">Privacy</Link></div>
          </div>
        </div>
        <div className="ph-footer__bottom"><p>© 2026 MY News Sentiment. All rights reserved.</p></div>
      </footer>
    </div>
  );
};

export default StaticPage;
