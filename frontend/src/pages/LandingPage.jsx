import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { motion, useInView, useAnimation } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import ScrollToTop from '../components/ScrollToTop';
import '../scss/LandingPage.scss';

// ── Framer Motion Variants ──
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
};

// ── Animated Section Wrapper ──
const AnimatedSection = ({ children, className, id, variants = fadeInUp, ...props }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.section
      ref={ref}
      id={id}
      className={className}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={variants}
      {...props}
    >
      {children}
    </motion.section>
  );
};

const LandingPage = () => {
  const { user } = useAuth();
  useLanguage();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  // === Animated Stats Counter ===
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
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = Math.min(step / steps, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCounters({
        articles: Math.round(targets.articles * eased),
        accuracy: Math.round(targets.accuracy * eased),
        models: Math.round(targets.models * eased),
      });
      if (step >= steps) clearInterval(timer);
    }, interval);
    return () => clearInterval(timer);
  }, [statsVisible]);

  // === Typing Animation ===
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

  // === Testimonial Carousel ===
  const testimonials = [
    { name: 'Dr. Aisha Rahman', role: 'Political Analyst, UKM', quote: 'This platform transformed how we track public sentiment during elections. The real-time insights are unmatched.' },
    { name: 'Marcus Tan', role: 'Head of Strategy, Bursa Analytics', quote: 'We reduced our media monitoring costs by 70% while getting 10x more actionable intelligence.' },
    { name: 'Priya Nair', role: 'Journalist, The Edge Malaysia', quote: 'The AI accuracy is remarkable. It catches narrative shifts hours before they hit mainstream coverage.' },
  ];
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // === Live Demo Preview (bar animation) ===
  const [barsVisible, setBarsVisible] = useState(false);
  const barsRef = useRef(null);

  useEffect(() => {
    const el = barsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setBarsVisible(true); obs.disconnect(); }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // === Dashboard Preview (sentiment bars) ===
  const [dashboardVisible, setDashboardVisible] = useState(false);
  const dashboardRef = useRef(null);

  useEffect(() => {
    const el = dashboardRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setDashboardVisible(true); obs.disconnect(); }
    }, { threshold: 0.2 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // === Card hover micro-interactions ===
  const handleCardMouseMove = useCallback((e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
    card.style.background = `radial-gradient(500px circle at ${x}px ${y}px, rgba(77,122,255,0.06), var(--sl-surface) 70%)`;
  }, []);

  const handleCardMouseLeave = useCallback((e) => {
    e.currentTarget.style.background = '';
  }, []);

  const smoothScroll = (e, id) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      window.scrollTo({ top: el.offsetTop - 80, behavior: 'smooth' });
    }
  };

  // Redirect to dashboard if logged in
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  // News sources
  const newsSources = [
    { name: 'Malaysiakini', icon: '📰' },
    { name: 'Astro Awani', icon: '📡' },
    { name: 'Free Malaysia Today', icon: '🗞️' },
    { name: 'Bernama', icon: '🏛️' },
    { name: 'The Star', icon: '⭐' },
  ];

  // Features data
  const features = [
    {
      title: 'Live Sentiment AI',
      desc: 'Instant sentiment classification across thousands of articles using fine-tuned transformer models.',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 28, height: 28 }}>
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
      ),
    },
    {
      title: 'Entity Recognition',
      desc: 'Automatically extract and track public figures, organizations, and locations from every article.',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 28, height: 28 }}>
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      title: 'Temporal Mapping',
      desc: 'Track how narratives evolve over time and predict upcoming sentiment shifts before they happen.',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 28, height: 28 }}>
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      ),
    },
    {
      title: 'Multi-Source Intelligence',
      desc: 'Aggregates and cross-references from Malaysiakini, Astro Awani, FMT, and more for complete coverage.',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 28, height: 28 }}>
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      ),
    },
  ];

  // How it works steps
  const steps = [
    {
      num: '01',
      title: 'Search',
      desc: 'Enter any topic, keyword, or entity. Our crawler fetches the latest articles from major Malaysian news outlets.',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 32, height: 32 }}>
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      ),
    },
    {
      num: '02',
      title: 'Analyze',
      desc: 'Our AI models process each article — classifying sentiment, extracting entities, and scoring relevance in real time.',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 32, height: 32 }}>
          <path d="M12 2a10 10 0 1 0 10 10h-10V2z" />
          <path d="M21.18 8.02c-1-2.3-2.85-4.17-5.18-5.18" />
        </svg>
      ),
    },
    {
      num: '03',
      title: 'Visualize',
      desc: 'Explore interactive dashboards with sentiment trends, entity networks, and temporal heatmaps at a glance.',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 32, height: 32 }}>
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      ),
    },
  ];

  // Dashboard mockup data
  const trendBars = [35, 45, 30, 55, 70, 60, 75, 65, 80, 72, 85, 68];
  const entities = ['Anwar Ibrahim', 'PETRONAS', 'Bank Negara', 'Johor', 'Budget 2026'];

  return (
    <div className="sentry-landing">
      <ScrollToTop />

      {/* ═══════════════ BACKGROUND ORBS ═══════════════ */}
      <div className="sl-bg-orbs">
        <div className="sl-orb sl-orb--1" />
        <div className="sl-orb sl-orb--2" />
        <div className="sl-orb sl-orb--3" />
      </div>

      {/* ═══════════════ NAVBAR ═══════════════ */}
      <motion.nav
        className="sl-navbar"
        initial={{ y: -64, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="sl-nav-inner">
          <div className="sl-logo">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4D7AFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            <span>MY News <b>Sentiment</b></span>
          </div>
          <div className="sl-nav-links">
            <Link to="/features">Features</Link>
            <Link to="/pricing">Pricing</Link>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
          </div>
          <div className="sl-nav-actions">
            <button className="sl-theme-toggle" onClick={toggleTheme} title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
              {isDark ? '☀️' : '🌙'}
            </button>
            <Link to="/login" className="sl-btn-ghost">Log In</Link>
            <button className="sl-btn-primary" onClick={() => navigate('/register')}>Get Started Free</button>
          </div>
        </div>
      </motion.nav>

      {/* ═══════════════ HERO SECTION ═══════════════ */}
      <header className="sl-hero">
        <div className="sl-hero-bg">
          <div className="sl-pulse-ring sl-pulse-ring-1" />
          <div className="sl-pulse-ring sl-pulse-ring-2" />
          <div className="sl-pulse-ring sl-pulse-ring-3" />
          <div className="sl-grid-overlay" />
        </div>

        <motion.div
          className="sl-hero-content"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div className="sl-badge" variants={staggerItem}>
            <span className="sl-live-dot" /> AI-Powered Sentiment Analysis
          </motion.div>

          <motion.h1 className="sl-headline" variants={staggerItem}>
            Decode the Pulse of<br />
            Malaysian <span className="sl-typing-gradient">{typingText}<span className="sl-cursor">|</span></span>
          </motion.h1>

          <motion.p className="sl-subheadline" variants={staggerItem}>
            Real-time AI that monitors, classifies, and visualizes sentiment across Malaysia's top news sources — so you never miss a narrative shift.
          </motion.p>

          <motion.div className="sl-hero-cta" variants={staggerItem}>
            <button className="sl-btn-primary sl-btn-lg" onClick={() => navigate('/register')}>
              Start Analyzing
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18, marginLeft: 8 }}>
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>

          </motion.div>

          {/* Stats Counter */}
          <motion.div className="sl-stats" ref={statsRef} variants={staggerItem}>
            <div className="sl-stat">
              <span className="sl-stat-num">{counters.articles.toLocaleString()}+</span>
              <span className="sl-stat-label">Articles Analyzed</span>
            </div>
            <div className="sl-stat-divider" />
            <div className="sl-stat">
              <span className="sl-stat-num">{counters.accuracy}%</span>
              <span className="sl-stat-label">AI Accuracy</span>
            </div>
            <div className="sl-stat-divider" />
            <div className="sl-stat">
              <span className="sl-stat-num">{counters.models}</span>
              <span className="sl-stat-label">AI Models</span>
            </div>
          </motion.div>
        </motion.div>
      </header>

      {/* ═══════════════ DASHBOARD PREVIEW SECTION ═══════════════ */}
      <AnimatedSection className="sl-section" variants={scaleIn}>
        <div className="sl-container">
          <motion.div
            className="sl-section-header"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={fadeInUp}
          >
            <p className="sl-section-tag">DASHBOARD PREVIEW</p>
            <h2>Your sentiment command center</h2>
            <p className="sl-section-desc">Real-time analytics dashboard showing sentiment distribution, trending entities, and temporal patterns.</p>
          </motion.div>

          <div className="sl-dashboard-preview" ref={dashboardRef}>
            <motion.div
              className="sl-dashboard-mockup"
              initial={{ opacity: 0, y: 40, rotateX: 8 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 2 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="sl-mockup-header">
                <div className="sl-mockup-dots">
                  <span style={{ background: '#F54E4E' }} />
                  <span style={{ background: '#F7A501' }} />
                  <span style={{ background: '#30CF79' }} />
                </div>
                <div className="sl-mockup-url">sentiment.mynews.ai/dashboard</div>
              </div>
              <div className="sl-mockup-body">
                {/* Sentiment Distribution Card */}
                <div className="sl-mockup-card">
                  <div className="sl-mockup-card-title">Sentiment Distribution</div>
                  <div className="sl-mockup-sentiment-row">
                    <span className="sl-mockup-sentiment-dot" style={{ background: '#30CF79' }} />
                    <span className="sl-mockup-sentiment-label">Positive</span>
                    <div className="sl-mockup-sentiment-bar">
                      <div className="sl-mockup-sentiment-fill" style={{ width: dashboardVisible ? '62%' : '0%', background: 'linear-gradient(90deg, rgba(48,207,121,0.3), #30CF79)' }} />
                    </div>
                    <span className="sl-mockup-sentiment-val" style={{ color: '#30CF79' }}>62%</span>
                  </div>
                  <div className="sl-mockup-sentiment-row">
                    <span className="sl-mockup-sentiment-dot" style={{ background: '#F54E4E' }} />
                    <span className="sl-mockup-sentiment-label">Negative</span>
                    <div className="sl-mockup-sentiment-bar">
                      <div className="sl-mockup-sentiment-fill" style={{ width: dashboardVisible ? '21%' : '0%', background: 'linear-gradient(90deg, rgba(245,78,78,0.3), #F54E4E)' }} />
                    </div>
                    <span className="sl-mockup-sentiment-val" style={{ color: '#F54E4E' }}>21%</span>
                  </div>
                  <div className="sl-mockup-sentiment-row">
                    <span className="sl-mockup-sentiment-dot" style={{ background: '#F7A501' }} />
                    <span className="sl-mockup-sentiment-label">Neutral</span>
                    <div className="sl-mockup-sentiment-bar">
                      <div className="sl-mockup-sentiment-fill" style={{ width: dashboardVisible ? '17%' : '0%', background: 'linear-gradient(90deg, rgba(247,165,1,0.3), #F7A501)' }} />
                    </div>
                    <span className="sl-mockup-sentiment-val" style={{ color: '#F7A501' }}>17%</span>
                  </div>
                </div>

                {/* Trending Entities Card */}
                <div className="sl-mockup-card">
                  <div className="sl-mockup-card-title">Trending Entities</div>
                  <div className="sl-mockup-entities">
                    {entities.map((entity, i) => (
                      <motion.span
                        key={i}
                        className="sl-mockup-entity"
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
                      >
                        {entity}
                      </motion.span>
                    ))}
                  </div>
                </div>

                {/* Trend Chart Card */}
                <div className="sl-mockup-card sl-mockup-card--full">
                  <div className="sl-mockup-card-title">7-Day Sentiment Trend</div>
                  <div className="sl-mockup-trend">
                    {trendBars.map((h, i) => (
                      <div
                        key={i}
                        className="sl-mockup-trend-bar"
                        style={{
                          height: dashboardVisible ? `${h}%` : '0%',
                          background: h > 60 ? 'linear-gradient(to top, rgba(48,207,121,0.2), #30CF79)' : h > 40 ? 'linear-gradient(to top, rgba(77,122,255,0.2), #4D7AFF)' : 'linear-gradient(to top, rgba(245,78,78,0.2), #F54E4E)',
                          transitionDelay: `${i * 80}ms`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
            <div className="sl-mockup-glow" />
          </div>
        </div>
      </AnimatedSection>

      {/* ═══════════════ FEATURES SECTION ═══════════════ */}
      <AnimatedSection id="features" className="sl-section sl-section-alt" variants={fadeIn}>
        <div className="sl-container">
          <motion.div
            className="sl-section-header"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={fadeInUp}
          >
            <p className="sl-section-tag">FEATURES</p>
            <h2>Everything you need to decode the news</h2>
            <p className="sl-section-desc">Purpose-built tools for Malaysian media intelligence — from raw articles to actionable insights.</p>
          </motion.div>

          <motion.div
            className="sl-features-grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={staggerContainer}
          >
            {features.map((f, i) => (
              <motion.div
                key={i}
                className="sl-feature-card"
                variants={staggerItem}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                onMouseMove={handleCardMouseMove}
                onMouseLeave={handleCardMouseLeave}
              >
                <div className="sl-feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </AnimatedSection>

      {/* ═══════════════ HOW IT WORKS ═══════════════ */}
      <AnimatedSection id="how-it-works" className="sl-section" variants={fadeIn}>
        <div className="sl-container">
          <motion.div
            className="sl-section-header"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={fadeInUp}
          >
            <p className="sl-section-tag">HOW IT WORKS</p>
            <h2>From search to insight in seconds</h2>
            <p className="sl-section-desc">Three simple steps to unlock the sentiment behind every headline.</p>
          </motion.div>

          <motion.div
            className="sl-steps"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={staggerContainer}
          >
            {steps.map((s, i) => (
              <React.Fragment key={i}>
                <motion.div className="sl-step" variants={staggerItem}>
                  <div className="sl-step-num">{s.num}</div>
                  <div className="sl-step-icon">{s.icon}</div>
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                </motion.div>
                {i < steps.length - 1 && (
                  <motion.div
                    className="sl-step-connector"
                    variants={staggerItem}
                  >
                    <svg viewBox="0 0 40 24" fill="none" stroke="#4D7AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 40, height: 24, opacity: 0.5 }}>
                      <line x1="0" y1="12" x2="30" y2="12" />
                      <polyline points="24 6 30 12 24 18" />
                    </svg>
                  </motion.div>
                )}
              </React.Fragment>
            ))}
          </motion.div>
        </div>
      </AnimatedSection>

      {/* ═══════════════ LIVE DEMO PREVIEW ═══════════════ */}
      <AnimatedSection className="sl-section sl-section-alt" variants={fadeIn}>
        <div className="sl-container">
          <motion.div
            className="sl-section-header"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={fadeInUp}
          >
            <p className="sl-section-tag">LIVE PREVIEW</p>
            <h2>See the dashboard in action</h2>
            <p className="sl-section-desc">Real-time sentiment breakdown across Malaysian news — updated every minute.</p>
          </motion.div>

          <motion.div
            className="sl-demo-panel"
            ref={barsRef}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="sl-panel-chrome">
              <div className="sl-chrome-dots">
                <span style={{ background: '#F54E4E' }} />
                <span style={{ background: '#F7A501' }} />
                <span style={{ background: '#30CF79' }} />
              </div>
              <div className="sl-chrome-url">sentiment.mynews.ai/dashboard</div>
              <div className="sl-chrome-live"><span className="sl-live-dot" /> LIVE</div>
            </div>
            <div className="sl-panel-body">
              <div className="sl-demo-chart">
                {[
                  { cls: 'pos', h: 75, label: 'Positive' },
                  { cls: 'neg', h: 35, label: 'Negative' },
                  { cls: 'neu', h: 55, label: 'Neutral' },
                  { cls: 'pos', h: 85, label: 'Positive' },
                  { cls: 'neg', h: 25, label: 'Negative' },
                  { cls: 'neu', h: 45, label: 'Neutral' },
                  { cls: 'pos', h: 65, label: 'Positive' },
                ].map((bar, idx) => (
                  <div key={idx} className="sl-bar-col">
                    <div
                      className={`sl-bar sl-bar-${bar.cls}`}
                      style={{
                        height: barsVisible ? `${bar.h}%` : '0%',
                        transitionDelay: `${idx * 120}ms`,
                      }}
                    />
                    <span className={`sl-bar-label sl-bar-label-${bar.cls}`}>{bar.label}</span>
                  </div>
                ))}
              </div>
              <div className="sl-demo-sidebar">
                <div className="sl-demo-metric">
                  <span className="sl-metric-dot" style={{ background: '#30CF79' }} />
                  <span>Positive</span>
                  <span className="sl-metric-val" style={{ color: '#30CF79' }}>62%</span>
                </div>
                <div className="sl-demo-metric">
                  <span className="sl-metric-dot" style={{ background: '#F54E4E' }} />
                  <span>Negative</span>
                  <span className="sl-metric-val" style={{ color: '#F54E4E' }}>21%</span>
                </div>
                <div className="sl-demo-metric">
                  <span className="sl-metric-dot" style={{ background: '#F7A501' }} />
                  <span>Neutral</span>
                  <span className="sl-metric-val" style={{ color: '#F7A501' }}>17%</span>
                </div>
                <div className="sl-demo-divider" />
                <div className="sl-demo-mini-stat">
                  <span>Articles today</span>
                  <span style={{ fontWeight: 700, color: '#fff' }}>1,247</span>
                </div>
                <div className="sl-demo-mini-stat">
                  <span>Sources active</span>
                  <span style={{ fontWeight: 700, color: '#fff' }}>5</span>
                </div>
              </div>
            </div>
            {/* Floating alert badge */}
            <motion.div
              className="sl-floating-alert"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 1, duration: 0.6 }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="#4D7AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16, flexShrink: 0 }}>
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span>Sentiment spike detected — <b>Economy</b></span>
            </motion.div>
          </motion.div>
        </div>
      </AnimatedSection>

      {/* ═══════════════ TESTIMONIALS ═══════════════ */}
      <AnimatedSection className="sl-section" variants={fadeIn}>
        <div className="sl-container">
          <motion.div
            className="sl-section-header"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={fadeInUp}
          >
            <p className="sl-section-tag">TESTIMONIALS</p>
            <h2>Trusted by industry leaders</h2>
            <p className="sl-section-desc">Hear from professionals who rely on our platform daily.</p>
          </motion.div>

          <div className="sl-testimonial-wrap">
            {testimonials.map((t, i) => (
              <div key={i} className={`sl-testimonial-card ${i === activeTestimonial ? 'sl-testimonial-active' : ''}`}>
                <div className="sl-testimonial-quote">"{t.quote}"</div>
                <div className="sl-testimonial-author">
                  <div className="sl-testimonial-avatar">{t.name.charAt(0)}</div>
                  <div>
                    <div className="sl-testimonial-name">{t.name}</div>
                    <div className="sl-testimonial-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
            <div className="sl-testimonial-dots">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  className={`sl-dot ${i === activeTestimonial ? 'sl-dot-active' : ''}`}
                  onClick={() => setActiveTestimonial(i)}
                />
              ))}
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* ═══════════════ NEWS SOURCES ═══════════════ */}
      <motion.section
        className="sl-section sl-sources-section"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        variants={fadeIn}
      >
        <div className="sl-container">
          <motion.p className="sl-sources-label" variants={fadeInUp}>
            AGGREGATING FROM MALAYSIA'S TOP NEWS OUTLETS
          </motion.p>
          <motion.div className="sl-sources-row" variants={staggerContainer}>
            {newsSources.map((src, i) => (
              <motion.div
                key={i}
                className="sl-source-item"
                variants={staggerItem}
                whileHover={{ y: -3, scale: 1.05 }}
              >
                <span className="sl-source-icon">{src.icon}</span>
                <span className="sl-source-name">{src.name}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* ═══════════════ BOTTOM CTA ═══════════════ */}
      <AnimatedSection className="sl-section sl-cta-section" variants={scaleIn}>
        <div className="sl-container">
          <motion.div
            className="sl-cta-box"
            whileHover={{ scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          >
            <div className="sl-cta-glow" />
            <h2>Ready to decode Malaysian news?</h2>
            <p>Join analysts, journalists, and researchers who trust MY News Sentiment for real-time media intelligence.</p>
            <button className="sl-btn-primary sl-btn-lg sl-btn-cta" onClick={() => navigate('/register')}>
              Get Started Free
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18, marginLeft: 8 }}>
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>

          </motion.div>
        </div>
      </AnimatedSection>

      {/* ═══════════════ FOOTER ═══════════════ */}
      <footer className="sl-footer">
        <div className="sl-container sl-footer-inner">
          <div className="sl-footer-brand">
            <div className="sl-logo">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4D7AFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
              <span>MY News <b>Sentiment</b></span>
            </div>
            <p className="sl-copyright">© 2026 MY News Sentiment. All rights reserved.</p>
          </div>
          <div className="sl-footer-links">
            <div className="sl-link-col">
              <h4>Product</h4>
              <Link to="/features">Features</Link>
              <Link to="/pricing">Pricing</Link>
              <Link to="/api">API Access</Link>
            </div>
            <div className="sl-link-col">
              <h4>Company</h4>
              <Link to="/about">About Us</Link>
              <Link to="/contact">Contact</Link>
              <Link to="/privacy">Privacy Policy</Link>
            </div>
            <div className="sl-link-col">
              <h4>Connect</h4>
              <a href="#">Twitter / X</a>
              <a href="#">LinkedIn</a>
              <a href="#">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
