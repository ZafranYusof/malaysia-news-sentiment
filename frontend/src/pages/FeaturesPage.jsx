import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import ScrollToTop from '../components/ScrollToTop';
import '../scss/LandingPage.scss';
import '../scss/FeaturesPage.scss';

// ── Variants ──
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};
const staggerItem = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

// ── Animated Section ──
const AnimatedSection = ({ children, className, variants = fadeInUp }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.section ref={ref} className={className} initial="hidden" animate={isInView ? 'visible' : 'hidden'} variants={variants}>
      {children}
    </motion.section>
  );
};

const FeaturesPage = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const toggleTheme = () => setTheme(isDark ? 'light' : 'dark');

  const features = [
    { icon: '📡', title: 'Multi-Source Aggregation', desc: 'Real-time RSS feeds from Astro Awani, FMT, Malaysiakini and other major Malaysian news outlets — all in one dashboard.', color: '#4D7AFF' },
    { icon: '🧠', title: 'AI Sentiment Analysis', desc: 'Triple-layer AI: GPT-4o-mini for accuracy, Malaya NLP for Bahasa Malaysia, and rule-based fallback for 100% uptime.', color: '#30CF79' },
    { icon: '📊', title: 'Interactive Dashboard', desc: 'Pie charts, bar charts, trend lines, word clouds, and regional heatmaps — all updating in real-time.', color: '#F7A501' },
    { icon: '🌐', title: 'Bilingual Support', desc: 'Full BM/EN interface with one-click language toggle. AI understands both languages natively.', color: '#4D7AFF' },
    { icon: '📈', title: '7-Day AI Forecast', desc: 'Predict sentiment trends for the next week based on current news patterns and historical data.', color: '#F54E4E' },
    { icon: '📄', title: 'Export and Reports', desc: 'One-click CSV export, printable reports, and bookmarking for articles that matter most.', color: '#30CF79' },
    { icon: '🗺️', title: 'Regional Heatmap', desc: 'Visualize sentiment distribution across all 13 Malaysian states and federal territories.', color: '#F7A501' },
    { icon: '🚨', title: 'Crisis Alerts', desc: 'Automatic detection of crisis keywords (banjir, rasuah, kemalangan) with real-time alert badges.', color: '#F54E4E' },
    { icon: '🔒', title: 'Secure Authentication', desc: 'Firebase Auth + Google OAuth + JWT tokens. Email verification and password reset included.', color: '#4D7AFF' },
  ];

  return (
    <div className="ph-features-page" data-theme={isDark ? 'dark' : 'light'}>
      <ScrollToTop />

      {/* ─── NAVBAR ─── */}
      <motion.nav className="ph-nav" initial={{ y: -80 }} animate={{ y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
        <div className="ph-nav__inner">
          <Link to="/" className="ph-nav__logo">
            <motion.span className="ph-nav__logo-icon" animate={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}>📰</motion.span>
            <span>MY News <b>Sentiment</b></span>
          </Link>
          <div className="ph-nav__links">
            <Link to="/features">Features</Link>
            <Link to="/pricing">Pricing</Link>
            <Link to="/about">About</Link>
          </div>
          <div className="ph-nav__actions">
            <button className="ph-nav__theme" onClick={toggleTheme}>{isDark ? '☀️' : '🌙'}</button>
            <Link to="/login" className="ph-btn ph-btn--ghost">Log in</Link>
            <motion.button className="ph-btn ph-btn--primary" onClick={() => navigate('/register')} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              Get started free
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* ─── HERO ─── */}
      <motion.header className="ph-features-page__hero" initial="hidden" animate="visible" variants={staggerContainer}>
        <motion.div className="ph-features-page__badge" variants={staggerItem}>
          <span className="ph-features-page__badge-dot" />
          Platform Capabilities
        </motion.div>
        <motion.h1 className="ph-features-page__title" variants={staggerItem}>
          Everything you need to <span>decode the news</span>
        </motion.h1>
        <motion.p className="ph-features-page__subtitle" variants={staggerItem}>
          Built for researchers, analysts, and anyone who wants to understand Malaysian media sentiment at scale.
        </motion.p>
      </motion.header>

      {/* ─── FEATURES GRID ─── */}
      <AnimatedSection className="ph-features-page__grid" variants={staggerContainer}>
        {features.map((f, i) => (
          <motion.div
            key={i}
            className="ph-features-page__card"
            variants={staggerItem}
            style={{ '--card-accent': f.color }}
            whileHover={{ y: -6, boxShadow: '0 12px 40px rgba(0,0,0,0.08)' }}
          >
            <span className="ph-features-page__card-icon">{f.icon}</span>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </motion.div>
        ))}
      </AnimatedSection>

      {/* ─── CTA ─── */}
      <AnimatedSection className="ph-features-page__cta" variants={fadeInUp}>
        <div className="ph-container">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            Ready to get started?
          </motion.h2>
          <p>Start analyzing Malaysian news sentiment for free. No credit card required.</p>
          <motion.button className="ph-btn ph-btn--primary ph-btn--lg" onClick={() => navigate('/register')} whileHover={{ scale: 1.06, boxShadow: '0 8px 30px rgba(245,78,0,0.35)' }} whileTap={{ scale: 0.97 }}>
            Start free →
          </motion.button>
        </div>
      </AnimatedSection>

      {/* ─── FOOTER ─── */}
      <footer className="ph-footer">
        <div className="ph-footer__inner">
          <div className="ph-footer__brand">
            <span className="ph-footer__logo">📰 MY News <b>Sentiment</b></span>
            <p>AI-powered sentiment analysis for Malaysian news.</p>
          </div>
          <div className="ph-footer__links">
            <div className="ph-footer__col">
              <h4>Product</h4>
              <Link to="/features">Features</Link>
              <Link to="/pricing">Pricing</Link>
              <Link to="/api">API</Link>
            </div>
            <div className="ph-footer__col">
              <h4>Company</h4>
              <Link to="/about">About</Link>
              <Link to="/contact">Contact</Link>
              <Link to="/jobs">Careers</Link>
            </div>
            <div className="ph-footer__col">
              <h4>Legal</h4>
              <Link to="/privacy">Privacy</Link>
            </div>
          </div>
        </div>
        <div className="ph-footer__bottom">
          <p>© 2026 MY News Sentiment. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default FeaturesPage;
