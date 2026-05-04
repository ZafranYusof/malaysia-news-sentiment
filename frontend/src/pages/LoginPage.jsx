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

const LoginPage = () => {
  const { login, guestLogin, googleLogin } = useAuth();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const [tab, setTab] = useState('email');
  const [form, setForm] = useState({ email: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMsg, setResetMsg] = useState('');
  const [guestLoading, setGuestLoading] = useState(false);

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = tab === 'email'
        ? { email: form.email, password: form.password }
        : { phone: form.phone, password: form.password };
      await login(payload);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    try { await googleLogin(); navigate('/dashboard'); }
    catch (err) { setError(err.response?.data?.error || 'Google login failed.'); }
  };

  const handleGuest = async () => {
    setGuestLoading(true);
    setError('');
    try { await guestLogin(); navigate('/dashboard'); }
    catch { setError('Guest login failed.'); }
    finally { setGuestLoading(false); }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setResetLoading(true);
    setResetMsg('');
    try {
      const res = await api.post('/auth/forgot-password', { email: resetEmail });
      setResetMsg(res.data.message);
    } catch (err) { setResetMsg(err.response?.data?.error || 'Something went wrong.'); }
    finally { setResetLoading(false); }
  };

  if (showReset) {
    return (
      <div className="ph-auth" data-theme={isDark ? 'dark' : 'light'}>
        <div className="ph-auth__bg" />
        <motion.div className="ph-auth__card" initial="hidden" animate="visible" variants={staggerContainer}>
          <motion.h1 className="ph-auth__title" variants={staggerItem}>Forgot Password</motion.h1>
          {resetMsg ? (
            <motion.div className="ph-auth__success" variants={staggerItem}>✅ {resetMsg}</motion.div>
          ) : (
            <motion.form className="ph-auth__form" onSubmit={handleForgotPassword} variants={staggerItem}>
              <div className="ph-auth__field">
                <label>Email Address</label>
                <input type="email" placeholder="name@email.com" value={resetEmail} onChange={e => setResetEmail(e.target.value)} required />
              </div>
              <motion.button type="submit" className="ph-btn ph-btn--primary ph-auth__submit" disabled={resetLoading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                {resetLoading ? 'Sending...' : 'Send Reset Link'}
              </motion.button>
            </motion.form>
          )}
          <motion.p className="ph-auth__note" variants={staggerItem}>
            Remembered? <button className="ph-auth__link" onClick={() => { setShowReset(false); setResetMsg(''); }}>Sign in</button>
          </motion.p>
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
          <h1 className="ph-auth__title">Welcome back</h1>
          <p className="ph-auth__subtitle">Login to your News Intelligence Dashboard</p>
        </motion.div>

        {/* Tabs */}
        <motion.div className="ph-auth__tabs" variants={staggerItem}>
          <button type="button" className={`ph-auth__tab ${tab === 'email' ? 'ph-auth__tab--active' : ''}`} onClick={() => setTab('email')}>Email</button>
          <button type="button" className={`ph-auth__tab ${tab === 'phone' ? 'ph-auth__tab--active' : ''}`} onClick={() => setTab('phone')}>Phone</button>
        </motion.div>

        {error && <motion.div className="ph-auth__error" variants={staggerItem}>{error}</motion.div>}

        {/* Input fields */}
        <motion.div className="ph-auth__field" variants={staggerItem}>
          <label>{tab === 'email' ? 'Email Address' : 'Phone Number'}</label>
          {tab === 'email' ? (
            <input type="email" name="email" placeholder="name@mail.com" value={form.email} onChange={handleChange} required />
          ) : (
            <input type="tel" name="phone" placeholder="+60 123 4567" value={form.phone} onChange={handleChange} required />
          )}
        </motion.div>

        <motion.div className="ph-auth__field" variants={staggerItem}>
          <div className="ph-auth__field-header">
            <label>Password</label>
            <button type="button" className="ph-auth__forgot" onClick={() => setShowReset(true)}>Forgot?</button>
          </div>
          <input type="password" name="password" placeholder="••••••••" value={form.password} onChange={handleChange} required />
        </motion.div>

        <motion.button type="submit" className="ph-btn ph-btn--primary ph-auth__submit" disabled={loading} variants={staggerItem} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
          {loading ? 'Processing...' : 'Sign In →'}
        </motion.button>

        <motion.div className="ph-auth__divider" variants={staggerItem}><span>Or continue with</span></motion.div>

        <motion.div className="ph-auth__social" variants={staggerItem}>
          <motion.button type="button" className="ph-auth__social-btn" onClick={handleGoogle} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
            <svg height="18" width="18" viewBox="0 0 32 32"><g transform="matrix(.727273 0 0 .727273 -.954545 -1.45455)"><path fill="#fbbc05" d="M0 37V11l17 13z"/><path fill="#ea4335" d="M0 11l17 13 7-6.1L48 14V0H0z"/><path fill="#34a853" d="M0 37l30-23 7.9 1L48 0v48H0z"/><path fill="#4285f4" d="M48 48L17 24l-4-3 35-10z"/></g></svg>
            Google
          </motion.button>
          <motion.button type="button" className="ph-auth__social-btn ph-auth__social-btn--guest" onClick={handleGuest} disabled={guestLoading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
            👤 {guestLoading ? 'Entering...' : 'Guest'}
          </motion.button>
        </motion.div>

        <motion.p className="ph-auth__note" variants={staggerItem}>
          Don't have an account? <Link to="/register" className="ph-auth__link">Create one</Link>
        </motion.p>
      </motion.form>
    </div>
  );
};

export default LoginPage;
