import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyMsg, setVerifyMsg] = useState('');

  // Handle email verification link
  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/verify-email' && token) {
      setVerifying(true);
      api.get(`/auth/verify-email/${token}`)
        .then(res => {
          setVerifyMsg(res.data.message);
          // Auto log in if token returned
          if (res.data.token) {
            localStorage.setItem('token', res.data.token);
            api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
            setTimeout(() => navigate('/'), 2500);
          }
        })
        .catch(err => setError(err.response?.data?.error || 'Verification failed.'))
        .finally(() => setVerifying(false));
    }
  }, [navigate, token]);

  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) return setError('Passwords do not match.');
    if (password.length < 6) return setError('Password must be at least 6 characters.');

    setLoading(true);
    try {
      const res = await api.post(`/auth/reset-password/${token}`, { password });
      setSuccess(res.data.message);
      setTimeout(() => navigate('/'), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Reset failed. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  // Email verification view
  if (window.location.pathname === '/verify-email') {
    return (
      <div className="auth-page">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          {verifying ? (
            <>
              <div className="auth-spinner-lg" />
              <h1 className="auth-title" style={{ marginTop: 20 }}>Verifying...</h1>
            </>
          ) : verifyMsg ? (
            <>
              <div style={{ fontSize: 52 }}>✅</div>
              <h1 className="auth-title">Email Verified!</h1>
              <p className="auth-sub">{verifyMsg}</p>
              <p style={{ fontSize: 12, color: 'var(--text-400)' }}>Redirecting to dashboard...</p>
            </>
          ) : (
            <>
              <div style={{ fontSize: 52 }}>❌</div>
              <h1 className="auth-title">Verification Failed</h1>
              <p className="auth-sub">{error}</p>
              <Link to="/login" className="auth-btn-primary" style={{ display: 'block', textDecoration: 'none', textAlign: 'center', marginTop: 16 }}>Back to Login</Link>
            </>
          )}
        </div>
      </div>
    );
  }

  // Password reset view
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-mark" style={{ width: 40, height: 40 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
        </div>
        <h1 className="auth-title">Set New Password</h1>
        <p className="auth-sub">Enter your new password below</p>

        {success ? (
          <div className="auth-success-box" style={{ marginBottom: 16 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            {success} Redirecting...
          </div>
        ) : (
          <form onSubmit={handleReset} className="auth-form">
            {error && (
              <div className="auth-error-box">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {error}
              </div>
            )}
            <div className="auth-field">
              <label className="auth-label">New password</label>
              <div className="auth-input-pw">
                <input type={showPassword ? 'text' : 'password'} className="auth-input"
                  placeholder="Min. 6 characters" value={password} onChange={e => setPassword(e.target.value)} required autoFocus />
                <button type="button" className="auth-pw-eye" onClick={() => setShowPassword(p => !p)}>
                  {showPassword
                    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
            </div>
            <div className="auth-field">
              <label className="auth-label">Confirm password</label>
              <input type={showPassword ? 'text' : 'password'} className="auth-input"
                placeholder="Re-enter password" value={confirm} onChange={e => setConfirm(e.target.value)} required />
            </div>
            <button type="submit" className="auth-btn-primary" disabled={loading}>
              {loading ? <span className="auth-spinner" /> : null}
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        <Link to="/login" className="auth-link-btn">← Back to Login</Link>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
