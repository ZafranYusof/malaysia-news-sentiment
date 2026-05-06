import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { motion, useInView, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  BarChart3, Network, TrendingUp, ShieldCheck, Brain, FileDown,
  Search, Zap, LineChart, Sun, Moon, ArrowRight, Play, Newspaper,
  ChevronRight, Star, Globe, Clock
} from 'lucide-react';

// ── Animation Variants ──
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
const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
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

const LandingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const toggleTheme = () => setTheme(isDark ? 'light' : 'dark');

  // Parallax
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -60]);

  // Stats counter
  const [statsVisible, setStatsVisible] = useState(false);
  const [counters, setCounters] = useState({ articles: 0, sources: 0, accuracy: 0 });
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
    const targets = { articles: 1000, sources: 50, accuracy: 95 };
    const duration = 2000, steps = 60, interval = duration / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const eased = 1 - Math.pow(1 - Math.min(step / steps, 1), 3);
      setCounters({
        articles: Math.round(targets.articles * eased),
        sources: Math.round(targets.sources * eased),
        accuracy: Math.round(targets.accuracy * eased),
      });
      if (step >= steps) clearInterval(timer);
    }, interval);
    return () => clearInterval(timer);
  }, [statsVisible]);

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
    { icon: BarChart3, title: 'Sentiment Analysis', desc: 'Classify news articles into positive, negative, and neutral sentiment using fine-tuned transformer models.', color: 'text-green-500' },
    { icon: Network, title: 'Entity Graph', desc: 'Extract and visualize relationships between public figures, organizations, and locations.', color: 'text-blue-500' },
    { icon: TrendingUp, title: 'Trending Topics', desc: 'Track emerging narratives and trending topics across Malaysian news in real-time.', color: 'text-orange-500' },
    { icon: ShieldCheck, title: 'Source Credibility', desc: 'Evaluate source reliability and detect bias patterns across multiple outlets.', color: 'text-purple-500' },
    { icon: Brain, title: 'AI Insights', desc: 'Get AI-powered summaries, predictions, and actionable intelligence from news data.', color: 'text-pink-500' },
    { icon: FileDown, title: 'Export Reports', desc: 'Generate PowerPoint presentations and CSV exports with one click.', color: 'text-teal-500' },
  ];

  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen bg-[#fafaf9] dark:bg-[#0f0f0f] transition-colors">
      <Navbar isDark={isDark} toggleTheme={toggleTheme} navigate={navigate} />

      {/* ─── HERO ─── */}
      <motion.header className="relative pt-32 pb-20 px-6 overflow-hidden" style={{ y: heroY }}>
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-transparent dark:from-blue-950/20 dark:to-transparent" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-accent/5 rounded-full blur-3xl" />

        <motion.div className="relative max-w-5xl mx-auto text-center" initial="hidden" animate="visible" variants={staggerContainer}>
          {/* Badge */}
          <motion.div variants={staggerItem} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-8">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            AI-Powered News Intelligence
          </motion.div>

          {/* Title */}
          <motion.h1 variants={staggerItem} className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-white leading-tight mb-6">
            Malaysia News Sentiment{' '}
            <span className="text-accent">Dashboard</span>
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

          {/* CTA */}
          <motion.div variants={staggerItem} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.button
              onClick={() => navigate('/register')}
              className="px-8 py-3.5 text-base font-semibold text-white bg-accent rounded-xl shadow-lg shadow-accent/25 hover:shadow-accent/40 transition-all"
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
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

          {/* Source tags */}
          <motion.div variants={staggerItem} className="mt-12 flex flex-wrap items-center justify-center gap-3">
            <span className="text-xs text-gray-400 uppercase tracking-wider">Powered by</span>
            {['Malaysiakini', 'Astro Awani', 'FMT', 'Bernama', 'The Star'].map((s, i) => (
              <motion.span
                key={s}
                className="px-3 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] rounded-full"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1 + i * 0.1, duration: 0.4 }}
              >
                {s}
              </motion.span>
            ))}
          </motion.div>
        </motion.div>
      </motion.header>

      {/* ─── STATS ─── */}
      <AnimatedSection className="py-16 px-6" variants={staggerContainer}>
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8" ref={statsRef}>
          {[
            { num: `${counters.articles.toLocaleString()}+`, label: 'Articles Analyzed', icon: Newspaper },
            { num: `${counters.sources}+`, label: 'News Sources', icon: Globe },
            { num: `${counters.accuracy}%`, label: 'AI Accuracy', icon: Star },
          ].map((s, i) => (
            <motion.div
              key={i}
              className="text-center p-6 bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] rounded-2xl"
              variants={staggerItem}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <s.icon className="w-8 h-8 text-accent mx-auto mb-3" />
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{s.num}</div>
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
                className="p-6 bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] rounded-2xl hover:border-accent/50 transition-all group"
                variants={staggerItem}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
              >
                <f.icon className={`w-10 h-10 ${f.color} mb-4 group-hover:scale-110 transition-transform`} />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>
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
            {/* Connecting line */}
            <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-accent/20 via-accent to-accent/20" />

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
                <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center bg-accent/10 rounded-xl">
                  <step.icon className="w-6 h-6 text-accent" />
                </div>
                <span className="text-xs font-bold text-accent uppercase tracking-wider">{step.num}</span>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-2 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{step.desc}</p>
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
          <div className="flex flex-wrap items-center justify-center gap-3">
            {['React', 'Express', 'MongoDB', 'Ollama', 'NLP', 'Tailwind', 'Framer Motion'].map((tech) => (
              <motion.span
                key={tech}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] rounded-xl"
                whileHover={{ scale: 1.05, borderColor: '#2563eb' }}
              >
                {tech}
              </motion.span>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ─── CTA ─── */}
      <AnimatedSection className="py-20 px-6" variants={scaleIn}>
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            className="p-12 bg-gradient-to-br from-accent/5 to-secondary/5 border border-accent/20 rounded-3xl"
            whileInView={{ opacity: 1, scale: 1 }}
            initial={{ opacity: 0, scale: 0.95 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Start analyzing Malaysian news today</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8">Free to get started. No credit card required.</p>
            <motion.button
              onClick={() => navigate('/register')}
              className="px-8 py-3.5 text-base font-semibold text-white bg-accent rounded-xl shadow-lg shadow-accent/25 hover:shadow-accent/40 transition-all"
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
            >
              Get Started Free <ArrowRight className="inline w-4 h-4 ml-1" />
            </motion.button>
          </motion.div>
        </div>
      </AnimatedSection>

      <Footer />
    </div>
  );
};

export default LandingPage;
