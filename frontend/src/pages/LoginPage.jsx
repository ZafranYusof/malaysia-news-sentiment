import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

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
      <div className={`min-h-screen flex items-center justify-center p-4 bg-[#fafaf9] dark:bg-[#0f0f0f] ${isDark ? 'dark' : ''}`}>
        <motion.div
          className="w-full max-w-md bg-white dark:bg-[#1a1a1a] rounded-2xl border border-[#eee] dark:border-[#2a2a2a] p-8 shadow-sm"
          initial="hidden" animate="visible" variants={staggerContainer}
        >
          <motion.h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6" variants={staggerItem}>
            Forgot Password
          </motion.h1>
          {resetMsg ? (
            <motion.div className="p-4 rounded-xl bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 text-sm" variants={staggerItem}>
              ✅ {resetMsg}
            </motion.div>
          ) : (
            <motion.form onSubmit={handleForgotPassword} variants={staggerItem} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Email Address</label>
                <input
                  type="email"
                  placeholder="name@email.com"
                  value={resetEmail}
                  onChange={e => setResetEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-[#111] border border-[#eee] dark:border-[#2a2a2a] text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
                />
              </div>
              <motion.button
                type="submit"
                disabled={resetLoading}
                className="w-full py-3 rounded-xl bg-accent text-white font-medium text-sm hover:bg-accent/90 disabled:opacity-50 transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                {resetLoading ? 'Sending...' : 'Send Reset Link'}
              </motion.button>
            </motion.form>
          )}
          <motion.p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6" variants={staggerItem}>
            Remembered?{' '}
            <button className="text-accent font-medium hover:underline" onClick={() => { setShowReset(false); setResetMsg(''); }}>
              Sign in
            </button>
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex ${isDark ? 'dark' : ''}`}>
      {/* Left side - Visual */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-accent to-secondary items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {/* Floating particles */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white rounded-full"
              style={{ left: `${20 + i * 12}%`, top: `${15 + i * 10}%` }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 3 + i * 0.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.3,
              }}
            />
          ))}
        </div>
        <div className="relative z-10 text-center text-white px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="text-6xl mb-6">📰</div>
            <h2 className="text-3xl font-bold mb-3">MY News Sentiment</h2>
            <p className="text-white/70 text-lg">AI-powered Malaysian news analysis and sentiment intelligence</p>
          </motion.div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-[#fafaf9] dark:bg-[#0f0f0f]">
        <motion.form
          onSubmit={handleSubmit}
          className="w-full max-w-md space-y-5"
          initial="hidden" animate="visible" variants={staggerContainer}
        >
          <motion.div variants={staggerItem} className="text-center lg:text-left">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Login to your News Intelligence Dashboard</p>
          </motion.div>

          {/* Tabs */}
          <motion.div className="flex gap-1 p-1 bg-gray-100 dark:bg-[#1a1a1a] rounded-xl" variants={staggerItem}>
            <button
              type="button"
              className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${tab === 'email' ? 'bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
              onClick={() => setTab('email')}
            >Email</button>
            <button
              type="button"
              className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${tab === 'phone' ? 'bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
              onClick={() => setTab('phone')}
            >Phone</button>
          </motion.div>

          {error && (
            <motion.div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-medium" variants={staggerItem}>
              {error}
            </motion.div>
          )}

          {/* Input fields */}
          <motion.div variants={staggerItem}>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
              {tab === 'email' ? 'Email Address' : 'Phone Number'}
            </label>
            {tab === 'email' ? (
              <input
                type="email" name="email" placeholder="name@mail.com"
                value={form.email} onChange={handleChange} required
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
              />
            ) : (
              <input
                type="tel" name="phone" placeholder="+60 123 4567"
                value={form.phone} onChange={handleChange} required
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
              />
            )}
          </motion.div>

          <motion.div variants={staggerItem}>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Password</label>
              <button type="button" className="text-xs text-accent hover:underline" onClick={() => setShowReset(true)}>Forgot?</button>
            </div>
            <input
              type="password" name="password" placeholder="••••••••"
              value={form.password} onChange={handleChange} required
              className="w-full px-4 py-3 rounded-xl bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
            />
          </motion.div>

          <motion.button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-accent text-white font-medium text-sm hover:bg-accent/90 disabled:opacity-50 transition-all shadow-sm shadow-accent/20"
            variants={staggerItem}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            {loading ? 'Processing...' : 'Sign In'}
          </motion.button>

          <motion.div className="relative flex items-center gap-3" variants={staggerItem}>
            <div className="flex-1 h-px bg-gray-200 dark:bg-[#2a2a2a]" />
            <span className="text-xs text-gray-400">Or continue with</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-[#2a2a2a]" />
          </motion.div>

          <motion.div className="flex gap-3" variants={staggerItem}>
            <motion.button
              type="button"
              onClick={handleGoogle}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#eee] dark:border-[#2a2a2a] bg-white dark:bg-[#1a1a1a] text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#222] transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              <svg height="16" width="16" viewBox="0 0 32 32"><g transform="matrix(.727273 0 0 .727273 -.954545 -1.45455)"><path fill="#fbbc05" d="M0 37V11l17 13z"/><path fill="#ea4335" d="M0 11l17 13 7-6.1L48 14V0H0z"/><path fill="#34a853" d="M0 37l30-23 7.9 1L48 0v48H0z"/><path fill="#4285f4" d="M48 48L17 24l-4-3 35-10z"/></g></svg>
              Google
            </motion.button>
            <motion.button
              type="button"
              onClick={handleGuest}
              disabled={guestLoading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#eee] dark:border-[#2a2a2a] bg-white dark:bg-[#1a1a1a] text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#222] transition-all disabled:opacity-50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              👤 {guestLoading ? 'Entering...' : 'Guest'}
            </motion.button>
          </motion.div>

          <motion.p className="text-center text-sm text-gray-500 dark:text-gray-400" variants={staggerItem}>
            Don't have an account?{' '}
            <Link to="/register" className="text-accent font-medium hover:underline">Create one</Link>
          </motion.p>
        </motion.form>
      </div>
    </div>
  );
};

export default LoginPage;
