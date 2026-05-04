import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import '../scss/AuthPage.scss';

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

const RegisterPage = () => {
  const { googleLogin } = useAuth();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const [tab, setTab] = useState('email');
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) return setError('Passwords do not match.');
    if (form.password.length < 6) return setError('Password must be at least 6 characters.');
    setLoading(true);
    try {
      const payload = { name: form.name, password: form.password, ...(tab === 'email' ? { email: form.email } : { phone: form.phone }) };
      const res = await api.post('/auth/register', payload);
      setSuccess(res.data.message);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  const handleGoogle = async () => {
    setError('');
    try { await googleLogin(); navigate('/dashboard'); }
    catch (err) { setError(err.response?.data?.error || 'Google signup failed.'); }
  };

  if (success) {
    return (
      <div className="ph-auth" data-theme={isDark ? 'dark' : 'light'}>
        <div className="ph-auth__bg" />
        <motion.div className="ph-auth__card" initial="hidden" animate="visible" variants={staggerContainer}>
          <motion.div className="ph-auth__success" variants={staggerItem}>
            <span style={{ fontSize: 48 }}>🎉</span>
            <h2>Account Created!</h2>
            <p>{success}</p>
          </motion.div>
          <motion.div variants={staggerItem}>
            <Link to="/login" className="ph-btn ph-btn--primary ph-auth__submit" style={{ textAlign: 'center', display: 'block' }}>Go to Login →</Link>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="ph-auth" data-theme={isDark ? 'dark' : 'light'}>
      <div className="ph-auth__bg" />
      <motion.form className="ph-auth__card" onSubmit={handleSubmit} initial="hidden" animate="visible" variants={staggerContainer}>
        <motion.div className="ph-auth__logo" variants={staggerItem}>
          <span>📰</span>
        </motion.div>

        <motion.div className="ph-auth__header" variants={staggerItem}>
          <h1 className="ph-auth__title">Create your account</h1>
          <p className="ph-auth__subtitle">Start analyzing Malaysian news sentiment for free</p>
        </motion.div>

        {/* Tabs */}
        <motion.div className="ph-auth__tabs" variants={staggerItem}>
          <button type="button" className={`ph-auth__tab ${tab === 'email' ? 'ph-auth__tab--active' : ''}`} onClick={() => setTab('email')}>Email</button>
          <button type="button" className={`ph-auth__tab ${tab === 'phone' ? 'ph-auth__tab--active' : ''}`} onClick={() => setTab('phone')}>Phone</button>
        </motion.div>

        {error && <motion.div className="ph-auth__error" variants={staggerItem}>{error}</motion.div>}

        <motion.div className="ph-auth__field" variants={staggerItem}>
          <label>Full Name</label>
          <input type="text" name="name" placeholder="Muhammad Zafran" value={form.name} onChange={handleChange} required />
        </motion.div>

        <motion.div className="ph-auth__field" variants={staggerItem}>
          <label>{tab === 'email' ? 'Email Address' : 'Phone Number'}</label>
          {tab === 'email' ? (
            <input type="email" name="email" placeholder="name@mail.com" value={form.email} onChange={handleChange} required />
          ) : (
            <input type="tel" name="phone" placeholder="+60 123 4567" value={form.phone} onChange={handleChange} required />
          )}
        </motion.div>

        <motion.div className="ph-auth__field" variants={staggerItem}>
          <label>Password</label>
          <input type="password" name="password" placeholder="Min 6 characters" value={form.password} onChange={handleChange} required />
        </motion.div>

        <motion.div className="ph-auth__field" variants={staggerItem}>
          <label>Confirm Password</label>
          <input type="password" name="confirm" placeholder="Re-enter password" value={form.confirm} onChange={handleChange} required />
        </motion.div>

        <motion.button type="submit" className="ph-btn ph-btn--primary ph-auth__submit" disabled={loading} variants={staggerItem} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
          {loading ? 'Creating...' : 'Create Account →'}
        </motion.button>

        <motion.div className="ph-auth__divider" variants={staggerItem}><span>Or sign up with</span></motion.div>

        <motion.div className="ph-auth__social" variants={staggerItem}>
          <motion.button type="button" className="ph-auth__social-btn" onClick={handleGoogle} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
            <svg height="18" width="18" viewBox="0 0 32 32"><g transform="matrix(.727273 0 0 .727273 -.954545 -1.45455)"><path fill="#fbbc05" d="M0 37V11l17 13z"/><path fill="#ea4335" d="M0 11l17 13 7-6.1L48 14V0H0z"/><path fill="#34a853" d="M0 37l30-23 7.9 1L48 0v48H0z"/><path fill="#4285f4" d="M48 48L17 24l-4-3 35-10z"/></g></svg>
            Google
          </motion.button>
        </motion.div>

        <motion.p className="ph-auth__note" variants={staggerItem}>
          Already have an account? <Link to="/login" className="ph-auth__link">Sign in</Link>
        </motion.p>
      </motion.form>
    </div>
  );
};

export default RegisterPage;
