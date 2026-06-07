import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import { Lock, Eye, EyeOff, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';

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
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md bg-white dark:bg-zinc-900 border-2 border-zinc-900 dark:border-zinc-700 p-8 text-center"
        >
          {verifying ? (
            <>
              <div className="w-10 h-10 border-2 border-zinc-900 dark:border-zinc-700 border-t-transparent rounded-full animate-spin mx-auto" />
              <h1 className="text-xl font-serif font-bold text-zinc-900 dark:text-zinc-50 mt-5">Verifying...</h1>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">Please wait while we verify your email</p>
            </>
          ) : verifyMsg ? (
            <>
              <div className="w-14 h-14 border-2 border-green-600 dark:border-green-500 flex items-center justify-center mx-auto">
                <CheckCircle size={28} className="text-green-600 dark:text-green-500" />
              </div>
              <h1 className="text-xl font-serif font-bold text-zinc-900 dark:text-zinc-50 mt-4">Email Verified</h1>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">{verifyMsg}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-3 uppercase tracking-wide">Redirecting to dashboard...</p>
            </>
          ) : (
            <>
              <div className="w-14 h-14 border-2 border-red-700 dark:border-red-500 flex items-center justify-center mx-auto">
                <XCircle size={28} className="text-red-700 dark:text-red-500" />
              </div>
              <h1 className="text-xl font-serif font-bold text-zinc-900 dark:text-zinc-50 mt-4">Verification Failed</h1>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">{error}</p>
              <Link to="/login" className="inline-block mt-5 px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-sm font-medium uppercase tracking-wide transition-colors no-underline">
                Back to Login
              </Link>
            </>
          )}
        </motion.div>
      </div>
    );
  }

  // Password reset view
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md bg-white dark:bg-zinc-900 border-2 border-zinc-900 dark:border-zinc-700 p-8"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 border-2 border-zinc-900 dark:border-zinc-700 mb-4">
            <Lock size={22} className="text-zinc-900 dark:text-zinc-50" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-zinc-900 dark:text-zinc-50">
            Reset Password
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2 uppercase tracking-wide">
            Enter your new password below
          </p>
        </div>

        {success ? (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 px-4 py-3 border border-green-600 dark:border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-sm"
          >
            <CheckCircle size={16} />
            {success} Redirecting...
          </motion.div>
        ) : (
          <form onSubmit={handleReset} className="space-y-5">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 px-4 py-3 border border-red-700 dark:border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm"
              >
                <XCircle size={14} />
                {error}
              </motion.div>
            )}

            <div>
              <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-300 mb-2 uppercase tracking-wide">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="w-full px-4 py-3 text-sm bg-white dark:bg-zinc-900 border-2 border-zinc-900 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-red-700 dark:focus:border-red-500 transition-colors pr-10"
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoFocus
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
                  onClick={() => setShowPassword(p => !p)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-900 dark:text-zinc-300 mb-2 uppercase tracking-wide">
                Confirm Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                className="w-full px-4 py-3 text-sm bg-white dark:bg-zinc-900 border-2 border-zinc-900 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-red-700 dark:focus:border-red-500 transition-colors"
                placeholder="Re-enter password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-50 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-sm font-medium uppercase tracking-wide transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <div className="w-4 h-4 border-2 border-white/30 dark:border-zinc-900/30 border-t-white dark:border-t-zinc-900 rounded-full animate-spin" />}
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        <Link to="/login" className="flex items-center justify-center gap-1.5 mt-6 text-sm font-medium text-red-700 dark:text-red-500 hover:text-red-800 dark:hover:text-red-400 transition-colors no-underline">
          <ArrowLeft size={14} /> Back to Login
        </Link>
      </motion.div>
    </div>
  );
};

export default ResetPasswordPage;
