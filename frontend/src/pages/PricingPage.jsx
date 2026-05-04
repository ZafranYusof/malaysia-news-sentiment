import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import ScrollToTop from '../components/ScrollToTop';
import '../scss/LandingPage.scss';
import '../scss/PricingPage.scss';

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
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
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

const PricingPage = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const toggleTheme = () => setTheme(isDark ? 'light' : 'dark');

  const [isYearly, setIsYearly] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const plans = [
    {
      name: 'Free',
      price: '$0',
      yearlyPrice: '$0',
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
      yearlyPrice: '$24',
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
      yearlyPrice: 'Custom',
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
    { q: 'Can I switch plans later?', a: 'Absolutely. You can upgrade or downgrade at any time. Changes take effect immediately and billing is prorated.' },
    { q: 'What news sources are covered?', a: 'We aggregate from Malaysiakini, Astro Awani, Free Malaysia Today, Bernama, The Star, and other major Malaysian outlets via RSS and API feeds.' },
    { q: 'How accurate is the sentiment analysis?', a: 'Our multi-tier AI pipeline (GPT-4o + Malaya NLP + rule-based fallback) achieves ~95% accuracy on Malaysian news content in both BM and English.' },
    { q: 'Is there a free trial for Pro?', a: 'Yes — every new account starts with a 14-day Pro trial. No credit card required. You will automatically move to the Free plan if you do not upgrade.' },
  ];

  return (
    <div className="ph-pricing" data-theme={isDark ? 'dark' : 'light'}>
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
      <motion.header className="ph-pricing__hero" initial="hidden" animate="visible" variants={staggerContainer}>
        <motion.div className="ph-pricing__badge" variants={staggerItem}>
          <span className="ph-pricing__badge-dot" />
          Transparent Pricing
        </motion.div>
        <motion.h1 className="ph-pricing__title" variants={staggerItem}>
          Intelligence that <span>scales with you</span>
        </motion.h1>
        <motion.p className="ph-pricing__subtitle" variants={staggerItem}>
          Start free, upgrade when you need more. No hidden fees, no surprises — just powerful Malaysian news sentiment analysis.
        </motion.p>

        {/* Toggle */}
        <motion.div className="ph-pricing__toggle" variants={staggerItem}>
          <span className={`ph-pricing__toggle-label ${!isYearly ? 'ph-pricing__toggle-label--active' : ''}`}>Monthly</span>
          <button className={`ph-pricing__toggle-switch ${isYearly ? 'ph-pricing__toggle-switch--active' : ''}`} onClick={() => setIsYearly(!isYearly)}>
            <span className="ph-pricing__toggle-knob" />
          </button>
          <span className={`ph-pricing__toggle-label ${isYearly ? 'ph-pricing__toggle-label--active' : ''}`}>Yearly</span>
          {isYearly && <span className="ph-pricing__save-badge">Save 17%</span>}
        </motion.div>
      </motion.header>

      {/* ─── PRICING CARDS ─── */}
      <AnimatedSection className="ph-pricing__grid" variants={staggerContainer}>
        {plans.map((plan, i) => (
          <motion.div
            key={plan.name}
            className={`ph-pricing__card ${plan.highlighted ? 'ph-pricing__card--highlighted' : ''}`}
            variants={staggerItem}
            whileHover={{ y: -6 }}
          >
            {plan.badge && <div className="ph-pricing__recommend-badge">{plan.badge}</div>}
            <div className="ph-pricing__plan-name">{plan.name}</div>
            <div className="ph-pricing__price-row">
              <span className="ph-pricing__price">{isYearly ? plan.yearlyPrice : plan.price}</span>
              {plan.period && <span className="ph-pricing__period">{plan.period}</span>}
            </div>
            <p className="ph-pricing__card-desc">{plan.desc}</p>
            <div className="ph-pricing__divider" />
            <ul className="ph-pricing__feature-list">
              {plan.features.map((f) => (
                <li key={f}>
                  <svg className="ph-pricing__check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            <motion.button
              className={`ph-pricing__card-cta ${plan.highlighted ? 'ph-pricing__card-cta--filled' : 'ph-pricing__card-cta--outline'}`}
              onClick={() => navigate(plan.name === 'Enterprise' ? '/contact' : '/register')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {plan.cta} →
            </motion.button>
          </motion.div>
        ))}
      </AnimatedSection>

      {/* ─── FAQ ─── */}
      <AnimatedSection className="ph-pricing__faq" variants={fadeInUp}>
        <div className="ph-pricing__faq-header">
          <h2>Frequently Asked Questions</h2>
          <p>Everything you need to know about our plans.</p>
        </div>
        {faqs.map((faq, i) => (
          <motion.div
            key={i}
            className={`ph-pricing__faq-item ${openFaq === i ? 'ph-pricing__faq-item--open' : ''}`}
            initial={false}
            animate={{ borderColor: openFaq === i ? 'var(--ph-accent)' : 'var(--ph-border)' }}
          >
            <button className="ph-pricing__faq-btn" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
              <span>{faq.q}</span>
              <svg className={`ph-pricing__faq-chevron ${openFaq === i ? 'ph-pricing__faq-chevron--open' : ''}`} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            <AnimatePresence>
              {openFaq === i && (
                <motion.div
                  className="ph-pricing__faq-answer"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                  {faq.a}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
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

export default PricingPage;
