import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { motion, useInView, useScroll, useTransform, AnimatePresence, useMotionValue, useSpring, useReducedMotion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  BarChart3, Network, TrendingUp, ShieldCheck, Brain, FileDown,
  Search, Zap, LineChart, Sun, Moon, ArrowRight, Play, Newspaper,
  ChevronRight, Star, Globe, Clock, X, Plus, Check
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
const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};
const slideFromLeft = {
  hidden: { opacity: 0, x: -80 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
};
const slideFromRight = {
  hidden: { opacity: 0, x: 80 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
};

// ── Floating Particles ──
const FloatingParticles = ({ count = 30 }) => {
  const particles = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 20 + 15,
      delay: Math.random() * 5,
    })), [count]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-accent/20 dark:bg-accent/10"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
          animate={{
            y: [0, -30, 0, 20, 0],
            x: [0, 15, -10, 5, 0],
            opacity: [0.3, 0.7, 0.4, 0.8, 0.3],
          }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
};

// ── Gradient Orbs ──
const GradientOrbs = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <motion.div
      className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-blue-400/20 to-purple-500/10 blur-3xl"
      animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
      transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
    />
    <motion.div
      className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-accent/15 to-teal-400/10 blur-3xl"
      animate={{ scale: [1.1, 1, 1.1], opacity: [0.4, 0.2, 0.4] }}
      transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
    />
    <motion.div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-pink-400/10 to-orange-400/5 blur-3xl"
      animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
      transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
    />
  </div>
);

// ── Mouse Follow Gradient ──
const MouseFollowGradient = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { stiffness: 50, damping: 30 });
  const smoothY = useSpring(mouseY, { stiffness: 50, damping: 30 });

  useEffect(() => {
    const handleMouse = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  return (
    <motion.div
      className="absolute w-[600px] h-[600px] rounded-full bg-accent/5 blur-3xl pointer-events-none"
      style={{ x: smoothX, y: smoothY, translateX: '-50%', translateY: '-50%' }}
    />
  );
};

// ── Live Sentiment Demo ──
const LiveSentimentDemo = () => {
  const headlines = [
    { text: "Malaysia's GDP grows 5.2% in Q1 2026", sentiment: 'Positive', score: 0.87, color: '#22c55e' },
    { text: "Ringgit weakens against USD amid global uncertainty", sentiment: 'Negative', score: 0.72, color: '#ef4444' },
    { text: "New MRT line construction on schedule", sentiment: 'Neutral', score: 0.51, color: '#f59e0b' },
    { text: "Tech sector sees record foreign investment", sentiment: 'Positive', score: 0.91, color: '#22c55e' },
  ];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState('typing'); // typing, analyzing, result
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    const headline = headlines[currentIndex];
    let timeout;

    if (phase === 'typing') {
      if (displayText.length < headline.text.length) {
        timeout = setTimeout(() => {
          setDisplayText(headline.text.substring(0, displayText.length + 1));
        }, 30);
      } else {
        timeout = setTimeout(() => setPhase('analyzing'), 500);
      }
    } else if (phase === 'analyzing') {
      timeout = setTimeout(() => setPhase('result'), 1500);
    } else if (phase === 'result') {
      timeout = setTimeout(() => {
        setPhase('typing');
        setDisplayText('');
        setCurrentIndex((prev) => (prev + 1) % headlines.length);
      }, 3000);
    }

    return () => clearTimeout(timeout);
  }, [phase, displayText, currentIndex]);

  const headline = headlines[currentIndex];

  return (
    <motion.div
      className="mt-12 max-w-xl mx-auto bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur-xl border border-[#eee] dark:border-[#2a2a2a] rounded-2xl p-6 shadow-2xl shadow-black/5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.2, duration: 0.8 }}
    >
      <div className="flex items-center gap-2 mb-3">
        <motion.div
          className="w-2 h-2 rounded-full bg-green-400"
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <span className="text-xs text-gray-400 font-medium">Live Analysis</span>
      </div>
      <div className="min-h-[60px]">
        <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
          {displayText}
          <motion.span
            className="inline-block w-0.5 h-4 bg-accent ml-0.5 align-middle"
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          />
        </p>
      </div>
      <AnimatePresence mode="wait">
        {phase === 'analyzing' && (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 flex items-center gap-2"
          >
            <motion.div
              className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
            />
            <span className="text-xs text-accent font-medium">Analyzing sentiment...</span>
          </motion.div>
        )}
        {phase === 'result' && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="mt-3 flex items-center gap-3"
          >
            <motion.span
              className="px-3 py-1 rounded-full text-xs font-bold text-white"
              style={{ backgroundColor: headline.color }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            >
              {headline.sentiment}
            </motion.span>
            <motion.span
              className="text-sm font-bold text-gray-700 dark:text-gray-300"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              Score: {headline.score.toFixed(2)}
            </motion.span>
            <motion.div
              className="flex-1 h-2 bg-gray-100 dark:bg-[#2a2a2a] rounded-full overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: headline.color }}
                initial={{ width: 0 }}
                animate={{ width: `${headline.score * 100}%` }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ── Animated Counter ──
const AnimatedCounter = ({ target, suffix = '', prefix = '' }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const [count, setCount] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!isInView) return;
    const duration = 2000, steps = 60, interval = duration / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = Math.min(step / steps, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setCount(Math.round(target * eased));
      if (step >= steps) {
        clearInterval(timer);
        setDone(true);
      }
    }, interval);
    return () => clearInterval(timer);
  }, [isInView, target]);

  return (
    <motion.span
      ref={ref}
      className="text-3xl font-bold text-gray-900 dark:text-white"
      animate={done ? { scale: [1, 1.1, 1] } : {}}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {prefix}{count.toLocaleString()}{suffix}
    </motion.span>
  );
};

// ── 3D Tilt Card ──
const TiltCard = ({ children, className }) => {
  const ref = useRef(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const smoothRotateX = useSpring(rotateX, { stiffness: 150, damping: 20 });
  const smoothRotateY = useSpring(rotateY, { stiffness: 150, damping: 20 });

  const handleMouse = (e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    rotateX.set(-y * 10);
    rotateY.set(x * 10);
  };

  const handleLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ rotateX: smoothRotateX, rotateY: smoothRotateY, perspective: 1000, transformStyle: 'preserve-3d' }}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
    >
      {children}
    </motion.div>
  );
};

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

