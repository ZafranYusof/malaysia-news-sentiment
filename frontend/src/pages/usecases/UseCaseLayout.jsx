import React, { useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useInView, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { Newspaper, Sun, Moon, ArrowRight } from 'lucide-react';

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

// ── Gradient Orbs ──
const GradientOrbs = ({ color1 = 'blue', color2 = 'purple' }) => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <motion.div
      className={`absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-${color1}-400/20 to-${color2}-500/10 blur-3xl`}
      animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
      transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
    />
    <motion.div
      className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-accent/15 to-teal-400/10 blur-3xl"
      animate={{ scale: [1.1, 1, 1.1], opacity: [0.4, 0.2, 0.4] }}
      transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
    />
  </div>
);

// ── Floating Particles ──
const FloatingParticles = ({ count = 15 }) => {
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
        <Link to="/#features" className="hover:text-accent transition-colors">Features</Link>
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

/**
 * UseCaseLayout - Shared layout for all use case pages
 * Props:
 * - badge: string (e.g. "For Researchers")
 * - title: string
 * - subtitle: string
 * - features: Array<{ icon: LucideIcon, title: string, desc: string, color: string }>
 * - steps: Array<{ num: string, title: string, desc: string }>
 * - accentColor: string (tailwind color class)
 */
const UseCaseLayout = ({ badge, title, subtitle, features, steps }) => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const toggleTheme = () => setTheme(isDark ? 'light' : 'dark');
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="min-h-screen bg-[#fafaf9] dark:bg-[#0f0f0f] transition-colors">
      {/* Scroll progress */}
      <motion.div className="fixed top-0 left-0 right-0 h-[3px] bg-accent origin-left z-[60]" style={{ scaleX }} />

      <Navbar isDark={isDark} toggleTheme={toggleTheme} navigate={navigate} />

      {/* ─── HERO ─── */}
      <motion.header
        className="relative pt-32 pb-16 px-6 text-center overflow-hidden"
        initial="hidden" animate="visible" variants={staggerContainer}
      >
        {!prefersReducedMotion && <GradientOrbs />}
        {!prefersReducedMotion && <FloatingParticles />}

        <div className="relative max-w-4xl mx-auto">
          <motion.div variants={staggerItem} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-6">
            {badge}
          </motion.div>
          <motion.h1 variants={staggerItem} className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white leading-tight mb-6">
            {title}
          </motion.h1>
          <motion.p variants={staggerItem} className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
            {subtitle}
          </motion.p>
          <motion.div variants={staggerItem}>
            <motion.button
              onClick={() => navigate('/register')}
              className="px-8 py-3.5 text-base font-semibold text-white bg-accent rounded-xl shadow-lg shadow-accent/25 hover:shadow-accent/40 transition-all"
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
            >
              Get Started Free <ArrowRight className="inline w-4 h-4 ml-1" />
            </motion.button>
          </motion.div>
        </div>
      </motion.header>

      {/* ─── KEY FEATURES ─── */}
      <AnimatedSection className="py-16 px-6" variants={staggerContainer}>
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-sm font-medium text-accent uppercase tracking-wider mb-2">Key Features</p>
          <h2 className="text-center text-3xl font-bold text-gray-900 dark:text-white mb-4">Built for your workflow</h2>
          <p className="text-center text-gray-500 dark:text-gray-400 max-w-xl mx-auto mb-12">
            Tools and insights tailored to help you get the most out of Malaysian news data.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                className="relative p-6 bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] rounded-2xl group overflow-hidden"
                variants={staggerItem}
                whileHover={{ y: -6, transition: { duration: 0.3 } }}
              >
                <div className="absolute inset-0 rounded-2xl border border-transparent group-hover:border-accent/30 transition-colors duration-300 pointer-events-none" />
                <div className="relative flex gap-4">
                  <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${f.color}`}>
                    <f.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{f.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ─── HOW IT WORKS ─── */}
      <AnimatedSection className="py-16 px-6 bg-white dark:bg-[#1a1a1a]" variants={staggerContainer}>
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-sm font-medium text-accent uppercase tracking-wider mb-2">How It Works</p>
          <h2 className="text-center text-3xl font-bold text-gray-900 dark:text-white mb-12">Your workflow, simplified</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                className="relative text-center p-8 bg-[#fafaf9] dark:bg-[#0f0f0f] border border-[#eee] dark:border-[#2a2a2a] rounded-2xl"
                variants={staggerItem}
                whileHover={{ y: -6 }}
              >
                <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center bg-accent/10 rounded-xl">
                  <span className="text-xl font-bold text-accent">{step.num}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{step.desc}</p>

                {i < 2 && (
                  <motion.div
                    className="hidden md:block absolute -right-6 top-1/2 -translate-y-1/2 text-accent/50"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <ArrowRight className="w-5 h-5" />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ─── CTA ─── */}
      <AnimatedSection className="py-16 px-6" variants={fadeInUp}>
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            className="relative p-12 rounded-3xl overflow-hidden"
            whileInView={{ opacity: 1, scale: 1 }}
            initial={{ opacity: 0, scale: 0.95 }}
            viewport={{ once: true }}
          >
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
            <div className="absolute inset-0 rounded-3xl border border-accent/20" />

            <div className="relative z-10">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Ready to get started?</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-8">Free to use. No credit card required.</p>
              <motion.button
                onClick={() => navigate('/register')}
                className="px-8 py-3.5 text-base font-semibold text-white bg-accent rounded-xl shadow-lg shadow-accent/25 hover:shadow-accent/40 transition-all"
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
              >
                Get Started Free <ArrowRight className="inline w-4 h-4 ml-1" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </AnimatedSection>

      <Footer />
    </div>
  );
};

export default UseCaseLayout;
