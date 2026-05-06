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
      <div className="min-h-screen flex items-center justify-center bg-[#fafaf9] dark:bg-[#0f0f0f] p-4">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          className="w-full max-w-sm bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] rounded-2xl p-8 text-center shadow-xl shadow-black/5"
        >
          {verifying ? (
            <>
              <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white mt-5">Verifying...</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Please wait while we verify your email</p>
            </>
          ) : verifyMsg ? (
            <>
              <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mx-auto">
                <CheckCircle size={28} className="text-emerald-500" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white mt-4">Email Verified!</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{verifyMsg}</p>
              <p className="text-xs text-gray-400 mt-3">Redirecting to dashboard...</p>
            </>
          ) : (
            <>
              <div className="w-14 h-14 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center mx-auto">
                <XCircle size={28} className="text-red-500" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white mt-4">Verification Failed</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{error}</p>
              <Link to="/login" className="inline-block mt-5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors no-underline">
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
    <div className="min-h-screen flex items-center justify-center bg-[#fafaf9] dark:bg-[#0f0f0f] p-4">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className="w-full max-w-sm bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] rounded-2xl p-8 shadow-xl shadow-black/5"
      >
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center">
            <Lock size={22} className="text-white" />
          </div>
        </div>

        <h1 className="text-xl font-bold text-gray-900 dark:text-white text-center">Set New Password</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-1.5">Enter your new password below</p>

        {success ? (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 flex items-center gap-2 px-4 py-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl text-emerald-600 text-sm"
          >
            <CheckCircle size={16} />
            {success} Redirecting...
          </motion.div>
        ) : (
          <form onSubmit={handleReset} className="mt-6 space-y-4">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-red-600 dark:text-red-400 text-sm"
              >
                <XCircle size={14} />
                {error}
              </motion.div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">New password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="w-full px-4 py-3 text-sm bg-gray-50 dark:bg-white/5 border border-[#eee] dark:border-[#2a2a2a] rounded-xl outline-none focus:border-blue-500 text-gray-900 dark:text-white placeholder:text-gray-400 transition-colors pr-10"
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoFocus
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => setShowPassword(p => !p)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Confirm password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                className="w-full px-4 py-3 text-sm bg-gray-50 dark:bg-white/5 border border-[#eee] dark:border-[#2a2a2a] rounded-xl outline-none focus:border-blue-500 text-gray-900 dark:text-white placeholder:text-gray-400 transition-colors"
                placeholder="Re-enter password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        <Link to="/login" className="flex items-center justify-center gap-1.5 mt-5 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-blue-600 transition-colors no-underline">
          <ArrowLeft size={12} /> Back to Login
        </Link>
      </motion.div>
    </div>
  );
};

export default ResetPasswordPage;
