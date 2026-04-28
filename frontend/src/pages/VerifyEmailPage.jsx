import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const navigate = useNavigate();
  const token = searchParams.get('token');

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus('error');
        return;
      }

      try {
        await api.get(`/auth/verify-email?token=${token}`);
        setStatus('success');
        toast.success('Email verified successfully!');
        setTimeout(() => navigate('/login'), 3000);
      } catch (err) {
        setStatus('error');
        toast.error(err.response?.data?.message || 'Verification failed');
      }
    };

    verify();
  }, [token, navigate]);

  return (
    <div className="auth-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <div className="auth-card" style={{ textAlign: 'center', maxWidth: 400, width: '100%', padding: '40px', background: 'var(--bg-100)', borderRadius: 16, border: '1px solid var(--border-200)' }}>
        {status === 'verifying' && (
          <>
            <div className="spinner" style={{ margin: '0 auto 20px' }}></div>
            <h2 style={{ color: 'var(--text-100)' }}>Verifying...</h2>
            <p style={{ color: 'var(--text-300)' }}>Please wait while we verify your email.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={{ fontSize: 60, color: 'var(--success)', marginBottom: 20 }}>{'\u2705'}</div>
            <h2 style={{ color: 'var(--text-100)' }}>Email Verified!</h2>
            <p style={{ color: 'var(--text-300)', marginBottom: 24 }}>Your account is now active. Redirecting to login...</p>
            <Link to="/login" className="btn-primary" style={{ display: 'block' }}>Go to Login</Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={{ fontSize: 60, color: 'var(--error)', marginBottom: 20 }}>{'\u274C'}</div>
            <h2 style={{ color: 'var(--text-100)' }}>Verification Failed</h2>
            <p style={{ color: 'var(--text-300)', marginBottom: 24 }}>The link may be invalid or expired.</p>
            <Link to="/register" className="btn-primary" style={{ display: 'block' }}>Try Registering Again</Link>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;
