import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      setErrors({ form: err.response?.data?.error || 'Registration failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // Dashboard preview data
  const trendingTopics = [
    { topic: "Economy", count: 247, trend: "up" },
    { topic: "Politics", count: 189, trend: "down" },
    { topic: "Technology", count: 156, trend: "up" },
    { topic: "Education", count: 98, trend: "neutral" }
  ];

  const features = [
    { icon: "📊", title: "Live Analytics", desc: "Real-time sentiment tracking" },
    { icon: "🗺️", title: "Heatmap View", desc: "Geographic sentiment data" },
    { icon: "📈", title: "Trend Analysis", desc: "Historical comparisons" },
    { icon: "🔖", title: "Bookmarks", desc: "Save important articles" }
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left side - Dashboard Preview */}
      <div className="hidden lg:flex lg:w-[55%] bg-zinc-50 dark:bg-zinc-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-emerald-500/5 dark:from-teal-500/10 dark:to-emerald-500/10" />
        
        <div className="relative z-10 flex flex-col justify-center px-16 py-20 w-full">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-8"
          >
            {/* Header */}
            <div>
              <h3 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-3">
                Comprehensive news intelligence
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400 max-w-md">
                Access powerful analytics tools to understand Malaysian news sentiment
              </p>
            </div>

            {/* Trending Topics */}
            <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 border border-zinc-200 dark:border-zinc-700">
              <h4 className="font-medium text-zinc-900 dark:text-zinc-50 mb-4">Trending Topics</h4>
              <div className="space-y-3">
                {trendingTopics.map((item, index) => (
                  <motion.div
                    key={item.topic}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 + index * 0.05 }}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`text-lg ${
                        item.trend === 'up' ? '↗️' : item.trend === 'down' ? '↘️' : '➡️'
                      }`}>
                        {item.trend === 'up' ? '↗️' : item.trend === 'down' ? '↘️' : '➡️'}
                      </span>
                      <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                        {item.topic}
                      </span>
                    </div>
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">
                      {item.count} articles
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-3">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 + index * 0.05 }}
                  className="bg-white dark:bg-zinc-800 rounded-lg p-4 border border-zinc-200 dark:border-zinc-700"
                >
                  <div className="text-2xl mb-2">{feature.icon}</div>
                  <h5 className="text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-1">
                    {feature.title}
                  </h5>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {feature.desc}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Stats Footer */}
            <div className="flex items-center gap-6 pt-4 text-sm text-zinc-500 dark:text-zinc-400">
              <div>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">14+</span> News Sources
              </div>
              <div>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">24/7</span> Monitoring
              </div>
              <div>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">95%</span> Accuracy
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right side - Form */}
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
              Create Account
            </h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Start analyzing Malaysian news sentiment
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {errors.form && (
              <div className="p-4 rounded-lg bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800">
                <p className="text-sm text-rose-600 dark:text-rose-400">{errors.form}</p>
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Full name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-transparent transition-all"
                placeholder="Ahmad bin Abdullah"
              />
              {errors.name && <p className="mt-1 text-sm text-rose-600 dark:text-rose-400">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-transparent transition-all"
                placeholder="ahmad@example.com"
              />
              {errors.email && <p className="mt-1 text-sm text-rose-600 dark:text-rose-400">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-transparent transition-all"
                placeholder="Min. 8 characters"
              />
              {errors.password && <p className="mt-1 text-sm text-rose-600 dark:text-rose-400">{errors.password}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Confirm password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-transparent transition-all"
                placeholder="Re-enter password"
              />
              {errors.confirmPassword && <p className="mt-1 text-sm text-rose-600 dark:text-rose-400">{errors.confirmPassword}</p>}
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.98 }}
              className="w-full px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </motion.button>
          </form>

          {/* Login link */}
          <p className="mt-8 text-center text-sm text-zinc-600 dark:text-zinc-400">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage;
