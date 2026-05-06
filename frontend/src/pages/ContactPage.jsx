import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import {
  Newspaper, Sun, Moon, Mail, MapPin, Clock, Send, CheckCircle
} from 'lucide-react';

// ── Animation Variants ──
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
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

const ContactPage = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const toggleTheme = () => setTheme(isDark ? 'light' : 'dark');
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSubmit = (e) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSubmitted(true);
      setFormData({ name: '', email: '', message: '' });
      setTimeout(() => setSubmitted(false), 5000);
    }, 1200);
  };

  const contactInfo = [
    { icon: Mail, title: 'Email', detail: 'support@mynewssentiment.com', sub: 'We reply within 24 hours' },
    { icon: MapPin, title: 'Location', detail: 'Universiti Malaysia Pahang Al-Sultan Abdullah', sub: 'Pekan, Pahang, Malaysia' },
    { icon: Clock, title: 'Working Hours', detail: 'Mon - Fri, 9:00 AM - 6:00 PM', sub: 'Malaysia Time (GMT+8)' },
  ];

  return (
    <div className="min-h-screen bg-[#fafaf9] dark:bg-[#0f0f0f] transition-colors">
      <Navbar isDark={isDark} toggleTheme={toggleTheme} navigate={navigate} />

      {/* ─── HERO ─── */}
      <motion.header className="relative pt-32 pb-12 px-6 text-center" initial="hidden" animate="visible" variants={staggerContainer}>
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-transparent dark:from-blue-950/20 dark:to-transparent" />
        <div className="relative max-w-3xl mx-auto">
          <motion.p variants={staggerItem} className="text-sm font-medium text-accent uppercase tracking-wider mb-3">Contact</motion.p>
          <motion.h1 variants={staggerItem} className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">Get in touch</motion.h1>
          <motion.p variants={staggerItem} className="text-lg text-gray-600 dark:text-gray-400">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </motion.p>
        </div>
      </motion.header>

      {/* ─── CONTENT ─── */}
      <section className="py-12 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Info Cards */}
          <motion.div className="lg:col-span-2 space-y-4" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
            {contactInfo.map((item, i) => (
              <motion.div
                key={i}
                className="flex items-start gap-4 p-5 bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] rounded-2xl"
                variants={staggerItem}
                whileHover={{ y: -2 }}
              >
                <div className="w-10 h-10 flex items-center justify-center bg-accent/10 rounded-xl flex-shrink-0">
                  <item.icon className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{item.title}</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5">{item.detail}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.sub}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Form */}
          <motion.form
            className="lg:col-span-3 p-8 bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] rounded-2xl"
            onSubmit={handleSubmit}
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
          >
            {submitted && (
              <motion.div
                className="flex items-center gap-2 p-4 mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-sm text-green-700 dark:text-green-300"
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              >
                <CheckCircle className="w-4 h-4" />
                Message sent successfully! We'll get back to you soon.
              </motion.div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Name</label>
                <input
                  type="text" name="name" value={formData.name} onChange={handleChange}
                  placeholder="Your name" required
                  className="w-full px-4 py-2.5 text-sm bg-[#fafaf9] dark:bg-[#0f0f0f] border border-[#eee] dark:border-[#2a2a2a] rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
                <input
                  type="email" name="email" value={formData.email} onChange={handleChange}
                  placeholder="you@example.com" required
                  className="w-full px-4 py-2.5 text-sm bg-[#fafaf9] dark:bg-[#0f0f0f] border border-[#eee] dark:border-[#2a2a2a] rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Message</label>
              <textarea
                name="message" value={formData.message} onChange={handleChange}
                placeholder="Tell us more..." rows={5} required
                className="w-full px-4 py-2.5 text-sm bg-[#fafaf9] dark:bg-[#0f0f0f] border border-[#eee] dark:border-[#2a2a2a] rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all resize-none"
              />
            </div>

            <motion.button
              type="submit"
              disabled={sending}
              className="w-full py-3 bg-accent text-white font-semibold rounded-xl shadow-lg shadow-accent/25 hover:shadow-accent/40 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            >
              {sending ? (
                'Sending...'
              ) : (
                <>
                  <Send className="w-4 h-4" /> Send Message
                </>
              )}
            </motion.button>
          </motion.form>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ContactPage;
