import React, { useEffect, useState, useRef } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import ScrollToTop from '../components/ScrollToTop';
import '../scss/LandingPage.scss';

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const staggerItem = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } },
};

const LandingPage = () => {
  const { user } = useAuth();
  useLanguage();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const toggleTheme = () => setTheme(isDark ? 'light' : 'dark');

  // Stats counter
  const [statsVisible, setStatsVisible] = useState(false);
  const [counters, setCounters] = useState({ articles: 0, accuracy: 0, models: 0 });
  const statsRef = useRef(null);

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setStatsVisible(true); obs.disconnect(); }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!statsVisible) return;
    const targets = { articles: 10000, accuracy: 98, models: 3 };
    const duration = 2000, steps = 60, interval = duration / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const eased = 1 - Math.pow(1 - Math.min(step / steps, 1), 3);
      setCounters({
        articles: Math.round(targets.articles * eased),
        accuracy: Math.round(targets.accuracy * eased),
        models: Math.round(targets.models * eased),
      });
      if (step >= steps) clearInterval(timer);
    }, interval);
    return () => clearInterval(timer);
  }, [statsVisible]);

  // Typing animation
  const typingWords = ['Politics', 'Economy', 'Markets', 'Rakyat'];
  const [typingIndex, setTypingIndex] = useState(0);
  const [typingText, setTypingText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = typingWords[typingIndex];
    let timeout;
    if (!isDeleting && typingText === currentWord) {
      timeout = setTimeout(() => setIsDeleting(true), 2000);
    } else if (isDeleting && typingText === '') {
      setIsDeleting(false);
      setTypingIndex((prev) => (prev + 1) % typingWords.length);
    } else {
      const speed = isDeleting ? 60 : 120;
      timeout = setTimeout(() => {
        setTypingText(isDeleting ? currentWord.substring(0, typingText.length - 1) : currentWord.substring(0, typingText.length + 1));
      }, speed);
    }
    return () => clearTimeout(timeout);
  }, [typingText, isDeleting, typingIndex]);

  // Testimonials
  const testimonials = [
    { name: 'Dr. Aisha Rahman', role: 'Political Analyst, UKM', quote: 'This platform transformed how we track public sentiment during elections. The real-time insights are unmatched.' },
    { name: 'Marcus Tan', role: 'Head of Strategy, Bursa Analytics', quote: 'We reduced our media monitoring costs by 70% while getting 10x more actionable intelligence.' },
    { name: 'Priya Nair', role: 'Journalist, The Edge Malaysia', quote: 'The AI accuracy is remarkable. It catches narrative shifts hours before they hit mainstream coverage.' },
  ];
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setActiveTestimonial((p) => (p + 1) % testimonials.length), 4000);
    return () => clearInterval(timer);
  }, []);

  // Active feature tab
  const [activeTab, setActiveTab] = useState(0);
  const featureTabs = [
    { title: 'Sentiment Analysis', desc: 'Instant classification of news articles into positive, negative, and neutral sentiment using fine-tuned transformer models.', emoji: '📊' },
    { title: 'Entity Recognition', desc: 'Automatically extract and track public figures, organizations, and locations mentioned across all articles.', emoji: '🔍' },
    { title: 'Trend Forecasting', desc: 'Track how narratives evolve over time and predict upcoming sentiment shifts before they happen.', emoji: '📈' },
    { title: 'Source Intelligence', desc: 'Aggregate and cross-reference from Malaysiakini, Astro Awani, FMT, Bernama, and more.', emoji: '🗞️' },
  ];

  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="ph-landing" data-theme={isDark ? 'dark' : 'light'}>
      <ScrollToTop />

      {/* ─── NAVBAR ─── */}
      <nav className="ph-nav">
        <div className="ph-nav__inner">
          <Link to="/" className="ph-nav__logo">
            <span className="ph-nav__logo-icon">📰</span>
            <span>MY News <b>Sentiment</b></span>
          </Link>
          <div className="ph-nav__links">
            <a href="#features">Features</a>
            <Link to="/pricing">Pricing</Link>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
          </div>
          <div className="ph-nav__actions">
            <button className="ph-nav__theme" onClick={toggleTheme} title={isDark ? 'Light mode' : 'Dark mode'}>
              {isDark ? '☀️' : '🌙'}
            </button>
            <Link to="/login" className="ph-btn ph-btn--ghost">Log in</Link>
            <button className="ph-btn ph-btn--primary" onClick={() => navigate('/register')}>Get started free</button>
          </div>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <header className="ph-hero">
        <motion.div className="ph-hero__content" initial="hidden" animate="visible" variants={staggerContainer}>
          <motion.h1 className="ph-hero__title" variants={staggerItem}>
            Decode the Pulse of<br />Malaysian <span className="ph-hero__typing">{typingText}<span className="ph-hero__cursor">|</span></span>
          </motion.h1>
          <motion.p className="ph-hero__sub" variants={staggerItem}>
            Real-time AI that monitors, classifies, and visualizes sentiment across Malaysia's top news sources — so you never miss a narrative shift.
          </motion.p>
          <motion.div className="ph-hero__cta" variants={staggerItem}>
            <button className="ph-btn ph-btn--primary ph-btn--lg" onClick={() => navigate('/register')}>Get started free</button>
            <Link to="/login" className="ph-btn ph-btn--outline ph-btn--lg">Watch demo</Link>
          </motion.div>
          <motion.div className="ph-hero__sources" variants={staggerItem}>
            {['Malaysiakini', 'Astro Awani', 'FMT', 'Bernama', 'The Star'].map((s) => (
              <span key={s} className="ph-hero__source-tag">{s}</span>
            ))}
          </motion.div>
        </motion.div>
      </header>

      {/* ─── STATS ─── */}
      <section className="ph-stats" ref={statsRef}>
        <div className="ph-stats__inner">
          <div className="ph-stats__item">
            <span className="ph-stats__num">{counters.articles.toLocaleString()}+</span>
            <span className="ph-stats__label">Articles Analyzed</span>
          </div>
          <div className="ph-stats__item">
            <span className="ph-stats__num">{counters.accuracy}%</span>
            <span className="ph-stats__label">AI Accuracy</span>
          </div>
          <div className="ph-stats__item">
            <span className="ph-stats__num">{counters.models}</span>
            <span className="ph-stats__label">AI Models</span>
          </div>
        </div>
      </section>

      {/* ─── FEATURES TABS ─── */}
      <section className="ph-features" id="features">
        <div className="ph-container">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
            <p className="ph-section-tag">Features</p>
            <h2 className="ph-section-title">Everything you need to understand Malaysian news</h2>
          </motion.div>
          <div className="ph-features__tabs">
            {featureTabs.map((tab, i) => (
              <button key={i} className={`ph-features__tab ${activeTab === i ? 'ph-features__tab--active' : ''}`} onClick={() => setActiveTab(i)}>
                <span className="ph-features__tab-emoji">{tab.emoji}</span>
                {tab.title}
              </button>
            ))}
          </div>
          <motion.div className="ph-features__panel" key={activeTab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <div className="ph-features__panel-content">
              <h3>{featureTabs[activeTab].title}</h3>
              <p>{featureTabs[activeTab].desc}</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="ph-how">
        <div className="ph-container">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
            <p className="ph-section-tag">How it works</p>
            <h2 className="ph-section-title">From search to insight in seconds</h2>
          </motion.div>
          <motion.div className="ph-how__steps" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
            {[
              { num: '01', title: 'Search', desc: 'Enter any topic, keyword, or entity. Our crawler fetches the latest articles from major Malaysian news outlets.' },
              { num: '02', title: 'Analyze', desc: 'AI models process each article — classifying sentiment, extracting entities, and scoring relevance in real time.' },
              { num: '03', title: 'Visualize', desc: 'Explore interactive dashboards with sentiment trends, entity networks, and temporal heatmaps.' },
            ].map((step) => (
              <motion.div key={step.num} className="ph-how__step" variants={staggerItem}>
                <span className="ph-how__num">{step.num}</span>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="ph-testimonials">
        <div className="ph-container">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
            <p className="ph-section-tag">Testimonials</p>
            <h2 className="ph-section-title">Trusted by analysts & journalists</h2>
          </motion.div>
          <div className="ph-testimonials__carousel">
            {testimonials.map((t, i) => (
              <div key={i} className={`ph-testimonials__card ${i === activeTestimonial ? 'ph-testimonials__card--active' : ''}`}>
                <p className="ph-testimonials__quote">"{t.quote}"</p>
                <div className="ph-testimonials__author">
                  <strong>{t.name}</strong>
                  <span>{t.role}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="ph-testimonials__dots">
            {testimonials.map((_, i) => (
              <button key={i} className={`ph-testimonials__dot ${i === activeTestimonial ? 'ph-testimonials__dot--active' : ''}`} onClick={() => setActiveTestimonial(i)} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="ph-cta">
        <div className="ph-container">
          <h2>Start analyzing Malaysian news today</h2>
          <p>Free to get started. No credit card required.</p>
          <button className="ph-btn ph-btn--primary ph-btn--lg" onClick={() => navigate('/register')}>Get started free</button>
        </div>
      </section>

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

export default LandingPage;
