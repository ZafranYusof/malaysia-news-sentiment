import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const AboutPage = () => {
  const navigate = useNavigate();

  /* ── Scroll-reveal ── */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('ap-visible');
            entry.target.querySelectorAll('.ap-stagger').forEach((child, i) => {
              child.style.transitionDelay = `${i * 120}ms`;
              child.classList.add('ap-visible');
            });
          }
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll('.ap-reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  /* ── Animated counters ── */
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
        sources: Math.round(targets.sources * eased),
      });
      if (step >= steps) clearInterval(timer);
    }, interval);
    return () => clearInterval(timer);
  }, [statsVisible]);

  /* ── Card hover ── */
  const handleCardHover = useCallback((e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    card.style.setProperty('--my', `${e.clientY - rect.top}px`);
  }, []);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const techStack = [
    { name: 'React', icon: <svg viewBox="0 0 24 24" width="36" height="36" fill="#61DAFB"><circle cx="12" cy="12" r="2.2"/><ellipse cx="12" cy="12" rx="10" ry="4" fill="none" stroke="#61DAFB" strokeWidth="1"/><ellipse cx="12" cy="12" rx="10" ry="4" fill="none" stroke="#61DAFB" strokeWidth="1" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" fill="none" stroke="#61DAFB" strokeWidth="1" transform="rotate(120 12 12)"/></svg>, desc: 'Frontend UI framework' },
    { name: 'Node.js', icon: <svg viewBox="0 0 24 24" width="36" height="36" fill="#68A063"><path d="M12 2L3 7v10l9 5 9-5V7l-9-5zm0 2.18L18.36 7.5 12 10.82 5.64 7.5 12 4.18zM5 9.06l6 3.33v6.55l-6-3.33V9.06zm8 9.88v-6.55l6-3.33v6.55l-6 3.33z"/></svg>, desc: 'Backend runtime' },
    { name: 'MongoDB', icon: <svg viewBox="0 0 24 24" width="36" height="36" fill="#47A248"><path d="M12 2C9.24 2 7 4.24 7 7c0 2.85 3.17 7.42 4.56 9.3a.52.52 0 00.88 0C13.83 14.42 17 9.85 17 7c0-2.76-2.24-5-5-5zm0 7a2 2 0 110-4 2 2 0 010 4z"/><path d="M11.5 17h1v5h-1z" fill="#47A248"/></svg>, desc: 'NoSQL database' },
    { name: 'Python', icon: <svg viewBox="0 0 24 24" width="36" height="36"><path d="M12 2c-1.66 0-3 .34-3 2v2h6v1H7.5C5.57 7 4 8.57 4 10.5v3C4 15.43 5.57 17 7.5 17H9v-2.5c0-1.38 1.12-2.5 2.5-2.5h5c.83 0 1.5-.67 1.5-1.5v-5C18 3.57 15.43 2 12 2zm-1.5 2a.75.75 0 110 1.5.75.75 0 010-1.5z" fill="#3776AB"/><path d="M12 22c1.66 0 3-.34 3-2v-2h-6v-1h7.5c1.93 0 3.5-1.57 3.5-3.5v-3C20 8.57 18.43 7 16.5 7H15v2.5c0 1.38-1.12 2.5-2.5 2.5h-5c-.83 0-1.5.67-1.5 1.5v5C6 20.43 8.57 22 12 22zm1.5-2a.75.75 0 110-1.5.75.75 0 010 1.5z" fill="#FFD43B"/></svg>, desc: 'ML pipeline' },
    { name: 'Malaya NLP', icon: <svg viewBox="0 0 24 24" width="36" height="36"><rect x="2" y="6" width="20" height="12" rx="1" fill="#CC0001"/><rect x="2" y="6" width="20" height="6" fill="#fff"/><rect x="2" y="6" width="10" height="12" fill="#010066"/><circle cx="6.5" cy="12" r="2.5" fill="#FC0"/><path d="M6.5 9.5l.6 1.8h1.9l-1.5 1.1.6 1.8-1.6-1.1-1.6 1.1.6-1.8-1.5-1.1h1.9z" fill="#FC0"/></svg>, desc: 'BM language processing' },
    { name: 'GPT-4o', icon: <svg viewBox="0 0 24 24" width="36" height="36" fill="none"><rect x="3" y="3" width="18" height="18" rx="4" fill="#10A37F"/><path d="M12 7v4m0 0v4m0-4h4m-4 0H8" stroke="#fff" strokeWidth="2" strokeLinecap="round"/><circle cx="8" cy="8" r="1" fill="#fff"/><circle cx="16" cy="8" r="1" fill="#fff"/><path d="M9 16c0 0 1.5 1 3 1s3-1 3-1" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/></svg>, desc: 'AI sentiment engine' },
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
    <div className="ap-root">
      <style>{`
        /* ═══ Variables ═══ */
        .ap-root {
          --ap-bg: #1D1F27;
          --ap-surface: #252730;
          --ap-border: rgba(255,255,255,0.08);
          --ap-text: #EEEFE9;
          --ap-muted: #9BA1B0;
          --ap-brand: #4D7AFF;
          --ap-brand-hover: #5588FF;
          --ap-font: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .ap-root {
          background: var(--ap-bg);
          color: var(--ap-text);
          font-family: var(--ap-font);
          min-height: 100vh;
          overflow-x: hidden;
          line-height: 1.6;
        }
        .ap-root * { box-sizing: border-box; margin: 0; padding: 0; }
        .ap-root a { color: inherit; text-decoration: none; }

        /* ═══ Navbar ═══ */
        .ap-navbar {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 100;
          background: rgba(29,31,39,0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--ap-border);
          height: 64px;
        }
        .ap-nav-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .ap-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 17px;
          font-weight: 700;
          color: var(--ap-text);
          white-space: nowrap;
          cursor: pointer;
        }
        .ap-nav-links { display: flex; gap: 28px; }
        .ap-nav-links a { color: var(--ap-muted); font-size: 14px; font-weight: 500; transition: color 0.2s; }
        .ap-nav-links a:hover { color: #fff; }
        .ap-nav-actions { display: flex; align-items: center; gap: 16px; }
        .ap-btn-ghost { color: var(--ap-muted); font-size: 14px; font-weight: 600; background: none; border: none; cursor: pointer; font-family: var(--ap-font); transition: color 0.2s; }
        .ap-btn-ghost:hover { color: #fff; }
        .ap-btn-primary {
          background: var(--ap-brand); color: #fff; border: none; padding: 10px 22px;
          border-radius: 8px; font-weight: 600; font-size: 14px; font-family: var(--ap-font);
          cursor: pointer; transition: all 0.2s; display: inline-flex; align-items: center;
        }
        .ap-btn-primary:hover { background: var(--ap-brand-hover); transform: translateY(-1px); box-shadow: 0 4px 20px rgba(29,74,255,0.35); }

        .ap-container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }

        /* ═══ Hero / Mission ═══ */
        .ap-hero {
          padding: 140px 24px 80px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .ap-hero-glow {
          position: absolute;
          top: -40%; left: 50%;
          transform: translateX(-50%);
          width: 700px; height: 500px;
          background: radial-gradient(circle, rgba(29,74,255,0.1), transparent 70%);
          pointer-events: none;
        }
        .ap-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(29,74,255,0.1);
          border: 1px solid rgba(29,74,255,0.25);
          padding: 6px 16px;
          border-radius: 99px;
          font-size: 13px;
          font-weight: 600;
          color: #8DA4FF;
          margin-bottom: 28px;
          position: relative;
        }
        .ap-hero h1 {
          font-size: clamp(36px, 5vw, 56px);
          font-weight: 800;
          line-height: 1.15;
          letter-spacing: -0.03em;
          color: #fff;
          margin-bottom: 24px;
          position: relative;
        }
        .ap-hero h1 span {
          background: linear-gradient(135deg, var(--ap-brand) 0%, #6B8AFF 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .ap-hero > p {
          font-size: 18px;
          color: var(--ap-muted);
          max-width: 620px;
          margin: 0 auto;
          line-height: 1.7;
          position: relative;
        }

        /* ═══ Stats Bar ═══ */
        .ap-stats-bar {
          background: var(--ap-surface);
          border: 1px solid var(--ap-border);
          border-radius: 20px;
          padding: 48px 40px;
          display: flex;
          justify-content: center;
          gap: 64px;
          margin: 0 auto 100px;
          max-width: 800px;
          position: relative;
          overflow: hidden;
        }
        .ap-stats-bar::before {
          content: '';
          position: absolute;
          top: 0; right: 0; bottom: 0; left: 0;
          background: radial-gradient(circle at 70% 30%, rgba(29,74,255,0.06), transparent 70%);
          pointer-events: none;
        }
        .ap-stat { text-align: center; position: relative; }
        .ap-stat-num { display: block; font-size: 40px; font-weight: 800; color: #fff; margin-bottom: 4px; }
        .ap-stat-label { font-size: 13px; color: var(--ap-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; }
        .ap-stat-divider { width: 1px; height: 60px; background: var(--ap-border); align-self: center; }

        /* ═══ Section ═══ */
        .ap-section { padding: 80px 0; }
        .ap-section-alt { background: rgba(255,255,255,0.015); }
        .ap-section-header { text-align: center; margin-bottom: 56px; }
        .ap-section-tag {
          font-size: 12px; font-weight: 700; letter-spacing: 2.5px;
          color: #EEEFE9; margin-bottom: 12px; text-transform: uppercase;
        }
        .ap-section-header h2 {
          font-size: clamp(28px, 3.5vw, 36px); font-weight: 800;
          color: #fff; letter-spacing: -0.02em; margin-bottom: 12px;
        }
        .ap-section-header p { font-size: 16px; color: var(--ap-muted); max-width: 520px; margin: 0 auto; }

        /* ═══ Tech Stack Grid ═══ */
        .ap-tech-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        .ap-tech-card {
          background: var(--ap-surface);
          border: 1px solid var(--ap-border);
          border-radius: 16px;
          padding: 32px 28px;
          text-align: center;
          transition: transform 0.35s cubic-bezier(0.16,1,0.3,1), border-color 0.3s, box-shadow 0.3s;
          position: relative;
          overflow: hidden;
        }
        .ap-tech-card::before {
          content: '';
          position: absolute; inset: 0; border-radius: 16px;
          background: radial-gradient(300px circle at var(--mx, 50%) var(--my, 50%), rgba(29,74,255,0.06), transparent 70%);
          opacity: 0; transition: opacity 0.3s; pointer-events: none;
        }
        .ap-tech-card:hover::before { opacity: 1; }
        .ap-tech-card:hover {
          transform: translateY(-4px);
          border-color: rgba(29,74,255,0.25);
          box-shadow: 0 12px 40px rgba(0,0,0,0.3);
        }
        .ap-tech-icon { margin-bottom: 14px; display: flex; align-items: center; justify-content: center; width: 48px; height: 48px; margin-left: auto; margin-right: auto; }
        .ap-tech-card h3 { font-size: 16px; font-weight: 700; color: #fff; margin-bottom: 6px; }
        .ap-tech-card p { font-size: 13px; color: var(--ap-muted); }

        /* ═══ Team Grid ═══ */
        .ap-team-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        .ap-team-card {
          background: var(--ap-surface);
          border: 1px solid var(--ap-border);
          border-radius: 16px;
          padding: 40px 28px;
          text-align: center;
          transition: transform 0.35s cubic-bezier(0.16,1,0.3,1), border-color 0.3s;
        }
        .ap-team-card:hover {
          transform: translateY(-4px);
          border-color: rgba(29,74,255,0.25);
        }
        .ap-team-avatar {
          width: 64px; height: 64px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--ap-brand), #6B8AFF);
          display: flex; align-items: center; justify-content: center;
          font-weight: 800; font-size: 20px; color: #fff;
          margin: 0 auto 18px;
          box-shadow: 0 4px 16px rgba(29,74,255,0.3);
        }
        .ap-team-card h3 { font-size: 16px; font-weight: 700; color: #fff; margin-bottom: 4px; }
        .ap-team-card p { font-size: 13px; color: var(--ap-muted); font-weight: 500; }

        /* ═══ Timeline ═══ */
        .ap-timeline {
          position: relative;
          max-width: 700px;
          margin: 0 auto;
          padding-left: 40px;
        }
        .ap-timeline::before {
          content: '';
          position: absolute;
          left: 15px; top: 8px; bottom: 8px;
          width: 2px;
          background: linear-gradient(to bottom, var(--ap-brand), rgba(29,74,255,0.1));
        }
        .ap-tl-item {
          position: relative;
          padding: 0 0 48px 32px;
        }
        .ap-tl-item:last-child { padding-bottom: 0; }
        .ap-tl-dot {
          position: absolute;
          left: -25px; top: 6px;
          width: 12px; height: 12px;
          border-radius: 50%;
          background: var(--ap-brand);
          border: 3px solid var(--ap-bg);
          box-shadow: 0 0 0 2px var(--ap-brand);
        }
        .ap-tl-date {
          font-size: 12px; font-weight: 700; color: #EEEFE9;
          text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px;
        }
        .ap-tl-item h3 { font-size: 17px; font-weight: 700; color: #fff; margin-bottom: 6px; }
        .ap-tl-item p { font-size: 14px; color: var(--ap-muted); line-height: 1.6; }

        /* ═══ Built At Banner ═══ */
        .ap-built-banner {
          background: var(--ap-surface);
          border: 1px solid var(--ap-border);
          border-radius: 20px;
          padding: 48px 40px;
          text-align: center;
          max-width: 700px;
          margin: 80px auto 0;
          position: relative;
          overflow: hidden;
        }
        .ap-built-banner::before {
          content: '';
          position: absolute;
          top: -60%; left: 50%; transform: translateX(-50%);
          width: 500px; height: 350px;
          background: radial-gradient(circle, rgba(29,74,255,0.1), transparent 70%);
          pointer-events: none;
        }
        .ap-built-banner h3 {
          font-size: 22px; font-weight: 800; color: #fff;
          margin-bottom: 12px; position: relative;
        }
        .ap-built-banner p {
          font-size: 15px; color: var(--ap-muted); line-height: 1.7;
          max-width: 480px; margin: 0 auto; position: relative;
        }
        .ap-umpsa-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(29,74,255,0.1); border: 1px solid rgba(29,74,255,0.2);
          padding: 8px 20px; border-radius: 99px;
          font-size: 14px; font-weight: 600; color: #8DA4FF;
          margin-top: 24px; position: relative;
        }

        /* ═══ Footer ═══ */
        .ap-footer {
          border-top: 1px solid var(--ap-border);
          padding: 48px 0 32px;
          background: #16181F;
          margin-top: 100px;
        }
        .ap-footer-inner {
          max-width: 1200px; margin: 0 auto; padding: 0 24px;
          display: flex; justify-content: space-between; align-items: center;
          flex-wrap: wrap; gap: 24px;
        }
        .ap-footer-copy { color: #555; font-size: 13px; }
        .ap-footer-links { display: flex; gap: 24px; }
        .ap-footer-links a { color: var(--ap-muted); font-size: 13px; font-weight: 500; transition: color 0.2s; }
        .ap-footer-links a:hover { color: #fff; }

        /* ═══ Reveal ═══ */
        .ap-reveal {
          opacity: 0; transform: translateY(28px);
          transition: all 0.7s cubic-bezier(0.16,1,0.3,1);
        }
        .ap-reveal.ap-visible { opacity: 1; transform: translateY(0); }
        .ap-stagger {
          opacity: 0; transform: translateY(20px);
          transition: opacity 0.6s cubic-bezier(0.16,1,0.3,1), transform 0.6s cubic-bezier(0.16,1,0.3,1);
        }
        .ap-stagger.ap-visible { opacity: 1; transform: translateY(0); }

        /* ═══ Responsive ═══ */
        @media (max-width: 1024px) {
          .ap-tech-grid { grid-template-columns: repeat(2, 1fr); }
          .ap-team-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 768px) {
          .ap-nav-links { display: none; }
          .ap-hero { padding: 110px 20px 60px; }
          .ap-hero h1 { font-size: 32px; }
          .ap-stats-bar { flex-direction: column; gap: 28px; padding: 36px 28px; }
          .ap-stat-divider { width: 60px; height: 1px; align-self: center; }
          .ap-tech-grid { grid-template-columns: repeat(2, 1fr); gap: 14px; }
          .ap-team-grid { grid-template-columns: 1fr; max-width: 360px; margin: 0 auto; }
          .ap-section { padding: 60px 0; }
          .ap-built-banner { padding: 36px 24px; margin: 60px auto 0; }
          .ap-footer-inner { flex-direction: column; text-align: center; }
        }
      `}</style>

      {/* ═══ NAVBAR ═══ */}
      <nav className="ap-navbar">
        <div className="ap-nav-inner">
          <div className="ap-logo" onClick={() => navigate('/')}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4D7AFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            <span>MY News <b>Sentiment</b></span>
          </div>
          <div className="ap-nav-links">
            <Link to="/features">Features</Link>
            <Link to="/pricing">Pricing</Link>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
          </div>
          <div className="ap-nav-actions">
            <Link to="/login" className="ap-btn-ghost">Log In</Link>
            <button className="ap-btn-primary" onClick={() => navigate('/register')}>Get Started Free</button>
          </div>
        </div>
      </nav>

      {/* ═══ HERO / MISSION ═══ */}
      <header className="ap-hero ap-reveal">
        <div className="ap-hero-glow" />
        <div className="ap-badge">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
          About Us
        </div>
        <h1>Making Malaysian news intelligence <span>accessible to everyone</span></h1>
        <p>We're building the infrastructure to monitor, analyze, and predict news sentiment across Malaysia's multilingual media landscape — powered by cutting-edge AI.</p>
      </header>

      {/* ═══ STATS ═══ */}
      <div className="ap-container ap-reveal">
        <div className="ap-stats-bar" ref={statsRef}>
          <div className="ap-stat">
            <span className="ap-stat-num">{counters.articles.toLocaleString()}+</span>
            <span className="ap-stat-label">Articles Analyzed</span>
          </div>
          <div className="ap-stat-divider" />
          <div className="ap-stat">
            <span className="ap-stat-num">{counters.accuracy}%</span>
            <span className="ap-stat-label">AI Accuracy</span>
          </div>
          <div className="ap-stat-divider" />
          <div className="ap-stat">
            <span className="ap-stat-num">{counters.sources}</span>
            <span className="ap-stat-label">News Sources</span>
          </div>
        </div>
      </div>

      {/* ═══ TECH STACK ═══ */}
      <section className="ap-section ap-section-alt">
        <div className="ap-container">
          <div className="ap-section-header ap-reveal">
            <p className="ap-section-tag">Technology</p>
            <h2>Built with modern tools</h2>
            <p>A full-stack architecture designed for real-time sentiment analysis at scale.</p>
          </div>
          <div className="ap-tech-grid ap-reveal">
            {techStack.map((tech, i) => (
              <div
                key={tech.name}
                className="ap-tech-card ap-stagger"
                style={{ transitionDelay: `${i * 100}ms` }}
                onMouseMove={handleCardHover}
              >
                <span className="ap-tech-icon">{tech.icon}</span>
                <h3>{tech.name}</h3>
                <p>{tech.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TEAM ═══ */}
      <section className="ap-section">
        <div className="ap-container">
          <div className="ap-section-header ap-reveal">
            <p className="ap-section-tag">Team</p>
            <h2>The people behind the platform</h2>
            <p>A dedicated team building the future of Malaysian media intelligence.</p>
          </div>
          <div className="ap-team-grid ap-reveal">
            {team.map((member, i) => (
              <div key={member.name} className="ap-team-card ap-stagger" style={{ transitionDelay: `${i * 120}ms` }}>
                <div className="ap-team-avatar">{member.avatar}</div>
                <h3>{member.name}</h3>
                <p>{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TIMELINE ═══ */}
      <section className="ap-section ap-section-alt">
        <div className="ap-container">
          <div className="ap-section-header ap-reveal">
            <p className="ap-section-tag">Milestones</p>
            <h2>Our journey so far</h2>
            <p>From concept to a fully functional sentiment analysis platform.</p>
          </div>
          <div className="ap-timeline ap-reveal">
            {milestones.map((ms, i) => (
              <div key={i} className="ap-tl-item ap-stagger" style={{ transitionDelay: `${i * 120}ms` }}>
                <div className="ap-tl-dot" />
                <div className="ap-tl-date">{ms.date}</div>
                <h3>{ms.title}</h3>
                <p>{ms.desc}</p>
              </div>
            ))}
          </div>

          {/* Built at UMPSA */}
          <div className="ap-built-banner ap-reveal">
            <h3>🎓 Built at UMPSA</h3>
            <p>This platform is developed as a Final Year Project (FYP) at Universiti Malaysia Pahang Al-Sultan Abdullah (UMPSA), Faculty of Computing (FSKKP).</p>
            <div className="ap-umpsa-badge">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 12 3 12 0v-5"/></svg>
              UMPSA · Gambang, Pahang
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="ap-footer">
        <div className="ap-footer-inner">
          <div className="ap-footer-copy">© {new Date().getFullYear()} MY News Sentiment. All rights reserved.</div>
          <div className="ap-footer-links">
            <Link to="/features">Features</Link>
            <Link to="/pricing">Pricing</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/privacy">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AboutPage;
