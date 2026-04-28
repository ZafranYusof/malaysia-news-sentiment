import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const LoginPage = () => {
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState('email'); // 'email' | 'phone'
  const [form, setForm] = useState({ email: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMsg, setResetMsg] = useState('');

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

  if (showReset) {
    return (
      <div className="auth-page badger-bg">
        <style>{`
          .badger-bg {
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f1f5f9;
            min-height: 100vh;
            font-family: "Inter", sans-serif;
            position: relative;
            overflow: hidden;
          }
          .badger-bg .background {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            z-index: 0;
            overflow: hidden;
          }
          .badger-bg .background::before,
          .badger-bg .background::after {
            content: '';
            position: absolute;
            border-radius: 50%;
            filter: blur(80px);
            opacity: 0.95;
            transform: translate3d(0,0,0);
          }
          .badger-bg .background::before {
            width: 680px;
            height: 680px;
            left: -10%;
            top: -20%;
            background: radial-gradient(circle at 30% 30%, rgba(124,58,237,0.85), rgba(59,130,246,0.45));
            animation: floatA 12s ease-in-out infinite;
          }
          .badger-bg .background::after {
            width: 520px;
            height: 520px;
            right: -12%;
            bottom: -18%;
            background: radial-gradient(circle at 70% 70%, rgba(14,165,233,0.6), rgba(168,85,247,0.35));
            animation: floatB 16s ease-in-out infinite;
          }
          @keyframes floatA {
            0% { transform: translate3d(0,0,0) scale(1); }
            50% { transform: translate3d(40px,-30px,0) scale(1.03); }
            100% { transform: translate3d(0,0,0) scale(1); }
          }
          @keyframes floatB {
            0% { transform: translate3d(0,0,0) scale(1); }
            50% { transform: translate3d(-30px,25px,0) scale(1.04); }
            100% { transform: translate3d(0,0,0) scale(1); }
          }
          .form-container {
            width: 400px;
            background-color: #fff;
            padding: 40px;
            font-size: 14px;
            color: #212121;
            display: flex;
            flex-direction: column;
            gap: 20px;
            box-sizing: border-box;
            border-radius: 12px;
            box-shadow: 0px 20px 25px -5px rgba(0, 0, 0, 0.1), 0px 10px 10px -5px rgba(0, 0, 0, 0.04);
            position: relative;
            z-index: 2;
          }
          .form-container .logo-container {
            text-align: center;
            font-weight: 800;
            font-size: 24px;
            color: #0f172a;
            margin-bottom: 10px;
          }
          .form-container .form {
            display: flex;
            flex-direction: column;
            gap: 15px;
          }
          .form-container .form-group {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }
          .form-container .form-group label {
            font-weight: 700;
            color: #475569;
            font-size: 13px;
          }
          .form-container .form-group input {
            width: 100%;
            padding: 12px 16px;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
            background: #f8fafc;
            outline: none;
            transition: all 0.2s;
          }
          .form-container .form-group input:focus {
            border-color: #2563eb;
            background: #fff;
            box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
          }
          .form-container .form-submit-btn {
            display: flex;
            justify-content: center;
            align-items: center;
            color: #fff;
            background-color: #0f172a;
            border: none;
            width: 100%;
            padding: 14px;
            font-weight: 700;
            cursor: pointer;
            border-radius: 8px;
            transition: background 0.2s;
            margin-top: 10px;
          }
          .form-container .form-submit-btn:hover {
            background-color: #1e293b;
          }
          .form-container .signup-link {
            align-self: center;
            font-weight: 600;
            color: #64748b;
          }
          .form-container .link {
            color: #2563eb;
            text-decoration: none;
            font-weight: 700;
            cursor: pointer;
            background: none;
            border: none;
            padding: 0;
            font-size: inherit;
          }
          .form-container .link:hover {
            text-decoration: underline;
          }
          .auth-success-box {
            background: #f0fdf4;
            border: 1px solid #bbf7d0;
            padding: 16px;
            border-radius: 8px;
            color: #15803d;
            font-weight: 600;
            text-align: center;
          }
        `}</style>
        <div className="background" />
        <div className="form-container">
          <div className="logo-container">
            Forgot Password
          </div>

          {resetMsg ? (
            <div className="auth-success-box">
               <svg style={{marginBottom: 10}} width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
               </svg>
               <div>{resetMsg}</div>
            </div>
          ) : (
            <form className="form" onSubmit={handleForgotPassword}>
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="name@email.com"
                  value={resetEmail}
                  onChange={e => setResetEmail(e.target.value)}
                  required
                />
              </div>

              <button className="form-submit-btn" type="submit" disabled={resetLoading}>
                {resetLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          )}

          <p className="signup-link">
            Remembered?
            <button className="link" onClick={() => { setShowReset(false); setResetMsg(''); }}> Sign in</button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page dragonfly-bg">
      <style>{`
        .dragonfly-bg {
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f8fafc;
          min-height: 100vh;
          position: relative;
          overflow: hidden;
        }
        .dragonfly-bg .background {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
          overflow: hidden;
        }
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
          width: 780px;
          height: 780px;
          left: -8%;
          top: -22%;
          background: radial-gradient(circle at 30% 30%, rgba(124,58,237,0.9), rgba(99,102,241,0.45));
          animation: floatA 14s ease-in-out infinite;
        }
        .dragonfly-bg .background::after {
          width: 560px;
          height: 560px;
          right: -14%;
          bottom: -16%;
          background: radial-gradient(circle at 70% 70%, rgba(14,165,233,0.55), rgba(59,130,246,0.28));
          animation: floatB 18s ease-in-out infinite;
        }
        .form_container {
          width: 400px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 15px;
          padding: 40px;
          background-color: #ffffff;
          box-shadow: 0px 106px 42px rgba(0, 0, 0, 0.01),
            0px 59px 36px rgba(0, 0, 0, 0.05), 0px 26px 26px rgba(0, 0, 0, 0.09),
            0px 7px 15px rgba(0, 0, 0, 0.1), 0px 0px 0px rgba(0, 0, 0, 0.1);
          border-radius: 11px;
          font-family: "Inter", sans-serif;
          position: relative;
          z-index: 2;
        }

        .logo_container {
          box-sizing: border-box;
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%);
          border: 1px solid #F7F7F8;
          filter: drop-shadow(0px 0.5px 0.5px #EFEFEF) drop-shadow(0px 1px 0.5px rgba(239, 239, 239, 0.5));
          border-radius: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .title_container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          text-align: center;
        }

        .title {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 800;
          color: #1e293b;
        }

        .subtitle {
          font-size: 0.85rem;
          line-height: 1.25rem;
          color: #64748b;
        }

        .input_container {
          width: 100%;
          height: fit-content;
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .icon {
          width: 18px;
          position: absolute;
          z-index: 9;
          left: 12px;
          bottom: 11px;
          opacity: 0.6;
        }

        .input_label {
          font-size: 0.75rem;
          color: #475569;
          font-weight: 600;
          margin-left: 2px;
        }

        .input_field {
          width: 100%;
          height: 40px;
          padding: 0 0 0 40px;
          border-radius: 8px;
          outline: none;
          border: 1px solid #cbd5e1;
          background: #f8fafc;
          transition: all 0.3s cubic-bezier(0.15, 0.83, 0.66, 1);
          font-size: 14px;
        }

        .input_field:focus {
          border-color: #3b82f6;
          background-color: #fff;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .sign-in_btn {
          width: 100%;
          height: 44px;
          border: 0;
          background: #2563eb;
          border-radius: 8px;
          outline: none;
          color: #ffffff;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          transition: background 0.2s;
          margin-top: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .sign-in_btn:hover {
          background: #1d4ed8;
        }

        .sign-in_ggl, .sign-in_apl {
          width: 100%;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background: #ffffff;
          border-radius: 8px;
          outline: none;
          color: #334155;
          border: 1px solid #e2e8f0;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .sign-in_apl {
          background: #0f172a;
          color: #fff;
          border-color: #0f172a;
        }
        .sign-in_ggl:hover { background: #f1f5f9; }

        .separator {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 15px;
          color: #94a3b8;
          font-size: 12px;
          font-weight: 600;
          margin: 10px 0;
        }

        .separator .line {
          flex: 1;
          height: 1px;
          border: 0;
          background-color: #e2e8f0;
        }

        .note {
          font-size: 13px;
          color: #1e293b;
          text-align: center;
          margin-top: 5px;
        }
        .note a { color: #2563eb; font-weight: 700; text-decoration: none; }
        .note a:hover { text-decoration: underline; }

        .auth-error-box {
          width: 100%;
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #b91c1c;
          padding: 10px;
          border-radius: 8px;
          display: flex;
          gap: 10px;
          font-size: 13px;
        }
        .auth-tab-row {
          display: flex;
          width: 100%;
          background: #f1f5f9;
          padding: 4px;
          border-radius: 8px;
        }
        .auth-tab-btn {
          flex: 1;
          padding: 6px;
          border-radius: 6px;
          border: none;
          background: transparent;
          font-size: 12px;
          font-weight: 700;
          color: #64748b;
          cursor: pointer;
        }
        .auth-tab-btn.active {
          background: #fff;
          color: #1e293b;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        .forgot-pw-link {
          align-self: flex-end;
          font-size: 12px;
          color: #64748b;
          font-weight: 600;
          background: none;
          border: none;
          cursor: pointer;
        }
        .forgot-pw-link:hover { color: #2563eb; }
      `}</style>
      <style>{`
        @keyframes floatA { 0% { transform: translate3d(0,0,0) scale(1); } 50% { transform: translate3d(40px,-30px,0) scale(1.03); } 100% { transform: translate3d(0,0,0) scale(1); } }
        @keyframes floatB { 0% { transform: translate3d(0,0,0) scale(1); } 50% { transform: translate3d(-30px,25px,0) scale(1.04); } 100% { transform: translate3d(0,0,0) scale(1); } }
      `}</style>

      <div className="background" />
      <form className="form_container" onSubmit={handleSubmit}>
        <div className="logo_container">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>
          </svg>
        </div>
        <div className="title_container">
          <p className="title">Welcome back</p>
          <span className="subtitle">Login to your News Intelligence Dashboard</span>
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
          <label className="input_label" htmlFor="id_field">{tab === 'email' ? 'Email Address' : 'Phone Number'}</label>
          <svg fill="none" viewBox="0 0 24 24" height="24" width="24" xmlns="http://www.w3.org/2000/svg" className="icon">
            <path strokeLinejoin="round" strokeLinecap="round" strokeWidth="1.5" stroke="#141B34" d="M7 8.5L9.94202 10.2394C11.6572 11.2535 12.3428 11.2535 14.058 10.2394L17 8.5"></path>
            <path strokeLinejoin="round" strokeWidth="1.5" stroke="#141B34" d="M2.01577 13.4756C2.08114 16.5412 2.11383 18.0739 3.24496 19.2094C4.37608 20.3448 5.95033 20.3843 9.09883 20.4634C11.0393 20.5122 12.9607 20.5122 14.9012 20.4634C18.0497 20.3843 19.6239 20.3448 20.7551 19.2094C21.8862 18.0739 21.9189 16.5412 21.9842 13.4756C22.0053 12.4899 22.0053 11.5101 21.9842 10.5244C21.9189 7.45886 21.8862 5.92609 20.7551 4.79066C19.6239 3.65523 18.0497 3.61568 14.9012 3.53657C12.9607 3.48781 11.0393 3.48781 9.09882 3.53656C5.95033 3.61566 4.37608 3.65521 3.24495 4.79065C2.11382 5.92608 2.08114 7.45885 2.01576 10.5244C1.99474 11.5101 1.99475 12.4899 2.01577 13.4756Z"></path>
          </svg>
          {tab === 'email' ? (
            <input placeholder="name@mail.com" className="input_field" id="id_field" name="email" type="email" value={form.email} onChange={handleChange} required />
          ) : (
            <input placeholder="+60 123 4567" className="input_field" id="id_field" name="phone" type="tel" value={form.phone} onChange={handleChange} required />
          )}
        </div>

        <div className="input_container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label className="input_label" htmlFor="password_field">Password</label>
            <button type="button" className="forgot-pw-link" onClick={() => setShowReset(true)}>Forgot Password?</button>
          </div>
          <svg fill="none" viewBox="0 0 24 24" height="24" width="24" xmlns="http://www.w3.org/2000/svg" className="icon">
            <path strokeLinecap="round" strokeWidth="1.5" stroke="#141B34" d="M18 11.0041C17.4166 9.91704 16.273 9.15775 14.9519 9.0993C13.477 9.03404 11.9788 9 10.329 9C8.67911 9 7.18091 9.03404 5.70604 9.0993C3.95328 9.17685 2.51295 10.4881 2.27882 12.1618C2.12602 13.2541 2 14.3734 2 15.5134C2 16.6534 2.12602 17.7727 2.27882 18.865C2.51295 20.5387 3.95328 21.8499 5.70604 21.9275C6.42013 21.9591 7.26041 21.9834 8 22"></path>
            <path strokeLinejoin="round" strokeLinecap="round" strokeWidth="1.5" stroke="#141B34" d="M6 9V6.5C6 4.01472 8.01472 2 10.5 2C12.9853 2 15 4.01472 15 6.5V9"></path>
          </svg>
          <input placeholder="••••••••" className="input_field" id="password_field" name="password" type="password" value={form.password} onChange={handleChange} required />
        </div>

        <button type="submit" className="sign-in_btn" disabled={loading}>
          {loading && <span className="auth-spinner" />}
          {loading ? 'Processing...' : 'Sign In'}
        </button>

        <div className="separator">
          <hr className="line" />
          <span>Or</span>
          <hr className="line" />
        </div>

        <button type="button" className="sign-in_ggl" onClick={handleGoogle}>
          <svg height="18" width="18" viewBox="0 0 32 32">
            <g transform="matrix(.727273 0 0 .727273 -.954545 -1.45455)">
              <path fill="#fbbc05" d="M0 37V11l17 13z"></path>
              <path fill="#ea4335" d="M0 11l17 13 7-6.1L48 14V0H0z"></path>
              <path fill="#34a853" d="M0 37l30-23 7.9 1L48 0v48H0z"></path>
              <path fill="#4285f4" d="M48 48L17 24l-4-3 35-10z"></path>
            </g>
          </svg>
          <span>Continue with Google</span>
        </button>

        <button type="button" className="sign-in_apl" onClick={() => toast('Apple Sign-In coming soon', { icon: '\u{1F34E}' })}>
          <svg preserveAspectRatio="xMidYMid" version="1.1" viewBox="0 0 256 315" height="20px" width="16px">
            <path fill="#ffffff" d="M213.803394,167.030943 C214.2452,214.609646 255.542482,230.442639 256,230.644727 C255.650812,231.761357 249.401383,253.208293 234.24263,275.361446 C221.138555,294.513969 207.538253,313.596333 186.113759,313.991545 C165.062051,314.379442 158.292752,301.507828 134.22469,301.507828 C110.163898,301.507828 102.642899,313.596301 82.7151126,314.379442 C62.0350407,315.16201 46.2873831,293.668525 33.0744079,274.586162 C6.07529317,235.552544 -14.5576169,164.286328 13.147166,116.18047 C26.9103111,92.2909053 51.5060917,77.1630356 78.2026125,76.7751096 C98.5099145,76.3877456 117.677594,90.4371851 130.091705,90.4371851 C142.497945,90.4371851 165.790755,73.5415029 190.277627,76.0228474 C200.528668,76.4495055 229.303509,80.1636878 247.780625,107.209389 C246.291825,108.132333 213.44635,127.253405 213.803394,167.030988 M174.239142,50.1987033 C185.218331,36.9088319 192.607958,18.4081019 190.591988,0 C174.766312,0.636050225 155.629514,10.5457909 144.278109,23.8283506 C134.10507,35.5906758 125.195775,54.4170275 127.599657,72.4607932 C145.239231,73.8255433 163.259413,63.4970262 174.239142,50.1987249"></path>
          </svg>
          <span>Continue with Apple</span>
        </button>

        <p className="note">
          Don't have an account? <Link to="/register">Create one</Link>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;
