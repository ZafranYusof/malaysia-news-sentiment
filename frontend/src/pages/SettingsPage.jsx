import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { settingsTranslations } from '../services/settingsTranslations';
import { Settings, Sun, Moon, Monitor, LogOut, User, Bell, Globe, Shield, CreditCard, Info } from 'lucide-react';

const Section = ({ title, icon, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] rounded-2xl p-5 mb-4"
  >
    <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
      {icon}
      {title}
    </h2>
    <div className="space-y-4">{children}</div>
  </motion.div>
);

const SettingRow = ({ label, desc, children }) => (
  <div className="flex items-center justify-between py-2">
    <div>
      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{label}</span>
      {desc && <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{desc}</p>}
    </div>
    <div className="shrink-0 ml-4">{children}</div>
  </div>
);

const Toggle = ({ checked, onChange, id }) => (
  <label className="relative inline-flex items-center cursor-pointer" htmlFor={id}>
    <input id={id} type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="sr-only peer" />
    <div className="w-9 h-5 bg-gray-200 dark:bg-gray-700 peer-checked:bg-blue-600 rounded-full transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-transform peer-checked:after:translate-x-4" />
  </label>
);

const THEME_OPTIONS = [
  { value: 'light',  label: 'Light', icon: <Sun size={14} /> },
  { value: 'dark',   label: 'Dark', icon: <Moon size={14} /> },
  { value: 'system', label: 'System', icon: <Monitor size={14} /> },
];

const LANG_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'ms', label: 'Bahasa Malaysia' },
];

const PAGE_OPTIONS = [5, 10, 20, 50];

// Guest localStorage helpers
const loadGuestProfile = () => {
  try { return JSON.parse(localStorage.getItem('guest_profile')) || {}; }
  catch { return {}; }
};

const loadGuestDashboardPrefs = () => {
  try { return JSON.parse(localStorage.getItem('guest_dashboard_prefs')) || {}; }
  catch { return {}; }
};

const loadGuestNotificationPrefs = () => {
  try { return JSON.parse(localStorage.getItem('guest_notification_prefs')) || {}; }
  catch { return {}; }
};

