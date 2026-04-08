import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ComparePage from './pages/Compare';
import Bookmarks from './pages/Bookmarks';
import Trending from './pages/Trending';
import LandingPage from './pages/LandingPage';
import AdminDashboard from './pages/AdminDashboard';
import StaticPage from './pages/StaticPage';
import NotFound from './pages/NotFound';
import LoadingScreen from './components/LoadingScreen';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

const SideLink = ({ to, children, icon, onClick }) => {
  const loc = useLocation();
  const active = loc.pathname === to;
  return (
    <Link to={to} className={`sidebar-link ${active ? 'active' : ''}`} onClick={onClick}>
      {icon}
      {children}
    </Link>
  );
};

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen message="Verifying Neural Link..." />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const initials = (user?.name || user?.email || 'User').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'active' : ''}`} onClick={onClose} />
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="logo-mark">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>
            </svg>
          </div>
          <div className="logo-text">MY News <span>Sentiment</span></div>
        </div>

        <div className="sidebar-section">
          <div className="sidebar-section-label">Analytics</div>
          <nav className="sidebar-nav">
            <SideLink to="/dashboard" onClick={onClose} icon={
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
              </svg>
            }>{t('dashboard')}</SideLink>
            <SideLink to="/compare" onClick={onClose} icon={
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 3h5v5"/><path d="M8 3H3v5"/><path d="M21 16v5h-5"/><path d="M3 16v5h5"/><path d="M4 12h16"/>
              </svg>
            }>{t('compareMode')}</SideLink>
            <SideLink to="/trending" onClick={onClose} icon={
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
            }>{t('trending')}</SideLink>
            <SideLink to="/history" onClick={onClose} icon={
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
            }>{t('history')}</SideLink>
          </nav>
        </div>

        <div className="sidebar-section">
          <div className="sidebar-section-label">System</div>
          <nav className="sidebar-nav">
            {user?.role === 'admin' && (
              <SideLink to="/admin" onClick={onClose} icon={
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 16V8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2z"/><path d="M3 10h18"/><path d="M7 15h.01"/><path d="M11 15h2"/></svg>
              }>{t('admin')}</SideLink>
            )}
            <SideLink to="/bookmarks" onClick={onClose} icon={
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
            }>{t('bookmarks')}</SideLink>
            <SideLink to="/settings" onClick={onClose} icon={
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
              </svg>
            }>{t('settings')}</SideLink>
          </nav>
        </div>

        <div className="sidebar-footer">
          {user ? (
            <div className="sidebar-user">
              {user.avatar
                ? <img src={user.avatar} alt={user.name} className="sidebar-avatar-img" />
                : <div className="sidebar-avatar">{initials}</div>
              }
              <div className="sidebar-user-info">
                <div className="sidebar-user-name">{user.name}</div>
                <div className="sidebar-user-email">{user.email || user.phone || ''}</div>
              </div>
            </div>
          ) : (
            <div style={{ fontSize: 10.5, color: 'var(--text-400)', padding: '0 2px', lineHeight: 1.5 }}>
              <div style={{ fontWeight: 600, color: 'var(--text-500)', marginBottom: 3 }}>Powered by</div>
              <div>NewsAPI · GPT-4o-mini</div>
              <div>MongoDB Atlas · 2026</div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

const TITLES = { 
  '/dashboard': 'dashboard', 
  '/history': 'history', 
  '/settings': 'settings', 
  '/compare': 'compareMode', 
  '/admin': 'admin',
  '/bookmarks': 'bookmarks',
  '/trending': 'trending'
};

const AppShell = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { t, lang, toggleLanguage } = useLanguage();
  const loc = useLocation();
  const titleKey = TITLES[loc.pathname] || 'dashboard';

  return (
    <div className="app-shell">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button className="topbar-hamburger" onClick={() => setIsSidebarOpen(true)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
            <h1 className="topbar-title">{t(titleKey)}</h1>
          </div>
          <div className="topbar-actions">
            <button className="btn-outline" onClick={toggleLanguage} style={{ fontSize: '11px', fontWeight: 800 }}>
              {lang === 'en' ? '🇲🇾 BM' : '🇺🇸 EN'}
            </button>
            <button className="btn-outline mobile-hide" onClick={() => window.location.reload()}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
              </svg>
              Refresh
            </button>
          </div>
        </header>
        <main className="page-body" id="main-content">{children}</main>
      </div>
    </div>
  );
};

const AppInner = () => (
  <Routes>
    <Route path="/"               element={<LandingPage />} />
    <Route path="/login"          element={<LoginPage />} />
    <Route path="/register"       element={<RegisterPage />} />
    <Route path="/reset-password" element={<ResetPasswordPage />} />
    <Route path="/verify-email"   element={<ResetPasswordPage />} />

    <Route path="/dashboard" element={<ProtectedRoute><AppShell><Dashboard /></AppShell></ProtectedRoute>} />
    <Route path="/trending" element={<ProtectedRoute><AppShell><Trending /></AppShell></ProtectedRoute>} />
    <Route path="/compare" element={<ProtectedRoute><AppShell><ComparePage /></AppShell></ProtectedRoute>} />
    <Route path="/history" element={<ProtectedRoute><AppShell><History /></AppShell></ProtectedRoute>} />
    <Route path="/bookmarks" element={<ProtectedRoute><AppShell><Bookmarks /></AppShell></ProtectedRoute>} />
    <Route path="/admin" element={<ProtectedRoute><AppShell><AdminDashboard /></AppShell></ProtectedRoute>} />
    <Route path="/settings" element={<ProtectedRoute><AppShell><SettingsPage /></AppShell></ProtectedRoute>} />
    
    {/* Static Informational Pages */}
    <Route path="/api" element={<StaticPage />} />
    <Route path="/pricing" element={<StaticPage />} />
    <Route path="/about" element={<StaticPage />} />
    <Route path="/jobs" element={<StaticPage />} />
    <Route path="/privacy" element={<StaticPage />} />
    
    {/* Cinematic 404 Route */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <Router>
            <AppInner />
            <Toaster 
              position="top-center"
              containerStyle={{
                top: 10,
              }}
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'var(--card-bg)',
                  color: 'var(--text-900)',
                  border: '1px solid var(--border)',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '14px',
                  borderRadius: '8px',
                  boxShadow: 'var(--shadow-lg)'
                },
              }}
            />
          </Router>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  </GoogleOAuthProvider>
);

export default App;
