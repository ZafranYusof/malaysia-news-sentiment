import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { motion, useInView, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import ScrollToTop from '../components/ScrollToTop';
import '../scss/LandingPage.scss';

// ── Variants ──
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.1 } },
};
const staggerItem = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};
const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};
const slideInLeft = {
  hidden: { opacity: 0, x: -60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};
const slideInRight = {
  hidden: { opacity: 0, x: 60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};

// ── Floating Particle ──
const FloatingParticle = ({ delay, size, x, duration }) => (
  <motion.div
    className="ph-particle"
    style={{ width: size, height: size, left: `${x}%` }}
    animate={{ y: [0, -30, 0], opacity: [0.3, 0.7, 0.3], scale: [1, 1.2, 1] }}
    transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
  />
);

// ── Animated Section ──
const AnimatedSection = ({ children, className, id, variants = fadeInUp }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.section ref={ref} id={id} className={className} initial="hidden" animate={isInView ? 'visible' : 'hidden'} variants={variants}>
      {children}
    </motion.section>
  );
};

// ── Live Sentiment Bar ──
const SentimentBar = ({ label, value, color, delay }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  return (
    <div className="ph-demo__bar-row" ref={ref}>
      <span className="ph-demo__bar-label">{label}</span>
      <div className="ph-demo__bar-track">
        <motion.div
          className="ph-demo__bar-fill"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={isInView ? { width: `${value}%` } : { width: 0 }}
          transition={{ duration: 1.2, delay, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
      <motion.span
        className="ph-demo__bar-val"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.5, delay: delay + 0.8 }}
      >
        {value}%
      </motion.span>
    </div>
  );
};

const LandingPage = () => {
  const { user } = useAuth();
  useLanguage();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const toggleTheme = () => setTheme(isDark ? 'light' : 'dark');

  // Parallax
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -80]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0.3]);

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
      timeout = setTimeout(() => {
        setTypingText(isDeleting ? currentWord.substring(0, typingText.length - 1) : currentWord.substring(0, typingText.length + 1));
      }, isDeleting ? 60 : 120);
    }
    return () => clearTimeout(timeout);
  }, [typingText, isDeleting, typingIndex]);

  // Testimonials
  const testimonials = [
    { name: 'Dr. Aisha Rahman', role: 'Political Analyst, UKM', quote: 'This platform transformed how we track public sentiment during elections. The real-time insights are unmatched.', avatar: '👩‍🔬' },
    { name: 'Marcus Tan', role: 'Head of Strategy, Bursa Analytics', quote: 'We reduced our media monitoring costs by 70% while getting 10x more actionable intelligence.', avatar: '👨‍💼' },
    { name: 'Priya Nair', role: 'Journalist, The Edge Malaysia', quote: 'The AI accuracy is remarkable. It catches narrative shifts hours before they hit mainstream coverage.', avatar: '👩‍💻' },
  ];
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setActiveTestimonial((p) => (p + 1) % testimonials.length), 4000);
    return () => clearInterval(timer);
  }, []);

  // Feature tabs
  const [activeTab, setActiveTab] = useState(0);
  const featureTabs = [
    { title: 'Sentiment Analysis', desc: 'Instant classification of news articles into positive, negative, and neutral sentiment using fine-tuned transformer models. Watch sentiment shift in real-time across thousands of articles.', emoji: '📊', color: '#F54E00' },
    { title: 'Entity Recognition', desc: 'Automatically extract and track public figures, organizations, and locations mentioned across all articles. Build knowledge graphs that reveal hidden connections.', emoji: '🔍', color: '#3B82F6' },
    { title: 'Trend Forecasting', desc: 'Track how narratives evolve over time and predict upcoming sentiment shifts before they happen. Stay ahead of the news cycle with AI-powered predictions.', emoji: '📈', color: '#30CF79' },
    { title: 'Source Intelligence', desc: 'Aggregate and cross-reference from Malaysiakini, Astro Awani, FMT, Bernama, and more. Evaluate source credibility and detect bias patterns.', emoji: '🗞️', color: '#F7A501' },
  ];

  // Card hover tilt
  const handleCardHover = useCallback((e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) scale(1.02)`;
  }, []);
  const handleCardLeave = useCallback((e) => {
    e.currentTarget.style.transform = '';
  }, []);

  // Mouse glow on hero
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const handleHeroMouse = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="ph-landing" data-theme={isDark ? 'dark' : 'light'}>
      <ScrollToTop />

      {/* ─── NAVBAR ─── */}
      <motion.nav className="ph-nav" initial={{ y: -80 }} animate={{ y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
        <div className="ph-nav__inner">
          <Link to="/" className="ph-nav__logo">
            <motion.span className="ph-nav__logo-icon" animate={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}>📰</motion.span>
            <span>MY News <b>Sentiment</b></span>
          </Link>
          <div className="ph-nav__links">
            <a href="#features">Features</a>
            <a href="#how-it-works">How it works</a>
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
      <header className="ph-hero" onMouseMove={handleHeroMouse}>
        <div className="ph-hero__glow" style={{ left: mousePos.x, top: mousePos.y }} />
        <div className="ph-hero__particles">
          {[
            { delay: 0, size: 6, x: 10, duration: 4 },
            { delay: 1, size: 8, x: 25, duration: 5 },
            { delay: 0.5, size: 5, x: 40, duration: 3.5 },
            { delay: 1.5, size: 7, x: 60, duration: 4.5 },
            { delay: 0.8, size: 6, x: 75, duration: 3.8 },
            { delay: 2, size: 9, x: 90, duration: 5.2 },
          ].map((p, i) => <FloatingParticle key={i} {...p} />)}
        </div>

        <motion.div className="ph-hero__content" style={{ y: heroY, opacity: heroOpacity }} initial="hidden" animate="visible" variants={staggerContainer}>
          <motion.div className="ph-hero__badge" variants={staggerItem}>
            <span className="ph-hero__badge-dot" />
            AI-Powered News Intelligence
          </motion.div>

          <motion.h1 className="ph-hero__title" variants={staggerItem}>
            Decode the Pulse of<br />Malaysian <span className="ph-hero__typing">{typingText}<span className="ph-hero__cursor">|</span></span>
          </motion.h1>

          <motion.p className="ph-hero__sub" variants={staggerItem}>
            Real-time AI that monitors, classifies, and visualizes sentiment across Malaysia's top news sources — so you never miss a narrative shift.
          </motion.p>

          <motion.div className="ph-hero__cta" variants={staggerItem}>
            <motion.button className="ph-btn ph-btn--primary ph-btn--lg" onClick={() => navigate('/register')} whileHover={{ scale: 1.06, boxShadow: '0 8px 30px rgba(245,78,0,0.35)' }} whileTap={{ scale: 0.97 }}>
              Get started free →
            </motion.button>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Link to="/login" className="ph-btn ph-btn--outline ph-btn--lg">Watch demo ▶</Link>
            </motion.div>
          </motion.div>

          <motion.div className="ph-hero__sources" variants={staggerItem}>
            <span className="ph-hero__sources-label">Powered by</span>
            {['Malaysiakini', 'Astro Awani', 'FMT', 'Bernama', 'The Star'].map((s, i) => (
              <motion.span key={s} className="ph-hero__source-tag" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1 + i * 0.1, duration: 0.4 }}>
                {s}
              </motion.span>
            ))}
          </motion.div>
        </motion.div>
      </header>

      {/* ─── STATS ─── */}
      <AnimatedSection className="ph-stats" variants={staggerContainer}>
        <div className="ph-stats__inner" ref={statsRef}>
          {[
            { num: `${counters.articles.toLocaleString()}+`, label: 'Articles Analyzed', icon: '📄' },
            { num: `${counters.accuracy}%`, label: 'AI Accuracy', icon: '🎯' },
            { num: counters.models, label: 'AI Models', icon: '🤖' },
          ].map((s, i) => (
            <motion.div key={i} className="ph-stats__item" variants={staggerItem} whileHover={{ y: -4, transition: { duration: 0.2 } }}>
              <span className="ph-stats__icon">{s.icon}</span>
              <span className="ph-stats__num">{s.num}</span>
              <span className="ph-stats__label">{s.label}</span>
            </motion.div>
          ))}
        </div>
      </AnimatedSection>

      {/* ─── LIVE DEMO ─── */}
      <AnimatedSection className="ph-demo" variants={fadeInUp}>
        <div className="ph-container">
          <p className="ph-section-tag">Live Preview</p>
          <h2 className="ph-section-title">See sentiment analysis in action</h2>
          <motion.div className="ph-demo__card" variants={scaleIn} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <div className="ph-demo__header">
              <span className="ph-demo__dot ph-demo__dot--red" />
              <span className="ph-demo__dot ph-demo__dot--yellow" />
              <span className="ph-demo__dot ph-demo__dot--green" />
              <span className="ph-demo__title">Sentiment Distribution — May 2026</span>
            </div>
            <div className="ph-demo__body">
              <SentimentBar label="Positive" value={42} color="#30CF79" delay={0.2} />
              <SentimentBar label="Neutral" value={35} color="#F7A501" delay={0.4} />
              <SentimentBar label="Negative" value={23} color="#F54E4E" delay={0.6} />
            </div>
          </motion.div>
        </div>
      </AnimatedSection>

      {/* ─── FEATURES TABS ─── */}
      <AnimatedSection className="ph-features" id="features" variants={fadeInUp}>
        <div className="ph-container">
          <p className="ph-section-tag">Features</p>
          <h2 className="ph-section-title">Everything you need to understand Malaysian news</h2>
          <div className="ph-features__tabs">
            {featureTabs.map((tab, i) => (
              <motion.button key={i} className={`ph-features__tab ${activeTab === i ? 'ph-features__tab--active' : ''}`} onClick={() => setActiveTab(i)} whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}>
                <span className="ph-features__tab-emoji">{tab.emoji}</span>
                {tab.title}
              </motion.button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.div className="ph-features__panel" key={activeTab} initial={{ opacity: 0, y: 20, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
              <div className="ph-features__panel-accent" style={{ background: featureTabs[activeTab].color }} />
              <div className="ph-features__panel-content">
                <span className="ph-features__panel-emoji">{featureTabs[activeTab].emoji}</span>
                <h3>{featureTabs[activeTab].title}</h3>
                <p>{featureTabs[activeTab].desc}</p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </AnimatedSection>

      {/* ─── HOW IT WORKS ─── */}
      <AnimatedSection className="ph-how" id="how-it-works" variants={fadeInUp}>
        <div className="ph-container">
          <p className="ph-section-tag">How it works</p>
          <h2 className="ph-section-title">From search to insight in seconds</h2>
          <motion.div className="ph-how__steps" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
            {[
              { num: '01', title: 'Search', desc: 'Enter any topic, keyword, or entity. Our crawler fetches the latest articles from major Malaysian news outlets.', icon: '🔎' },
              { num: '02', title: 'Analyze', desc: 'AI models process each article — classifying sentiment, extracting entities, and scoring relevance in real time.', icon: '⚡' },
              { num: '03', title: 'Visualize', desc: 'Explore interactive dashboards with sentiment trends, entity networks, and temporal heatmaps.', icon: '📊' },
            ].map((step, i) => (
              <motion.div key={step.num} className="ph-how__step" variants={staggerItem} whileHover={{ y: -8, boxShadow: '0 12px 40px rgba(0,0,0,0.1)' }} onMouseMove={handleCardHover} onMouseLeave={handleCardLeave}>
                <span className="ph-how__icon">{step.icon}</span>
                <span className="ph-how__num">{step.num}</span>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
                {i < 2 && <div className="ph-how__connector">→</div>}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </AnimatedSection>

      {/* ─── TESTIMONIALS ─── */}
      <AnimatedSection className="ph-testimonials" variants={fadeInUp}>
        <div className="ph-container">
          <p className="ph-section-tag">Testimonials</p>
          <h2 className="ph-section-title">Trusted by analysts & journalists</h2>
          <div className="ph-testimonials__carousel">
            <AnimatePresence mode="wait">
              <motion.div key={activeTestimonial} className="ph-testimonials__card" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
                <span className="ph-testimonials__avatar">{testimonials[activeTestimonial].avatar}</span>
                <p className="ph-testimonials__quote">"{testimonials[activeTestimonial].quote}"</p>
                <div className="ph-testimonials__author">
                  <strong>{testimonials[activeTestimonial].name}</strong>
                  <span>{testimonials[activeTestimonial].role}</span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="ph-testimonials__dots">
            {testimonials.map((_, i) => (
              <motion.button key={i} className={`ph-testimonials__dot ${i === activeTestimonial ? 'ph-testimonials__dot--active' : ''}`} onClick={() => setActiveTestimonial(i)} whileHover={{ scale: 1.3 }} />
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ─── CTA ─── */}
      <AnimatedSection className="ph-cta" variants={scaleIn}>
        <div className="ph-container">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            Start analyzing Malaysian news today
          </motion.h2>
          <p>Free to get started. No credit card required.</p>
          <motion.button className="ph-btn ph-btn--primary ph-btn--lg" onClick={() => navigate('/register')} whileHover={{ scale: 1.06, boxShadow: '0 8px 30px rgba(245,78,0,0.35)' }} whileTap={{ scale: 0.97 }}>
            Get started free →
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

export default LandingPage;
