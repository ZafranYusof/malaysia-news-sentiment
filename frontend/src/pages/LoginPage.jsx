import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

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
    try {
      await googleLogin();
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Google login failed.');
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setResetLoading(true);
    setResetMsg('');
    try {
      const res = await api.post('/auth/forgot-password', { email: resetEmail });
      setResetMsg(res.data.message);
    } catch (err) {
      setResetMsg(err.response?.data?.error || 'Something went wrong.');
    } finally {
      setResetLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }
  };

  const styles = getStyles(isDark);

  if (showReset) {
    return (
      <div style={styles.page}>
        <style>{getKeyframes(isDark)}</style>
        <div style={styles.background} />
        {isDark && <><div style={styles.orb1} /><div style={styles.orb2} /><div style={styles.orb3} /></>}
        {!isDark && <><div style={styles.orbLight1} /><div style={styles.orbLight2} /></>}
        <motion.div
          style={styles.card}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} style={styles.logoContainer}>
            Forgot Password
          </motion.div>

          {resetMsg ? (
            <motion.div variants={itemVariants} style={styles.successBox}>
              <svg style={{ marginBottom: 10 }} width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <div>{resetMsg}</div>
            </motion.div>
          ) : (
            <motion.form variants={itemVariants} style={styles.form} onSubmit={handleForgotPassword}>
              <div style={styles.formGroup}>
                <label style={styles.label} htmlFor="email">Email Address</label>
                <input
                  style={styles.input}
                  type="email"
                  id="email"
                  name="email"
                  placeholder="name@email.com"
                  value={resetEmail}
                  onChange={e => setResetEmail(e.target.value)}
                  required
                />
              </div>

              <motion.button
                style={styles.submitBtn}
                type="submit"
                disabled={resetLoading}
                whileHover={{ scale: 1.02, boxShadow: isDark ? '0 0 20px rgba(77,122,255,0.4)' : '0 0 20px rgba(37,99,235,0.3)' }}
                whileTap={{ scale: 0.98 }}
              >
                {resetLoading ? 'Sending...' : 'Send Reset Link'}
              </motion.button>
            </motion.form>
          )}

          <motion.p variants={itemVariants} style={styles.note}>
            Remembered?{' '}
            <button style={styles.link} onClick={() => { setShowReset(false); setResetMsg(''); }}>Sign in</button>
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <style>{getKeyframes(isDark)}</style>
      <div style={styles.background} />
      {isDark && <><div style={styles.orb1} /><div style={styles.orb2} /><div style={styles.orb3} /></>}
      {!isDark && <><div style={styles.orbLight1} /><div style={styles.orbLight2} /></>}

      <motion.form
        style={styles.card}
        onSubmit={handleSubmit}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} style={styles.logoBox}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" />
          </svg>
        </motion.div>

        <motion.div variants={itemVariants} style={styles.titleContainer}>
          <p style={styles.title}>Welcome back</p>
          <span style={styles.subtitle}>Login to your News Intelligence Dashboard</span>
        </motion.div>

        <motion.div variants={itemVariants} style={styles.tabRow}>
          <button type="button" style={tab === 'email' ? styles.tabActive : styles.tabBtn} onClick={() => setTab('email')}>Email</button>
          <button type="button" style={tab === 'phone' ? styles.tabActive : styles.tabBtn} onClick={() => setTab('phone')}>Phone</button>
        </motion.div>

        {error && (
          <motion.div variants={itemVariants} style={styles.errorBox}>
            <span>{error}</span>
          </motion.div>
        )}

        <motion.div variants={itemVariants} style={styles.inputContainer}>
          <label style={styles.inputLabel}>{tab === 'email' ? 'Email Address' : 'Phone Number'}</label>
          <div style={{ position: 'relative' }}>
            <svg fill="none" viewBox="0 0 24 24" height="24" width="24" xmlns="http://www.w3.org/2000/svg" style={styles.icon}>
              <path strokeLinejoin="round" strokeLinecap="round" strokeWidth="1.5" stroke={isDark ? '#94a3b8' : '#141B34'} d="M7 8.5L9.94202 10.2394C11.6572 11.2535 12.3428 11.2535 14.058 10.2394L17 8.5" />
              <path strokeLinejoin="round" strokeWidth="1.5" stroke={isDark ? '#94a3b8' : '#141B34'} d="M2.01577 13.4756C2.08114 16.5412 2.11383 18.0739 3.24496 19.2094C4.37608 20.3448 5.95033 20.3843 9.09883 20.4634C11.0393 20.5122 12.9607 20.5122 14.9012 20.4634C18.0497 20.3843 19.6239 20.3448 20.7551 19.2094C21.8862 18.0739 21.9189 16.5412 21.9842 13.4756C22.0053 12.4899 22.0053 11.5101 21.9842 10.5244C21.9189 7.45886 21.8862 5.92609 20.7551 4.79066C19.6239 3.65523 18.0497 3.61568 14.9012 3.53657C12.9607 3.48781 11.0393 3.48781 9.09882 3.53656C5.95033 3.61566 4.37608 3.65521 3.24495 4.79065C2.11382 5.92608 2.08114 7.45885 2.01576 10.5244C1.99474 11.5101 1.99475 12.4899 2.01577 13.4756Z" />
            </svg>
            {tab === 'email' ? (
              <input placeholder="name@mail.com" style={styles.inputField} name="email" type="email" value={form.email} onChange={handleChange} required />
            ) : (
              <input placeholder="+60 123 4567" style={styles.inputField} name="phone" type="tel" value={form.phone} onChange={handleChange} required />
            )}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} style={styles.inputContainer}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={styles.inputLabel}>Password</label>
            <button type="button" style={styles.forgotLink} onClick={() => setShowReset(true)}>Forgot Password?</button>
          </div>
          <div style={{ position: 'relative' }}>
            <svg fill="none" viewBox="0 0 24 24" height="24" width="24" xmlns="http://www.w3.org/2000/svg" style={styles.icon}>
              <path strokeLinecap="round" strokeWidth="1.5" stroke={isDark ? '#94a3b8' : '#141B34'} d="M18 11.0041C17.4166 9.91704 16.273 9.15775 14.9519 9.0993C13.477 9.03404 11.9788 9 10.329 9C8.67911 9 7.18091 9.03404 5.70604 9.0993C3.95328 9.17685 2.51295 10.4881 2.27882 12.1618C2.12602 13.2541 2 14.3734 2 15.5134C2 16.6534 2.12602 17.7727 2.27882 18.865C2.51295 20.5387 3.95328 21.8499 5.70604 21.9275C6.42013 21.9591 7.26041 21.9834 8 22" />
              <path strokeLinejoin="round" strokeLinecap="round" strokeWidth="1.5" stroke={isDark ? '#94a3b8' : '#141B34'} d="M6 9V6.5C6 4.01472 8.01472 2 10.5 2C12.9853 2 15 4.01472 15 6.5V9" />
            </svg>
            <input placeholder="••••••••" style={styles.inputField} name="password" type="password" value={form.password} onChange={handleChange} required />
          </div>
        </motion.div>

        <motion.button
          variants={itemVariants}
          type="submit"
          style={styles.signInBtn}
          disabled={loading}
          whileHover={{ scale: 1.02, boxShadow: isDark ? '0 0 25px rgba(77,122,255,0.5)' : '0 0 20px rgba(37,99,235,0.3)' }}
          whileTap={{ scale: 0.98 }}
        >
          {loading ? 'Processing...' : 'Sign In'}
        </motion.button>

        <motion.div variants={itemVariants} style={styles.separator}>
          <hr style={styles.line} />
          <span>Or</span>
          <hr style={styles.line} />
        </motion.div>

        <motion.button
          variants={itemVariants}
          type="button"
          style={styles.googleBtn}
          onClick={handleGoogle}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <svg height="18" width="18" viewBox="0 0 32 32">
            <g transform="matrix(.727273 0 0 .727273 -.954545 -1.45455)">
              <path fill="#fbbc05" d="M0 37V11l17 13z" />
              <path fill="#ea4335" d="M0 11l17 13 7-6.1L48 14V0H0z" />
              <path fill="#34a853" d="M0 37l30-23 7.9 1L48 0v48H0z" />
              <path fill="#4285f4" d="M48 48L17 24l-4-3 35-10z" />
            </g>
          </svg>
          <span>Continue with Google</span>
        </motion.button>

        <motion.button
          variants={itemVariants}
          type="button"
          style={styles.appleBtn}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <svg preserveAspectRatio="xMidYMid" version="1.1" viewBox="0 0 256 315" height="20px" width="16px">
            <path fill="#ffffff" d="M213.803394,167.030943 C214.2452,214.609646 255.542482,230.442639 256,230.644727 C255.650812,231.761357 249.401383,253.208293 234.24263,275.361446 C221.138555,294.513969 207.538253,313.596333 186.113759,313.991545 C165.062051,314.379442 158.292752,301.507828 134.22469,301.507828 C110.163898,301.507828 102.642899,313.596301 82.7151126,314.379442 C62.0350407,315.16201 46.2873831,293.668525 33.0744079,274.586162 C6.07529317,235.552544 -14.5576169,164.286328 13.147166,116.18047 C26.9103111,92.2909053 51.5060917,77.1630356 78.2026125,76.7751096 C98.5099145,76.3877456 117.677594,90.4371851 130.091705,90.4371851 C142.497945,90.4371851 165.790755,73.5415029 190.277627,76.0228474 C200.528668,76.4495055 229.303509,80.1636878 247.780625,107.209389 C246.291825,108.132333 213.44635,127.253405 213.803394,167.030988 M174.239142,50.1987033 C185.218331,36.9088319 192.607958,18.4081019 190.591988,0 C174.766312,0.636050225 155.629514,10.5457909 144.278109,23.8283506 C134.10507,35.5906758 125.195775,54.4170275 127.599657,72.4607932 C145.239231,73.8255433 163.259413,63.4970262 174.239142,50.1987249" />
          </svg>
          <span>Continue with Apple</span>
        </motion.button>

        <motion.div variants={itemVariants} style={styles.separator}>
          <hr style={styles.line} />
          <span>Or try</span>
          <hr style={styles.line} />
        </motion.div>

        <motion.button
          variants={itemVariants}
          type="button"
          style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: 12,
            border: `1px solid ${isDark ? 'rgba(99,102,241,0.3)' : 'rgba(99,102,241,0.4)'}`,
            background: isDark ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.05)',
            color: isDark ? '#a5b4fc' : '#4f46e5',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
          onClick={async () => {
            setGuestLoading(true);
            setError('');
            try {
              await guestLogin();
              navigate('/dashboard');
            } catch (err) {
              setError('Guest login failed. Please try again.');
            } finally {
              setGuestLoading(false);
            }
          }}
          disabled={guestLoading}
          whileHover={{ scale: 1.02, borderColor: isDark ? 'rgba(99,102,241,0.5)' : 'rgba(99,102,241,0.6)' }}
          whileTap={{ scale: 0.98 }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
          {guestLoading ? 'Entering...' : 'Continue as Guest'}
        </motion.button>

        <motion.p variants={itemVariants} style={{ ...styles.note, marginTop: 8, fontSize: 11, opacity: 0.6 }}>
          Guest mode has limited features. Sign up for full access.
        </motion.p>

        <motion.p variants={itemVariants} style={styles.note}>
          Don't have an account? <Link to="/register" style={styles.link}>Create one</Link>
        </motion.p>
      </motion.form>
    </div>
  );
};

