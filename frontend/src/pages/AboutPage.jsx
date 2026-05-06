import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import {
  Newspaper, Sun, Moon, Code2, Database, Server, Brain, Palette, Globe,
  Users, GraduationCap, Building2, Calendar, ArrowRight
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
    { name: 'React', icon: Code2, desc: 'Frontend UI framework', color: 'text-cyan-500' },
    { name: 'Node.js', icon: Server, desc: 'Backend runtime', color: 'text-green-500' },
    { name: 'MongoDB', icon: Database, desc: 'NoSQL database', color: 'text-emerald-500' },
    { name: 'Express', icon: Globe, desc: 'Backend framework', color: 'text-gray-500' },
    { name: 'Ollama', icon: Brain, desc: 'AI inference engine', color: 'text-orange-500' },
    { name: 'Framer Motion', icon: Palette, desc: 'Animation library', color: 'text-purple-500' },
  ];

  const team = [
    { name: 'Muhammad Zafran', role: 'Lead Developer', initials: 'MZ' },
    { name: 'Dr. Supervisor', role: 'Project Advisor', initials: 'DS' },
    { name: 'UMPSA FSKKP', role: 'Faculty Support', initials: 'UF' },
  ];

  const milestones = [
    { date: 'Sep 2025', title: 'Project Kickoff', desc: 'FYP proposal approved at UMPSA FSKKP.' },
    { date: 'Nov 2025', title: 'Core Architecture', desc: 'Backend API, MongoDB schema, and React frontend scaffolded.' },
    { date: 'Jan 2026', title: 'AI Pipeline Live', desc: 'Multi-tier sentiment analysis with GPT-4o + Malaya NLP integrated.' },
    { date: 'Mar 2026', title: 'Beta Launch', desc: 'Dashboard, forecasting, and real-time analysis features deployed.' },
    { date: 'May 2026', title: 'FYP Presentation', desc: 'Final demonstration and thesis submission.' },
  ];

  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="min-h-screen bg-[#fafaf9] dark:bg-[#0f0f0f] transition-colors">
      <Navbar isDark={isDark} toggleTheme={toggleTheme} navigate={navigate} />

      {/* ─── HERO ─── */}
      <motion.header className="relative pt-32 pb-16 px-6 text-center" initial="hidden" animate="visible" variants={staggerContainer}>
        <div className="absolute inset-0 bg-gradient-to-b from-purple-50/50 to-transparent dark:from-purple-950/20 dark:to-transparent" />
        <div className="relative max-w-4xl mx-auto">
          <motion.div variants={staggerItem} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-6">
            About Us
          </motion.div>
          <motion.h1 variants={staggerItem} className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white leading-tight mb-6">
            Making Malaysian news intelligence{' '}
            <span className="text-accent">accessible to everyone</span>
          </motion.h1>
          <motion.p variants={staggerItem} className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            We're building the infrastructure to monitor, analyze, and predict news sentiment across Malaysia's multilingual media landscape.
          </motion.p>
        </div>
      </motion.header>

      {/* ─── STATS ─── */}
      <AnimatedSection className="py-12 px-6" variants={staggerContainer}>
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6" ref={statsRef}>
          {[
            { num: `${counters.articles.toLocaleString()}+`, label: 'Articles Analyzed', icon: Newspaper },
            { num: `${counters.accuracy}%`, label: 'AI Accuracy', icon: Brain },
            { num: counters.sources, label: 'News Sources', icon: Globe },
          ].map((s, i) => (
            <motion.div
              key={i}
              className="text-center p-6 bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] rounded-2xl"
              variants={staggerItem}
              whileHover={{ y: -4 }}
            >
              <s.icon className="w-8 h-8 text-accent mx-auto mb-3" />
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{s.num}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </AnimatedSection>

      {/* ─── MISSION ─── */}
      <AnimatedSection className="py-16 px-6" variants={fadeInUp}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Our Mission</h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
            To provide transparent, unbiased, and accessible news sentiment analysis for Malaysia. We believe that understanding media narratives is essential for informed decision-making in a democratic society.
          </p>
        </div>
      </AnimatedSection>

      {/* ─── TECH STACK ─── */}
      <section className="py-16 px-6 bg-white dark:bg-[#1a1a1a]">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-sm font-medium text-accent uppercase tracking-wider mb-2">Technology</p>
          <h2 className="text-center text-3xl font-bold text-gray-900 dark:text-white mb-4">Built with modern tools</h2>
          <p className="text-center text-gray-500 dark:text-gray-400 max-w-xl mx-auto mb-10">A full-stack architecture designed for real-time sentiment analysis at scale.</p>

          <AnimatedSection className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" variants={staggerContainer}>
            {techStack.map((tech) => (
              <motion.div
                key={tech.name}
                className="p-6 bg-[#fafaf9] dark:bg-[#0f0f0f] border border-[#eee] dark:border-[#2a2a2a] rounded-2xl hover:border-accent/50 transition-all"
                variants={staggerItem}
                whileHover={{ y: -4 }}
              >
                <tech.icon className={`w-8 h-8 ${tech.color} mb-3`} />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{tech.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{tech.desc}</p>
              </motion.div>
            ))}
          </AnimatedSection>
        </div>
      </section>

      {/* ─── TEAM ─── */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-sm font-medium text-accent uppercase tracking-wider mb-2">Team</p>
          <h2 className="text-center text-3xl font-bold text-gray-900 dark:text-white mb-4">The people behind the platform</h2>
          <p className="text-center text-gray-500 dark:text-gray-400 max-w-xl mx-auto mb-10">A dedicated team building the future of Malaysian media intelligence.</p>

          <AnimatedSection className="grid grid-cols-1 sm:grid-cols-3 gap-6" variants={staggerContainer}>
            {team.map((member) => (
              <motion.div
                key={member.name}
                className="text-center p-8 bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] rounded-2xl"
                variants={staggerItem}
                whileHover={{ y: -4 }}
              >
                <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-accent/10 text-accent font-bold text-xl rounded-full">
                  {member.initials}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{member.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{member.role}</p>
              </motion.div>
            ))}
          </AnimatedSection>
        </div>
      </section>

      {/* ─── TIMELINE ─── */}
      <section className="py-16 px-6 bg-white dark:bg-[#1a1a1a]">
        <div className="max-w-3xl mx-auto">
          <p className="text-center text-sm font-medium text-accent uppercase tracking-wider mb-2">Milestones</p>
          <h2 className="text-center text-3xl font-bold text-gray-900 dark:text-white mb-10">Our journey so far</h2>

          <AnimatedSection className="relative" variants={staggerContainer}>
            {/* Vertical line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-[#eee] dark:bg-[#2a2a2a]" />

            <div className="space-y-8">
              {milestones.map((ms, i) => (
                <motion.div key={i} className="relative pl-16" variants={staggerItem}>
                  <div className="absolute left-4 top-1 w-4 h-4 rounded-full bg-accent border-4 border-white dark:border-[#1a1a1a]" />
                  <span className="text-xs font-bold text-accent uppercase tracking-wider">{ms.date}</span>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-1">{ms.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{ms.desc}</p>
                </motion.div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ─── UMPSA Banner ─── */}
      <AnimatedSection className="py-16 px-6" variants={fadeInUp}>
        <div className="max-w-3xl mx-auto text-center p-10 bg-gradient-to-br from-accent/5 to-secondary/5 border border-accent/20 rounded-3xl">
          <GraduationCap className="w-12 h-12 text-accent mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Built at UMPSA</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            This platform is developed as a Final Year Project (FYP) at Universiti Malaysia Pahang Al-Sultan Abdullah (UMPSA), Faculty of Computing (FSKKP).
          </p>
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] rounded-full text-sm text-gray-600 dark:text-gray-400">
            <Building2 className="w-4 h-4" /> UMPSA · Gambang, Pahang
          </span>
        </div>
      </AnimatedSection>

      <Footer />
    </div>
  );
};

export default AboutPage;
