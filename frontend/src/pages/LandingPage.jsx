import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import ScrollToTop from '../components/ScrollToTop';
import Spline from '@splinetool/react-spline';

const LandingPage = () => {
  const { user } = useAuth();
  useLanguage();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  // === Enhancement 1: Animated Stats Counter ===
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

  // === Enhancement 6: Typing Animation ===
  const typingWords = ['Malaysia', 'Rakyat', 'Markets', 'Politics'];
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

  // === Enhancement 3: Testimonial Carousel ===
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

  // === Enhancement 4: Live Demo Preview (bar animation triggered by visibility) ===
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

  // === Enhancement 5: Hover Micro-interactions ===
  const handleCardMouseMove = useCallback((e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.background = `radial-gradient(300px circle at ${x}px ${y}px, rgba(99,102,241,0.12), rgba(255,255,255,0.03) 70%)`;
  }, []);
  const handleCardMouseLeave = useCallback((e) => {
    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
  }, []);

  // Scroll reveal logic (Enhanced with stagger - Enhancement 7)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            // Stagger children
            const staggerChildren = entry.target.querySelectorAll('.stagger-child');
            staggerChildren.forEach((child, i) => {
              child.style.transitionDelay = `${i * 120}ms`;
              child.classList.add('is-visible');
            });
          }
        });
      },
      { threshold: 0.1 }
    );

    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
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

  return (
    <div className="dark-landing">
      <ScrollToTop />
      
      {/* 2. NAVBAR */}
      <nav className="d-navbar">
        <div className="d-nav-container">
          <div className="d-logo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            <span>MY News <b>Sentiment</b></span>
          </div>
          <div className="d-nav-links">
            <a href="#features" onClick={(e) => smoothScroll(e, 'features')}>Features</a>
            <Link to="/pricing">Pricing</Link>
            <Link to="/about">About Us</Link>
            <Link to="/contact">Contact</Link>
          </div>
          <div className="d-nav-actions">
            <button className="btn-theme-toggle" onClick={toggleTheme} title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
              {isDark ? '☀️' : '🌙'}
            </button>
            <Link to="/login" className="btn-ghost">Log In</Link>
            <button className="btn-neon" onClick={() => navigate('/register')}>Get Started</button>
          </div>
        </div>
      </nav>

      {/* 1. HERO SECTION */}
      <header className="d-hero">
        {/* Animated Gradient Orbs - Enhancement 2 */}
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-orb hero-orb-3" />
        
        {/* Spline 3D Scene */}
        <div className="hero-spline-wrapper">
          <Spline scene="https://prod.spline.design/8RN-loeg1OTstVrg/scene.splinecode" />
          <div className="hero-spline-badge-cover" />
        </div>

        <div className="d-hero-content reveal">
          <div className="badge-glass">
            <span className="live-dot"></span> Next-Gen Analytics 2.0
          </div>
          <h1 className="d-headline">
            Decode the Voice <br />
            of <span className="text-gradient-purple typing-word">{typingText}<span className="typing-cursor">|</span></span>
          </h1>
          <p className="d-subheadline">
            Harness real-time AI to monitor national narratives, identify market shifts, and stay ahead of every headline with enterprise-grade intelligence.
          </p>
          <div className="d-hero-cta">
            <button className="btn-neon large" onClick={() => navigate('/register')}>Start Analyzing Now</button>
            <button className="btn-glass large" onClick={(e) => smoothScroll(e, 'features')}>Explore More</button>
          </div>

          {/* Enhancement 1: Animated Stats Counter */}
          <div className="hero-stats" ref={statsRef}>
            <div className="hero-stat">
              <span className="stat-number">{counters.articles.toLocaleString()}+</span>
              <span className="stat-label">Articles Analyzed</span>
            </div>
            <div className="hero-stat">
              <span className="stat-number">{counters.accuracy}%</span>
              <span className="stat-label">AI Accuracy</span>
            </div>
            <div className="hero-stat">
              <span className="stat-number">{counters.models}</span>
              <span className="stat-label">AI Models</span>
            </div>
          </div>
        </div>
      </header>

      {/* 3. FEATURES SECTION */}
      <section id="features" className="d-section features-section">
        <div className="features-spline-wrapper">
          <Spline scene="https://prod.spline.design/B0-z7WP9Q3wEne-S/scene.splinecode" />
          <div className="hero-spline-badge-cover" />
        </div>
        <div className="d-container features-content">
          <div className="section-header reveal">
            <h2>Architected for Intelligence</h2>
            <p>Everything you need to turn raw news into strategic foresight.</p>
          </div>

          <div className="d-features-grid">
            {[
              { t: 'Live Sentiment AI', d: 'Get instant classifications across thousands of articles using fine-tuned LLMs.', i: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a10 10 0 1 0 10 10h-10V2z"/><path d="M12 12L22 4"/></svg> },
              { t: 'Entity Recognition', d: 'Automatically extract and track public figures, companies, and locations.', i: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="7" r="4"/><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/></svg> },
              { t: 'Temporal Mapping', d: 'Track narrative evolution over time to predict upcoming shifts.', i: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><path d="M16 2v4M8 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"/></svg> }
            ].map((f, i) => (
              <div key={i} className="d-card reveal stagger-child" style={{ transitionDelay: `${i * 100}ms` }} onMouseMove={handleCardMouseMove} onMouseLeave={handleCardMouseLeave}>
                <div className="d-card-icon">{f.i}</div>
                <h3>{f.t}</h3>
                <p>{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. PRODUCT / EXPERIENCE SECTION */}
      <section id="experience" className="d-section product-section">
        <div className="d-container split-layout">
          <div className="split-text reveal">
            <h2 className="text-gradient-blue">See the Unseen.</h2>
            <p>
              The news cycle is chaotic. Our platform cuts through the noise by clustering related stories, identifying partisan bias, and scoring the potential reach of every headline.
            </p>
            <ul className="d-benefits-list">
              <li>
                <div className="check-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="20 6 9 17 4 12"/></svg></div>
                <span>Identify emerging PR crises in under 60 seconds</span>
              </li>
              <li>
                <div className="check-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="20 6 9 17 4 12"/></svg></div>
                <span>Measure competitor sentiment across multi-language media</span>
              </li>
              <li>
                <div className="check-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="20 6 9 17 4 12"/></svg></div>
                <span>Export automated intelligence reports instantly</span>
              </li>
            </ul>
          </div>
          
          <div className="split-visual reveal">
            <div className="visual-glass-panel">
               <div className="panel-header">
                 <div className="dots"><span/><span/><span/></div>
                 <div className="url">dashboard.mynews.ai</div>
                 <div className="live-indicator"><span className="live-pulse-dot"></span> LIVE</div>
               </div>
               <div className="panel-body">
                  <div className="mockup-chart" ref={barsRef}>
                    {[{cls:'pos',h:70},{cls:'neu',h:40},{cls:'neg',h:20},{cls:'pos',h:80},{cls:'neg',h:50}].map((bar, idx) => (
                      <div key={idx} className={`bar ${bar.cls} ${barsVisible ? 'bar-animate' : ''}`} style={{ height: barsVisible ? `${bar.h}%` : '0%', transitionDelay: `${idx * 150}ms` }}></div>
                    ))}
                  </div>
                  <div className="mockup-stats">
                     <div className="line" style={{width: '100%'}}></div>
                     <div className="line" style={{width: '60%'}}></div>
                  </div>
               </div>
               
               {/* Floating element over panel */}
               <div className="floating-badge">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  Sentiment Spike Detected
               </div>
            </div>
            {/* Visual glow backdrop */}
            <div className="visual-glow"></div>
          </div>
        </div>
      </section>

      {/* 5. SOCIAL PROOF / TRUST */}
      <section id="trust" className="d-section trust-section">
        <div className="d-container">
          <p className="trust-label reveal">POWERING INTELLIGENCE FOR MODERN TEAMS</p>
          <div className="d-logos reveal">
            {/* Abstract geometric logos representing companies */}
            <div className="fake-logo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polygon points="12 2 2 22 22 22"/></svg> Vertex</div>
            <div className="fake-logo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/></svg> OribtMedia</div>
            <div className="fake-logo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/></svg> BlockResearch</div>
            <div className="fake-logo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M2 12h20M12 2v20"/></svg> NexusGov</div>
          </div>
        </div>
      </section>

      {/* TESTIMONIAL CAROUSEL - Enhancement 3 */}
      <section className="d-section testimonial-section">
        <div className="d-container">
          <div className="section-header reveal">
            <h2>Trusted by Industry Leaders</h2>
            <p>Hear from professionals who rely on our platform daily.</p>
          </div>
          <div className="testimonial-carousel reveal">
            {testimonials.map((t, i) => (
              <div key={i} className={`testimonial-card ${i === activeTestimonial ? 'testimonial-active' : ''}`}>
                <div className="testimonial-quote">"{t.quote}"</div>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">{t.name.charAt(0)}</div>
                  <div>
                    <div className="testimonial-name">{t.name}</div>
                    <div className="testimonial-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
            <div className="testimonial-dots">
              {testimonials.map((_, i) => (
                <button key={i} className={`t-dot ${i === activeTestimonial ? 't-dot-active' : ''}`} onClick={() => setActiveTestimonial(i)} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6. FINAL CTA SECTION */}
      <section className="d-section cta-section reveal">
        <div className="d-container">
          <div className="cta-box">
             <div className="cta-glow"></div>
             <h2>Ready to command the narrative?</h2>
             <p>Join top analysts who rely on MY News Sentiment for unmatched media intelligence.</p>
             <button className="btn-neon large hover-scale" onClick={() => navigate('/register')}>Activate Your Dashboard ➔</button>
          </div>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="d-footer">
        <div className="d-container footer-content">
          <div className="footer-brand">
            <div className="d-logo">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
              <span>MY News <b>Sentiment</b></span>
            </div>
            <p className="copyright">© 2026 Semantic AI Solutions. All rights reserved.</p>
          </div>
          <div className="footer-links">
            <div className="link-col">
              <h4>Product</h4>
              <Link to="/features">Features</Link>
              <Link to="/pricing">Pricing</Link>
              <Link to="/api">API Access</Link>
            </div>
            <div className="link-col">
              <h4>Company</h4>
              <Link to="/about">About Us</Link>
              <Link to="/contact">Contact</Link>
              <Link to="/privacy">Privacy Policy</Link>
            </div>
            <div className="link-col">
              <h4>Social</h4>
              <a href="#">Twitter/X</a>
              <a href="#">LinkedIn</a>
              <a href="#">GitHub</a>
            </div>
          </div>
        </div>
      </footer>

      {/* --- STYLES FOR NEW DESIGN --- */}
      <style>{`
        /* Core Theme Variables */
        :root {
          --bg: #030305;
          --bg-surface: rgba(255, 255, 255, 0.03);
          --text-main: #f8fafc;
          --text-muted: #94a3b8;
          --accent-blue: #3b82f6;
          --accent-purple: #8b5cf6;
          --border: rgba(255, 255, 255, 0.08);
          --font-body: 'Inter', system-ui, -apple-system, sans-serif;
        }

        /* Base Resets */
        .dark-landing {
          background-color: var(--bg);
          color: var(--text-main);
          font-family: var(--font-body);
          min-height: 100vh;
          overflow-x: hidden;
          line-height: 1.5;
        }
        .dark-landing * {
          box-sizing: border-box;
        }
        .d-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
          position: relative;
          z-index: 10;
        }

        /* Typography */
        .text-gradient-purple {
          background: linear-gradient(135deg, #a855f7 0%, #6366f1 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .text-gradient-blue {
          background: linear-gradient(135deg, #3b82f6 0%, #0ea5e9 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        /* Buttons */
        .btn-neon {
          position: relative;
          background: linear-gradient(135deg, #6366f1, #3b82f6);
          color: white;
          border: none;
          padding: 10px 24px;
          border-radius: 99px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          z-index: 1;
          transition: all 0.3s ease;
        }
        .btn-neon::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 99px;
          background: inherit;
          filter: blur(12px);
          opacity: 0.5;
          z-index: -1;
          transition: opacity 0.3s ease;
        }
        .btn-neon:hover { transform: translateY(-2px); }
        .btn-neon:hover::before { opacity: 0.8; }
        
        .btn-neon.large {
          padding: 16px 36px;
          font-size: 16px;
        }

        .btn-glass {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid var(--border);
          color: white;
          padding: 10px 24px;
          border-radius: 99px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .btn-glass:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: translateY(-2px);
        }
        .btn-glass.large { padding: 16px 36px; font-size: 16px; }

        .btn-ghost {
          color: var(--text-muted);
          text-decoration: none;
          font-weight: 600;
          font-size: 14px;
          transition: color 0.3s;
        }
        .btn-ghost:hover { color: white; }

        /* Navigation */
        .d-navbar {
          position: fixed;
          top: 0; left: 0; right: 0;
          background: rgba(3, 3, 5, 0.6);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid var(--border);
          z-index: 100;
          height: 72px;
        }
        .d-nav-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .d-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 18px;
          font-weight: 700;
          color: white;
        }
        .d-logo svg { color: var(--accent-blue); }
        .d-nav-links {
          display: flex;
          gap: 32px;
        }
        .d-nav-links a {
          color: var(--text-muted);
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          transition: color 0.2s;
        }
        .d-nav-links a:hover { color: white; }
        .d-nav-actions {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .btn-theme-toggle {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.12);
          width: 40px;
          height: 40px;
          border-radius: 12px;
          cursor: pointer;
          font-size: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }
        .btn-theme-toggle:hover {
          background: rgba(255, 255, 255, 0.15);
          transform: rotate(20deg);
        }

        /* ── Light Mode Overrides ── */
        [data-theme='light'] .dark-landing {
          background-color: #f8fafc;
          color: #1e293b;
        }
        [data-theme='light'] .d-navbar {
          background: rgba(255, 255, 255, 0.85);
          border-bottom-color: #e2e8f0;
        }
        [data-theme='light'] .d-logo { color: #0f172a; }
        [data-theme='light'] .d-nav-links a { color: #64748b; }
        [data-theme='light'] .d-nav-links a:hover { color: #0f172a; }
        [data-theme='light'] .btn-ghost { color: #64748b; }
        [data-theme='light'] .btn-ghost:hover { color: #0f172a; }
        [data-theme='light'] .btn-theme-toggle {
          background: rgba(0, 0, 0, 0.05);
          border-color: #e2e8f0;
        }
        [data-theme='light'] .btn-theme-toggle:hover {
          background: rgba(0, 0, 0, 0.1);
        }
        [data-theme='light'] .d-headline { color: #0f172a; }
        [data-theme='light'] .d-subheadline { color: #64748b; }
        [data-theme='light'] .badge-glass {
          background: rgba(99, 102, 241, 0.1);
          border-color: rgba(99, 102, 241, 0.2);
          color: #6366f1;
        }
        [data-theme='light'] .d-card {
          background: white;
          border-color: #e2e8f0;
        }
        [data-theme='light'] .d-card { background: white; border: 1px solid #e2e8f0; }
        [data-theme='light'] .d-card h3 { color: #0f172a; }
        [data-theme='light'] .d-card p { color: #475569; }
        [data-theme='light'] .d-card-icon { background: rgba(99,102,241,0.1); }
        [data-theme='light'] .d-card-icon svg { color: #6366f1; }
        [data-theme='light'] .section-header h2 { color: #0f172a; }
        [data-theme='light'] .section-header p { color: #475569; }
        [data-theme='light'] .d-section { color: #1e293b; }
        [data-theme='light'] .features-section { background: #f8fafc; }
        [data-theme='light'] .product-section { background: #ffffff; }
        [data-theme='light'] .split-text h2 { color: #0f172a; }
        [data-theme='light'] .split-text p { color: #475569; }
        [data-theme='light'] .split-text li span { color: #334155; }
        [data-theme='light'] .d-benefits-list li { color: #334155; }
        [data-theme='light'] .btn-glass { background: rgba(0,0,0,0.05); border-color: #e2e8f0; color: #0f172a; }
        [data-theme='light'] .btn-glass:hover { background: rgba(0,0,0,0.1); }
        [data-theme='light'] .d-features-grid { color: #1e293b; }
        [data-theme='light'] .d-benefits-list .check-icon { background: #ecfdf5; }
        [data-theme='light'] .visual-glass-panel {
          background: white;
          border-color: #e2e8f0;
        }
        [data-theme='light'] .panel-header { border-bottom-color: #e2e8f0; }
        [data-theme='light'] .panel-header .url { color: #64748b; }
        [data-theme='light'] .trust-label { color: #94a3b8; }
        [data-theme='light'] .fake-logo { color: #64748b; border-color: #e2e8f0; }
        [data-theme='light'] .cta-box {
          background: #0f172a;
        }
        [data-theme='light'] .d-footer {
          background: #f1f5f9;
          border-top-color: #e2e8f0;
        }
        [data-theme='light'] .d-footer .copyright { color: #94a3b8; }
        [data-theme='light'] .footer-links a { color: #64748b; }
        [data-theme='light'] .footer-links h4 { color: #0f172a; }
        [data-theme='light'] .hero-glow { opacity: 0.15; }
        [data-theme='light'] .features-spline-wrapper { opacity: 0.3; }
        [data-theme='light'] .stats-counter { background: white; border-color: #e2e8f0; }
        [data-theme='light'] .stat-number { color: #0f172a; }
        [data-theme='light'] .stat-label { color: #64748b; }
        [data-theme='light'] .testimonial-card,
        [data-theme='light'] [class*="testimonial"] {
          background: white !important;
          border-color: #e2e8f0 !important;
        }
        [data-theme='light'] .testimonial-card p,
        [data-theme='light'] [class*="testimonial"] p,
        [data-theme='light'] .testimonial-quote { color: #334155 !important; }
        [data-theme='light'] .testimonial-name { color: #0f172a !important; }
        [data-theme='light'] .testimonial-role { color: #64748b !important; }
        [data-theme='light'] .trust-section,
        [data-theme='light'] .trust-section * { color: #1e293b; }
        [data-theme='light'] .trust-section p { color: #475569 !important; }
        [data-theme='light'] .trust-section h2 { color: #0f172a !important; }

        /* Hero */
        .d-hero {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          padding-top: 72px; /* nav offset */
          overflow: hidden;
        }
        /* Enhancement 2: Animated Gradient Orbs */
        .hero-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
          z-index: 0;
          pointer-events: none;
          will-change: transform;
        }
        .hero-orb-1 {
          width: 600px; height: 600px;
          background: var(--accent-purple);
          top: -200px; left: -200px;
          opacity: 0.4;
          animation: orbFloat1 8s ease-in-out infinite;
        }
        .hero-orb-2 {
          width: 500px; height: 500px;
          background: var(--accent-blue);
          bottom: 10%; right: 10%;
          opacity: 0.2;
          animation: orbFloat2 10s ease-in-out infinite;
        }
        .hero-orb-3 {
          width: 400px; height: 400px;
          background: linear-gradient(135deg, #ec4899, #8b5cf6);
          top: 40%; left: 30%;
          opacity: 0.15;
          animation: orbFloat3 12s ease-in-out infinite;
        }
        @keyframes orbFloat1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(60px, 40px) scale(1.1); }
          66% { transform: translate(-30px, 60px) scale(0.95); }
        }
        @keyframes orbFloat2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-50px, -40px) scale(1.15); }
        }
        @keyframes orbFloat3 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.15; }
          50% { transform: translate(40px, -30px) scale(1.2); opacity: 0.25; }
        }
        .features-section {
          position: relative;
          background: transparent;
          min-height: 80vh;
          display: flex;
          align-items: center;
          padding: 100px 0;
          overflow: hidden;
        }
        .features-spline-wrapper {
          position: absolute;
          inset: 0;
          z-index: 0;
          opacity: 0.5;
          pointer-events: none;
        }
        .features-spline-wrapper canvas {
          width: 100% !important;
          height: 100% !important;
          display: block;
        }
        .features-content {
          position: relative;
          z-index: 10;
        }
        /* Enhancement 1: Hero Stats */
        .hero-stats {
          display: flex;
          gap: 40px;
          margin-top: 48px;
          padding-top: 32px;
          border-top: 1px solid var(--border);
        }
        .hero-stat {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .stat-number {
          font-size: 28px;
          font-weight: 800;
          background: linear-gradient(135deg, #a855f7, #3b82f6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .stat-label {
          font-size: 13px;
          color: var(--text-muted);
          font-weight: 500;
        }

        /* Enhancement 6: Typing Cursor */
        .typing-word {
          position: relative;
        }
        .typing-cursor {
          font-weight: 300;
          animation: cursorBlink 0.7s step-end infinite;
          -webkit-text-fill-color: #a855f7;
        }
        @keyframes cursorBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }

        /* Spline Container */
        .hero-spline-wrapper {
          position: absolute;
          inset: 0;
          z-index: 1;
          transform: scale(1.1) translateX(4%);
        }
        .hero-spline-wrapper canvas {
          width: 100% !important;
          height: 100% !important;
          display: block;
        }
        
        /* No overlays needed - Spline scene natively handles the dark theme */
        /* Cover spline watermark */
        .hero-spline-badge-cover {
          position: absolute;
          bottom: 10px; right: 10px;
          width: 180px; height: 50px;
          background: var(--bg);
          pointer-events: none;
          filter: blur(8px);
        }

        /* Hero Content */
        .d-hero-content {
          position: relative;
          z-index: 10;
          max-width: 680px;
          padding-left: 10%;
        }
        .badge-glass {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(8px);
          border: 1px solid var(--border);
          padding: 6px 16px;
          border-radius: 99px;
          font-size: 13px;
          font-weight: 500;
          color: #e2e8f0;
          margin-bottom: 24px;
        }
        .live-dot {
          width: 8px; height: 8px;
          background: #22c55e;
          border-radius: 50%;
          box-shadow: 0 0 10px #22c55e;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.4; }
          100% { opacity: 1; }
        }

        .d-headline {
          font-size: 64px;
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -0.02em;
          margin: 0 0 24px;
        }
        .d-subheadline {
          font-size: 18px;
          color: var(--text-muted);
          line-height: 1.6;
          margin: 0 0 40px;
          max-width: 500px;
        }
        .d-hero-cta {
          display: flex;
          gap: 16px;
        }

        /* General Sections */
        .d-section {
          padding: 120px 0;
          position: relative;
        }
        .section-header {
          text-align: center;
          margin-bottom: 80px;
        }
        .section-header h2 {
          font-size: 36px;
          font-weight: 700;
          margin: 0 0 16px;
        }
        .section-header p {
          font-size: 18px;
          color: var(--text-muted);
          margin: 0;
        }

        /* Features */
        .d-features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
        }
        .d-card {
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: 24px;
          padding: 40px 32px;
          position: relative;
          overflow: hidden;
          transition: transform 0.3s ease, border-color 0.3s ease;
        }
        .d-card:hover {
          transform: translateY(-5px);
          border-color: rgba(99, 102, 241, 0.4);
        }
        .d-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .d-card:hover::before { opacity: 1; }
        
        .d-card-icon {
          width: 48px; height: 48px;
          background: rgba(99, 102, 241, 0.1);
          color: var(--accent-purple);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 24px;
        }
        .d-card-icon svg { width: 24px; height: 24px; }
        .d-card h3 {
          font-size: 20px;
          font-weight: 600;
          margin: 0 0 12px;
        }
        .d-card p {
          color: var(--text-muted);
          margin: 0;
          line-height: 1.6;
        }

        /* Product Split Section */
        .split-layout {
          display: flex;
          align-items: center;
          gap: 80px;
        }
        .split-text {
          flex: 1;
        }
        .split-text h2 {
          font-size: 40px;
          font-weight: 800;
          margin: 0 0 24px;
        }
        .split-text p {
          font-size: 18px;
          color: var(--text-muted);
          line-height: 1.6;
          margin: 0 0 40px;
        }
        .d-benefits-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .d-benefits-list li {
          display: flex;
          align-items: center;
          gap: 16px;
          font-size: 16px;
          font-weight: 500;
        }
        .check-icon {
          width: 28px; height: 28px;
          background: rgba(34, 197, 94, 0.1);
          color: #22c55e;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .check-icon svg { width: 14px; height: 14px; stroke-width: 3; }

        .split-visual {
          flex: 1;
          position: relative;
        }
        .visual-glow {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at center, rgba(59, 130, 246, 0.2), transparent 70%);
          z-index: 0;
        }
        .visual-glass-panel {
          position: relative;
          z-index: 1;
          background: rgba(20, 20, 25, 0.6);
          border: 1px solid var(--border);
          border-radius: 16px;
          backdrop-filter: blur(12px);
          overflow: hidden;
          box-shadow: 0 24px 80px rgba(0,0,0,0.4);
          transform: perspective(1000px) rotateY(-5deg) rotateX(5deg);
          transition: transform 0.5s ease;
        }
        .visual-glass-panel:hover {
          transform: perspective(1000px) rotateY(0deg) rotateX(0deg);
        }
        .panel-header {
          background: rgba(255, 255, 255, 0.05);
          padding: 12px 16px;
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .panel-header .dots { display: flex; gap: 6px; }
        .panel-header .dots span { width: 10px; height: 10px; border-radius: 50%; background: #475569; }
        .panel-header .dots span:nth-child(1) { background: #ef4444; }
        .panel-header .dots span:nth-child(2) { background: #eab308; }
        .panel-header .dots span:nth-child(3) { background: #22c55e; }
        .panel-header .url {
          background: rgba(0,0,0,0.2);
          border-radius: 4px;
          padding: 4px 0;
          width: 50%;
          text-align: center;
          font-size: 11px;
          color: #64748b;
          font-family: monospace;
        }
        .panel-body { padding: 32px; }
        .mockup-chart {
          display: flex;
          align-items: flex-end;
          gap: 12px;
          height: 120px;
          margin-bottom: 32px;
          border-bottom: 1px solid var(--border);
          padding-bottom: 8px;
        }
        .mockup-chart .bar {
          flex: 1;
          border-radius: 4px 4px 0 0;
          background: var(--border);
          transition: height 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .mockup-chart .bar.bar-animate {
          /* height set inline */
        }

        /* Enhancement 4: Live Indicator */
        .live-indicator {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 10px;
          font-weight: 700;
          color: #22c55e;
          letter-spacing: 1px;
          margin-left: auto;
        }
        .live-pulse-dot {
          width: 6px; height: 6px;
          background: #22c55e;
          border-radius: 50%;
          box-shadow: 0 0 8px #22c55e;
          animation: livePulse 1.5s ease-in-out infinite;
        }
        @keyframes livePulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.6); opacity: 0.5; }
        }
        .mockup-chart .bar.pos { background: linear-gradient(to top, #0f172a, #22c55e); }
        .mockup-chart .bar.neu { background: linear-gradient(to top, #0f172a, #eab308); }
        .mockup-chart .bar.neg { background: linear-gradient(to top, #0f172a, #ef4444); }
        .mockup-stats .line {
          height: 12px;
          background: var(--bg-surface);
          border-radius: 6px;
          margin-bottom: 12px;
        }
        .floating-badge {
          position: absolute;
          bottom: -20px;
          right: -20px;
          background: rgba(15, 23, 42, 0.9);
          border: 1px solid rgba(59, 130, 246, 0.5);
          backdrop-filter: blur(8px);
          padding: 12px 20px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 14px;
          font-weight: 600;
          box-shadow: 0 10px 40px rgba(0,0,0,0.5);
          animation: float 4s infinite ease-in-out;
        }
        .floating-badge svg { width: 18px; height: 18px; color: #3b82f6; }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        /* Trust Section */
        .trust-section { padding: 60px 0; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); background: rgba(255,255,255,0.01); }
        .trust-label { text-align: center; font-size: 12px; font-weight: 700; color: #475569; letter-spacing: 2px; margin: 0 0 40px; }
        .d-logos {
          display: flex;
          justify-content: center;
          gap: 60px;
          flex-wrap: wrap;
        }
        .fake-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 20px;
          font-weight: 700;
          color: #64748b;
          filter: grayscale(1);
          opacity: 0.6;
          transition: all 0.3s;
        }
        .fake-logo:hover { filter: grayscale(0); opacity: 1; color: white; }
        .fake-logo svg { width: 28px; height: 28px; color: var(--accent-blue); }

        /* Enhancement 3: Testimonial Carousel */
        .testimonial-section {
          background: rgba(255,255,255,0.01);
        }
        .testimonial-carousel {
          position: relative;
          max-width: 700px;
          margin: 0 auto;
          min-height: 240px;
        }
        .testimonial-card {
          position: absolute;
          top: 0; left: 0; right: 0;
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: 24px;
          padding: 40px;
          opacity: 0;
          transform: translateY(20px) scale(0.97);
          transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
          pointer-events: none;
        }
        .testimonial-card.testimonial-active {
          opacity: 1;
          transform: translateY(0) scale(1);
          pointer-events: auto;
        }
        .testimonial-quote {
          font-size: 18px;
          line-height: 1.7;
          color: #e2e8f0;
          font-style: italic;
          margin-bottom: 24px;
        }
        [data-theme='light'] .testimonial-quote { color: #334155 !important; }
        [data-theme='light'] .testimonial-card { background: white !important; border: 1px solid #e2e8f0 !important; }
        [data-theme='light'] .testimonial-section { background: #f8fafc; }
        [data-theme='light'] .testimonial-section h2 { color: #0f172a; }
        [data-theme='light'] .testimonial-section p { color: #475569; }
        .testimonial-author {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .testimonial-avatar {
          width: 44px; height: 44px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1, #3b82f6);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 18px;
          color: white;
        }
        .testimonial-name {
          font-weight: 600;
          font-size: 15px;
        }
        .testimonial-role {
          font-size: 13px;
          color: var(--text-muted);
        }
        .testimonial-dots {
          display: flex;
          justify-content: center;
          gap: 10px;
          position: absolute;
          bottom: -40px;
          left: 50%;
          transform: translateX(-50%);
        }
        .t-dot {
          width: 10px; height: 10px;
          border-radius: 50%;
          border: none;
          background: #334155;
          cursor: pointer;
          transition: all 0.3s;
          padding: 0;
        }
        .t-dot-active {
          background: var(--accent-purple);
          box-shadow: 0 0 10px rgba(139, 92, 246, 0.5);
          transform: scale(1.3);
        }

        /* Enhancement 7: Stagger children */
        .stagger-child {
          opacity: 0;
          transform: translateY(25px);
          transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .stagger-child.is-visible {
          opacity: 1;
          transform: translateY(0);
        }

        /* CTA Section */
        .cta-section { padding: 160px 0; }
        .cta-box {
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: 32px;
          padding: 80px 40px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .cta-glow {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at top, rgba(139, 92, 246, 0.2), transparent 60%);
          pointer-events: none;
        }
        .cta-box h2 { font-size: 40px; font-weight: 800; margin: 0 0 16px; position: relative; z-index: 1;}
        .cta-box p { font-size: 18px; color: var(--text-muted); margin: 0 auto 40px; max-width: 500px; position: relative; z-index: 1;}
        .hover-scale { transform: scale(1); transition: transform 0.2s;}
        .hover-scale:hover { transform: scale(1.05); }

        /* Footer */
        .d-footer {
          border-top: 1px solid var(--border);
          padding: 80px 0 40px;
          background: #020202;
        }
        .footer-content {
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 60px;
        }
        .footer-brand .copyright {
          color: #475569;
          font-size: 14px;
          margin-top: 24px;
        }
        .footer-links {
          display: flex;
          gap: 80px;
        }
        .link-col { display: flex; flex-direction: column; gap: 16px; }
        .link-col h4 { font-size: 14px; font-weight: 600; color: white; margin: 0 0 8px; }
        .link-col a { color: var(--text-muted); text-decoration: none; font-size: 14px; transition: color 0.2s; }
        .link-col a:hover { color: white; }

        /* Animations */
        .reveal {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .reveal.is-visible {
          opacity: 1;
          transform: translateY(0);
        }

        /* Responsive */
        @media (max-width: 900px) {
          .d-headline { font-size: 48px; }
          .d-features-grid { grid-template-columns: 1fr; }
          .split-layout { flex-direction: column; }
          .hero-spline-wrapper { width: 100%; opacity: 0.5; }
          .d-hero-content { padding: 0 20px; z-index: 2; }
          .d-nav-links { display: none; }
          .footer-links { flex-wrap: wrap; gap: 40px; }
          .hero-stats { gap: 24px; flex-wrap: wrap; }
          .stat-number { font-size: 22px; }
          .testimonial-carousel { min-height: 300px; }
          .testimonial-card { padding: 28px; }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
