import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { motion, useInView, useScroll, useTransform, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
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
        <a href="#features" className="hover:text-accent transition-colors">Features</a>
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

const LandingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const toggleTheme = () => setTheme(isDark ? 'light' : 'dark');

  // Parallax
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -80]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0.6]);

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

  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen bg-[#fafaf9] dark:bg-[#0f0f0f] transition-colors overflow-x-hidden relative">
      {/* Global gradient mesh background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#2563eb]/[0.04] dark:bg-[#2563eb]/[0.06] rounded-full blur-[120px] animate-[float_20s_ease-in-out_infinite]" />
        <div className="absolute top-[30%] right-[-15%] w-[500px] h-[500px] bg-[#7c3aed]/[0.04] dark:bg-[#7c3aed]/[0.06] rounded-full blur-[120px] animate-[float_25s_ease-in-out_infinite_reverse]" />
        <div className="absolute bottom-[-10%] left-[20%] w-[700px] h-[700px] bg-[#059669]/[0.03] dark:bg-[#059669]/[0.05] rounded-full blur-[140px] animate-[float_30s_ease-in-out_infinite_2s]" />
        <div className="absolute top-[60%] right-[30%] w-[400px] h-[400px] bg-[#d97706]/[0.03] dark:bg-[#d97706]/[0.04] rounded-full blur-[100px] animate-[float_22s_ease-in-out_infinite_4s]" />
        <div className="absolute top-[10%] left-[50%] w-[350px] h-[350px] bg-[#ec4899]/[0.03] dark:bg-[#ec4899]/[0.04] rounded-full blur-[100px] animate-[float_18s_ease-in-out_infinite_1s]" />
      </div>

      <div className="relative z-10">
      <Navbar isDark={isDark} toggleTheme={toggleTheme} navigate={navigate} />

      {/* ─── HERO ─── */}
      <motion.header className="relative pt-32 pb-20 px-6 overflow-hidden min-h-[90vh] flex items-center" style={{ y: heroY, opacity: heroOpacity }}>
        {/* Background effects */}
        <GradientOrbs />
        <FloatingParticles count={40} />
        <MouseFollowGradient />

        <motion.div className="relative max-w-5xl mx-auto text-center w-full" initial="hidden" animate="visible" variants={staggerContainer}>
          {/* Badge */}
          <motion.div variants={staggerItem} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-8">
            <motion.span
              className="w-2 h-2 rounded-full bg-accent"
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            AI-Powered News Intelligence
          </motion.div>

          {/* Title */}
          <motion.h1 variants={staggerItem} className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-white leading-tight mb-6">
            Malaysia News Sentiment{' '}
            <span className="text-accent relative">
              Dashboard
              <motion.span
                className="absolute -bottom-2 left-0 right-0 h-1 bg-accent/30 rounded-full"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              />
            </span>
            <br />
            <span className="text-3xl sm:text-4xl md:text-5xl text-gray-500 dark:text-gray-400">
              Tracking{' '}
              <span className="text-accent">{typingText}</span>
              <span className="animate-pulse text-accent">|</span>
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p variants={staggerItem} className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10">
            Real-time AI that monitors, classifies, and visualizes sentiment across Malaysia's top news sources. Never miss a narrative shift.
          </motion.p>

          {/* CTA with glow */}
          <motion.div variants={staggerItem} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.button
              onClick={() => navigate('/register')}
              className="relative px-8 py-3.5 text-base font-semibold text-white bg-accent rounded-xl shadow-lg shadow-accent/25 hover:shadow-accent/40 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              animate={{ boxShadow: ['0 10px 40px rgba(37,99,235,0.2)', '0 10px 60px rgba(37,99,235,0.4)', '0 10px 40px rgba(37,99,235,0.2)'] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              Get Started Free <ArrowRight className="inline w-4 h-4 ml-1" />
            </motion.button>
            <motion.button
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-3.5 text-base font-semibold text-gray-700 dark:text-gray-300 border border-[#eee] dark:border-[#2a2a2a] rounded-xl hover:border-accent hover:text-accent transition-all"
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            >
              <Play className="inline w-4 h-4 mr-2" /> Learn More
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
      <AnimatedSection className="py-16 px-6" variants={staggerContainer}>
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8">
          {[
            { target: 1000, suffix: '+', label: 'Articles Analyzed', icon: Newspaper },
            { target: 50, suffix: '+', label: 'News Sources', icon: Globe },
            { target: 95, suffix: '%', label: 'AI Accuracy', icon: Star },
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
      <AnimatedSection className="py-16 px-6" variants={scaleIn}>
        <div className="max-w-3xl mx-auto">
          <p className="text-center text-sm font-medium text-accent uppercase tracking-wider mb-2">Live Preview</p>
          <h2 className="text-center text-3xl font-bold text-gray-900 dark:text-white mb-10">See sentiment analysis in action</h2>
          <motion.div
            className="bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] rounded-2xl overflow-hidden shadow-xl shadow-black/5"
            whileInView={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 20 }}
            viewport={{ once: true }}
          >
            {/* Window chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[#eee] dark:border-[#2a2a2a]">
              <span className="w-3 h-3 rounded-full bg-red-400" />
              <span className="w-3 h-3 rounded-full bg-yellow-400" />
              <span className="w-3 h-3 rounded-full bg-green-400" />
              <span className="ml-4 text-xs text-gray-400">Sentiment Distribution - May 2026</span>
            </div>
            <div className="p-6 space-y-4">
              <SentimentBar label="Positive" value={42} color="#22c55e" delay={0.2} />
              <SentimentBar label="Neutral" value={35} color="#f59e0b" delay={0.4} />
              <SentimentBar label="Negative" value={23} color="#ef4444" delay={0.6} />
            </div>
          </motion.div>
        </div>
      </AnimatedSection>

      {/* ─── FEATURES ─── */}
      <AnimatedSection className="py-20 px-6" id="features" variants={staggerContainer}>
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-sm font-medium text-accent uppercase tracking-wider mb-2">Features</p>
          <h2 className="text-center text-3xl font-bold text-gray-900 dark:text-white mb-4">Everything you need to understand Malaysian news</h2>
          <p className="text-center text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-12">Powerful AI tools designed for researchers, analysts, and anyone tracking Malaysian media sentiment.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                className="relative p-6 bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] rounded-2xl group overflow-hidden"
                variants={staggerItem}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                style={{ willChange: 'transform' }}
              >
                {/* Gradient border on hover */}
                <motion.div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `linear-gradient(135deg, ${f.glowColor}, transparent, ${f.glowColor})`, padding: '1px' }}
                />
                {/* Glow behind icon */}
                <motion.div
                  className="absolute top-4 left-4 w-14 h-14 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"
                  style={{ backgroundColor: f.glowColor }}
                />
                <div className="relative">
                  <motion.div
                    className="inline-block"
                    whileHover={{ rotate: [0, -10, 10, 0], scale: 1.2 }}
                    transition={{ duration: 0.5 }}
                  >
                    <f.icon className={`w-10 h-10 ${f.color} mb-4`} />
                  </motion.div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{f.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>
                </div>
                {/* Gradient border overlay */}
                <div className="absolute inset-0 rounded-2xl border border-transparent group-hover:border-accent/30 transition-colors duration-300 pointer-events-none" />
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ─── HOW IT WORKS ─── */}
      <AnimatedSection className="py-20 px-6 bg-white dark:bg-[#1a1a1a]" variants={staggerContainer}>
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-sm font-medium text-accent uppercase tracking-wider mb-2">How it works</p>
          <h2 className="text-center text-3xl font-bold text-gray-900 dark:text-white mb-12">From search to insight in seconds</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Animated connecting line */}
            <AnimatedLine />

            {[
              { num: '01', title: 'Search', desc: 'Enter any topic or keyword. Our crawler fetches the latest articles from major Malaysian news outlets.', icon: Search },
              { num: '02', title: 'Analyze', desc: 'AI models classify sentiment, extract entities, and score relevance in real time.', icon: Zap },
              { num: '03', title: 'Insights', desc: 'Explore interactive dashboards with sentiment trends, entity networks, and heatmaps.', icon: LineChart },
            ].map((step, i) => (
              <motion.div
                key={step.num}
                className="relative text-center p-8 bg-[#fafaf9] dark:bg-[#0f0f0f] border border-[#eee] dark:border-[#2a2a2a] rounded-2xl"
                variants={staggerItem}
                whileHover={{ y: -6 }}
              >
                <div className="relative w-12 h-12 mx-auto mb-4 flex items-center justify-center bg-accent/10 rounded-xl">
                  <PulseRing />
                  <step.icon className="w-6 h-6 text-accent" />
                </div>
                <span className="text-xs font-bold text-accent uppercase tracking-wider">{step.num}</span>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-2 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{step.desc}</p>

                {/* Arrow between steps */}
                {i < 2 && (
                  <motion.div
                    className="hidden md:block absolute -right-6 top-1/2 -translate-y-1/2 text-accent/50"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ─── TECH STACK ─── */}
      <AnimatedSection className="py-16 px-6" variants={fadeInUp}>
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm font-medium text-accent uppercase tracking-wider mb-2">Tech Stack</p>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Built with modern tools</h2>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {['React', 'Express', 'MongoDB', 'Ollama', 'NLP', 'Tailwind', 'Framer Motion'].map((tech, i) => (
              <FloatingTechBadge key={tech} tech={tech} index={i} total={7} />
            ))}
          </div>
          {/* Connection lines (decorative) */}
          <motion.div
            className="mt-6 h-px max-w-xs mx-auto bg-gradient-to-r from-transparent via-accent/30 to-transparent"
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
        </div>
      </AnimatedSection>

      {/* ─── USE CASES ─── */}
      <AnimatedSection className="py-20 px-6 bg-white dark:bg-[#1a1a1a] border-t border-[#eee] dark:border-[#2a2a2a]" variants={staggerContainer}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-medium text-accent uppercase tracking-wider mb-2">Use Cases</p>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Who is this for?</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: '🎓', title: 'Researchers', desc: 'Track media sentiment trends for academic papers and thesis research on Malaysian politics, economy, and social issues.', borderColor: '#22c55e' },
              { icon: '📰', title: 'Journalists', desc: 'Monitor how different outlets cover the same story. Identify bias patterns and verify source credibility.', borderColor: '#3b82f6' },
              { icon: '📊', title: 'Analysts', desc: 'Real-time sentiment tracking for market analysis, brand monitoring, and public opinion research.', borderColor: '#f59e0b' },
              { icon: '🏛️', title: 'Policy Makers', desc: 'Understand public sentiment on policies, track media coverage of government initiatives.', borderColor: '#8b5cf6' },
              { icon: '🎯', title: 'PR & Communications', desc: 'Monitor brand mentions, track crisis sentiment, measure campaign effectiveness across Malaysian media.', borderColor: '#ec4899' },
              { icon: '🧑‍🎓', title: 'Students', desc: 'Learn NLP concepts through real Malaysian news data. Perfect for FYP and coursework projects.', borderColor: '#14b8a6' },
            ].map((item, i) => (
              <TiltCard
                key={i}
                className="bg-[#fafaf9] dark:bg-[#111] border border-[#eee] dark:border-[#2a2a2a] rounded-2xl p-6 hover:shadow-lg hover:shadow-black/5 transition-all group relative overflow-hidden"
              >
                {/* Colored top border that slides in */}
                <motion.div
                  className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ backgroundColor: item.borderColor }}
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                />
                <motion.span
                  className="text-3xl mb-3 block"
                  whileHover={{ scale: 1.3 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  {item.icon}
                </motion.span>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{item.desc}</p>
              </TiltCard>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ─── COMPARISON ─── */}
      <AnimatedSection className="py-20 px-6" variants={staggerContainer}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
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
      <AnimatedSection className="py-20 px-6 bg-white dark:bg-[#1a1a1a] border-t border-[#eee] dark:border-[#2a2a2a]" variants={staggerContainer}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-medium text-accent uppercase tracking-wider mb-2">Feedback</p>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">What users say</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Dr. Ahmad', role: 'UMP Lecturer', text: 'Excellent tool for teaching students about NLP and sentiment analysis with real Malaysian data.' },
              { name: 'Sarah K.', role: 'Journalism Student', text: 'Helped me identify media bias patterns for my thesis. The entity graph is incredibly useful.' },
              { name: 'Rizal M.', role: 'Data Analyst', text: 'The real-time sentiment tracking saves hours of manual work. Source credibility feature is a game changer.' },
            ].map((t, i) => (
              <motion.div
                key={i}
                variants={staggerItem}
                className="relative bg-[#fafaf9] dark:bg-[#111] border border-[#eee] dark:border-[#2a2a2a] rounded-2xl p-6 group"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 4 + i * 0.7, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }}
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
        </div>
      </AnimatedSection>

      {/* ─── FAQ ─── */}
      <AnimatedSection className="py-20 px-6" variants={staggerContainer}>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
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
      <AnimatedSection className="py-20 px-6" variants={scaleIn}>
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
    </div>
  );
};

export default LandingPage;
