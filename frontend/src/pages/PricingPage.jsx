import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const PricingPage = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);

  /* ── Scroll-reveal with stagger ── */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('pp-visible');
            entry.target.querySelectorAll('.pp-stagger').forEach((child, i) => {
              child.style.transitionDelay = `${i * 120}ms`;
              child.classList.add('pp-visible');
            });
          }
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll('.pp-reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  /* ── Card radial hover ── */
  const handleCardHover = useCallback((e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--mx', `${x}px`);
    card.style.setProperty('--my', `${y}px`);
  }, []);

  /* ── Scroll to top on mount ── */
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: '/mo',
      desc: 'For students and researchers exploring Malaysian news sentiment.',
      features: [
        '100 articles / day',
        'Basic sentiment analysis',
        '1 user seat',
        '7-day data retention',
        'Community support',
      ],
      cta: 'Start Free',
      highlighted: false,
    },
    {
      name: 'Pro',
      price: '$29',
      period: '/mo',
      desc: 'For analysts and teams who need deeper intelligence and forecasting.',
      features: [
        'Unlimited articles',
        'AI-powered daily digest',
        '7-day sentiment forecast',
        'Priority support',
        'CSV & PDF export',
        'Regional heatmaps',
      ],
      cta: 'Start Free',
      highlighted: true,
      badge: 'Recommended',
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      desc: 'For organizations requiring custom integrations and dedicated infrastructure.',
      features: [
        'Custom API access',
        'Dedicated account manager',
        'SLA guarantee (99.9%)',
        'On-premise deployment',
        'Custom LLM fine-tuning',
        'SSO & audit logs',
      ],
      cta: 'Contact Sales',
      highlighted: false,
    },
  ];

  const faqs = [
    {
      q: 'Can I switch plans later?',
      a: 'Absolutely. You can upgrade or downgrade at any time. Changes take effect immediately and billing is prorated.',
    },
    {
      q: 'What news sources are covered?',
      a: 'We aggregate from Malaysiakini, Astro Awani, Free Malaysia Today, Bernama, The Star, and other major Malaysian outlets via RSS and API feeds.',
    },
    {
      q: 'How accurate is the sentiment analysis?',
      a: 'Our multi-tier AI pipeline (GPT-4o + Malaya NLP + rule-based fallback) achieves ~95% accuracy on Malaysian news content in both BM and English.',
    },
    {
      q: 'Is there a free trial for Pro?',
      a: 'Yes — every new account starts with a 14-day Pro trial. No credit card required. You will automatically move to the Free plan if you do not upgrade.',
    },
  ];

  return (
    <div className="pp-root">
      <style>{`
        /* ═══ Variables ═══ */
        .pp-root {
          --pp-bg: #1D1F27;
          --pp-surface: #252730;
          --pp-surface-hover: #2C2E38;
          --pp-border: rgba(255,255,255,0.08);
          --pp-text: #EEEFE9;
          --pp-muted: #9BA1B0;
          --pp-brand: #4D7AFF;
          --pp-brand-hover: #5588FF;
          --pp-font: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        /* ═══ Base ═══ */
        .pp-root {
          background: var(--pp-bg);
          color: var(--pp-text);
          font-family: var(--pp-font);
          min-height: 100vh;
          overflow-x: hidden;
          line-height: 1.6;
        }
        .pp-root * { box-sizing: border-box; margin: 0; padding: 0; }
        .pp-root a { color: inherit; text-decoration: none; }

        /* ═══ Navbar ═══ */
        .pp-navbar {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 100;
          background: rgba(29,31,39,0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--pp-border);
          height: 64px;
        }
        .pp-nav-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .pp-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 17px;
          font-weight: 700;
          color: var(--pp-text);
          white-space: nowrap;
          cursor: pointer;
        }
        .pp-nav-links {
          display: flex;
          gap: 28px;
        }
        .pp-nav-links a {
          color: var(--pp-muted);
          font-size: 14px;
          font-weight: 500;
          transition: color 0.2s;
        }
        .pp-nav-links a:hover { color: #fff; }
        .pp-nav-actions {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .pp-btn-ghost {
          color: var(--pp-muted);
          font-size: 14px;
          font-weight: 600;
          background: none;
          border: none;
          cursor: pointer;
          font-family: var(--pp-font);
          transition: color 0.2s;
        }
        .pp-btn-ghost:hover { color: #fff; }
        .pp-btn-primary {
          background: var(--pp-brand);
          color: #fff;
          border: none;
          padding: 10px 22px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 14px;
          font-family: var(--pp-font);
          cursor: pointer;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .pp-btn-primary:hover {
          background: var(--pp-brand-hover);
          transform: translateY(-1px);
          box-shadow: 0 4px 20px rgba(29,74,255,0.35);
        }

        /* ═══ Container ═══ */
        .pp-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
        }

        /* ═══ Hero ═══ */
        .pp-hero {
          padding: 140px 24px 80px;
          text-align: center;
        }
        .pp-badge {
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
        .pp-hero h1 {
          font-size: clamp(36px, 5vw, 56px);
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -0.03em;
          color: #fff;
          margin-bottom: 20px;
        }
        .pp-hero h1 span {
          background: linear-gradient(135deg, var(--pp-brand) 0%, #6B8AFF 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .pp-hero p {
          font-size: 18px;
          color: var(--pp-muted);
          max-width: 560px;
          margin: 0 auto;
          line-height: 1.7;
        }

        /* ═══ Pricing Grid ═══ */
        .pp-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          padding: 0 24px 100px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .pp-card {
          background: var(--pp-surface);
          border: 1px solid var(--pp-border);
          border-radius: 20px;
          padding: 44px 36px;
          position: relative;
          transition: transform 0.35s cubic-bezier(0.16,1,0.3,1), border-color 0.3s, box-shadow 0.3s;
          overflow: hidden;
        }
        .pp-card::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 20px;
          background: radial-gradient(400px circle at var(--mx, 50%) var(--my, 50%), rgba(29,74,255,0.06), transparent 70%);
          opacity: 0;
          transition: opacity 0.3s;
          pointer-events: none;
        }
        .pp-card:hover::before { opacity: 1; }
        .pp-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 48px rgba(0,0,0,0.35);
        }
        .pp-card-highlighted {
          border-color: #EEEFE9;
          box-shadow: 0 0 0 1px var(--pp-brand), 0 8px 32px rgba(29,74,255,0.15);
        }
        .pp-card-highlighted:hover {
          border-color: var(--pp-brand-hover);
          box-shadow: 0 0 0 1px var(--pp-brand-hover), 0 16px 48px rgba(29,74,255,0.25);
        }
        .pp-recommend-badge {
          position: absolute;
          top: 20px;
          right: 24px;
          background: var(--pp-brand);
          color: #fff;
          padding: 4px 14px;
          border-radius: 99px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .pp-plan-name {
          font-size: 14px;
          font-weight: 700;
          color: #EEEFE9;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          margin-bottom: 16px;
        }
        .pp-price-row {
          display: flex;
          align-items: baseline;
          gap: 4px;
          margin-bottom: 8px;
        }
        .pp-price {
          font-size: 48px;
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.03em;
        }
        .pp-period {
          font-size: 16px;
          color: var(--pp-muted);
          font-weight: 500;
        }
        .pp-card-desc {
          font-size: 15px;
          color: var(--pp-muted);
          line-height: 1.6;
          margin-bottom: 32px;
        }
        .pp-divider {
          height: 1px;
          background: var(--pp-border);
          margin-bottom: 32px;
        }
        .pp-feature-list {
          list-style: none;
          margin-bottom: 40px;
        }
        .pp-feature-list li {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 15px;
          font-weight: 500;
          color: var(--pp-text);
          margin-bottom: 16px;
        }
        .pp-check {
          width: 20px;
          height: 20px;
          flex-shrink: 0;
          color: #EEEFE9;
        }
        .pp-card-cta {
          width: 100%;
          padding: 14px;
          border-radius: 10px;
          font-weight: 700;
          font-size: 15px;
          font-family: var(--pp-font);
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .pp-cta-filled {
          background: var(--pp-brand);
          color: #fff;
          border: none;
        }
        .pp-cta-filled:hover {
          background: var(--pp-brand-hover);
          transform: translateY(-1px);
          box-shadow: 0 4px 20px rgba(29,74,255,0.35);
        }
        .pp-cta-outline {
          background: transparent;
          color: var(--pp-text);
          border: 1px solid rgba(255,255,255,0.15);
        }
        .pp-cta-outline:hover {
          border-color: rgba(255,255,255,0.3);
          background: rgba(255,255,255,0.04);
          transform: translateY(-1px);
        }

        /* ═══ FAQ Section ═══ */
        .pp-faq-section {
          padding: 80px 24px 120px;
          max-width: 760px;
          margin: 0 auto;
        }
        .pp-faq-header {
          text-align: center;
          margin-bottom: 48px;
        }
        .pp-faq-header h2 {
          font-size: clamp(28px, 3.5vw, 36px);
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.02em;
          margin-bottom: 12px;
        }
        .pp-faq-header p {
          font-size: 16px;
          color: var(--pp-muted);
        }
        .pp-faq-item {
          border: 1px solid var(--pp-border);
          border-radius: 14px;
          margin-bottom: 12px;
          overflow: hidden;
          background: var(--pp-surface);
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .pp-faq-item-open {
          border-color: rgba(29,74,255,0.25);
          box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        }
        .pp-faq-btn {
          width: 100%;
          padding: 20px 24px;
          background: none;
          border: none;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          text-align: left;
          font-family: var(--pp-font);
        }
        .pp-faq-btn span {
          font-weight: 600;
          font-size: 15px;
          color: var(--pp-text);
        }
        .pp-faq-chevron {
          color: var(--pp-muted);
          transition: transform 0.3s;
          flex-shrink: 0;
        }
        .pp-faq-chevron-open {
          transform: rotate(180deg);
        }
        .pp-faq-answer {
          padding: 0 24px 20px;
          color: var(--pp-muted);
          font-size: 14px;
          line-height: 1.7;
        }

        /* ═══ Footer ═══ */
        .pp-footer {
          border-top: 1px solid var(--pp-border);
          padding: 48px 0 32px;
          background: #16181F;
        }
        .pp-footer-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 24px;
        }
        .pp-footer-copy {
          color: #555;
          font-size: 13px;
        }
        .pp-footer-links {
          display: flex;
          gap: 24px;
        }
        .pp-footer-links a {
          color: var(--pp-muted);
          font-size: 13px;
          font-weight: 500;
          transition: color 0.2s;
        }
        .pp-footer-links a:hover { color: #fff; }

        /* ═══ Reveal Animations ═══ */
        .pp-reveal {
          opacity: 0;
          transform: translateY(28px);
          transition: all 0.7s cubic-bezier(0.16,1,0.3,1);
        }
        .pp-reveal.pp-visible {
          opacity: 1;
          transform: translateY(0);
        }
        .pp-stagger {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.6s cubic-bezier(0.16,1,0.3,1), transform 0.6s cubic-bezier(0.16,1,0.3,1);
        }
        .pp-stagger.pp-visible {
          opacity: 1;
          transform: translateY(0);
        }

        /* ═══ Responsive ═══ */
        @media (max-width: 1024px) {
          .pp-grid { grid-template-columns: 1fr; max-width: 480px; }
        }
        @media (max-width: 768px) {
          .pp-nav-links { display: none; }
          .pp-hero { padding: 110px 20px 60px; }
          .pp-hero h1 { font-size: 32px; }
          .pp-grid { padding: 0 20px 80px; }
          .pp-card { padding: 36px 28px; }
          .pp-faq-section { padding: 60px 20px 80px; }
          .pp-footer-inner { flex-direction: column; text-align: center; }
        }
      `}</style>

      {/* ═══ NAVBAR ═══ */}
      <nav className="pp-navbar">
        <div className="pp-nav-inner">
          <div className="pp-logo" onClick={() => navigate('/')}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4D7AFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            <span>MY News <b>Sentiment</b></span>
          </div>
          <div className="pp-nav-links">
            <Link to="/features">Features</Link>
            <Link to="/pricing">Pricing</Link>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
          </div>
          <div className="pp-nav-actions">
            <Link to="/login" className="pp-btn-ghost">Log In</Link>
            <button className="pp-btn-primary" onClick={() => navigate('/register')}>Get Started Free</button>
          </div>
        </div>
      </nav>

      {/* ═══ HERO ═══ */}
      <header className="pp-hero pp-reveal">
        <div className="pp-badge">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          Transparent Pricing
        </div>
        <h1>Intelligence that <span>scales with you</span></h1>
        <p>Start free, upgrade when you need more. No hidden fees, no surprises — just powerful Malaysian news sentiment analysis.</p>
      </header>

      {/* ═══ PRICING CARDS ═══ */}
      <div className="pp-grid pp-reveal">
        {plans.map((plan, i) => (
          <div
            key={plan.name}
            className={`pp-card pp-stagger ${plan.highlighted ? 'pp-card-highlighted' : ''}`}
            style={{ transitionDelay: `${i * 120}ms` }}
            onMouseMove={handleCardHover}
          >
            {plan.badge && <div className="pp-recommend-badge">{plan.badge}</div>}
            <div className="pp-plan-name">{plan.name}</div>
            <div className="pp-price-row">
              <span className="pp-price">{plan.price}</span>
              {plan.period && <span className="pp-period">{plan.period}</span>}
            </div>
            <p className="pp-card-desc">{plan.desc}</p>
            <div className="pp-divider" />
            <ul className="pp-feature-list">
              {plan.features.map((f) => (
                <li key={f}>
                  <svg className="pp-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            <button
              className={`pp-card-cta ${plan.highlighted ? 'pp-cta-filled' : 'pp-cta-outline'}`}
              onClick={() => navigate(plan.name === 'Enterprise' ? '/contact' : '/register')}
            >
              {plan.cta}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* ═══ FAQ ═══ */}
      <section className="pp-faq-section pp-reveal">
        <div className="pp-faq-header">
          <h2>Frequently Asked Questions</h2>
          <p>Everything you need to know about our plans.</p>
        </div>
        {faqs.map((faq, i) => (
          <div key={i} className={`pp-faq-item ${openFaq === i ? 'pp-faq-item-open' : ''}`}>
            <button className="pp-faq-btn" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
              <span>{faq.q}</span>
              <svg className={`pp-faq-chevron ${openFaq === i ? 'pp-faq-chevron-open' : ''}`} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {openFaq === i && <div className="pp-faq-answer">{faq.a}</div>}
          </div>
        ))}
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="pp-footer">
        <div className="pp-footer-inner">
          <div className="pp-footer-copy">© {new Date().getFullYear()} MY News Sentiment. All rights reserved.</div>
          <div className="pp-footer-links">
            <Link to="/features">Features</Link>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/privacy">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PricingPage;
