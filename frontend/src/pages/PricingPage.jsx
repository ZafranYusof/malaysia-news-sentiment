import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import {
  Newspaper, Sun, Moon, Check, ChevronDown, ArrowRight, Sparkles
} from 'lucide-react';

// ── Animation Variants ──
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

const AnimatedSection = ({ children, className, variants = fadeInUp }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.section ref={ref} className={className} initial="hidden" animate={isInView ? 'visible' : 'hidden'} variants={variants}>
      {children}
    </motion.section>
  );
};

// ── Navbar ──
const Navbar = ({ isDark, toggleTheme, navigate }) => (
  <motion.nav
    className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-[#0f0f0f]/80 border-b border-[#eee] dark:border-[#2a2a2a]"
    initial={{ y: -80 }} animate={{ y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
  >
    <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white">
        <Newspaper className="w-5 h-5 text-accent" />
        <span>MY News <span className="text-accent">Sentiment</span></span>
      </Link>
      <div className="hidden md:flex items-center gap-8 text-sm text-gray-600 dark:text-gray-400">
        <Link to="/features" className="hover:text-accent transition-colors">Features</Link>
        <Link to="/pricing" className="hover:text-accent transition-colors">Pricing</Link>
        <Link to="/about" className="hover:text-accent transition-colors">About</Link>
        <Link to="/contact" className="hover:text-accent transition-colors">Contact</Link>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1a1a1a] transition-colors">
          {isDark ? <Sun className="w-4 h-4 text-gray-400" /> : <Moon className="w-4 h-4 text-gray-600" />}
        </button>
        <Link to="/login" className="hidden sm:inline-flex text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-accent transition-colors">
          Log in
        </Link>
        <motion.button
          onClick={() => navigate('/register')}
          className="px-4 py-2 text-sm font-medium text-white bg-accent rounded-lg hover:bg-blue-700 transition-colors"
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
        >
          Get Started
        </motion.button>
      </div>
    </div>
  </motion.nav>
);

// ── Footer ──
const Footer = () => (
  <footer className="border-t border-[#eee] dark:border-[#2a2a2a] bg-white dark:bg-[#0f0f0f]">
    <div className="max-w-7xl mx-auto px-6 py-16">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="md:col-span-1">
          <div className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white mb-3">
            <Newspaper className="w-5 h-5 text-accent" />
            <span>MY News Sentiment</span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">AI-powered sentiment analysis for Malaysian news.</p>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Product</h4>
          <div className="flex flex-col gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Link to="/features" className="hover:text-accent transition-colors">Features</Link>
            <Link to="/pricing" className="hover:text-accent transition-colors">Pricing</Link>
            <Link to="/api" className="hover:text-accent transition-colors">API</Link>
          </div>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Company</h4>
          <div className="flex flex-col gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Link to="/about" className="hover:text-accent transition-colors">About</Link>
            <Link to="/contact" className="hover:text-accent transition-colors">Contact</Link>
            <Link to="/jobs" className="hover:text-accent transition-colors">Careers</Link>
          </div>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Legal</h4>
          <div className="flex flex-col gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Link to="/privacy" className="hover:text-accent transition-colors">Privacy</Link>
          </div>
        </div>
      </div>
      <div className="mt-12 pt-8 border-t border-[#eee] dark:border-[#2a2a2a] text-center text-sm text-gray-400">
        © 2026 MY News Sentiment. All rights reserved.
      </div>
    </div>
  </footer>
);

const PricingPage = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const toggleTheme = () => setTheme(isDark ? 'light' : 'dark');

  const [openFaq, setOpenFaq] = useState(null);

  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: '/mo',
      desc: 'For students and researchers exploring Malaysian news sentiment.',
      features: [
        'Unlimited articles',
        'AI sentiment analysis',
        'Entity recognition',
        'Trending topics',
        'Source credibility scores',
        'Interactive dashboard',
        '7-day AI forecast',
        'CSV & PowerPoint export',
        'Regional heatmaps',
        'Crisis alerts',
      ],
      cta: 'Get Started Free',
      highlighted: true,
    },
    {
      name: 'Pro',
      price: 'Coming Soon',
      period: '',
      desc: 'Advanced features for teams and organizations. Currently in development.',
      features: [
        'Everything in Free',
        'API access',
        'Custom alerts',
        'Priority support',
        'Team collaboration',
        'Advanced analytics',
      ],
      cta: 'Join Waitlist',
      highlighted: false,
      badge: 'Coming Soon',
    },
  ];

  const faqs = [
    { q: 'Is it really free?', a: 'Yes! This is a Final Year Project (FYP) at UMPSA. All features are free to use during the research period.' },
    { q: 'What news sources are covered?', a: 'We aggregate from Malaysiakini, Astro Awani, Free Malaysia Today, Bernama, The Star, and other major Malaysian outlets via RSS and API feeds.' },
    { q: 'How accurate is the sentiment analysis?', a: 'Our multi-tier AI pipeline (GPT-4o + Malaya NLP + rule-based fallback) achieves ~95% accuracy on Malaysian news content in both BM and English.' },
    { q: 'Will there be a paid plan?', a: 'We are exploring a Pro tier with API access and team features. Join the waitlist to be notified when it launches.' },
  ];

  return (
    <div className="min-h-screen bg-[#fafaf9] dark:bg-[#0f0f0f] transition-colors">
      <Navbar isDark={isDark} toggleTheme={toggleTheme} navigate={navigate} />

      {/* ─── HERO ─── */}
      <motion.header className="relative pt-32 pb-16 px-6 text-center" initial="hidden" animate="visible" variants={staggerContainer}>
        <div className="absolute inset-0 bg-gradient-to-b from-green-50/50 to-transparent dark:from-green-950/20 dark:to-transparent" />
        <div className="relative max-w-4xl mx-auto">
          <motion.div variants={staggerItem} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Free for Everyone
          </motion.div>
          <motion.h1 variants={staggerItem} className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white leading-tight mb-6">
            Powerful analysis,{' '}
            <span className="text-accent">zero cost</span>
          </motion.h1>
          <motion.p variants={staggerItem} className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            All features are free during our research period. No credit card required, no hidden fees.
          </motion.p>
        </div>
      </motion.header>

      {/* ─── PRICING CARDS ─── */}
      <AnimatedSection className="py-12 px-6" variants={staggerContainer}>
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              className={`relative p-8 rounded-2xl border transition-all ${
                plan.highlighted
                  ? 'bg-white dark:bg-[#1a1a1a] border-accent shadow-xl shadow-accent/10'
                  : 'bg-white dark:bg-[#1a1a1a] border-[#eee] dark:border-[#2a2a2a]'
              }`}
              variants={staggerItem}
              whileHover={{ y: -6 }}
            >
              {plan.badge && (
                <span className="absolute -top-3 left-6 px-3 py-1 text-xs font-semibold text-white bg-secondary rounded-full">
                  {plan.badge}
                </span>
              )}
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{plan.name}</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">{plan.price}</span>
                {plan.period && <span className="text-gray-500 dark:text-gray-400">{plan.period}</span>}
              </div>
              <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">{plan.desc}</p>

              <div className="mt-6 h-px bg-[#eee] dark:bg-[#2a2a2a]" />

              <ul className="mt-6 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <motion.button
                onClick={() => navigate('/register')}
                className={`mt-8 w-full py-3 rounded-xl font-semibold text-sm transition-all ${
                  plan.highlighted
                    ? 'bg-accent text-white shadow-lg shadow-accent/25 hover:shadow-accent/40'
                    : 'border border-[#eee] dark:border-[#2a2a2a] text-gray-700 dark:text-gray-300 hover:border-accent hover:text-accent'
                }`}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              >
                {plan.cta} <ArrowRight className="inline w-4 h-4 ml-1" />
              </motion.button>
            </motion.div>
          ))}
        </div>
      </AnimatedSection>

      {/* ─── FAQ ─── */}
      <AnimatedSection className="py-20 px-6" variants={fadeInUp}>
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">Frequently Asked Questions</h2>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-10">Everything you need to know.</p>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className={`border rounded-xl overflow-hidden transition-colors ${
                  openFaq === i ? 'border-accent/50' : 'border-[#eee] dark:border-[#2a2a2a]'
                }`}
              >
                <button
                  className="w-full flex items-center justify-between p-5 text-left"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <div className="px-5 pb-5 text-sm text-gray-500 dark:text-gray-400">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      <Footer />
    </div>
  );
};

export default PricingPage;
