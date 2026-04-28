import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const RegisterPage = () => {
  const { googleLogin } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('email'); // 'email' | 'phone'
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

  if (success) {
    return (
      <div className="auth-page dragonfly-bg">
        <style>{`
          .dragonfly-bg { display: flex; align-items: center; justify-content: center; background: #f8fafc; min-height: 100vh; font-family: "Inter", sans-serif; position: relative; overflow: hidden; }
          .dragonfly-bg .background { position: absolute; inset: 0; width: 100%; height: 100%; z-index: 0; overflow: hidden; }
          .dragonfly-bg .background::before,
          .dragonfly-bg .background::after {
            content: '';
            position: absolute;
            border-radius: 50%;
            filter: blur(80px);
            opacity: 0.95;
            transform: translate3d(0,0,0);
          }
          .dragonfly-bg .background::before {
            width: 760px;
            height: 760px;
            left: -6%;
            top: -24%;
            background: radial-gradient(circle at 30% 30%, rgba(124,58,237,0.9), rgba(99,102,241,0.45));
            animation: floatA 14s ease-in-out infinite;
          }
          .dragonfly-bg .background::after {
            width: 520px;
            height: 520px;
            right: -14%;
            bottom: -16%;
            background: radial-gradient(circle at 70% 70%, rgba(14,165,233,0.55), rgba(59,130,246,0.28));
            animation: floatB 18s ease-in-out infinite;
          }
          .auth-card { position: relative; z-index: 2; }
        `}</style>
        <style>{`
          @keyframes floatA { 0% { transform: translate3d(0,0,0) scale(1); } 50% { transform: translate3d(40px,-30px,0) scale(1.03); } 100% { transform: translate3d(0,0,0) scale(1); } }
          @keyframes floatB { 0% { transform: translate3d(0,0,0) scale(1); } 50% { transform: translate3d(-30px,25px,0) scale(1.04); } 100% { transform: translate3d(0,0,0) scale(1); } }
        `}</style>
        <div className="background" />
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>📧</div>
          <h1 className="auth-title">Check Your Email</h1>
          <p className="auth-sub" style={{ maxWidth: 340, margin: '8px auto 24px' }}>{success}</p>
          <div className="auth-success-box" style={{ marginBottom: 20 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            Verification email sent!
          </div>
          <Link to="/login" className="auth-btn-primary" style={{ display: 'block', textDecoration: 'none', textAlign: 'center' }}>
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page dragonfly-bg">
      <style>{`
        .dragonfly-bg { display: flex; align-items: center; justify-content: center; background: #f8fafc; min-height: 100vh; font-family: "Inter", sans-serif; padding: 20px 0; position: relative; overflow: hidden; }
        .dragonfly-bg .background { position: absolute; inset: 0; width: 100%; height: 100%; background: radial-gradient(125% 125% at 50% 10%, #f8fbff 30%, #7c3aed 100%); z-index: 0; }
        .form_container { width: 440px; display: flex; flex-direction: column; align-items: center; gap: 15px; padding: 40px; background-color: #ffffff; box-shadow: 0px 106px 42px rgba(0, 0, 0, 0.01), 0px 59px 36px rgba(0, 0, 0, 0.05), 0px 26px 26px rgba(0, 0, 0, 0.09), 0px 7px 15px rgba(0, 0, 0, 0.1); border-radius: 11px; position: relative; z-index: 2; }
        .logo_container { box-sizing: border-box; width: 60px; height: 60px; background: linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%); border: 1px solid #F7F7F8; filter: drop-shadow(0px 0.5px 0.5px #EFEFEF); border-radius: 11px; display: flex; align-items: center; justify-content: center; }
        .title_container { display: flex; flex-direction: column; align-items: center; gap: 8px; text-align: center; }
        .title { margin: 0; font-size: 1.4rem; font-weight: 800; color: #1e293b; }
        .subtitle { font-size: 0.85rem; color: #64748b; }
        .input_container { width: 100%; position: relative; display: flex; flex-direction: column; gap: 5px; }
        .icon { width: 18px; position: absolute; z-index: 9; left: 12px; bottom: 11px; opacity: 0.5; }
        .input_label { font-size: 0.75rem; color: #475569; font-weight: 600; margin-left: 2px; }
        .input_field { width: 100%; height: 40px; padding: 0 0 0 40px; border-radius: 8px; outline: none; border: 1px solid #cbd5e1; background: #f8fafc; transition: all 0.3s; font-size: 14px; }
        .input_field:focus { border-color: #3b82f6; background-color: #fff; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
        .sign-in_btn { width: 100%; height: 44px; border: 0; background: #2563eb; border-radius: 8px; color: #ffffff; font-weight: 700; font-size: 14px; cursor: pointer; transition: background 0.2s; margin-top: 5px; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .sign-in_btn:hover { background: #1d4ed8; }
        .sign-in_ggl, .sign-in_apl { width: 100%; height: 40px; display: flex; align-items: center; justify-content: center; gap: 10px; background: #ffffff; border-radius: 8px; color: #334155; border: 1px solid #e2e8f0; font-weight: 600; font-size: 13px; cursor: pointer; transition: background 0.2s; }
        .sign-in_apl { background: #0f172a; color: #fff; border-color: #0f172a; }
        .separator { width: 100%; display: flex; align-items: center; justify-content: center; gap: 15px; color: #94a3b8; font-size: 11px; font-weight: 600; margin: 5px 0; }
        .separator .line { flex: 1; height: 1px; border: 0; background-color: #e2e8f0; }
        .note { font-size: 13px; color: #1e293b; text-align: center; }
        .note a { color: #2563eb; font-weight: 700; text-decoration: none; }
        .auth-error-box { width: 100%; background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c; padding: 10px; border-radius: 8px; font-size: 12px; font-weight: 600; }
        .auth-tab-row { display: flex; width: 100%; background: #f1f5f9; padding: 4px; border-radius: 8px; }
        .auth-tab-btn { flex: 1; padding: 6px; border-radius: 6px; border: none; background: transparent; font-size: 12px; font-weight: 700; color: #64748b; cursor: pointer; }
        .auth-tab-btn.active { background: #fff; color: #1e293b; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
      `}</style>

      <div className="background" />
      <form className="form_container" onSubmit={handleSubmit}>
        <div className="logo_container">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>
          </svg>
        </div>
        <div className="title_container">
          <p className="title">Create Account</p>
          <span className="subtitle">Join our news intelligence network</span>
        </div>

        <div className="auth-tab-row">
          <button type="button" className={`auth-tab-btn ${tab === 'email' ? 'active' : ''}`} onClick={() => setTab('email')}>Email</button>
          <button type="button" className={`auth-tab-btn ${tab === 'phone' ? 'active' : ''}`} onClick={() => setTab('phone')}>Phone</button>
        </div>

        {error && (
          <div className="auth-error-box">
             <span>{error}</span>
          </div>
        )}

        <div className="input_container">
          <label className="input_label">Full Name</label>
          <svg fill="none" viewBox="0 0 24 24" height="24" width="24" xmlns="http://www.w3.org/2000/svg" className="icon">
            <path strokeLinejoin="round" strokeLinecap="round" strokeWidth="1.5" stroke="#141B34" d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"></path>
            <circle strokeLinejoin="round" strokeLinecap="round" strokeWidth="1.5" stroke="#141B34" cx="12" cy="7" r="4"></circle>
          </svg>
          <input placeholder="Name" className="input_field" name="name" type="text" value={form.name} onChange={handleChange} required />
        </div>

        <div className="input_container">
          <label className="input_label">{tab === 'email' ? 'Email Address' : 'Phone Number'}</label>
          <svg fill="none" viewBox="0 0 24 24" height="24" width="24" xmlns="http://www.w3.org/2000/svg" className="icon">
            <path strokeLinejoin="round" strokeLinecap="round" strokeWidth="1.5" stroke="#141B34" d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
            <polyline strokeLinejoin="round" strokeLinecap="round" strokeWidth="1.5" stroke="#141B34" points="22,6 12,13 2,6"></polyline>
          </svg>
          {tab === 'email' ? (
            <input placeholder="name@mail.com" className="input_field" name="email" type="email" value={form.email} onChange={handleChange} required />
          ) : (
            <input placeholder="+60 12-345 6789" className="input_field" name="phone" type="tel" value={form.phone} onChange={handleChange} required />
          )}
        </div>

        <div className="input_container" style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
          <div style={{ flex: 1, position: 'relative' }}>
             <label className="input_label">Password</label>
             <svg fill="none" viewBox="0 0 24 24" height="18" width="18" xmlns="http://www.w3.org/2000/svg" className="icon" style={{ bottom: 12 }}>
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="#141B34" strokeWidth="1.5"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="#141B34" strokeWidth="1.5"></path>
             </svg>
             <input placeholder="••••" className="input_field" name="password" type="password" value={form.password} onChange={handleChange} required />
          </div>
          <div style={{ flex: 1, position: 'relative' }}>
             <label className="input_label">Confirm</label>
             <svg fill="none" viewBox="0 0 24 24" height="18" width="18" xmlns="http://www.w3.org/2000/svg" className="icon" style={{ bottom: 12 }}>
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="#141B34" strokeWidth="1.5"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="#141B34" strokeWidth="1.5"></path>
             </svg>
             <input placeholder="••••" className="input_field" name="confirm" type="password" value={form.confirm} onChange={handleChange} required />
          </div>
        </div>

        <button type="submit" className="sign-in_btn" disabled={loading}>
          {loading && <span className="auth-spinner" />}
          {loading ? 'Creating Account...' : 'Get Started'}
        </button>

        <div className="separator">
          <hr className="line" />
          <span>Or sign up with</span>
          <hr className="line" />
        </div>

        <button type="button" className="sign-in_ggl" onClick={handleGoogle}>
          <svg height="16" width="16" viewBox="0 0 32 32">
            <g transform="matrix(.727273 0 0 .727273 -.954545 -1.45455)">
              <path fill="#fbbc05" d="M0 37V11l17 13z"></path>
              <path fill="#ea4335" d="M0 11l17 13 7-6.1L48 14V0H0z"></path>
              <path fill="#34a853" d="M0 37l30-23 7.9 1L48 0v48H0z"></path>
              <path fill="#4285f4" d="M48 48L17 24l-4-3 35-10z"></path>
            </g>
          </svg>
          <span>Google Account</span>
        </button>

        <p className="note">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </div>
  );
};

export default RegisterPage;
