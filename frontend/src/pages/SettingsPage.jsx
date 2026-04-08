import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Section = ({ title, children }) => (
  <div className="settings-section">
    <h2 className="settings-section-title">{title}</h2>
    <div className="settings-card">{children}</div>
  </div>
);

const SettingRow = ({ label, desc, children }) => (
  <div className="setting-row">
    <div className="setting-row-left">
      <span className="setting-label">{label}</span>
      {desc && <span className="setting-desc">{desc}</span>}
    </div>
    <div className="setting-row-right">{children}</div>
  </div>
);

const Toggle = ({ checked, onChange, id }) => (
  <label className="toggle" htmlFor={id}>
    <input id={id} type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
    <span className="toggle-track"><span className="toggle-thumb" /></span>
  </label>
);

const THEME_OPTIONS = [
  { value: 'light',  label: '☀️ Light' },
  { value: 'dark',   label: '🌙 Dark' },
  { value: 'system', label: '💻 System' },
];

const LANG_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'ms', label: 'Bahasa Malaysia' },
];

const PAGE_OPTIONS = [5, 10, 20, 50];

const SettingsPage = () => {
  const { user, updatePreferences, updateProfile, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const prefs = user?.preferences || {};
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(null); // which field is saving
  const [saved, setSaved] = useState(null);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  const savePreference = async (key, value) => {
    setSaving(key);
    try {
      await updatePreferences({ [key]: value });
      setSaved(key);
      setTimeout(() => setSaved(null), 2000);
    } catch (err) {
      console.error('Failed to save preference:', err);
    } finally {
      setSaving(null);
    }
  };

  const handleThemeChange = (val) => {
    setTheme(val);
    if (user) savePreference('theme', val);
  };

  const handleSaveProfile = async () => {
    setProfileSaving(true);
    try {
      await updateProfile({ name });
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
    <div className="settings-page">
      {/* ── Appearance ── */}
      <Section title="Appearance">
        <SettingRow label="Theme" desc="Choose your preferred colour scheme">
          <div className="theme-picker">
            {THEME_OPTIONS.map(t => (
              <button
                key={t.value}
                className={`theme-option ${theme === t.value ? 'active' : ''}`}
                onClick={() => handleThemeChange(t.value)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </SettingRow>
      </Section>

      {/* ── Dashboard Preferences ── */}
      <Section title="Dashboard Preferences">
        <SettingRow label="Default Topic" desc="Pre-filled search query when opening the dashboard">
          <div className="setting-inline-input">
            <input
              type="text"
              className="filter-input"
              defaultValue={prefs.defaultTopic || 'Malaysia'}
              onBlur={e => savePreference('defaultTopic', e.target.value)}
              placeholder="e.g. Malaysia economy"
              style={{ width: 200 }}
            />
            {saved === 'defaultTopic' && <span className="setting-saved">✓ Saved</span>}
          </div>
        </SettingRow>

        <SettingRow label="Articles Per Page" desc="How many articles to fetch per search">
          <div className="setting-inline-input">
            <select
              className="filter-select"
              value={prefs.articlesPerPage || 10}
              onChange={e => savePreference('articlesPerPage', Number(e.target.value))}
            >
              {PAGE_OPTIONS.map(n => <option key={n} value={n}>{n} articles</option>)}
            </select>
            {saved === 'articlesPerPage' && <span className="setting-saved">✓ Saved</span>}
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

      {/* ── Notifications ── */}
      <Section title="Notifications">
        <SettingRow label="Email Notifications" desc="Receive email summaries of sentiment analysis">
          <Toggle
            id="email-notif"
            checked={prefs.emailNotifications !== false}
            onChange={v => savePreference('emailNotifications', v)}
          />
        </SettingRow>

        <SettingRow label="Crisis Alerts" desc="Get notified when articles with crisis keywords are detected">
          <Toggle
            id="alert-notif"
            checked={prefs.alertNotifications !== false}
            onChange={v => savePreference('alertNotifications', v)}
          />
        </SettingRow>
      </Section>

      {/* ── Language ── */}
      <Section title="Language & Region">
        <SettingRow label="Interface Language" desc="Display language for the dashboard">
          <div className="setting-inline-input">
            <select
              className="filter-select"
              value={prefs.language || 'en'}
              onChange={e => savePreference('language', e.target.value)}
            >
              {LANG_OPTIONS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
            {saved === 'language' && <span className="setting-saved">✓ Saved</span>}
          </div>
        </SettingRow>
      </Section>

      {/* ── Account ── */}
      {user && (
        <Section title="Account Profile">
          <SettingRow label="Display Photo" desc="Automatically provided from your login source">
            <div className="settings-avatar-preview">
              {user.avatar ? (
                <img src={user.avatar} alt="Current" />
              ) : (
                <div className="avatar-ph">{(user.name || '?').charAt(0).toUpperCase()}</div>
              )}
            </div>
          </SettingRow>

          <SettingRow label="Display Name" desc="Your name shown in the dashboard">
            <div className="setting-inline-input">
              <input
                type="text"
                className="filter-input"
                value={name}
                onChange={e => setName(e.target.value)}
                style={{ width: 200 }}
              />
              <button
                className="btn-primary"
                style={{ padding: '7px 14px', fontSize: 12 }}
                onClick={handleSaveProfile}
                disabled={profileSaving}
              >
                {profileSaving ? 'Saving...' : profileSaved ? '✓ Saved' : 'Save Name'}
              </button>
            </div>
          </SettingRow>

          <SettingRow label="Email & Auth" desc="Account identity details">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span className="setting-value-text">{user.email || 'No email registered'}</span>
              <span className="setting-badge" style={{ alignSelf: 'flex-start', marginTop: 4 }}>
                {user.provider === 'google' ? '🟢 Verified via Google' : '📧 Standard Account'}
              </span>
            </div>
          </SettingRow>
        </Section>
      )}

      {/* ── About ── */}
      <Section title="About">
        <SettingRow label="Application" desc="MY News Sentiment Dashboard">
          <span className="setting-value-text">v1.0.0</span>
        </SettingRow>
        <SettingRow label="Data Source">
          <span className="setting-value-text">NewsAPI · AI Processing · MongoDB</span>
        </SettingRow>
      </Section>

      {/* ── Danger Zone ── */}
      {user && (
        <Section title="Session">
          <SettingRow label="Sign Out" desc="Log out of your account on this device">
            <button className="btn-danger" onClick={handleLogout}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Sign Out
            </button>
          </SettingRow>
        </Section>
      )}
    </div>
  );
};

export default SettingsPage;
