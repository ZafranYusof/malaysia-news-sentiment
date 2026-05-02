import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

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
      const payload = {
        name: form.name,
        password: form.password,
        ...(tab === 'email' ? { email: form.email } : { phone: form.phone }),
      };
      const res = await api.post('/auth/register', payload);
      setSuccess(res.data.message);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
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
      setError(err.response?.data?.error || 'Google registration failed.');
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], staggerChildren: 0.07 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }
  };

  const styles = getStyles(isDark);

  if (success) {
    return (
      <div style={styles.page}>
        <style>{getKeyframes()}</style>
        <div style={styles.background} />
        {isDark && <><div style={styles.orb1} /><div style={styles.orb2} /><div style={styles.orb3} /></>}
        {!isDark && <><div style={styles.orbLight1} /><div style={styles.orbLight2} /></>}
        <motion.div
          style={{ ...styles.card, textAlign: 'center' }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <div style={{ fontSize: 52, marginBottom: 16 }}>📧</div>
          <h1 style={styles.title}>Check Your Email</h1>
          <p style={{ ...styles.subtitle, maxWidth: 340, margin: '8px auto 24px' }}>{success}</p>
          <div style={styles.successBox}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
            {' '}Verification email sent!
          </div>
          <Link to="/login" style={{ ...styles.signInBtn, textDecoration: 'none', textAlign: 'center', marginTop: 20 }}>
            Go to Login
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <style>{getKeyframes()}</style>
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
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-3 3" />
          </svg>
        </motion.div>

        <motion.div variants={itemVariants} style={styles.titleContainer}>
          <p style={styles.title}>Create Account</p>
          <span style={styles.subtitle}>Join our news intelligence network</span>
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
          <label style={styles.inputLabel}>Full Name</label>
          <div style={{ position: 'relative' }}>
            <svg fill="none" viewBox="0 0 24 24" height="24" width="24" xmlns="http://www.w3.org/2000/svg" style={styles.icon}>
              <path strokeLinejoin="round" strokeLinecap="round" strokeWidth="1.5" stroke={isDark ? '#94a3b8' : '#141B34'} d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" />
              <circle strokeLinejoin="round" strokeLinecap="round" strokeWidth="1.5" stroke={isDark ? '#94a3b8' : '#141B34'} cx="12" cy="7" r="4" />
            </svg>
            <input placeholder="Name" style={styles.inputField} name="name" type="text" value={form.name} onChange={handleChange} required />
          </div>
        </motion.div>

        <motion.div variants={itemVariants} style={styles.inputContainer}>
          <label style={styles.inputLabel}>{tab === 'email' ? 'Email Address' : 'Phone Number'}</label>
          <div style={{ position: 'relative' }}>
            <svg fill="none" viewBox="0 0 24 24" height="24" width="24" xmlns="http://www.w3.org/2000/svg" style={styles.icon}>
              <path strokeLinejoin="round" strokeLinecap="round" strokeWidth="1.5" stroke={isDark ? '#94a3b8' : '#141B34'} d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline strokeLinejoin="round" strokeLinecap="round" strokeWidth="1.5" stroke={isDark ? '#94a3b8' : '#141B34'} points="22,6 12,13 2,6" />
            </svg>
            {tab === 'email' ? (
              <input placeholder="name@mail.com" style={styles.inputField} name="email" type="email" value={form.email} onChange={handleChange} required />
            ) : (
              <input placeholder="+60 12-345 6789" style={styles.inputField} name="phone" type="tel" value={form.phone} onChange={handleChange} required />
            )}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} style={{ display: 'flex', gap: 10, width: '100%' }}>
          <div style={{ flex: 1 }}>
            <label style={styles.inputLabel}>Password</label>
            <div style={{ position: 'relative', marginTop: 5 }}>
              <svg fill="none" viewBox="0 0 24 24" height="18" width="18" xmlns="http://www.w3.org/2000/svg" style={styles.icon}>
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke={isDark ? '#94a3b8' : '#141B34'} strokeWidth="1.5" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke={isDark ? '#94a3b8' : '#141B34'} strokeWidth="1.5" />
              </svg>
              <input placeholder="••••" style={styles.inputField} name="password" type="password" value={form.password} onChange={handleChange} required />
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <label style={styles.inputLabel}>Confirm</label>
            <div style={{ position: 'relative', marginTop: 5 }}>
              <svg fill="none" viewBox="0 0 24 24" height="18" width="18" xmlns="http://www.w3.org/2000/svg" style={styles.icon}>
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke={isDark ? '#94a3b8' : '#141B34'} strokeWidth="1.5" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke={isDark ? '#94a3b8' : '#141B34'} strokeWidth="1.5" />
              </svg>
              <input placeholder="••••" style={styles.inputField} name="confirm" type="password" value={form.confirm} onChange={handleChange} required />
            </div>
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
          {loading ? 'Creating Account...' : 'Get Started'}
        </motion.button>

        <motion.div variants={itemVariants} style={styles.separator}>
          <hr style={styles.line} />
          <span>Or sign up with</span>
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
          <svg height="16" width="16" viewBox="0 0 32 32">
            <g transform="matrix(.727273 0 0 .727273 -.954545 -1.45455)">
              <path fill="#fbbc05" d="M0 37V11l17 13z" />
              <path fill="#ea4335" d="M0 11l17 13 7-6.1L48 14V0H0z" />
              <path fill="#34a853" d="M0 37l30-23 7.9 1L48 0v48H0z" />
              <path fill="#4285f4" d="M48 48L17 24l-4-3 35-10z" />
            </g>
          </svg>
          <span>Google Account</span>
        </motion.button>

        <motion.p variants={itemVariants} style={styles.note}>
          Already have an account? <Link to="/login" style={styles.linkStyle}>Sign in</Link>
        </motion.p>
      </motion.form>
    </div>
  );
};

