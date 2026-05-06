const THEME_KEY = 'theme';

export function getTheme() {
  if (typeof window === 'undefined') return 'light';
  return localStorage.getItem(THEME_KEY) || 'light';
}

export function setTheme(theme) {
  localStorage.setItem(THEME_KEY, theme);
  applyTheme(theme);
}

export function toggleTheme() {
  const current = getTheme();
  const next = current === 'dark' ? 'light' : 'dark';
  setTheme(next);
  return next;
}

export function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

// Initialize on load
export function initTheme() {
  const theme = getTheme();
  applyTheme(theme);
}