const SettingsPage = () => {
  const { user, updatePreferences, updateProfile, logout } = useAuth();
  const { lang, setLang } = useLanguage();
  const ts = (key) => settingsTranslations[lang]?.[key] || settingsTranslations.en[key] || key;
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const isGuest = !user || user.role === 'guest' || !localStorage.getItem('token');
  const safeUser = user || { name: 'Guest', email: 'guest@statusmy.app', role: 'viewer', plan: 'free' };

  const [guestDashPrefs, setGuestDashPrefs] = useState(loadGuestDashboardPrefs);
  const [guestNotifPrefs, setGuestNotifPrefs] = useState(loadGuestNotificationPrefs);
  const [guestProfile, setGuestProfile] = useState(loadGuestProfile);

  const prefs = isGuest
    ? { ...guestDashPrefs, ...guestNotifPrefs }
    : (user?.preferences || {});

  const [name, setName] = useState(
    isGuest ? (guestProfile.name || 'Guest') : (user?.name || '')
  );
  const [, setSaving] = useState(null);
  const [saved, setSaved] = useState(null);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  useEffect(() => {
    if (!isGuest && user?.name) setName(user.name);
  }, [isGuest, user?.name]);

  const savePreference = async (key, value) => {
    setSaving(key);
    try {
      if (isGuest) {
        const updated = { ...guestDashPrefs, [key]: value };
        localStorage.setItem('guest_dashboard_prefs', JSON.stringify(updated));
        setGuestDashPrefs(updated);
      } else {
        await updatePreferences({ [key]: value });
      }
      if (key === 'language') setLang(value);
      setSaved(key);
      setTimeout(() => setSaved(null), 2000);
    } catch (err) {
      console.error('Failed to save preference:', err);
    } finally {
      setSaving(null);
    }
  };

  const saveNotificationPref = (key, value) => {
    if (isGuest) {
      const updated = { ...guestNotifPrefs, [key]: value };
      localStorage.setItem('guest_notification_prefs', JSON.stringify(updated));
      setGuestNotifPrefs(updated);
      setSaved(key);
      setTimeout(() => setSaved(null), 2000);
    } else {
      savePreference(key, value);
    }
  };

  const handleThemeChange = (val) => {
    setTheme(val);
    if (!isGuest) savePreference('theme', val);
  };

  const handleSaveProfile = async () => {
    setProfileSaving(true);
    try {
      if (isGuest) {
        const profile = { name, email: guestProfile.email || 'guest@statusmy.app' };
        localStorage.setItem('guest_profile', JSON.stringify(profile));
        setGuestProfile(profile);
      } else {
        await updateProfile({ name });
      }
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2500);
    } catch (err) {
      console.error('Failed to save profile:', err);
    } finally {
      setProfileSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Settings size={24} className="text-blue-600" />
          Settings
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage your preferences and account
        </p>
      </motion.div>

      {/* Appearance */}
      <Section title="Appearance" icon={<Sun size={16} className="text-amber-500" />}>
        <SettingRow label="Theme" desc="Choose your preferred colour scheme">
          <div className="flex gap-1 bg-gray-50 dark:bg-white/5 rounded-xl p-0.5">
            {THEME_OPTIONS.map(t => (
              <button
                key={t.value}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  theme === t.value
                    ? 'bg-white dark:bg-[#2a2a2a] text-blue-600 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                }`}
                onClick={() => handleThemeChange(t.value)}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </SettingRow>
      </Section>

      {/* Dashboard Preferences */}
      <Section title="Dashboard Preferences" icon={<Settings size={16} className="text-blue-500" />}>
        <SettingRow label="Default Topic" desc="Pre-filled search query when opening the dashboard">
          <div className="flex items-center gap-2">
            <input
              type="text"
              className="px-3 py-1.5 text-sm bg-gray-50 dark:bg-white/5 border border-[#eee] dark:border-[#2a2a2a] rounded-lg outline-none focus:border-blue-500 text-gray-900 dark:text-white w-44 transition-colors"
              defaultValue={prefs.defaultTopic || 'Malaysia'}
              onBlur={e => savePreference('defaultTopic', e.target.value)}
              placeholder="e.g. Malaysia economy"
            />
            {saved === 'defaultTopic' && <span className="text-[10px] font-medium text-emerald-500">✓ Saved</span>}
          </div>
        </SettingRow>

        <SettingRow label="Articles Per Page" desc="How many articles to fetch per search">
          <div className="flex items-center gap-2">
            <select
              className="px-3 py-1.5 text-sm bg-gray-50 dark:bg-white/5 border border-[#eee] dark:border-[#2a2a2a] rounded-lg outline-none text-gray-700 dark:text-gray-300"
              value={prefs.articlesPerPage || 10}
              onChange={e => savePreference('articlesPerPage', Number(e.target.value))}
            >
              {PAGE_OPTIONS.map(n => <option key={n} value={n}>{n} articles</option>)}
            </select>
            {saved === 'articlesPerPage' && <span className="text-[10px] font-medium text-emerald-500">✓ Saved</span>}
          </div>
        </SettingRow>

        <SettingRow label="Auto Refresh" desc="Automatically refresh articles every 5 minutes">
          <Toggle
            id="auto-refresh"
            checked={!!prefs.autoRefresh}
            onChange={v => savePreference('autoRefresh', v)}
          />
        </SettingRow>
      </Section>

      {/* Notifications */}
      <Section title="Notifications" icon={<Bell size={16} className="text-purple-500" />}>
        {isGuest && (
          <p className="text-xs text-gray-500 dark:text-gray-400 italic -mt-2 mb-2">
            Preferences saved locally on this device.
          </p>
        )}
        <SettingRow label="Email Notifications" desc="Receive email summaries of sentiment analysis">
          <Toggle
            id="email-notif"
            checked={isGuest ? (guestNotifPrefs.emailNotifications !== false) : (prefs.emailNotifications !== false)}
            onChange={v => saveNotificationPref('emailNotifications', v)}
          />
        </SettingRow>

        <SettingRow label="Crisis Alerts" desc="Get notified when articles with crisis keywords are detected">
          <Toggle
            id="alert-notif"
            checked={isGuest ? (guestNotifPrefs.alertNotifications !== false) : (prefs.alertNotifications !== false)}
            onChange={v => saveNotificationPref('alertNotifications', v)}
          />
        </SettingRow>
      </Section>

      {/* Language */}
      <Section title="Language & Region" icon={<Globe size={16} className="text-cyan-500" />}>
        <SettingRow label="Interface Language" desc="Display language for the dashboard">
          <div className="flex items-center gap-2">
            <select
              className="px-3 py-1.5 text-sm bg-gray-50 dark:bg-white/5 border border-[#eee] dark:border-[#2a2a2a] rounded-lg outline-none text-gray-700 dark:text-gray-300"
              value={lang}
              onChange={e => savePreference('language', e.target.value)}
            >
              {LANG_OPTIONS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
            {saved === 'language' && <span className="text-[10px] font-medium text-emerald-500">✓ Saved</span>}
          </div>
        </SettingRow>
      </Section>

      {/* Security */}
      <Section title="Security" icon={<Shield size={16} className="text-red-500" />}>
        {isGuest ? (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">🔒 Sign in to manage security settings</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Password, two-factor authentication, and API keys are available for registered accounts.</p>
          </div>
        ) : (
          <>
            <SettingRow label="Password" desc="Change your account password">
              <button className="px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg opacity-50 cursor-not-allowed">
                Change Password
              </button>
            </SettingRow>
            <SettingRow label="Two-Factor Auth" desc="Add an extra layer of security">
              <button className="px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg opacity-50 cursor-not-allowed">
                Setup 2FA
              </button>
            </SettingRow>
          </>
        )}
      </Section>

      {/* Billing */}
      <Section title="Billing" icon={<CreditCard size={16} className="text-emerald-500" />}>
        <SettingRow label="Current Plan" desc={isGuest ? "You're using the free tier" : "Manage your subscription"}>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600">
            {(!isGuest && safeUser.plan === 'pro') ? '⭐ Pro' : '🆓 Free Plan'}
          </span>
        </SettingRow>
        {isGuest && (
          <p className="text-xs text-gray-500 dark:text-gray-400 italic">
            Sign in to access premium features and manage billing.
          </p>
        )}
      </Section>

      {/* Account Profile */}
      <Section title="Account Profile" icon={<User size={16} className="text-indigo-500" />}>
        <SettingRow label="Display Photo" desc={isGuest ? "Sign in to set a profile photo" : "Automatically provided from your login source"}>
          <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 flex items-center justify-center text-sm font-bold overflow-hidden">
            {!isGuest && safeUser.avatar ? (
              <img src={safeUser.avatar} alt="Current" className="w-full h-full object-cover" loading="lazy" decoding="async" />
            ) : (
              (name || safeUser.name || '?').charAt(0).toUpperCase()
            )}
          </div>
        </SettingRow>

        <SettingRow label="Display Name" desc="Your name shown in the dashboard">
          <div className="flex items-center gap-2">
            <input
              type="text"
              className="px-3 py-1.5 text-sm bg-gray-50 dark:bg-white/5 border border-[#eee] dark:border-[#2a2a2a] rounded-lg outline-none focus:border-blue-500 text-gray-900 dark:text-white w-40 transition-colors"
              value={name}
              onChange={e => setName(e.target.value)}
            />
            <button
              className="px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
              onClick={handleSaveProfile}
              disabled={profileSaving}
            >
              {profileSaving ? 'Saving...' : profileSaved ? '✓ Saved' : 'Save'}
            </button>
          </div>
        </SettingRow>

        <SettingRow label="Email & Auth" desc="Account identity details">
          <div className="text-right">
            <p className="text-xs text-gray-700 dark:text-gray-300">{safeUser.email || 'No email registered'}</p>
            <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-gray-100 dark:bg-white/5 text-gray-500">
              {isGuest
                ? '👤 Guest Mode'
                : safeUser.provider === 'google'
                  ? '🟢 Verified via Google'
                  : '📧 Standard Account'}
            </span>
          </div>
        </SettingRow>
      </Section>

      {/* About */}
      <Section title="About" icon={<Info size={16} className="text-gray-400" />}>
        <SettingRow label="Application" desc="MY News Sentiment Dashboard">
          <span className="text-xs text-gray-500 font-mono">v1.0.0</span>
        </SettingRow>
        <SettingRow label="Data Source">
          <span className="text-xs text-gray-500">NewsAPI · AI Processing · MongoDB</span>
        </SettingRow>
      </Section>

      {/* Session */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] rounded-2xl p-5 mb-4"
      >
        {isGuest ? (
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Sign In</span>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">Create an account or sign in for full features</p>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
            >
              Sign In
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Sign Out</span>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">Log out of your account on this device</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-red-50 dark:bg-red-500/10 text-red-600 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-xl transition-colors"
            >
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default SettingsPage;
