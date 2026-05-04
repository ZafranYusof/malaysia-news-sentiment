import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import ScrollToTop from '../components/ScrollToTop';
import '../scss/LandingPage.scss';
import '../scss/AboutPage.scss';

// ── Variants ──
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
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

const AboutPage = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const toggleTheme = () => setTheme(isDark ? 'light' : 'dark');

  // Animated counters
  const [statsVisible, setStatsVisible] = useState(false);
  const [counters, setCounters] = useState({ articles: 0, accuracy: 0, sources: 0 });
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
    const targets = { articles: 10000, accuracy: 95, sources: 5 };
    const duration = 2000, steps = 60, interval = duration / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const eased = 1 - Math.pow(1 - Math.min(step / steps, 1), 3);
      setCounters({
        articles: Math.round(targets.articles * eased),
        accuracy: Math.round(targets.accuracy * eased),
        sources: Math.round(targets.sources * eased),
      });
      if (step >= steps) clearInterval(timer);
    }, interval);
    return () => clearInterval(timer);
  }, [statsVisible]);

  const techStack = [
    { name: 'React', icon: (<svg viewBox="0 0 24 24" width="32" height="32" fill="#61DAFB"><circle cx="12" cy="12" r="2.2"/><ellipse cx="12" cy="12" rx="10" ry="4" fill="none" stroke="#61DAFB" strokeWidth="1"/><ellipse cx="12" cy="12" rx="10" ry="4" fill="none" stroke="#61DAFB" strokeWidth="1" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" fill="none" stroke="#61DAFB" strokeWidth="1" transform="rotate(120 12 12)"/></svg>), desc: 'Frontend UI framework' },
    { name: 'Node.js', icon: (<svg viewBox="0 0 24 24" width="32" height="32" fill="#339933"><path d="M12 1.85l9.5 5.5v11l-9.5 5.5-9.5-5.5v-11l9.5-5.5zm0 2.3L4.5 8.5v7l7.5 4.35L19.5 15.5v-7L12 4.15z"/></svg>), desc: 'Backend runtime' },
    { name: 'MongoDB', icon: (<svg viewBox="0 0 24 24" width="32" height="32" fill="#47A248"><path d="M12 2C12 2 8 6 8 12c0 4 2 8 4 10 2-2 4-6 4-10 0-6-4-10-4-10zm0 4c1.1 0 2 2.5 2 6s-.9 6-2 6-2-2.5-2-6 .9-6 2-6z"/></svg>), desc: 'NoSQL database' },
    { name: 'Express', icon: (<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 12h18M3 12l4-4m-4 4l4 4m14-4l-4-4m4 4l-4 4"/><rect x="7" y="8" width="10" height="8" rx="1" fill="none" stroke="currentColor" strokeWidth="1.5"/></svg>), desc: 'Backend framework' },
    { name: 'Ollama', icon: (<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#F54E00" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="5"/><path d="M4 20c0-4 3.5-7 8-7s8 3 8 7"/><path d="M9 7h6M10 9.5h4"/></svg>), desc: 'AI inference engine' },
    { name: 'Framer Motion', icon: (<svg viewBox="0 0 24 24" width="32" height="32" fill="#0055FF"><path d="M4 0h16v8H12L4 0zm0 8h8l8 8H4V8zm0 8h8v8L4 16z"/></svg>), desc: 'Animation library' },
  ];

  const team = [
    { name: 'Muhammad Zafran', role: 'Lead Developer', avatar: 'MZ' },
    { name: 'Dr. Supervisor', role: 'Project Advisor', avatar: 'DS' },
    { name: 'UMPSA FSKKP', role: 'Faculty Support', avatar: 'UF' },
  ];

  const milestones = [
    { date: 'Sep 2025', title: 'Project Kickoff', desc: 'FYP proposal approved at UMPSA FSKKP.' },
    { date: 'Nov 2025', title: 'Core Architecture', desc: 'Backend API, MongoDB schema, and React frontend scaffolded.' },
    { date: 'Jan 2026', title: 'AI Pipeline Live', desc: 'Multi-tier sentiment analysis with GPT-4o + Malaya NLP integrated.' },
    { date: 'Mar 2026', title: 'Beta Launch', desc: 'Dashboard, forecasting, and real-time analysis features deployed.' },
    { date: 'May 2026', title: 'FYP Presentation', desc: 'Final demonstration and thesis submission.' },
  ];

  return (
    <div className="ph-about" data-theme={isDark ? 'dark' : 'light'}>
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
      <motion.header className="ph-about__hero" initial="hidden" animate="visible" variants={staggerContainer}>
        <div className="ph-about__hero-glow" />
        <motion.div className="ph-about__badge" variants={staggerItem}>
          ℹ️ About Us
        </motion.div>
        <motion.h1 className="ph-about__title" variants={staggerItem}>
          Making Malaysian news intelligence <span>accessible to everyone</span>
        </motion.h1>
        <motion.p className="ph-about__subtitle" variants={staggerItem}>
          We're building the infrastructure to monitor, analyze, and predict news sentiment across Malaysia's multilingual media landscape — powered by cutting-edge AI.
        </motion.p>
      </motion.header>

      {/* ─── STATS ─── */}
      <AnimatedSection className="ph-about__stats" variants={staggerContainer}>
        <div className="ph-about__stats-inner" ref={statsRef}>
          {[
            { num: `${counters.articles.toLocaleString()}+`, label: 'Articles Analyzed', icon: '📄' },
            { num: `${counters.accuracy}%`, label: 'AI Accuracy', icon: '🎯' },
            { num: counters.sources, label: 'News Sources', icon: '🗞️' },
          ].map((s, i) => (
            <motion.div key={i} className="ph-about__stat" variants={staggerItem} whileHover={{ y: -4, transition: { duration: 0.2 } }}>
              <span className="ph-about__stat-icon">{s.icon}</span>
              <span className="ph-about__stat-num">{s.num}</span>
              <span className="ph-about__stat-label">{s.label}</span>
            </motion.div>
          ))}
        </div>
      </AnimatedSection>

      {/* ─── TECH STACK ─── */}
      <section className="ph-about__section ph-about__section--alt">
        <div className="ph-about__section-header">
          <p className="ph-about__section-tag">Technology</p>
          <h2 className="ph-about__section-title">Built with modern tools</h2>
          <p className="ph-about__section-desc">A full-stack architecture designed for real-time sentiment analysis at scale.</p>
        </div>
        <AnimatedSection className="ph-about__tech-grid" variants={staggerContainer}>
          {techStack.map((tech, i) => (
            <motion.div key={tech.name} className="ph-about__tech-card" variants={staggerItem} whileHover={{ y: -4, borderColor: 'var(--ph-accent)' }}>
              <span className="ph-about__tech-icon">{tech.icon}</span>
              <h3>{tech.name}</h3>
              <p>{tech.desc}</p>
            </motion.div>
          ))}
        </AnimatedSection>
      </section>

      {/* ─── TEAM ─── */}
      <section className="ph-about__section">
        <div className="ph-about__section-header">
          <p className="ph-about__section-tag">Team</p>
          <h2 className="ph-about__section-title">The people behind the platform</h2>
          <p className="ph-about__section-desc">A dedicated team building the future of Malaysian media intelligence.</p>
        </div>
        <AnimatedSection className="ph-about__team-grid" variants={staggerContainer}>
          {team.map((member, i) => (
            <motion.div key={member.name} className="ph-about__team-card" variants={staggerItem} whileHover={{ y: -4 }}>
              <div className="ph-about__team-avatar">{member.avatar}</div>
              <h3>{member.name}</h3>
              <p>{member.role}</p>
            </motion.div>
          ))}
        </AnimatedSection>
      </section>

      {/* ─── TIMELINE ─── */}
      <section className="ph-about__section ph-about__section--alt">
        <div className="ph-about__section-header">
          <p className="ph-about__section-tag">Milestones</p>
          <h2 className="ph-about__section-title">Our journey so far</h2>
          <p className="ph-about__section-desc">From concept to a fully functional sentiment analysis platform.</p>
        </div>
        <AnimatedSection className="ph-about__timeline" variants={staggerContainer}>
          <div className="ph-about__timeline-line" />
          {milestones.map((ms, i) => (
            <motion.div key={i} className="ph-about__tl-item" variants={staggerItem}>
              <div className="ph-about__tl-dot" />
              <div className="ph-about__tl-date">{ms.date}</div>
              <h3>{ms.title}</h3>
              <p>{ms.desc}</p>
            </motion.div>
          ))}
        </AnimatedSection>

        {/* Built at UMPSA */}
        <AnimatedSection className="ph-about__built-banner" variants={fadeInUp}>
          <h3>🎓 Built at UMPSA</h3>
          <p>This platform is developed as a Final Year Project (FYP) at Universiti Malaysia Pahang Al-Sultan Abdullah (UMPSA), Faculty of Computing (FSKKP).</p>
          <div className="ph-about__umpsa-badge">
            🏫 UMPSA · Gambang, Pahang
          </div>
        </AnimatedSection>
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

export default AboutPage;