function getKeyframes() {
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
    padding: '20px 0',
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
    position: 'absolute', width: 760, height: 760, borderRadius: '50%',
    background: 'radial-gradient(circle at 30% 30%, rgba(124,58,237,0.9), rgba(99,102,241,0.45))',
    left: '-6%', top: '-24%', zIndex: 0, filter: 'blur(80px)', opacity: 0.95,
    animation: 'floatOrb1 14s ease-in-out infinite',
  };
  const orbLight2 = {
    position: 'absolute', width: 520, height: 520, borderRadius: '50%',
    background: 'radial-gradient(circle at 70% 70%, rgba(14,165,233,0.55), rgba(59,130,246,0.28))',
    right: '-14%', bottom: '-16%', zIndex: 0, filter: 'blur(80px)', opacity: 0.95,
    animation: 'floatOrb2 18s ease-in-out infinite',
  };

  const card = {
    width: 440,
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
    width: 60, height: 60,
    background: isDark ? 'linear-gradient(135deg, #4D7AFF 0%, #6366f1 100%)' : 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)',
    borderRadius: 11,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: isDark ? '0 8px 24px rgba(77,122,255,0.3)' : '0 4px 12px rgba(29,78,216,0.2)',
  };

  const titleContainer = { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, textAlign: 'center' };
  const title = { margin: 0, fontSize: '1.4rem', fontWeight: 800, color: isDark ? '#f1f5f9' : '#1e293b' };
  const subtitle = { fontSize: '0.85rem', color: isDark ? '#94a3b8' : '#64748b' };

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
  const icon = { width: 18, position: 'absolute', zIndex: 9, left: 12, top: '50%', transform: 'translateY(-50%)', opacity: 0.5 };
  const inputField = {
    width: '100%', height: 40, padding: '0 0 0 40px', borderRadius: 8,
    outline: 'none', fontSize: 14,
    border: isDark ? '1px solid rgba(77,122,255,0.2)' : '1px solid #cbd5e1',
    background: isDark ? 'rgba(15,23,42,0.5)' : '#f8fafc',
    color: isDark ? '#f1f5f9' : '#1e293b',
    transition: 'all 0.3s', boxSizing: 'border-box',
  };

  const signInBtn = {
    width: '100%', height: 44, border: 0,
    background: isDark ? 'linear-gradient(135deg, #4D7AFF, #6366f1)' : '#2563eb',
    borderRadius: 8, color: '#ffffff', fontWeight: 700, fontSize: 14,
    cursor: 'pointer', marginTop: 5,
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    transition: 'all 0.2s',
  };

  const separator = {
    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: 15, color: isDark ? '#475569' : '#94a3b8', fontSize: 11, fontWeight: 600, margin: '5px 0',
  };
  const line = { flex: 1, height: 1, border: 0, backgroundColor: isDark ? 'rgba(77,122,255,0.15)' : '#e2e8f0' };

  const googleBtn = {
    width: '100%', height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: 10, borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer',
    background: isDark ? 'rgba(15,23,42,0.6)' : '#ffffff',
    color: isDark ? '#e2e8f0' : '#334155',
    border: isDark ? '1px solid rgba(77,122,255,0.2)' : '1px solid #e2e8f0',
    transition: 'all 0.2s',
  };

  const note = { fontSize: 13, color: isDark ? '#94a3b8' : '#1e293b', textAlign: 'center' };
  const linkStyle = { color: isDark ? '#4D7AFF' : '#2563eb', fontWeight: 700, textDecoration: 'none' };

  const errorBox = {
    width: '100%',
    background: isDark ? 'rgba(185,28,28,0.1)' : '#fef2f2',
    border: isDark ? '1px solid rgba(239,68,68,0.3)' : '1px solid #fecaca',
    color: isDark ? '#fca5a5' : '#b91c1c',
    padding: 10, borderRadius: 8, fontSize: 12, fontWeight: 600,
  };

  const successBox = {
    background: isDark ? 'rgba(21,128,61,0.1)' : '#f0fdf4',
    border: isDark ? '1px solid rgba(34,197,94,0.3)' : '1px solid #bbf7d0',
    padding: 12, borderRadius: 8,
    color: isDark ? '#86efac' : '#15803d',
    fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginBottom: 10,
  };

  return {
    page, background, card, logoBox, titleContainer, title, subtitle,
    tabRow, tabBtn, tabActive, inputContainer, inputLabel, icon, inputField,
    signInBtn, separator, line, googleBtn, note, linkStyle, errorBox, successBox,
    orb1, orb2, orb3, orbLight1, orbLight2,
  };
}

export default RegisterPage;
