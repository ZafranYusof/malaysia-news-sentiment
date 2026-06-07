import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  // Sample dashboard preview data
  const sampleArticles = [
    {
      title: "Economic Growth Reaches 5.2% in Q2",
      source: "The Star",
      sentiment: "positive",
      score: 0.78
    },
    {
      title: "Traffic Congestion Worsens in KL",
      source: "Malaysiakini",
      sentiment: "negative",
      score: -0.62
    },
    {
      title: "New Tech Hub Opens in Cyberjaya",
      source: "The Edge",
      sentiment: "positive",
      score: 0.85
    }
  ];

  const sentimentStats = [
    { label: "Positive", value: 42, color: "bg-emerald-500" },
    { label: "Neutral", value: 38, color: "bg-zinc-400" },
    { label: "Negative", value: 20, color: "bg-rose-500" }
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center px-6 sm:px-12 lg:px-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md mx-auto"
        >
          {/* Logo/Brand */}
          <div className="mb-12">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              MYNewsSentiment
            </h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Malaysia News Sentiment Analysis
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 rounded-lg bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800">
                <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-transparent transition-all"
                placeholder="ahmad@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-transparent transition-all"
                placeholder="Enter your password"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-700 text-emerald-600 focus:ring-emerald-500 dark:focus:ring-emerald-400"
                />
                <span className="ml-2 text-sm text-zinc-600 dark:text-zinc-400">
                  Remember me
                </span>
              </label>
              <Link
                to="/reset-password"
                className="text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.98 }}
              className="w-full px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </motion.button>
          </form>

          {/* Register link */}
          <p className="mt-8 text-center text-sm text-zinc-600 dark:text-zinc-400">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
            >
              Create account
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right side - Dashboard Preview */}
      <div className="hidden lg:flex lg:w-[55%] bg-zinc-50 dark:bg-zinc-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 dark:from-emerald-500/10 dark:to-teal-500/10" />
        
        <div className="relative z-10 flex flex-col justify-center px-16 py-20 w-full">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-8"
          >
            {/* Dashboard Preview Header */}
            <div>
              <h3 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-3">
                Real-time sentiment insights
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400 max-w-md">
                Track sentiment trends across Malaysian news sources with AI-powered analysis
              </p>
            </div>

            {/* Sentiment Distribution Mini Chart */}
            <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 border border-zinc-200 dark:border-zinc-700">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-zinc-900 dark:text-zinc-50">Today's Sentiment</h4>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">Live</span>
              </div>
              <div className="space-y-3">
                {sentimentStats.map((stat) => (
                  <div key={stat.label}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-zinc-600 dark:text-zinc-400">{stat.label}</span>
                      <span className="font-medium text-zinc-900 dark:text-zinc-50">{stat.value}%</span>
                    </div>
                    <div className="h-2 bg-zinc-100 dark:bg-zinc-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${stat.color} transition-all`}
                        style={{ width: `${stat.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sample Article Cards */}
            <div className="space-y-3">
              {sampleArticles.map((article, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                  className="bg-white dark:bg-zinc-800 rounded-lg p-4 border border-zinc-200 dark:border-zinc-700"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h5 className="text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-1 truncate">
                        {article.title}
                      </h5>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">{article.source}</p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
                        article.sentiment === 'positive'
                          ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                          : article.sentiment === 'negative'
                          ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400'
                          : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-400'
                      }`}
                    >
                      {article.sentiment === 'positive' ? '↗' : article.sentiment === 'negative' ? '↘' : '→'} {Math.abs(article.score).toFixed(2)}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Dashboard CTA */}
            <div className="pt-4">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Sign in to access your full analytics dashboard
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
