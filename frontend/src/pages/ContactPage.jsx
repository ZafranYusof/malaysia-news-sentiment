import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const ContactPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  /* ── Scroll-reveal ── */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('cp-visible');
            entry.target.querySelectorAll('.cp-stagger').forEach((child, i) => {
              child.style.transitionDelay = `${i * 120}ms`;
              child.classList.add('cp-visible');
            });
          }
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll('.cp-reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setSubmitted(false), 5000);
    }, 1200);
  };

  /* ── Card hover ── */
  const handleCardHover = useCallback((e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    card.style.setProperty('--my', `${e.clientY - rect.top}px`);
  }, []);

  const contactInfo = [
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
        </svg>
      ),
      title: 'Email',
      detail: 'support@mynewssentiment.com',
      sub: 'We reply within 24 hours',
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
        </svg>
      ),
      title: 'Location',
      detail: 'UMPSA, Gambang, Pahang',
      sub: 'Universiti Malaysia Pahang Al-Sultan Abdullah',
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
      ),
      title: 'Office Hours',
      detail: 'Mon – Fri, 9AM – 5PM',
      sub: 'Malaysia Time (MYT / GMT+8)',
    },
  ];

  const socials = [
    { name: 'GitHub', href: '#', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg> },
    { name: 'LinkedIn', href: '#', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg> },
    { name: 'Twitter / X', href: '#', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
  ];

  return (
    <div className="cp-root">
      <style>{`
        /* ═══ Variables ═══ */
        .cp-root {
          --cp-bg: #1D1F27;
          --cp-surface: #252730;
          --cp-border: rgba(255,255,255,0.08);
          --cp-text: #EEEFE9;
          --cp-muted: #9BA1B0;
          --cp-brand: #4D7AFF;
          --cp-brand-hover: #5588FF;
          --cp-font: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .cp-root {
          background: var(--cp-bg);
          color: var(--cp-text);
          font-family: var(--cp-font);
          min-height: 100vh;
          overflow-x: hidden;
          line-height: 1.6;
        }
        .cp-root * { box-sizing: border-box; margin: 0; padding: 0; }
        .cp-root a { color: inherit; text-decoration: none; }

        /* ═══ Navbar ═══ */
        .cp-navbar {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 100;
          background: rgba(29,31,39,0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--cp-border);
          height: 64px;
        }
        .cp-nav-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .cp-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 17px;
          font-weight: 700;
          color: var(--cp-text);
          white-space: nowrap;
          cursor: pointer;
        }
        .cp-nav-links { display: flex; gap: 28px; }
        .cp-nav-links a { color: var(--cp-muted); font-size: 14px; font-weight: 500; transition: color 0.2s; }
        .cp-nav-links a:hover { color: #fff; }
        .cp-nav-actions { display: flex; align-items: center; gap: 16px; }
        .cp-btn-ghost { color: var(--cp-muted); font-size: 14px; font-weight: 600; background: none; border: none; cursor: pointer; font-family: var(--cp-font); transition: color 0.2s; }
        .cp-btn-ghost:hover { color: #fff; }
        .cp-btn-primary-nav {
          background: var(--cp-brand); color: #fff; border: none; padding: 10px 22px;
          border-radius: 8px; font-weight: 600; font-size: 14px; font-family: var(--cp-font);
          cursor: pointer; transition: all 0.2s; display: inline-flex; align-items: center;
        }
        .cp-btn-primary-nav:hover { background: var(--cp-brand-hover); transform: translateY(-1px); box-shadow: 0 4px 20px rgba(29,74,255,0.35); }

        .cp-container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }

        /* ═══ Hero ═══ */
        .cp-hero {
          padding: 140px 24px 80px;
          text-align: center;
        }
        .cp-badge {
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
        }
        .cp-hero h1 {
          font-size: clamp(36px, 5vw, 56px);
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -0.03em;
          color: #fff;
          margin-bottom: 20px;
        }
        .cp-hero h1 span {
          background: linear-gradient(135deg, var(--cp-brand) 0%, #6B8AFF 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .cp-hero > p {
          font-size: 18px;
          color: var(--cp-muted);
          max-width: 520px;
          margin: 0 auto;
          line-height: 1.7;
        }

        /* ═══ Contact Info Cards ═══ */
        .cp-info-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 80px;
        }
        .cp-info-card {
          background: var(--cp-surface);
          border: 1px solid var(--cp-border);
          border-radius: 16px;
          padding: 32px 28px;
          text-align: center;
          transition: transform 0.35s cubic-bezier(0.16,1,0.3,1), border-color 0.3s, box-shadow 0.3s;
          position: relative;
          overflow: hidden;
        }
        .cp-info-card::before {
          content: '';
          position: absolute; inset: 0; border-radius: 16px;
          background: radial-gradient(300px circle at var(--mx, 50%) var(--my, 50%), rgba(29,74,255,0.06), transparent 70%);
          opacity: 0; transition: opacity 0.3s; pointer-events: none;
        }
        .cp-info-card:hover::before { opacity: 1; }
        .cp-info-card:hover {
          transform: translateY(-4px);
          border-color: rgba(29,74,255,0.25);
          box-shadow: 0 12px 40px rgba(0,0,0,0.3);
        }
        .cp-info-icon {
          width: 52px; height: 52px;
          background: rgba(29,74,255,0.1);
          border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 18px;
          color: #EEEFE9;
        }
        .cp-info-card h3 { font-size: 16px; font-weight: 700; color: #fff; margin-bottom: 8px; }
        .cp-info-detail { font-size: 15px; font-weight: 600; color: #EEEFE9; margin-bottom: 4px; }
        .cp-info-sub { font-size: 13px; color: var(--cp-muted); }

        /* ═══ Main Content Grid ═══ */
        .cp-main-grid {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 48px;
          margin-bottom: 80px;
        }

        /* ═══ Form ═══ */
        .cp-form-section h2 {
          font-size: 28px; font-weight: 800; color: #fff;
          margin-bottom: 8px;
        }
        .cp-form-section > p {
          color: var(--cp-muted); font-size: 15px; margin-bottom: 32px;
        }
        .cp-form { display: flex; flex-direction: column; gap: 16px; }
        .cp-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .cp-input {
          width: 100%;
          padding: 14px 18px;
          background: rgba(255,255,255,0.04);
          border: 1px solid var(--cp-border);
          border-radius: 12px;
          color: var(--cp-text);
          font-size: 15px;
          font-family: var(--cp-font);
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .cp-input::placeholder { color: #555; }
        .cp-input:focus {
          border-color: #EEEFE9;
          box-shadow: 0 0 0 3px rgba(29,74,255,0.15);
        }
        .cp-textarea {
          resize: vertical;
          min-height: 140px;
        }
        .cp-submit {
          background: var(--cp-brand);
          color: #fff;
          border: none;
          padding: 16px 32px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 16px;
          font-family: var(--cp-font);
          cursor: pointer;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: fit-content;
        }
        .cp-submit:hover {
          background: var(--cp-brand-hover);
          transform: translateY(-1px);
          box-shadow: 0 4px 20px rgba(29,74,255,0.35);
        }
        .cp-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }
        .cp-success {
          background: rgba(48,207,121,0.1);
          border: 1px solid rgba(48,207,121,0.25);
          padding: 14px 20px;
          border-radius: 12px;
          color: #30CF79;
          font-weight: 600;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        /* ═══ Social Links ═══ */
        .cp-social-section h2 {
          font-size: 28px; font-weight: 800; color: #fff;
          margin-bottom: 8px;
        }
        .cp-social-section > p {
          color: var(--cp-muted); font-size: 15px; margin-bottom: 32px;
        }
        .cp-social-list { display: flex; flex-direction: column; gap: 12px; }
        .cp-social-link {
          display: flex;
          align-items: center;
          gap: 14px;
          background: var(--cp-surface);
          border: 1px solid var(--cp-border);
          border-radius: 14px;
          padding: 18px 22px;
          transition: border-color 0.2s, transform 0.2s;
          cursor: pointer;
        }
        .cp-social-link:hover {
          border-color: rgba(29,74,255,0.3);
          transform: translateX(4px);
        }
        .cp-social-icon {
          width: 40px; height: 40px;
          background: rgba(29,74,255,0.1);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          color: #EEEFE9;
          flex-shrink: 0;
        }
        .cp-social-name { font-weight: 600; font-size: 15px; color: #fff; }
        .cp-social-handle { font-size: 13px; color: var(--cp-muted); }
        .cp-social-arrow {
          margin-left: auto;
          color: var(--cp-muted);
          transition: transform 0.2s;
        }
        .cp-social-link:hover .cp-social-arrow { transform: translateX(4px); }

        /* ═══ Map placeholder ═══ */
        .cp-map-section {
          margin-top: 40px;
          background: var(--cp-surface);
          border: 1px solid var(--cp-border);
          border-radius: 16px;
          padding: 40px;
          text-align: center;
        }
        .cp-map-section h3 { font-size: 18px; font-weight: 700; color: #fff; margin-bottom: 8px; }
        .cp-map-section p { font-size: 14px; color: var(--cp-muted); margin-bottom: 20px; }
        .cp-map-placeholder {
          background: rgba(29,74,255,0.05);
          border: 1px dashed rgba(29,74,255,0.2);
          border-radius: 12px;
          height: 180px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--cp-muted);
          font-size: 14px;
          font-weight: 500;
        }

        /* ═══ Footer ═══ */
        .cp-footer {
          border-top: 1px solid var(--cp-border);
          padding: 48px 0 32px;
          background: #16181F;
          margin-top: 100px;
        }
        .cp-footer-inner {
          max-width: 1200px; margin: 0 auto; padding: 0 24px;
          display: flex; justify-content: space-between; align-items: center;
          flex-wrap: wrap; gap: 24px;
        }
        .cp-footer-copy { color: #555; font-size: 13px; }
        .cp-footer-links { display: flex; gap: 24px; }
        .cp-footer-links a { color: var(--cp-muted); font-size: 13px; font-weight: 500; transition: color 0.2s; }
        .cp-footer-links a:hover { color: #fff; }

        /* ═══ Reveal ═══ */
        .cp-reveal {
          opacity: 0; transform: translateY(28px);
          transition: all 0.7s cubic-bezier(0.16,1,0.3,1);
        }
        .cp-reveal.cp-visible { opacity: 1; transform: translateY(0); }
        .cp-stagger {
          opacity: 0; transform: translateY(20px);
          transition: opacity 0.6s cubic-bezier(0.16,1,0.3,1), transform 0.6s cubic-bezier(0.16,1,0.3,1);
        }
        .cp-stagger.cp-visible { opacity: 1; transform: translateY(0); }

        /* ═══ Responsive ═══ */
        @media (max-width: 1024px) {
          .cp-main-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 768px) {
          .cp-nav-links { display: none; }
          .cp-hero { padding: 110px 20px 60px; }
          .cp-hero h1 { font-size: 32px; }
          .cp-info-grid { grid-template-columns: 1fr; max-width: 400px; margin-left: auto; margin-right: auto; }
          .cp-form-row { grid-template-columns: 1fr; }
          .cp-main-grid { gap: 60px; }
          .cp-footer-inner { flex-direction: column; text-align: center; }
        }
      `}</style>

      {/* ═══ NAVBAR ═══ */}
      <nav className="cp-navbar">
        <div className="cp-nav-inner">
          <div className="cp-logo" onClick={() => navigate('/')}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4D7AFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            <span>MY News <b>Sentiment</b></span>
          </div>
          <div className="cp-nav-links">
            <Link to="/features">Features</Link>
            <Link to="/pricing">Pricing</Link>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
          </div>
          <div className="cp-nav-actions">
            <Link to="/login" className="cp-btn-ghost">Log In</Link>
            <button className="cp-btn-primary-nav" onClick={() => navigate('/register')}>Get Started Free</button>
          </div>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <header className="cp-hero cp-reveal">
        <div className="cp-badge">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          Get In Touch
        </div>
        <h1>Let's <span>connect</span></h1>
        <p>Have questions about the platform? Need help with integration? We'd love to hear from you.</p>
      </header>

      {/* ═══ CONTACT INFO CARDS ═══ */}
      <div className="cp-container cp-reveal">
        <div className="cp-info-grid">
          {contactInfo.map((info, i) => (
            <div
              key={info.title}
              className="cp-info-card cp-stagger"
              style={{ transitionDelay: `${i * 120}ms` }}
              onMouseMove={handleCardHover}
            >
              <div className="cp-info-icon">{info.icon}</div>
              <h3>{info.title}</h3>
              <div className="cp-info-detail">{info.detail}</div>
              <div className="cp-info-sub">{info.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ FORM + SOCIAL ═══ */}
      <div className="cp-container">
        <div className="cp-main-grid">
          {/* Contact Form */}
          <div className="cp-form-section cp-reveal">
            <h2>Send us a message</h2>
            <p>Fill out the form and we'll get back to you within 24 hours.</p>

            {submitted && (
              <div className="cp-success">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                Message sent successfully! We'll reply within 24 hours.
              </div>
            )}

            <form className="cp-form" onSubmit={handleSubmit}>
              <div className="cp-form-row">
                <input
                  className="cp-input"
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                />
                <input
                  className="cp-input"
                  type="email"
                  name="email"
                  placeholder="Your Email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <input
                className="cp-input"
                type="text"
                name="subject"
                placeholder="Subject"
                required
                value={formData.subject}
                onChange={handleChange}
              />
              <textarea
                className="cp-input cp-textarea"
                name="message"
                placeholder="Your Message"
                required
                value={formData.message}
                onChange={handleChange}
              />
              <button className="cp-submit" type="submit" disabled={sending}>
                {sending ? (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                    Sending...
                  </>
                ) : (
                  <>
                    Send Message
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Social Links + Map */}
          <div className="cp-social-section cp-reveal">
            <h2>Connect with us</h2>
            <p>Follow us on social media for updates and news.</p>

            <div className="cp-social-list">
              {socials.map((social) => (
                <a key={social.name} href={social.href} className="cp-social-link" target="_blank" rel="noopener noreferrer">
                  <div className="cp-social-icon">{social.icon}</div>
                  <div>
                    <div className="cp-social-name">{social.name}</div>
                    <div className="cp-social-handle">@mynewssentiment</div>
                  </div>
                  <svg className="cp-social-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </a>
              ))}
            </div>

            {/* Map Placeholder */}
            <div className="cp-map-section">
              <h3>📍 Find Us</h3>
              <p>UMPSA Gambang Campus, 26300 Gambang, Pahang, Malaysia</p>
              <div className="cp-map-placeholder">
                <span>🗺️ Map integration coming soon</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ FOOTER ═══ */}
      <footer className="cp-footer">
        <div className="cp-footer-inner">
          <div className="cp-footer-copy">© {new Date().getFullYear()} MY News Sentiment. All rights reserved.</div>
          <div className="cp-footer-links">
            <Link to="/features">Features</Link>
            <Link to="/pricing">Pricing</Link>
            <Link to="/about">About</Link>
            <Link to="/privacy">Privacy</Link>
          </div>
        </div>
      </footer>

      {/* Spinner keyframe for submit button */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default ContactPage;
