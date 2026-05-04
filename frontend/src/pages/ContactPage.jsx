import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import '../scss/ContactPage.scss';

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

const ContactPage = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const toggleTheme = () => setTheme(isDark ? 'light' : 'dark');
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
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
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setSubmitted(false), 5000);
    }, 1200);
  };

  return (
    <div className="ph-contact" data-theme={isDark ? 'dark' : 'light'}>
      {/* Navbar */}
      <nav className="ph-nav">
        <div className="ph-nav__inner">
          <Link to="/" className="ph-nav__logo"><span className="ph-nav__logo-icon">📰</span><span>MY News <b>Sentiment</b></span></Link>
          <div className="ph-nav__links">
            <Link to="/features">Features</Link>
            <Link to="/pricing">Pricing</Link>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
          </div>
          <div className="ph-nav__actions">
            <button className="ph-nav__theme" onClick={toggleTheme}>{isDark ? '☀️' : '🌙'}</button>
            <Link to="/login" className="ph-btn ph-btn--ghost">Log in</Link>
            <motion.button className="ph-btn ph-btn--primary" onClick={() => navigate('/register')} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>Get started free</motion.button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="ph-contact__hero">
        <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
          <motion.p className="ph-section-tag" variants={staggerItem}>Contact</motion.p>
          <motion.h1 className="ph-contact__title" variants={staggerItem}>Get in touch</motion.h1>
          <motion.p className="ph-contact__sub" variants={staggerItem}>Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.</motion.p>
        </motion.div>
      </header>

      {/* Content */}
      <section className="ph-contact__content">
        <div className="ph-container">
          <div className="ph-contact__grid">
            {/* Info Cards */}
            <motion.div className="ph-contact__info" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
              {[
                { icon: '📧', title: 'Email', detail: 'support@mynewssentiment.com', sub: 'We reply within 24 hours' },
                { icon: '📍', title: 'Location', detail: 'Universiti Malaysia Pahang Al-Sultan Abdullah', sub: 'Pekan, Pahang, Malaysia' },
                { icon: '⏰', title: 'Working Hours', detail: 'Mon - Fri, 9:00 AM - 6:00 PM', sub: 'Malaysia Time (GMT+8)' },
              ].map((item, i) => (
                <motion.div key={i} className="ph-contact__info-card" variants={staggerItem} whileHover={{ y: -4 }}>
                  <span className="ph-contact__info-icon">{item.icon}</span>
                  <div>
                    <h3>{item.title}</h3>
                    <p className="ph-contact__info-detail">{item.detail}</p>
                    <p className="ph-contact__info-sub">{item.sub}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Form */}
            <motion.form className="ph-contact__form" onSubmit={handleSubmit} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}>
              {submitted && (
                <motion.div className="ph-contact__success" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                  ✅ Message sent successfully! We'll get back to you soon.
                </motion.div>
              )}
              <div className="ph-contact__form-row">
                <div className="ph-contact__field">
                  <label>Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Your name" required />
                </div>
                <div className="ph-contact__field">
                  <label>Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" required />
                </div>
              </div>
              <div className="ph-contact__field">
                <label>Subject</label>
                <input type="text" name="subject" value={formData.subject} onChange={handleChange} placeholder="What's this about?" required />
              </div>
              <div className="ph-contact__field">
                <label>Message</label>
                <textarea name="message" value={formData.message} onChange={handleChange} placeholder="Tell us more..." rows={5} required />
              </div>
              <motion.button type="submit" className="ph-btn ph-btn--primary ph-btn--lg ph-contact__submit" disabled={sending} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                {sending ? 'Sending...' : 'Send message →'}
              </motion.button>
            </motion.form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="ph-footer">
        <div className="ph-footer__inner">
          <div className="ph-footer__brand"><span className="ph-footer__logo">📰 MY News <b>Sentiment</b></span><p>AI-powered sentiment analysis for Malaysian news.</p></div>
          <div className="ph-footer__links">
            <div className="ph-footer__col"><h4>Product</h4><Link to="/features">Features</Link><Link to="/pricing">Pricing</Link><Link to="/api">API</Link></div>
            <div className="ph-footer__col"><h4>Company</h4><Link to="/about">About</Link><Link to="/contact">Contact</Link><Link to="/jobs">Careers</Link></div>
            <div className="ph-footer__col"><h4>Legal</h4><Link to="/privacy">Privacy</Link></div>
          </div>
        </div>
        <div className="ph-footer__bottom"><p>© 2026 MY News Sentiment. All rights reserved.</p></div>
      </footer>
    </div>
  );
};

export default ContactPage;