function getKeyframes(isDark) {
  return `
    @keyframes floatOrb1 {
      0% { transform: translate(0, 0) scale(1); }
      33% { transform: translate(30px, -20px) scale(1.05); }
      66% { transform: translate(-20px, 15px) scale(0.95); }
      100% { transform: translate(0, 0) scale(1); }
    }
    @keyframes floatOrb2 {
      0% { transform: translate(0, 0) scale(1); }
      33% { transform: translate(-25px, 20px) scale(1.03); }
      66% { transform: translate(15px, -25px) scale(0.97); }
      100% { transform: translate(0, 0) scale(1); }
    }
    @keyframes floatOrb3 {
      0% { transform: translate(0, 0) scale(1); }
      50% { transform: translate(20px, 20px) scale(1.04); }
      100% { transform: translate(0, 0) scale(1); }
    }
  `;
}

function getStyles(isDark) {
  const page = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: isDark ? '#0B0D14' : '#f8fafc',
    minHeight: '100vh',
    fontFamily: '"Inter", sans-serif',
    position: 'relative',
    overflow: 'hidden',
  };

  const background = isDark
    ? { position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 0%, rgba(77,122,255,0.08) 0%, transparent 60%)', zIndex: 0 }
    : { position: 'absolute', inset: 0, background: 'radial-gradient(125% 125% at 50% 10%, #f8fbff 30%, #7c3aed 100%)', zIndex: 0 };

  // Dark mode orbs
  const orb1 = {
    position: 'absolute', width: 600, height: 600, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(77,122,255,0.15) 0%, transparent 70%)',
    left: '-10%', top: '-15%', zIndex: 0, filter: 'blur(60px)',
    animation: 'floatOrb1 16s ease-in-out infinite',
  };
  const orb2 = {
    position: 'absolute', width: 500, height: 500, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)',
    right: '-12%', bottom: '-10%', zIndex: 0, filter: 'blur(60px)',
    animation: 'floatOrb2 20s ease-in-out infinite',
  };
  const orb3 = {
    position: 'absolute', width: 300, height: 300, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(14,165,233,0.1) 0%, transparent 70%)',
    left: '50%', top: '60%', zIndex: 0, filter: 'blur(40px)',
    animation: 'floatOrb3 14s ease-in-out infinite',
  };

  // Light mode orbs
  const orbLight1 = {
    position: 'absolute', width: 780, height: 780, borderRadius: '50%',
    background: 'radial-gradient(circle at 30% 30%, rgba(124,58,237,0.9), rgba(99,102,241,0.45))',
    left: '-8%', top: '-22%', zIndex: 0, filter: 'blur(80px)', opacity: 0.95,
    animation: 'floatOrb1 14s ease-in-out infinite',
  };
  const orbLight2 = {
    position: 'absolute', width: 560, height: 560, borderRadius: '50%',
    background: 'radial-gradient(circle at 70% 70%, rgba(14,165,233,0.55), rgba(59,130,246,0.28))',
    right: '-14%', bottom: '-16%', zIndex: 0, filter: 'blur(80px)', opacity: 0.95,
    animation: 'floatOrb2 18s ease-in-out infinite',
  };

  const card = {
    width: 400,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 15,
    padding: 40,
    backgroundColor: isDark ? 'rgba(26, 28, 37, 0.85)' : '#ffffff',
    backdropFilter: isDark ? 'blur(20px)' : 'none',
    WebkitBackdropFilter: isDark ? 'blur(20px)' : 'none',
    border: isDark ? '1px solid rgba(77,122,255,0.15)' : 'none',
    boxShadow: isDark
      ? '0 25px 50px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)'
      : '0px 106px 42px rgba(0,0,0,0.01), 0px 59px 36px rgba(0,0,0,0.05), 0px 26px 26px rgba(0,0,0,0.09), 0px 7px 15px rgba(0,0,0,0.1)',
    borderRadius: 12,
    position: 'relative',
    zIndex: 2,
    boxSizing: 'border-box',
  };

  const logoBox = {
    width: 80, height: 80,
    background: isDark ? 'linear-gradient(135deg, #4D7AFF 0%, #6366f1 100%)' : 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)',
    borderRadius: 11,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: isDark ? '0 8px 24px rgba(77,122,255,0.3)' : '0 4px 12px rgba(29,78,216,0.2)',
  };

  const titleContainer = { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, textAlign: 'center' };
  const title = { margin: 0, fontSize: '1.5rem', fontWeight: 800, color: isDark ? '#f1f5f9' : '#1e293b' };
  const subtitle = { fontSize: '0.85rem', lineHeight: '1.25rem', color: isDark ? '#94a3b8' : '#64748b' };

  const tabRow = {
    display: 'flex', width: '100%',
    background: isDark ? 'rgba(15,23,42,0.6)' : '#f1f5f9',
    padding: 4, borderRadius: 8,
  };
  const tabBtn = {
    flex: 1, padding: 6, borderRadius: 6, border: 'none',
    background: 'transparent', fontSize: 12, fontWeight: 700,
    color: isDark ? '#64748b' : '#64748b', cursor: 'pointer',
  };
  const tabActive = {
    ...tabBtn,
    background: isDark ? 'rgba(77,122,255,0.15)' : '#fff',
    color: isDark ? '#4D7AFF' : '#1e293b',
    boxShadow: isDark ? '0 2px 8px rgba(77,122,255,0.2)' : '0 2px 4px rgba(0,0,0,0.05)',
  };

  const inputContainer = { width: '100%', display: 'flex', flexDirection: 'column', gap: 5 };
  const inputLabel = { fontSize: '0.75rem', color: isDark ? '#94a3b8' : '#475569', fontWeight: 600, marginLeft: 2 };
  const icon = { width: 18, position: 'absolute', zIndex: 9, left: 12, top: '50%', transform: 'translateY(-50%)', opacity: 0.6 };
  const inputField = {
    width: '100%', height: 40, padding: '0 0 0 40px', borderRadius: 8,
    outline: 'none', fontSize: 14,
    border: isDark ? '1px solid rgba(77,122,255,0.2)' : '1px solid #cbd5e1',
    background: isDark ? 'rgba(15,23,42,0.5)' : '#f8fafc',
    color: isDark ? '#f1f5f9' : '#1e293b',
    transition: 'all 0.3s cubic-bezier(0.15, 0.83, 0.66, 1)',
    boxSizing: 'border-box',
  };

  const signInBtn = {
    width: '100%', height: 44, border: 0,
    background: isDark ? 'linear-gradient(135deg, #4D7AFF, #6366f1)' : '#2563eb',
    borderRadius: 8, color: '#ffffff', fontWeight: 700, fontSize: 14,
    cursor: 'pointer', marginTop: 10,
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    transition: 'all 0.2s',
  };

  const separator = {
    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: 15, color: isDark ? '#475569' : '#94a3b8', fontSize: 12, fontWeight: 600, margin: '10px 0',
  };
  const line = { flex: 1, height: 1, border: 0, backgroundColor: isDark ? 'rgba(77,122,255,0.15)' : '#e2e8f0' };

  const googleBtn = {
    width: '100%', height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: 10, borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: 'pointer',
    background: isDark ? 'rgba(15,23,42,0.6)' : '#ffffff',
    color: isDark ? '#e2e8f0' : '#334155',
    border: isDark ? '1px solid rgba(77,122,255,0.2)' : '1px solid #e2e8f0',
    transition: 'all 0.2s',
  };

  const appleBtn = {
    width: '100%', height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: 10, borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: 'pointer',
    background: isDark ? '#1e293b' : '#0f172a',
    color: '#fff',
    border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #0f172a',
    transition: 'all 0.2s',
  };

  const note = { fontSize: 13, color: isDark ? '#94a3b8' : '#1e293b', textAlign: 'center', marginTop: 5 };
  const link = { color: isDark ? '#4D7AFF' : '#2563eb', fontWeight: 700, textDecoration: 'none', cursor: 'pointer', background: 'none', border: 'none', fontSize: 'inherit' };

  const errorBox = {
    width: '100%',
    background: isDark ? 'rgba(185,28,28,0.1)' : '#fef2f2',
    border: isDark ? '1px solid rgba(239,68,68,0.3)' : '1px solid #fecaca',
    color: isDark ? '#fca5a5' : '#b91c1c',
    padding: 10, borderRadius: 8, fontSize: 13,
  };

  const forgotLink = {
    fontSize: 12, color: isDark ? '#64748b' : '#64748b', fontWeight: 600,
    background: 'none', border: 'none', cursor: 'pointer',
  };

  // Reset page styles
  const logoContainer = {
    textAlign: 'center', fontWeight: 800, fontSize: 24,
    color: isDark ? '#f1f5f9' : '#0f172a', marginBottom: 10,
  };
  const form = { display: 'flex', flexDirection: 'column', gap: 15, width: '100%' };
  const formGroup = { display: 'flex', flexDirection: 'column', gap: 8 };
  const label = { fontWeight: 700, color: isDark ? '#94a3b8' : '#475569', fontSize: 13 };
  const input = {
    width: '100%', padding: '12px 16px', borderRadius: 8,
    border: isDark ? '1px solid rgba(77,122,255,0.2)' : '1px solid #e2e8f0',
    background: isDark ? 'rgba(15,23,42,0.5)' : '#f8fafc',
    color: isDark ? '#f1f5f9' : '#1e293b',
    outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box', fontSize: 14,
  };
  const submitBtn = {
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    color: '#fff',
    background: isDark ? 'linear-gradient(135deg, #4D7AFF, #6366f1)' : '#0f172a',
    border: 'none', width: '100%', padding: 14, fontWeight: 700,
    cursor: 'pointer', borderRadius: 8, marginTop: 10, fontSize: 14,
    transition: 'all 0.2s',
  };
  const successBox = {
    background: isDark ? 'rgba(21,128,61,0.1)' : '#f0fdf4',
    border: isDark ? '1px solid rgba(34,197,94,0.3)' : '1px solid #bbf7d0',
    padding: 16, borderRadius: 8,
    color: isDark ? '#86efac' : '#15803d',
    fontWeight: 600, textAlign: 'center',
  };

  return {
    page, background, card, logoBox, titleContainer, title, subtitle,
    tabRow, tabBtn, tabActive, inputContainer, inputLabel, icon, inputField,
    signInBtn, separator, line, googleBtn, appleBtn, note, link, errorBox,
    forgotLink, logoContainer, form, formGroup, label, input, submitBtn, successBox,
    orb1, orb2, orb3, orbLight1, orbLight2,
  };
}

export default LoginPage;