// ── FAQ Item with AnimatePresence ──
const FAQItem = ({ question, answer, index }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      className={`bg-white dark:bg-[#1a1a1a] border rounded-xl overflow-hidden transition-colors ${isOpen ? 'border-accent/50 border-l-4 border-l-accent' : 'border-[#eee] dark:border-[#2a2a2a]'}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-6 py-4 cursor-pointer text-sm font-medium text-gray-900 dark:text-white hover:bg-[#f8f8f8] dark:hover:bg-[#222] transition-colors text-left"
      >
        {question}
        <motion.span
          className="text-accent flex-shrink-0 ml-4"
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <Plus className="w-4 h-4" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className="px-6 pb-4 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ── Navbar ──
const Navbar = ({ isDark, toggleTheme, navigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-paper/90 dark:bg-paper-dark/90 border-b-2 border-ink dark:border-paper"
        initial={{ y: -80 }} animate={{ y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-baseline gap-2 no-underline">
            <span className="font-display font-bold text-lg text-ink dark:text-paper leading-none">MY News <span className="italic text-accent">Sentiment</span></span>
            <span className="hidden sm:inline text-[10px] tracking-[0.18em] text-ink-muted dark:text-ink-faint uppercase">· Est. 2026</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-[13px] tracking-wider uppercase text-ink-muted dark:text-ink-faint">
            <a href="#features" className="hover:text-accent transition-colors">Features</a>
            <Link to="/api" className="hover:text-accent transition-colors">Docs</Link>
            <Link to="/pricing" className="hover:text-accent transition-colors">Pricing</Link>
            <Link to="/about" className="hover:text-accent transition-colors">About</Link>
            <Link to="/contact" className="hover:text-accent transition-colors">Contact</Link>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="p-2 rounded-sm hover:bg-ink/5 dark:hover:bg-paper/10 transition-colors">
              {isDark ? <Sun className="w-4 h-4 text-ink-faint" /> : <Moon className="w-4 h-4 text-ink-muted" />}
            </button>
            <Link to="/login" className="hidden sm:inline-flex text-sm font-medium text-ink dark:text-paper hover:text-accent transition-colors">
              Log in
            </Link>
            <motion.button
              onClick={() => navigate('/register')}
              className="hidden sm:inline-flex px-4 py-2 text-sm font-semibold text-paper bg-ink dark:bg-paper dark:text-ink hover:bg-accent dark:hover:bg-accent dark:hover:text-paper transition-colors"
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            >
              Subscribe
            </motion.button>
            {/* Hamburger button - mobile only */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1a1a1a] transition-colors"
              aria-label="Toggle menu"
            >
              <AnimatePresence mode="wait">
                {mobileMenuOpen ? (
                  <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  </motion.div>
                ) : (
                  <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-40 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            {/* Menu panel */}
            <motion.div
              className="absolute top-16 left-0 right-0 bg-white dark:bg-[#0f0f0f] border-b border-[#eee] dark:border-[#2a2a2a] shadow-xl"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex flex-col px-6 py-4 space-y-1">
                {[
                  { label: 'Features', href: '#features', isAnchor: true },
                  { label: 'Docs', to: '/api' },
                  { label: 'Pricing', to: '/pricing' },
                  { label: 'About', to: '/about' },
                  { label: 'Contact', to: '/contact' },
                ].map((item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.3 }}
                  >
                    {item.isAnchor ? (
                      <a
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="block py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-accent transition-colors"
                      >
                        {item.label}
                      </a>
                    ) : (
                      <Link
                        to={item.to}
                        onClick={() => setMobileMenuOpen(false)}
                        className="block py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-accent transition-colors"
                      >
                        {item.label}
                      </Link>
                    )}
                  </motion.div>
                ))}
                <motion.div
                  className="pt-3 mt-2 border-t border-[#eee] dark:border-[#2a2a2a] flex flex-col gap-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25 }}
                >
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-accent transition-colors"
                  >
                    Log in
                  </Link>
                  <button
                    onClick={() => { setMobileMenuOpen(false); navigate('/register'); }}
                    className="w-full py-3 text-sm font-semibold text-white bg-accent rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    Get Started
                  </button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

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

// ── Sentiment Bar ──
const SentimentBar = ({ label, value, color, delay }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  return (
    <div className="flex items-center gap-3" ref={ref}>
      <span className="text-sm font-medium text-gray-600 dark:text-gray-400 w-20">{label}</span>
      <div className="flex-1 h-3 bg-gray-100 dark:bg-[#2a2a2a] rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={isInView ? { width: `${value}%` } : { width: 0 }}
          transition={{ duration: 1.2, delay, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
      <motion.span
        className="text-sm font-semibold text-gray-700 dark:text-gray-300 w-10 text-right"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.5, delay: delay + 0.8 }}
      >
        {value}%
      </motion.span>
    </div>
  );
};

// ── Animated Connecting Line ──
const AnimatedLine = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <div ref={ref} className="hidden md:block absolute top-16 left-[20%] right-[20%] h-0.5 overflow-hidden">
      <motion.div
        className="h-full bg-gradient-to-r from-accent/20 via-accent to-accent/20"
        initial={{ scaleX: 0 }}
        animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
        style={{ transformOrigin: 'left' }}
      />
    </div>
  );
};

// ── Pulse Ring ──
const PulseRing = ({ color = 'accent' }) => (
  <motion.div
    className="absolute inset-0 rounded-xl border-2 border-accent/30"
    animate={{ scale: [1, 1.3, 1.3], opacity: [0.5, 0, 0] }}
    transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
  />
);

// ── Shimmer Button ──
const ShimmerButton = ({ children, onClick, className }) => (
  <motion.button
    onClick={onClick}
    className={`relative overflow-hidden ${className}`}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.97 }}
  >
    <motion.div
      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
      animate={{ x: ['-200%', '200%'] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1 }}
    />
    {children}
  </motion.button>
);

// ── Floating Tech Badge ──
const FloatingTechBadge = ({ tech, index, total }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltips = {
    'React': 'Frontend UI Library',
    'Express': 'Backend API Framework',
    'MongoDB': 'NoSQL Database',
    'Ollama': 'Local LLM Runtime',
    'NLP': 'Natural Language Processing',
    'Tailwind': 'Utility-First CSS',
    'Framer Motion': 'Animation Library',
  };

  return (
    <motion.div
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <motion.span
        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] rounded-xl inline-block cursor-default"
        animate={{
          y: [0, -8, 0, 5, 0],
        }}
        transition={{
          duration: 4 + index * 0.5,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: index * 0.3,
        }}
        whileHover={{ scale: 1.15, borderColor: '#2563eb', zIndex: 10 }}
      >
        {tech}
      </motion.span>
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.9 }}
            className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs rounded-lg whitespace-nowrap z-20"
          >
            {tooltips[tech] || tech}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ── Tech Stack Marquee ──
const TECH_ITEMS = [
  { name: 'React', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg', color: '#61DAFB' },
  { name: 'Express', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg', color: '#ffffff' },
  { name: 'MongoDB', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg', color: '#47A248' },
  { name: 'Node.js', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg', color: '#339933' },
  { name: 'Tailwind', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg', color: '#06B6D4' },
  { name: 'Python', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg', color: '#3776AB' },
  { name: 'Vite', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vitejs/vitejs-original.svg', color: '#646CFF' },
  { name: 'Docker', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg', color: '#2496ED' },
];

const TechStackMarquee = () => {
  // Duplicate items for seamless loop
  const items = [...TECH_ITEMS, ...TECH_ITEMS];

  return (
    <div className="relative overflow-hidden">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[#fafaf9] dark:from-[#0f0f0f] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#fafaf9] dark:from-[#0f0f0f] to-transparent z-10 pointer-events-none" />
      
      <motion.div
        className="flex gap-5 py-4"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
      >
        {items.map((tech, i) => (
          <div
            key={`${tech.name}-${i}`}
            className="flex-shrink-0 flex items-center gap-3 px-5 py-3 bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] rounded-xl shadow-sm hover:shadow-md hover:border-accent/50 transition-all cursor-default group"
          >
            <img
              src={tech.icon}
              alt={tech.name}
              className="w-7 h-7 group-hover:scale-110 transition-transform"
              loading="lazy"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">{tech.name}</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

// ── Continuous Analysis Demo (Detailed Pipeline) ──
const DEMO_HEADLINES = [
  { text: "Malaysia's GDP grows 5.2% in Q1 2026", source: 'The Star', sentiment: 'Positive', score: 0.87, color: '#22c55e', tokens: ['malaysia', 'gdp', 'grows', '5.2%', 'q1', '2026'], entities: ['Malaysia', 'GDP'], keywords: ['grows', 'economic growth'] },
  { text: "Ringgit weakens against USD amid global uncertainty", source: 'Malaysiakini', sentiment: 'Negative', score: 0.72, color: '#ef4444', tokens: ['ringgit', 'weakens', 'usd', 'global', 'uncertainty'], entities: ['Ringgit', 'USD'], keywords: ['weakens', 'uncertainty'] },
  { text: "New MRT line construction ahead of schedule", source: 'Bernama', sentiment: 'Neutral', score: 0.51, color: '#f59e0b', tokens: ['new', 'mrt', 'line', 'construction', 'ahead', 'schedule'], entities: ['MRT'], keywords: ['construction', 'schedule'] },
  { text: "Tech sector sees record RM4.2B foreign investment", source: 'FMT', sentiment: 'Positive', score: 0.91, color: '#22c55e', tokens: ['tech', 'sector', 'record', 'rm4.2b', 'foreign', 'investment'], entities: ['Tech Sector', 'RM4.2B'], keywords: ['record', 'investment'] },
  { text: "Flood warning issued for east coast states", source: 'Astro Awani', sentiment: 'Negative', score: 0.68, color: '#ef4444', tokens: ['flood', 'warning', 'issued', 'east', 'coast', 'states'], entities: ['East Coast'], keywords: ['flood', 'warning'] },
];

const PIPELINE_STEPS = [
  { id: 'fetch', label: 'Fetching Article', icon: '🌐', detail: 'GET /api/news' },
  { id: 'extract', label: 'Extracting Text', icon: '📄', detail: 'Parsing HTML content' },
  { id: 'tokenize', label: 'Tokenizing', icon: '✂️', detail: 'Word segmentation' },
  { id: 'nlp', label: 'NLP Model', icon: '🧠', detail: 'Running transformer' },
  { id: 'score', label: 'Scoring', icon: '📊', detail: 'Calculating confidence' },
  { id: 'classify', label: 'Classifying', icon: '🏷️', detail: 'Assigning sentiment' },
];

const ContinuousAnalysisDemo = () => {
  const [analyzedArticles, setAnalyzedArticles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState('fetch'); // fetch, extract, tokenize, nlp, score, classify, result
  const [pipelineStep, setPipelineStep] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [stats, setStats] = useState({ positive: 0, negative: 0, neutral: 0, total: 0 });
  const [showTokens, setShowTokens] = useState(false);
  const [showEntities, setShowEntities] = useState(false);
  const resultHandled = useRef(false);

  const headline = DEMO_HEADLINES[currentIndex];

  useEffect(() => {
    let timeout;
    const stepDurations = { fetch: 2500, extract: 3500, tokenize: 4200, nlp: 6000, score: 4000, classify: 2500 };

    if (phase === 'fetch') {
      resultHandled.current = false;
      setPipelineStep(0);
      setShowTokens(false);
      setShowEntities(false);
      // Type out the headline during fetch
      if (displayText.length < headline.text.length) {
        timeout = setTimeout(() => {
          setDisplayText(headline.text.substring(0, displayText.length + 1));
        }, 85);
      } else {
        timeout = setTimeout(() => setPhase('extract'), 1500);
      }
    } else if (phase === 'extract') {
      setPipelineStep(1);
      timeout = setTimeout(() => setPhase('tokenize'), stepDurations.extract);
    } else if (phase === 'tokenize') {
      setPipelineStep(2);
      setShowTokens(true);
      timeout = setTimeout(() => setPhase('nlp'), stepDurations.tokenize);
    } else if (phase === 'nlp') {
      setPipelineStep(3);
      timeout = setTimeout(() => setPhase('score'), stepDurations.nlp);
    } else if (phase === 'score') {
      setPipelineStep(4);
      setShowEntities(true);
      timeout = setTimeout(() => setPhase('classify'), stepDurations.score);
    } else if (phase === 'classify') {
      setPipelineStep(5);
      timeout = setTimeout(() => setPhase('result'), stepDurations.classify);
    } else if (phase === 'result') {
      if (!resultHandled.current) {
        resultHandled.current = true;
        setAnalyzedArticles(prev => [{ ...headline, id: `${currentIndex}-${Date.now()}` }, ...prev].slice(0, 4));
        setStats(prev => ({
          total: prev.total + 1,
          positive: prev.positive + (headline.sentiment === 'Positive' ? 1 : 0),
          negative: prev.negative + (headline.sentiment === 'Negative' ? 1 : 0),
          neutral: prev.neutral + (headline.sentiment === 'Neutral' ? 1 : 0),
        }));
      }
      timeout = setTimeout(() => {
        setPhase('fetch');
        setDisplayText('');
        setCurrentIndex((prev) => (prev + 1) % DEMO_HEADLINES.length);
      }, 5500);
    }
    return () => clearTimeout(timeout);
  }, [phase, displayText, currentIndex, headline]);

  const totalAnalyzed = stats.total || 1;
  const posPercent = Math.round((stats.positive / totalAnalyzed) * 100);
  const negPercent = Math.round((stats.negative / totalAnalyzed) * 100);
  const neuPercent = 100 - posPercent - negPercent;

  return (
    <motion.div
      className="bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] rounded-2xl overflow-hidden shadow-xl shadow-black/5"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      {/* Window chrome */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[#eee] dark:border-[#2a2a2a]">
        <span className="w-3 h-3 rounded-full bg-red-400" />
        <span className="w-3 h-3 rounded-full bg-yellow-400" />
        <span className="w-3 h-3 rounded-full bg-green-400" />
        <span className="ml-4 text-xs text-gray-400 flex-1">MY News Sentiment — Analysis Pipeline</span>
        <motion.div className="w-2 h-2 rounded-full bg-green-400" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
        <span className="text-[10px] text-gray-400 ml-1">Live</span>
      </div>

      <div className="p-5 sm:p-6">
        {/* Pipeline steps indicator */}
        <div className="flex items-center gap-1 mb-5 overflow-x-auto pb-1">
          {PIPELINE_STEPS.map((step, i) => (
            <div key={step.id} className="flex items-center">
              <motion.div
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-medium whitespace-nowrap transition-all ${
                  i < pipelineStep ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' :
                  i === pipelineStep && phase !== 'result' ? 'bg-accent/10 text-accent ring-1 ring-accent/30' :
                  i === pipelineStep && phase === 'result' ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' :
                  'bg-gray-100 dark:bg-[#222] text-gray-400'
                }`}
                animate={i === pipelineStep && phase !== 'result' ? { scale: [1, 1.05, 1] } : {}}
                transition={{ duration: 0.8, repeat: Infinity }}
              >
                <span>{step.icon}</span>
                <span className="hidden sm:inline">{step.label}</span>
              </motion.div>
              {i < PIPELINE_STEPS.length - 1 && (
                <motion.div
                  className={`w-3 h-0.5 mx-0.5 rounded-full ${
                    i < pipelineStep ? 'bg-emerald-400' : 'bg-gray-200 dark:bg-[#333]'
                  }`}
                  animate={i === pipelineStep - 1 ? { backgroundColor: '#22c55e' } : {}}
                />
              )}
            </div>
          ))}
        </div>

        {/* Main analysis area */}
        <div className="bg-gray-50 dark:bg-[#111] rounded-xl p-4 mb-4 min-h-[160px]">
          {/* Source + headline */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] px-2 py-0.5 bg-accent/10 text-accent rounded font-medium">{headline.source}</span>
            <span className="text-[10px] text-gray-400">Article #{stats.total + 1}</span>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300 font-medium mb-3">
            {displayText || headline.text}
            {phase === 'fetch' && displayText.length < headline.text.length && (
              <motion.span className="inline-block w-0.5 h-4 bg-accent ml-0.5 align-middle" animate={{ opacity: [1, 0] }} transition={{ duration: 0.5, repeat: Infinity }} />
            )}
          </p>

          {/* Pipeline detail view */}
          <AnimatePresence mode="wait">
            {phase === 'extract' && (
              <motion.div key="extract" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <motion.div className="w-3 h-3 border-2 border-accent border-t-transparent rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.6, repeat: Infinity, ease: 'linear' }} />
                  <span className="text-xs text-accent font-medium">Extracting text content from HTML...</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {['<html>', '<head>', '<title>', '<meta>', '<body>', '<article>', '<p>'].map((tag, i) => (
                    <motion.span key={tag} className="text-[10px] px-2 py-0.5 bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded font-mono" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.2 }}>
                      {tag}
                    </motion.span>
                  ))}
                </div>
                <div className="space-y-1">
                  <motion.div className="flex items-center gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
                    <span className="text-[10px] text-gray-400">Removing ads & nav...</span>
                    <motion.span className="text-[10px] text-emerald-500" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}>✓ Clean</motion.span>
                  </motion.div>
                  <motion.div className="flex items-center gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}>
                    <span className="text-[10px] text-gray-400">Extracting article body...</span>
                    <motion.span className="text-[10px] text-emerald-500" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }}>✓ {headline.text.split(' ').length * 12} chars</motion.span>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {phase === 'tokenize' && showTokens && (
              <motion.div key="tokenize" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-2.5">
                <span className="text-xs text-accent font-medium">✂️ Tokenizing & preprocessing...</span>
                <div className="space-y-2">
                  <motion.div className="flex items-center gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <span className="text-[10px] text-gray-400">Lowercasing...</span>
                    <motion.span className="text-[10px] text-emerald-500" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>✓</motion.span>
                  </motion.div>
                  <motion.div className="flex items-center gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                    <span className="text-[10px] text-gray-400">Removing stopwords...</span>
                    <motion.span className="text-[10px] text-emerald-500" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>✓ Removed {Math.floor(Math.random() * 3) + 2} words</motion.span>
                  </motion.div>
                  <motion.div className="flex items-center gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.0 }}>
                    <span className="text-[10px] text-gray-400">Word segmentation...</span>
                    <motion.span className="text-[10px] text-emerald-500" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}>✓ {headline.tokens.length} tokens</motion.span>
                  </motion.div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {headline.tokens.map((token, i) => (
                    <motion.span
                      key={token}
                      className="text-[11px] px-2 py-1 bg-purple-100 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300 rounded-md font-mono border border-purple-200 dark:border-purple-500/20"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1.5 + i * 0.15, type: 'spring', stiffness: 300 }}
                    >
                      {token}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            )}

            {phase === 'nlp' && (
              <motion.div key="nlp" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <motion.div className="w-3 h-3 border-2 border-purple-500 border-t-transparent rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.5, repeat: Infinity, ease: 'linear' }} />
                  <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">🧠 Running sentiment transformer model...</span>
                </div>
                <motion.div className="text-[10px] text-gray-400 font-mono bg-gray-100 dark:bg-[#0a0a0a] rounded px-2 py-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                  Model: nlp-sentiment-v2 | Params: 110M | Device: GPU
                </motion.div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-400 w-24">1. Embedding</span>
                    <div className="flex-1 h-2 bg-gray-200 dark:bg-[#2a2a2a] rounded-full overflow-hidden">
                      <motion.div className="h-full bg-purple-500 rounded-full" initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: 0.8 }} />
                    </div>
                    <motion.span className="text-[9px] text-emerald-500" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>✓</motion.span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-400 w-24">2. Self-Attention</span>
                    <div className="flex-1 h-2 bg-gray-200 dark:bg-[#2a2a2a] rounded-full overflow-hidden">
                      <motion.div className="h-full bg-purple-500 rounded-full" initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: 1.0, delay: 0.8 }} />
                    </div>
                    <motion.span className="text-[9px] text-emerald-500" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.9 }}>✓</motion.span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-400 w-24">3. Feed-Forward</span>
                    <div className="flex-1 h-2 bg-gray-200 dark:bg-[#2a2a2a] rounded-full overflow-hidden">
                      <motion.div className="h-full bg-purple-500 rounded-full" initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: 0.8, delay: 1.8 }} />
                    </div>
                    <motion.span className="text-[9px] text-emerald-500" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.7 }}>✓</motion.span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-400 w-24">4. Softmax</span>
                    <div className="flex-1 h-2 bg-gray-200 dark:bg-[#2a2a2a] rounded-full overflow-hidden">
                      <motion.div className="h-full bg-purple-500 rounded-full" initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: 0.6, delay: 2.7 }} />
                    </div>
                    <motion.span className="text-[9px] text-emerald-500" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3.4 }}>✓</motion.span>
                  </div>
                </div>
                <motion.div className="text-[10px] text-gray-400" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3.2 }}>
                  Inference time: ~{(Math.random() * 50 + 80).toFixed(0)}ms
                </motion.div>
              </motion.div>
            )}

            {phase === 'score' && (
              <motion.div key="score" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-2.5">
                <span className="text-xs text-accent font-medium">📊 Calculating confidence scores...</span>
                <motion.div className="text-[10px] text-gray-400" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                  Applying softmax normalization to logits...
                </motion.div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Positive', val: headline.sentiment === 'Positive' ? headline.score : (Math.random() * 0.2 + 0.05).toFixed(2), color: 'text-emerald-600', barColor: '#22c55e' },
                    { label: 'Negative', val: headline.sentiment === 'Negative' ? headline.score : (Math.random() * 0.2 + 0.05).toFixed(2), color: 'text-red-500', barColor: '#ef4444' },
                    { label: 'Neutral', val: headline.sentiment === 'Neutral' ? headline.score : (Math.random() * 0.2 + 0.05).toFixed(2), color: 'text-amber-500', barColor: '#f59e0b' },
                  ].map((s, i) => (
                    <motion.div key={s.label} className="text-center p-2.5 bg-white dark:bg-[#1a1a1a] rounded-lg border border-[#eee] dark:border-[#2a2a2a]" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.25 }}>
                      <div className="text-[10px] text-gray-400 mb-1">{s.label}</div>
                      <div className={`text-base font-bold ${s.color}`}>{s.val}</div>
                      <div className="h-1 bg-gray-100 dark:bg-[#2a2a2a] rounded-full mt-1.5 overflow-hidden">
                        <motion.div className="h-full rounded-full" style={{ backgroundColor: s.barColor }} initial={{ width: '0%' }} animate={{ width: `${s.val * 100}%` }} transition={{ duration: 0.6, delay: 0.8 + i * 0.2 }} />
                      </div>
                    </motion.div>
                  ))}
                </div>
                {showEntities && (
                  <motion.div className="space-y-1.5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-400">Named Entities (NER):</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {headline.entities.map((e, i) => (
                        <motion.span key={e} className="text-[10px] px-2 py-0.5 bg-teal-100 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 rounded-md font-medium border border-teal-200 dark:border-teal-500/20" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.7 + i * 0.15, type: 'spring' }}>{e}</motion.span>
                      ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {phase === 'classify' && (
              <motion.div key="classify" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-3">
                <motion.div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.5, repeat: Infinity, ease: 'linear' }} />
                <span className="text-xs font-medium text-gray-600 dark:text-gray-300">🏷️ Assigning final classification...</span>
              </motion.div>
            )}

            {phase === 'result' && (
              <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="space-y-2">
                <div className="flex items-center gap-3">
                  <motion.span
                    className="px-3 py-1.5 rounded-full text-xs font-bold text-white"
                    style={{ backgroundColor: headline.color }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  >
                    ✓ {headline.sentiment}
                  </motion.span>
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Confidence: {(headline.score * 100).toFixed(0)}%</span>
                </div>
                <motion.div className="h-2 bg-gray-200 dark:bg-[#2a2a2a] rounded-full overflow-hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <motion.div className="h-full rounded-full" style={{ backgroundColor: headline.color }} initial={{ width: 0 }} animate={{ width: `${headline.score * 100}%` }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} />
                </motion.div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-400">Keywords:</span>
                  {headline.keywords.map(k => (
                    <span key={k} className="text-[10px] px-1.5 py-0.5 bg-gray-100 dark:bg-[#222] text-gray-600 dark:text-gray-400 rounded">{k}</span>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Stats + Results */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <div className="bg-gray-50 dark:bg-[#111] rounded-lg p-2 text-center">
            <div className="text-[9px] text-gray-400 uppercase">Total</div>
            <motion.div className="text-base font-bold text-blue-600" key={stats.total} initial={{ scale: 1.2 }} animate={{ scale: 1 }}>{stats.total}</motion.div>
          </div>
          <div className="bg-gray-50 dark:bg-[#111] rounded-lg p-2 text-center">
            <div className="text-[9px] text-gray-400 uppercase">Pos</div>
            <div className="text-base font-bold text-emerald-500">{posPercent}%</div>
          </div>
          <div className="bg-gray-50 dark:bg-[#111] rounded-lg p-2 text-center">
            <div className="text-[9px] text-gray-400 uppercase">Neg</div>
            <div className="text-base font-bold text-red-500">{negPercent}%</div>
          </div>
          <div className="bg-gray-50 dark:bg-[#111] rounded-lg p-2 text-center">
            <div className="text-[9px] text-gray-400 uppercase">Neu</div>
            <div className="text-base font-bold text-amber-500">{neuPercent}%</div>
          </div>
        </div>

        {/* Recent results */}
        <AnimatePresence initial={false}>
          {analyzedArticles.map((article) => (
            <motion.div
              key={article.id}
              className="flex items-center gap-3 p-2.5 mb-1.5 bg-gray-50 dark:bg-[#111] rounded-lg border-l-4"
              style={{ borderLeftColor: article.color }}
              initial={{ opacity: 0, x: -20, height: 0 }}
              animate={{ opacity: 1, x: 0, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              layout
            >
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-medium text-gray-700 dark:text-gray-300 truncate">{article.text}</p>
              </div>
              <span className={`shrink-0 text-[9px] font-bold px-2 py-0.5 rounded-full ${
                article.sentiment === 'Positive' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' :
                article.sentiment === 'Negative' ? 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400' :
                'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
              }`}>{article.sentiment}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

const LandingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const toggleTheme = () => setTheme(isDark ? 'light' : 'dark');
  const prefersReducedMotion = useReducedMotion();

  // Parallax
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -80]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0.6]);
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  // #1 Real stats from API
  const [realArticleCount, setRealArticleCount] = useState(null);
  useEffect(() => {
    fetch('https://mynewsa-api.onrender.com/api/history/public-stats')
      .then(r => r.json())
      .then(data => { if (data.totalArticles > 0) setRealArticleCount(data.totalArticles); })
      .catch(() => {});
  }, []);

  // #5 Sticky mobile CTA
  const [showMobileCTA, setShowMobileCTA] = useState(false);
  const [mobileCTADismissed, setMobileCTADismissed] = useState(false);
  const heroRef = useRef(null);
  useEffect(() => {
    if (mobileCTADismissed) return;
    const handleScroll = () => {
      setShowMobileCTA(window.scrollY > window.innerHeight);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [mobileCTADismissed]);

  // Typing animation
  const typingWords = ['Politics', 'Economy', 'Markets', 'Rakyat', 'Tech'];
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

  const features = [
    { icon: BarChart3, title: 'Sentiment Analysis', desc: 'Classify news articles into positive, negative, and neutral sentiment using fine-tuned transformer models.', color: 'text-green-500', glowColor: 'rgba(34,197,94,0.2)' },
    { icon: Network, title: 'Entity Graph', desc: 'Extract and visualize relationships between public figures, organizations, and locations.', color: 'text-blue-500', glowColor: 'rgba(59,130,246,0.2)' },
    { icon: TrendingUp, title: 'Trending Topics', desc: 'Track emerging narratives and trending topics across Malaysian news in real-time.', color: 'text-orange-500', glowColor: 'rgba(249,115,22,0.2)' },
    { icon: ShieldCheck, title: 'Source Credibility', desc: 'Evaluate source reliability and detect bias patterns across multiple outlets.', color: 'text-purple-500', glowColor: 'rgba(168,85,247,0.2)' },
    { icon: Brain, title: 'AI Insights', desc: 'Get AI-powered summaries, predictions, and actionable intelligence from news data.', color: 'text-pink-500', glowColor: 'rgba(236,72,153,0.2)' },
    { icon: FileDown, title: 'Export Reports', desc: 'Generate PowerPoint presentations and CSV exports with one click.', color: 'text-teal-500', glowColor: 'rgba(20,184,166,0.2)' },
  ];

  return (
    <div className="min-h-screen bg-[#fafaf9] dark:bg-[#0f0f0f] transition-colors overflow-x-hidden relative">
      {/* #4 Scroll progress indicator */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[3px] bg-accent origin-left z-[60]"
        style={{ scaleX }}
      />

      {/* Animated grid background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Grid lines */}
        <div className="absolute inset-0" style={{
          backgroundImage: isDark
            ? `linear-gradient(rgba(37, 99, 235, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(37, 99, 235, 0.05) 1px, transparent 1px)`
            : `linear-gradient(rgba(37, 99, 235, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(37, 99, 235, 0.08) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
          ...(!prefersReducedMotion && { animation: 'gridMove 20s linear infinite' }),
        }} />
        {/* Radial fade so grid is strongest in center */}
        <div className="absolute inset-0" style={{
          background: isDark
            ? 'radial-gradient(ellipse at center, transparent 30%, rgba(15,15,15,0.9) 70%)'
            : 'radial-gradient(ellipse at center, transparent 30%, rgba(250,250,249,0.9) 70%)',
        }} />
        {/* Accent glow spots */}
        {!prefersReducedMotion && (
          <>
            <div className="absolute top-[20%] left-[30%] w-[400px] h-[400px] rounded-full blur-[100px]" style={{ background: isDark ? 'rgba(37, 99, 235, 0.06)' : 'rgba(37, 99, 235, 0.1)', animation: 'float 20s ease-in-out infinite' }} />
            <div className="absolute top-[50%] right-[20%] w-[350px] h-[350px] rounded-full blur-[80px]" style={{ background: isDark ? 'rgba(124, 58, 237, 0.05)' : 'rgba(124, 58, 237, 0.08)', animation: 'float 25s ease-in-out infinite reverse' }} />
            <div className="absolute bottom-[20%] left-[50%] w-[300px] h-[300px] rounded-full blur-[80px]" style={{ background: isDark ? 'rgba(5, 150, 105, 0.04)' : 'rgba(5, 150, 105, 0.07)', animation: 'float 18s ease-in-out infinite 3s' }} />
          </>
        )}
      </div>

      <div className="relative z-10">
      <Navbar isDark={isDark} toggleTheme={toggleTheme} navigate={navigate} />

      {/* ─── HERO ─── */}
      <motion.header ref={heroRef} className="relative pt-32 pb-20 px-6 overflow-hidden min-h-[90vh] flex items-center" style={{ y: heroY, opacity: heroOpacity }}>
        {!prefersReducedMotion && <GradientOrbs />}
        {!prefersReducedMotion && <FloatingParticles count={40} />}
        {!prefersReducedMotion && <MouseFollowGradient />}

        <motion.div className="relative max-w-5xl mx-auto text-center w-full" initial="hidden" animate="visible" variants={staggerContainer}>
          {/* Masthead bar */}
          <motion.div variants={staggerItem} className="flex items-center justify-center gap-4 mb-8">
            <span className="flex-1 max-w-[80px] h-px bg-ink/30 dark:bg-paper/30"/>
            <span className="editorial-kicker">Vol. I · No. 01 · Kuala Lumpur</span>
            <span className="flex-1 max-w-[80px] h-px bg-ink/30 dark:bg-paper/30"/>
          </motion.div>

          {/* Title */}
          <motion.h1 variants={staggerItem} className="font-display text-5xl sm:text-6xl md:text-7xl font-bold text-ink dark:text-paper leading-[1.05] mb-6 tracking-tight">
            Malaysia's News Sentiment,{' '}
            <span className="italic text-accent">
              Decoded in Real-Time.
            </span>
            <br />
            <span className="block mt-4 text-2xl sm:text-3xl md:text-4xl font-normal italic text-ink-muted dark:text-ink-faint">
              Tracking <span className="not-italic text-accent font-semibold">{typingText}</span>
              <span className="animate-pulse text-accent">|</span>
            </span>
          </motion.h1>

          {/* Double rule */}
          <motion.div variants={staggerItem} className="editorial-rule max-w-md mx-auto mb-8"/>

          {/* Subtitle */}
          <motion.p variants={staggerItem} className="text-lg text-ink-muted dark:text-ink-faint max-w-2xl mx-auto mb-10 font-serif italic">
            AI-powered sentiment analysis tracking Malaysia's media landscape. From breaking news to trending narratives—understand public sentiment as it unfolds, backed by 92% classification accuracy.
          </motion.p>

          {/* CTA */}
          <motion.div variants={staggerItem} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.button
              onClick={() => navigate('/register')}
              className="relative px-8 py-3.5 text-sm font-semibold tracking-wider uppercase text-paper bg-ink dark:bg-paper dark:text-ink hover:bg-accent dark:hover:bg-accent dark:hover:text-paper transition-colors"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Start Reading · <ArrowRight className="inline w-4 h-4 ml-1" />
            </motion.button>
            <motion.button
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-3.5 text-sm font-semibold tracking-wider uppercase text-ink dark:text-paper border-2 border-ink dark:border-paper hover:bg-ink hover:text-paper dark:hover:bg-paper dark:hover:text-ink transition-all"
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            >
              <Play className="inline w-4 h-4 mr-2" /> The Method
            </motion.button>
          </motion.div>

          {/* Live Sentiment Demo */}
          <LiveSentimentDemo />

          {/* Source tags */}
          <motion.div variants={staggerItem} className="mt-12 flex flex-wrap items-center justify-center gap-3">
            <span className="text-xs text-gray-400 uppercase tracking-wider">Powered by</span>
            {['Malaysiakini', 'Astro Awani', 'FMT', 'Bernama', 'The Star'].map((s, i) => (
              <motion.span
                key={s}
                className="px-3 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] rounded-full"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.5 + i * 0.1, duration: 0.4 }}
                whileHover={{ scale: 1.1, borderColor: '#2563eb' }}
              >
                {s}
              </motion.span>
            ))}
          </motion.div>
        </motion.div>
      </motion.header>

      {/* ─── STATS ─── */}
      <AnimatedSection className="py-10 px-6" variants={staggerContainer}>
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8">
          {[
            { target: realArticleCount || 1000, suffix: realArticleCount ? '+' : '+', label: 'Articles Analyzed', icon: Newspaper },
            { target: 15, suffix: '', label: 'News Sources', icon: Globe },
            { target: 92, suffix: '%', label: 'Classification Accuracy', icon: Star },
          ].map((s, i) => (
            <motion.div
              key={i}
              className="text-center p-6 bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] rounded-2xl group cursor-default"
              variants={staggerItem}
              whileHover={{ y: -8, scale: 1.02, boxShadow: '0 20px 40px rgba(0,0,0,0.1)', transition: { duration: 0.3 } }}
            >
              <motion.div whileHover={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 0.5 }}>
                <s.icon className="w-8 h-8 text-accent mx-auto mb-3" />
              </motion.div>
              <AnimatedCounter target={s.target} suffix={s.suffix} />
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </AnimatedSection>

      {/* ─── LIVE DEMO ─── */}
      <AnimatedSection className="py-10 px-6" variants={scaleIn}>
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-sm font-medium text-accent uppercase tracking-wider mb-2">Live Preview</p>
          <h2 className="text-center text-3xl font-bold text-gray-900 dark:text-white mb-10">See sentiment analysis in action</h2>
          <ContinuousAnalysisDemo />
        </div>
      </AnimatedSection>

      {/* ─── FEATURES ─── */}
      <AnimatedSection className="py-16 px-6 relative overflow-hidden" id="features" variants={staggerContainer}>
        {/* Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-accent/3 blur-[150px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-purple-500/3 blur-[120px]" />
        </div>

        <div className="max-w-6xl mx-auto relative">
          <motion.p variants={staggerItem} className="text-center text-sm font-medium text-accent uppercase tracking-wider mb-2">Features</motion.p>
          <motion.h2 variants={staggerItem} className="text-center text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">Everything you need to understand Malaysian news</motion.h2>
          <motion.p variants={staggerItem} className="text-center text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-14">Powerful AI tools designed for researchers, analysts, and anyone tracking Malaysian media sentiment.</motion.p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                className="relative p-7 bg-white dark:bg-[#111] border border-[#eee] dark:border-[#2a2a2a] rounded-2xl group overflow-hidden"
                variants={staggerItem}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Hover gradient overlay */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `linear-gradient(135deg, ${f.glowColor}, transparent)` }} />

                {/* Corner glow */}
                <div className="absolute -top-10 -left-10 w-32 h-32 rounded-full opacity-0 group-hover:opacity-60 transition-opacity duration-500 blur-3xl" style={{ backgroundColor: f.glowColor }} />

                {/* Top accent line */}
                <motion.div
                  className="absolute top-0 left-0 h-[3px] rounded-t-2xl"
                  style={{ backgroundColor: f.glowColor.replace('0.2', '0.8') }}
                  initial={{ width: '0%' }}
                  whileInView={{ width: '25%' }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.2 + i * 0.1 }}
                />
                <div className="absolute top-0 left-0 h-[3px] rounded-t-2xl group-hover:!w-full transition-all duration-500" style={{ backgroundColor: f.glowColor.replace('0.2', '0.8'), width: '0%' }} />

                <div className="relative">
                  {/* Icon with glow container */}
                  <div className="relative inline-block mb-5">
                    <motion.div
                      className="w-14 h-14 flex items-center justify-center rounded-xl border"
                      style={{ backgroundColor: f.glowColor, borderColor: f.glowColor.replace('0.2', '0.3') }}
                      whileHover={{ rotate: [0, -5, 5, 0], scale: 1.1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <f.icon className={`w-7 h-7 ${f.color}`} />
                    </motion.div>
                    <motion.div
                      className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: f.glowColor.replace('0.2', '1') }}
                      animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
                      transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.3 }}
                    />
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{f.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-4">{f.desc}</p>

                  {/* Mini preview per feature */}
                  {i === 0 && (
                    <div className="bg-gray-50 dark:bg-[#0a0a0a] rounded-lg p-2.5 border border-[#eee] dark:border-[#222]">
                      <div className="flex items-center gap-2 mb-1.5">
                        {[{ l: 'Pos', c: '#22c55e', w: 52 }, { l: 'Neg', c: '#ef4444', w: 23 }, { l: 'Neu', c: '#f59e0b', w: 25 }].map((s) => (
                          <div key={s.l} className="flex-1">
                            <div className="text-[9px] text-gray-400 mb-0.5">{s.l}</div>
                            <div className="h-1.5 bg-gray-200 dark:bg-[#1a1a1a] rounded-full overflow-hidden">
                              <motion.div className="h-full rounded-full" style={{ backgroundColor: s.c }} animate={{ width: [`${s.w * 0.3}%`, `${s.w}%`] }} transition={{ duration: 1.5, repeat: Infinity, repeatType: 'reverse', delay: 0.5 }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {i === 1 && (
                    <div className="bg-gray-50 dark:bg-[#0a0a0a] rounded-lg p-2.5 border border-[#eee] dark:border-[#222]">
                      <div className="flex items-center gap-3">
                        {[1, 2, 3, 4].map((n) => (
                          <motion.div
                            key={n}
                            className="w-3 h-3 rounded-full bg-blue-500/30 border border-blue-500/50"
                            animate={{ scale: [1, 1.3, 1], opacity: [0.4, 1, 0.4] }}
                            transition={{ duration: 2, repeat: Infinity, delay: n * 0.3 }}
                          />
                        ))}
                        <motion.div className="flex-1 h-[1px] bg-blue-500/30" animate={{ scaleX: [0, 1, 0] }} transition={{ duration: 3, repeat: Infinity }} style={{ transformOrigin: 'left' }} />
                      </div>
                    </div>
                  )}

                  {i === 2 && (
                    <div className="bg-gray-50 dark:bg-[#0a0a0a] rounded-lg p-2.5 border border-[#eee] dark:border-[#222]">
                      <div className="flex items-center gap-1">
                        <motion.span className="text-[10px] px-1.5 py-0.5 bg-orange-100 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}>#Economy</motion.span>
                        <motion.span className="text-[10px] px-1.5 py-0.5 bg-orange-100 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}>#Politics</motion.span>
                        <motion.span className="text-[10px] px-1.5 py-0.5 bg-orange-100 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity, delay: 1 }}>#Tech</motion.span>
                      </div>
                    </div>
                  )}

                  {i === 3 && (
                    <div className="bg-gray-50 dark:bg-[#0a0a0a] rounded-lg p-2.5 border border-[#eee] dark:border-[#222]">
                      <div className="flex items-center gap-2">
                        <motion.div className="flex items-center gap-1" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2.5, repeat: Infinity }}>
                          <div className="w-2 h-2 rounded-full bg-emerald-400" />
                          <span className="text-[9px] text-gray-400">Reliable</span>
                        </motion.div>
                        <motion.div className="flex items-center gap-1" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2.5, repeat: Infinity, delay: 0.8 }}>
                          <div className="w-2 h-2 rounded-full bg-amber-400" />
                          <span className="text-[9px] text-gray-400">Mixed</span>
                        </motion.div>
                        <motion.div className="flex items-center gap-1" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2.5, repeat: Infinity, delay: 1.6 }}>
                          <div className="w-2 h-2 rounded-full bg-red-400" />
                          <span className="text-[9px] text-gray-400">Low</span>
                        </motion.div>
                      </div>
                    </div>
                  )}

                  {i === 4 && (
                    <div className="bg-gray-50 dark:bg-[#0a0a0a] rounded-lg p-2.5 border border-[#eee] dark:border-[#222]">
                      <motion.div className="flex items-center gap-1.5" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 3, repeat: Infinity }}>
                        <Brain size={10} className="text-pink-500" />
                        <span className="text-[9px] text-gray-400">Generating summary...</span>
                        <motion.span className="text-[9px] text-pink-500" animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>█</motion.span>
                      </motion.div>
                    </div>
                  )}

                  {i === 5 && (
                    <div className="bg-gray-50 dark:bg-[#0a0a0a] rounded-lg p-2.5 border border-[#eee] dark:border-[#222]">
                      <div className="flex items-center gap-2">
                        <motion.div className="flex items-center gap-1" animate={{ x: [0, 3, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                          <FileDown size={10} className="text-teal-500" />
                          <span className="text-[9px] text-gray-400">.pptx</span>
                        </motion.div>
                        <motion.div className="flex items-center gap-1" animate={{ x: [0, 3, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}>
                          <FileDown size={10} className="text-teal-500" />
                          <span className="text-[9px] text-gray-400">.csv</span>
                        </motion.div>
                        <motion.div className="flex items-center gap-1" animate={{ x: [0, 3, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 1 }}>
                          <FileDown size={10} className="text-teal-500" />
                          <span className="text-[9px] text-gray-400">.pdf</span>
                        </motion.div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Border glow on hover */}
                <div className="absolute inset-0 rounded-2xl border border-transparent group-hover:border-accent/20 transition-colors duration-300 pointer-events-none" />
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ─── HOW IT WORKS ─── */}
      <AnimatedSection className="py-20 px-6 bg-white dark:bg-[#0a0a0a] border-t border-[#eee] dark:border-[#1a1a1a] relative overflow-hidden" variants={staggerContainer}>
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-accent/3 blur-[150px]" />
        </div>

        <div className="max-w-5xl mx-auto relative">
          <motion.p variants={staggerItem} className="text-center text-sm font-medium text-accent uppercase tracking-wider mb-2">How it works</motion.p>
          <motion.h2 variants={staggerItem} className="text-center text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">From search to insight in seconds</motion.h2>
          <motion.p variants={staggerItem} className="text-center text-gray-500 dark:text-gray-400 max-w-lg mx-auto mb-16">Three simple steps to understand Malaysian news sentiment at scale.</motion.p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-4 relative">
            {/* Connecting line (desktop) */}
            <div className="hidden md:block absolute top-[72px] left-[20%] right-[20%] h-[2px] z-0">
              <motion.div
                className="h-full bg-gradient-to-r from-accent/50 via-accent to-accent/50 rounded-full"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                style={{ transformOrigin: 'left' }}
              />
              {/* Animated dot traveling along line */}
              <motion.div
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-accent shadow-[0_0_12px_rgba(37,99,235,0.6)]"
                animate={{ left: ['0%', '100%', '0%'] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>

            {[
              { num: '01', title: 'Search', desc: 'Enter any topic or keyword. Our crawler fetches the latest articles from major Malaysian news outlets.', icon: Search, gradient: 'from-blue-500/20 to-cyan-500/10' },
              { num: '02', title: 'Analyze', desc: 'AI models classify sentiment, extract entities, and score relevance in real time.', icon: Zap, gradient: 'from-purple-500/20 to-violet-500/10' },
              { num: '03', title: 'Insights', desc: 'Explore interactive dashboards with sentiment trends, entity networks, and heatmaps.', icon: LineChart, gradient: 'from-emerald-500/20 to-teal-500/10' },
            ].map((step, i) => (
              <motion.div
                key={step.num}
                className="relative text-center p-8 bg-[#fafaf9] dark:bg-[#111] border border-[#eee] dark:border-[#2a2a2a] rounded-2xl group overflow-hidden z-10"
                variants={staggerItem}
                whileHover={{ y: -10, scale: 1.03 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Hover gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${step.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl`} />

                {/* Top glow */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full bg-accent/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative">
                  {/* Icon container with glow ring */}
                  <div className="relative w-16 h-16 mx-auto mb-5">
                    <motion.div
                      className="absolute inset-0 rounded-2xl bg-accent/10 dark:bg-accent/5"
                      animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
                      transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
                    />
                    <div className="relative w-full h-full flex items-center justify-center bg-accent/10 dark:bg-accent/10 rounded-2xl border border-accent/20">
                      <step.icon className="w-7 h-7 text-accent" />
                    </div>
                    {/* Glow dot */}
                    <motion.div
                      className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-accent shadow-[0_0_8px_rgba(37,99,235,0.6)]"
                      animate={{ scale: [1, 1.3, 1], opacity: [0.8, 1, 0.8] }}
                      transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                    />
                  </div>

                  {/* Step number */}
                  <motion.span
                    className="inline-block text-xs font-bold text-accent uppercase tracking-wider mb-2"
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
                  >
                    {step.num}
                  </motion.span>

                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{step.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-4">{step.desc}</p>

                  {/* Mini animated preview */}
                  {i === 0 && (
                    <div className="bg-white dark:bg-[#0a0a0a] rounded-xl p-3 border border-[#eee] dark:border-[#2a2a2a] text-left">
                      <div className="flex items-center gap-2 bg-gray-50 dark:bg-[#111] rounded-lg px-3 py-2">
                        <Search size={12} className="text-gray-400" />
                        <motion.span
                          className="text-[11px] text-gray-600 dark:text-gray-300 font-medium"
                          animate={{ opacity: [0, 1] }}
                          transition={{ duration: 0.5 }}
                          key={Math.floor(Date.now() / 4000) % 3}
                        >
                          {['malaysia economy', 'ringgit forex', 'election 2026'][Math.floor(Date.now() / 4000) % 3]}
                        </motion.span>
                        <motion.span className="inline-block w-0.5 h-3 bg-accent ml-0.5" animate={{ opacity: [1, 0] }} transition={{ duration: 0.6, repeat: Infinity }} />
                      </div>
                      <div className="mt-2 space-y-1.5">
                        {['The Star', 'Malaysiakini', 'Bernama'].map((src, j) => (
                          <motion.div
                            key={src}
                            className="flex items-center gap-2"
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 2, repeat: Infinity, delay: j * 0.4 }}
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            <span className="text-[10px] text-gray-400">{src}</span>
                            <span className="text-[9px] text-gray-300 dark:text-gray-600 ml-auto">fetching...</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {i === 1 && (
                    <div className="bg-white dark:bg-[#0a0a0a] rounded-xl p-3 border border-[#eee] dark:border-[#2a2a2a] text-left">
                      <div className="space-y-2">
                        {[
                          { label: 'Tokenizing', color: 'bg-purple-500' },
                          { label: 'NLP Model', color: 'bg-accent' },
                          { label: 'Scoring', color: 'bg-emerald-500' },
                        ].map((bar, j) => (
                          <div key={bar.label} className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-gray-400">{bar.label}</span>
                              <motion.span
                                className="text-[9px] text-emerald-500"
                                animate={{ opacity: [0, 0, 1] }}
                                transition={{ duration: 3, repeat: Infinity, delay: j * 1 }}
                              >
                                ✓
                              </motion.span>
                            </div>
                            <div className="h-1.5 bg-gray-100 dark:bg-[#1a1a1a] rounded-full overflow-hidden">
                              <motion.div
                                className={`h-full ${bar.color} rounded-full`}
                                animate={{ width: ['0%', '100%', '100%', '0%'] }}
                                transition={{ duration: 4, repeat: Infinity, delay: j * 1.2, ease: 'easeInOut' }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {i === 2 && (
                    <div className="bg-white dark:bg-[#0a0a0a] rounded-xl p-3 border border-[#eee] dark:border-[#2a2a2a]">
                      <div className="flex items-end gap-1 h-12 justify-center mb-2">
                        {[40, 65, 35, 80, 55, 70, 45].map((h, j) => (
                          <motion.div
                            key={j}
                            className="w-3 rounded-t-sm"
                            style={{ backgroundColor: h > 60 ? '#22c55e' : h > 45 ? '#f59e0b' : '#ef4444' }}
                            animate={{ height: [`${h * 0.3}%`, `${h}%`, `${h * 0.6}%`, `${h}%`] }}
                            transition={{ duration: 3, repeat: Infinity, delay: j * 0.2, ease: 'easeInOut' }}
                          />
                        ))}
                      </div>
                      <div className="flex justify-between text-[9px] text-gray-400">
                        <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Arrow between steps (desktop) */}
                {i < 2 && (
                  <motion.div
                    className="hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 w-8 h-8 items-center justify-center bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] rounded-full shadow-sm z-20"
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <ChevronRight className="w-4 h-4 text-accent" />
                  </motion.div>
                )}

                {/* Mobile step connector */}
                {i < 2 && (
                  <motion.div
                    className="md:hidden absolute -bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-0.5 z-20"
                    animate={{ y: [0, 3, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <div className="w-0.5 h-2 bg-accent/30 rounded-full" />
                    <div className="w-0.5 h-2 bg-accent/50 rounded-full" />
                    <div className="w-0.5 h-2 bg-accent/30 rounded-full" />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ─── TECH STACK ─── */}
      <AnimatedSection className="py-10 px-6" variants={fadeInUp}>
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-sm font-medium text-accent uppercase tracking-wider mb-2">Tech Stack</p>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Built with modern tools</h2>
          <TechStackMarquee />
        </div>
      </AnimatedSection>

      {/* ─── USE CASES ─── */}
      <AnimatedSection className="py-16 px-6 bg-white dark:bg-[#1a1a1a] border-t border-[#eee] dark:border-[#2a2a2a] relative overflow-hidden" variants={staggerContainer}>
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-accent/5 blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-purple-500/5 blur-[100px]" />
        </div>

        <div className="max-w-6xl mx-auto relative">
          <div className="text-center mb-12">
            <motion.p variants={staggerItem} className="text-sm font-medium text-accent uppercase tracking-wider mb-2">Use Cases</motion.p>
            <motion.h2 variants={staggerItem} className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">Who is this for?</motion.h2>
            <motion.p variants={staggerItem} className="text-gray-500 dark:text-gray-400 mt-3 max-w-lg mx-auto">Built for anyone who needs to understand Malaysian media narratives at scale.</motion.p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: '🎓', title: 'Researchers', desc: 'Track media sentiment trends for academic papers and thesis research on Malaysian politics, economy, and social issues.', gradient: 'from-green-500/20 to-emerald-500/5', borderColor: '#22c55e', iconBg: 'bg-green-500/10', link: '/use-cases/researchers', feature: 'trending' },
              { icon: '📰', title: 'Journalists', desc: 'Monitor how different outlets cover the same story. Identify bias patterns and verify source credibility.', gradient: 'from-blue-500/20 to-cyan-500/5', borderColor: '#3b82f6', iconBg: 'bg-blue-500/10', link: '/use-cases/journalists', feature: 'credibility' },
              { icon: '📊', title: 'Analysts', desc: 'Real-time sentiment tracking for market analysis, brand monitoring, and public opinion research.', gradient: 'from-amber-500/20 to-orange-500/5', borderColor: '#f59e0b', iconBg: 'bg-amber-500/10', link: '/use-cases/analysts', feature: 'dashboard' },
              { icon: '🏛️', title: 'Policy Makers', desc: 'Understand public sentiment on policies, track media coverage of government initiatives.', gradient: 'from-purple-500/20 to-violet-500/5', borderColor: '#8b5cf6', iconBg: 'bg-purple-500/10', link: '/use-cases/policy-makers', feature: 'forecast' },
              { icon: '🎯', title: 'PR & Communications', desc: 'Monitor brand mentions, track crisis sentiment, measure campaign effectiveness across Malaysian media.', gradient: 'from-pink-500/20 to-rose-500/5', borderColor: '#ec4899', iconBg: 'bg-pink-500/10', link: '/use-cases/pr', feature: 'alerts' },
              { icon: '🧑‍🎓', title: 'Students', desc: 'Learn NLP concepts through real Malaysian news data. Perfect for FYP and coursework projects.', gradient: 'from-teal-500/20 to-cyan-500/5', borderColor: '#14b8a6', iconBg: 'bg-teal-500/10', link: '/use-cases/students', feature: 'entities' },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="relative bg-[#fafaf9] dark:bg-[#111] border border-[#eee] dark:border-[#2a2a2a] rounded-2xl p-7 group overflow-hidden cursor-pointer"
                onClick={() => navigate(item.link)}
                variants={staggerItem}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Gradient overlay on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl`} />
                
                {/* Animated border */}
                <motion.div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ border: `2px solid ${item.borderColor}20` }}
                />
                
                {/* Top accent line */}
                <motion.div
                  className="absolute top-0 left-0 h-1 rounded-t-2xl"
                  style={{ backgroundColor: item.borderColor }}
                  initial={{ width: '0%' }}
                  whileInView={{ width: '30%' }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.2 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                />
                <motion.div
                  className="absolute top-0 left-0 h-1 rounded-t-2xl group-hover:!w-full transition-all duration-500"
                  style={{ backgroundColor: item.borderColor, width: '0%' }}
                />

                {/* Glow effect */}
                <div
                  className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-0 group-hover:opacity-30 transition-opacity duration-500"
                  style={{ backgroundColor: item.borderColor }}
                />

                <div className="relative">
                  {/* Icon with background */}
                  <motion.div
                    className={`inline-flex items-center justify-center w-14 h-14 rounded-xl ${item.iconBg} mb-4`}
                    whileHover={{ rotate: [0, -5, 5, 0], scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <span className="text-3xl">{item.icon}</span>
                  </motion.div>

                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">{item.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{item.desc}</p>

                  {/* Arrow indicator */}
                  <motion.div
                    className="mt-4 flex items-center gap-1 text-xs font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1"
                    style={{ color: item.borderColor }}
                  >
                    Get started <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ─── COMPARISON ─── */}
      <AnimatedSection className="py-12 px-6" variants={staggerContainer}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-sm font-medium text-secondary uppercase tracking-wider mb-2">Why Us</p>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Manual vs AI Analysis</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <motion.div
              variants={slideFromLeft}
              className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 rounded-2xl p-8"
            >
              <h3 className="font-bold text-red-700 dark:text-red-400 text-lg mb-4">❌ Manual Research</h3>
              <ul className="space-y-3 text-sm text-red-600 dark:text-red-300">
                {[
                  'Hours reading individual articles',
                  'Subjective sentiment interpretation',
                  'Limited to few sources at a time',
                  'No entity relationship mapping',
                  'Difficult to track trends over time',
                ].map((item, i) => (
                  <motion.li
                    key={i}
                    className="flex items-start gap-2"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                  >
                    <motion.span
                      className="mt-0.5 text-red-400"
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5 + i * 0.1, type: 'spring' }}
                    >
                      <X className="w-4 h-4" />
                    </motion.span>
                    {item}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
            <motion.div
              variants={slideFromRight}
              className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/30 rounded-2xl p-8"
            >
              <h3 className="font-bold text-blue-700 dark:text-blue-400 text-lg mb-4">✅ AI-Powered Analysis</h3>
              <ul className="space-y-3 text-sm text-blue-600 dark:text-blue-300">
                {[
                  'Analyze 100+ articles in seconds',
                  'Consistent NLP-based scoring',
                  '50+ Malaysian news sources',
                  'Auto entity extraction & graph',
                  'Real-time trend tracking & alerts',
                ].map((item, i) => (
                  <motion.li
                    key={i}
                    className="flex items-start gap-2"
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                  >
                    <motion.span
                      className="mt-0.5 text-blue-400"
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5 + i * 0.1, type: 'spring' }}
                    >
                      <Check className="w-4 h-4" />
                    </motion.span>
                    {item}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </AnimatedSection>

      {/* ─── TESTIMONIALS ─── */}
      <AnimatedSection className="py-12 px-6 bg-white dark:bg-[#1a1a1a] border-t border-[#eee] dark:border-[#2a2a2a]" variants={staggerContainer}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-sm font-medium text-accent uppercase tracking-wider mb-2">Feedback</p>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">What users say</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Dr. Ahmad', role: 'FYP Supervisor', text: 'The technical implementation demonstrates strong understanding of NLP pipelines and real-time data processing. Well-architected system.' },
              { name: 'Peer Reviewer', role: 'Software Engineering', text: 'Clean UI/UX with intuitive navigation. The dashboard visualizations are professional-grade and responsive across devices.' },
              { name: 'Beta Tester', role: 'UMPSA Student', text: 'Really useful for tracking Malaysian news sentiment. The entity graph helped me understand connections between political figures.' },
            ].map((t, i) => (
              <motion.div
                key={i}
                variants={staggerItem}
                className="relative bg-[#fafaf9] dark:bg-[#111] border border-[#eee] dark:border-[#2a2a2a] rounded-2xl p-6 group"
                {...(!prefersReducedMotion && {
                  animate: { y: [0, -5, 0] },
                  transition: { duration: 4 + i * 0.7, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 },
                })}
              >
                {/* Decorative quote */}
                <motion.span
                  className="absolute top-3 right-4 text-5xl text-accent/10 font-serif leading-none select-none"
                  animate={{ opacity: [0.1, 0.2, 0.1] }}
                  transition={{ duration: 3, repeat: Infinity, delay: i * 0.3 }}
                >
                  "
                </motion.span>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-4 italic relative z-10">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <motion.div
                    className="relative w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-sm"
                    whileHover={{ scale: 1.1 }}
                  >
                    {t.name[0]}
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-accent/30 opacity-0 group-hover:opacity-100"
                      animate={{ scale: [1, 1.3], opacity: [0.5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  </motion.div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{t.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-4 italic">Feedback from project evaluation</p>
        </div>
      </AnimatedSection>

      {/* ─── FAQ ─── */}
      <AnimatedSection className="py-12 px-6" variants={staggerContainer}>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-sm font-medium text-secondary uppercase tracking-wider mb-2">FAQ</p>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Common questions</h2>
          </div>
          <div className="space-y-3">
            {[
              { q: 'What news sources are supported?', a: 'We analyze 50+ Malaysian news sources including The Star, NST, Malaysiakini, Bernama, Free Malaysia Today, and more.' },
              { q: 'How accurate is the sentiment analysis?', a: 'Our NLP models achieve 85%+ accuracy on Malaysian news text, trained specifically on local language patterns and context.' },
              { q: 'Is it free to use?', a: 'Yes! The basic features are completely free. This is a university research project (FYP) at UMPSA.' },
              { q: 'Can I export the results?', a: 'Yes, you can export analysis results as PowerPoint presentations, perfect for reports and presentations.' },
              { q: 'Does it support Bahasa Malaysia?', a: 'Currently optimized for English-language Malaysian news. BM support is on the roadmap.' },
            ].map((faq, i) => (
              <FAQItem key={i} question={faq.q} answer={faq.a} index={i} />
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ─── CTA ─── */}
      <AnimatedSection className="py-12 px-6" variants={scaleIn}>
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            className="relative p-12 rounded-3xl overflow-hidden"
            whileInView={{ opacity: 1, scale: 1 }}
            initial={{ opacity: 0, scale: 0.95 }}
            viewport={{ once: true }}
          >
            {/* Animated gradient background */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-accent/10 via-purple-500/10 to-teal-400/10"
              animate={{
                background: [
                  'linear-gradient(135deg, rgba(37,99,235,0.1), rgba(168,85,247,0.1), rgba(20,184,166,0.1))',
                  'linear-gradient(225deg, rgba(20,184,166,0.1), rgba(37,99,235,0.1), rgba(168,85,247,0.1))',
                  'linear-gradient(315deg, rgba(168,85,247,0.1), rgba(20,184,166,0.1), rgba(37,99,235,0.1))',
                  'linear-gradient(135deg, rgba(37,99,235,0.1), rgba(168,85,247,0.1), rgba(20,184,166,0.1))',
                ],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            />
            {/* Border */}
            <div className="absolute inset-0 rounded-3xl border border-accent/20" />

            {/* Floating decorative elements */}
            <motion.div
              className="absolute top-6 left-8 w-3 h-3 rounded-full bg-accent/30"
              animate={{ y: [0, -10, 0], x: [0, 5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            <motion.div
              className="absolute bottom-8 right-12 w-2 h-2 rounded-full bg-purple-400/30"
              animate={{ y: [0, 8, 0], x: [0, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: 1 }}
            />
            <motion.div
              className="absolute top-1/2 right-8 w-4 h-4 rounded-full bg-teal-400/20"
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 5, repeat: Infinity, delay: 2 }}
            />

            <div className="relative z-10">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Start analyzing Malaysian news today</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-8">Free to get started. No credit card required.</p>
              <ShimmerButton
                onClick={() => navigate('/register')}
                className="px-8 py-3.5 text-base font-semibold text-white bg-accent rounded-xl shadow-lg shadow-accent/25 hover:shadow-accent/40 transition-all"
              >
                Get Started Free <ArrowRight className="inline w-4 h-4 ml-1" />
              </ShimmerButton>
            </div>
          </motion.div>
        </div>
      </AnimatedSection>

      <Footer />
      </div>{/* end relative z-10 */}

      {/* #5 Sticky mobile CTA */}
      <AnimatePresence>
        {showMobileCTA && !mobileCTADismissed && (
          <motion.div
            className="fixed bottom-6 left-4 right-4 z-50 md:hidden"
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center gap-2 px-4 py-3 bg-accent/95 backdrop-blur-md rounded-2xl shadow-lg shadow-accent/25">
              <button
                onClick={() => navigate('/register')}
                className="flex-1 text-sm font-semibold text-white text-center"
              >
                Get Started Free <ArrowRight className="inline w-4 h-4 ml-1" />
              </button>
              <button
                onClick={() => setMobileCTADismissed(true)}
                className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4 text-white/80" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LandingPage;
