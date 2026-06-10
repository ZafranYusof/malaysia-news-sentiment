1|import React, { useState, useEffect } from 'react';
2|import { motion } from 'framer-motion';
3|import { useNavigate } from 'react-router-dom';
4|import { useAuth } from '../context/AuthContext';
5|import { useTheme } from '../context/ThemeContext';
6|import { useLanguage } from '../context/LanguageContext';
7|import { settingsTranslations } from '../services/settingsTranslations';
8|import { Settings, Sun, Moon, Monitor, LogOut, User, Bell, Globe, Shield, CreditCard, Info } from 'lucide-react';
9|
10|const Section = ({ title, icon, children }) => (
11|  <motion.div
12|    initial={{ opacity: 0, y: 8 }}
13|    animate={{ opacity: 1, y: 0 }}
14|    className="bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] rounded-2xl p-5 mb-4"
15|  >
16|    <h2 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
17|      {icon}
18|      {title}
19|    </h2>
20|    <div className="space-y-4">{children}</div>
21|  </motion.div>
22|);
23|
24|const SettingRow = ({ label, desc, children }) => (
25|  <div className="flex items-center justify-between py-2">
26|    <div>
27|      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{label}</span>
28|      {desc && <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{desc}</p>}
29|    </div>
30|    <div className="shrink-0 ml-4">{children}</div>
31|  </div>
32|);
33|
34|const Toggle = ({ checked, onChange, id }) => (
35|  <label className="relative inline-flex items-center cursor-pointer" htmlFor={id}>
36|    <input id={id} type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="sr-only peer" />
37|    <div className="w-9 h-5 bg-gray-200 dark:bg-gray-700 peer-checked:bg-blue-600 rounded-full transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-transform peer-checked:after:translate-x-4" />
38|  </label>
39|);
40|
41|const THEME_OPTIONS = [
42|  { value: 'light',  label: 'Light', icon: <Sun size={14} /> },
43|  { value: 'dark',   label: 'Dark', icon: <Moon size={14} /> },
44|  { value: 'system', label: 'System', icon: <Monitor size={14} /> },
45|];
46|
47|const LANG_OPTIONS = [
48|  { value: 'en', label: 'English' },
49|  { value: 'ms', label: 'Bahasa Malaysia' },
50|];
51|
52|const PAGE_OPTIONS = [5, 10, 20, 50];
53|
54|// Guest localStorage helpers
55|const loadGuestProfile = () => {
56|  try { return JSON.parse(localStorage.getItem('guest_profile')) || {}; }
57|  catch { return {}; }
58|};
59|
60|const loadGuestDashboardPrefs = () => {
61|  try { return JSON.parse(localStorage.getItem('guest_dashboard_prefs')) || {}; }
62|  catch { return {}; }
63|};
64|
65|const loadGuestNotificationPrefs = () => {
66|  try { return JSON.parse(localStorage.getItem('guest_notification_prefs')) || {}; }
67|  catch { return {}; }
68|};
69|
70|const SettingsPage = () => {
71|  const { user, updatePreferences, updateProfile, logout } = useAuth();
72|  const { lang, setLang } = useLanguage();
73|  const ts = (key) => settingsTranslations[lang]?.[key] || settingsTranslations.en[key] || key;
74|  const { theme, setTheme } = useTheme();
75|  const navigate = useNavigate();
76|
77|  const isGuest = !user || user.role === 'guest' || !localStorage.getItem('token');
78|  const safeUser = user || { name: 'Guest', email: 'guest@statusmy.app', role: 'viewer', plan: 'free' };
79|
80|  const [guestDashPrefs, setGuestDashPrefs] = useState(loadGuestDashboardPrefs);
81|  const [guestNotifPrefs, setGuestNotifPrefs] = useState(loadGuestNotificationPrefs);
82|  const [guestProfile, setGuestProfile] = useState(loadGuestProfile);
83|
84|  const prefs = isGuest
85|    ? { ...guestDashPrefs, ...guestNotifPrefs }
86|    : (user?.preferences || {});
87|
88|  const [name, setName] = useState(
89|    isGuest ? (guestProfile.name || 'Guest') : (user?.name || '')
90|  );
91|  const [, setSaving] = useState(null);
92|  const [saved, setSaved] = useState(null);
93|  const [profileSaving, setProfileSaving] = useState(false);
94|  const [profileSaved, setProfileSaved] = useState(false);
95|
96|  useEffect(() => {
97|    if (!isGuest && user?.name) setName(user.name);
98|  }, [isGuest, user?.name]);
99|
100|  const savePreference = async (key, value) => {
101|    setSaving(key);
102|    try {
103|      if (isGuest) {
104|        const updated = { ...guestDashPrefs, [key]: value };
105|        localStorage.setItem('guest_dashboard_prefs', JSON.stringify(updated));
106|        setGuestDashPrefs(updated);
107|      } else {
108|        await updatePreferences({ [key]: value });
109|      }
110|      if (key === 'language') setLang(value);
111|      setSaved(key);
112|      setTimeout(() => setSaved(null), 2000);
113|    } catch (err) {
114|      console.error('Failed to save preference:', err);
115|    } finally {
116|      setSaving(null);
117|    }
118|  };
119|
120|  const saveNotificationPref = (key, value) => {
121|    if (isGuest) {
122|      const updated = { ...guestNotifPrefs, [key]: value };
123|      localStorage.setItem('guest_notification_prefs', JSON.stringify(updated));
124|      setGuestNotifPrefs(updated);
125|      setSaved(key);
126|      setTimeout(() => setSaved(null), 2000);
127|    } else {
128|      savePreference(key, value);
129|    }
130|  };
131|
132|  const handleThemeChange = (val) => {
133|    setTheme(val);
134|    if (!isGuest) savePreference('theme', val);
135|  };
136|
137|  const handleSaveProfile = async () => {
138|    setProfileSaving(true);
139|    try {
140|      if (isGuest) {
141|        const profile = { name, email: guestProfile.email || 'guest@statusmy.app' };
142|        localStorage.setItem('guest_profile', JSON.stringify(profile));
143|        setGuestProfile(profile);
144|      } else {
145|        await updateProfile({ name });
146|      }
147|      setProfileSaved(true);
148|      setTimeout(() => setProfileSaved(false), 2500);
149|    } catch (err) {
150|      console.error('Failed to save profile:', err);
151|    } finally {
152|      setProfileSaving(false);
153|    }
154|  };
155|
156|  const handleLogout = () => {
157|    logout();
158|    navigate('/login');
159|  };
160|
161|  return (
162|    <div className="max-w-2xl mx-auto">
163|      {/* Header */}
164|      <motion.div
165|        initial={{ opacity: 0, y: -10 }}
166|        animate={{ opacity: 1, y: 0 }}
167|        className="mb-6"
168|      >
169|        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
170|          <Settings size={24} className="text-blue-600" />
171|          Settings
172|        </h1>
173|        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
174|          Manage your preferences and account
175|        </p>
176|      </motion.div>
177|
178|      {/* Appearance */}
179|      <Section title="Appearance" icon={<Sun size={16} className="text-amber-500" />}>
180|        <SettingRow label="Theme" desc="Choose your preferred colour scheme">
181|          <div className="flex gap-1 bg-gray-50 dark:bg-white/5 rounded-xl p-0.5">
182|            {THEME_OPTIONS.map(t => (
183|              <button
184|                key={t.value}
185|                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
186|                  theme === t.value
187|                    ? 'bg-white dark:bg-[#2a2a2a] text-blue-600 shadow-sm'
188|                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
189|                }`}
190|                onClick={() => handleThemeChange(t.value)}
191|              >
192|                {t.icon} {t.label}
193|              </button>
194|            ))}
195|          </div>
196|        </SettingRow>
197|      </Section>
198|
199|      {/* Dashboard Preferences */}
200|      <Section title={ts('dashboardPreferences')} icon={<Settings size={16} className="text-blue-500" />}>
201|        <SettingRow label={ts('defaultTopic')} desc={ts('defaultTopicDesc')}>
202|          <div className="flex items-center gap-2">
203|            <input
204|              type="text"
205|              className="px-3 py-1.5 text-sm bg-gray-50 dark:bg-white/5 border border-[#eee] dark:border-[#2a2a2a] rounded-lg outline-none focus:border-blue-500 text-gray-900 dark:text-white w-44 transition-colors"
206|              defaultValue={prefs.defaultTopic || 'Malaysia'}
207|              onBlur={e => savePreference('defaultTopic', e.target.value)}
208|              placeholder="e.g. Malaysia economy"
209|            />
210|            {saved === 'defaultTopic' && <span className="text-[10px] font-medium text-emerald-500">✓ Saved</span>}
211|          </div>
212|        </SettingRow>
213|
214|        <SettingRow label={ts('articlesPerPage')} desc={ts('articlesPerPageDesc')}>
215|          <div className="flex items-center gap-2">
216|            <select
217|              className="px-3 py-1.5 text-sm bg-gray-50 dark:bg-white/5 border border-[#eee] dark:border-[#2a2a2a] rounded-lg outline-none text-gray-700 dark:text-gray-300"
218|              value={prefs.articlesPerPage || 10}
219|              onChange={e => savePreference('articlesPerPage', Number(e.target.value))}
220|            >
221|              {PAGE_OPTIONS.map(n => <option key={n} value={n}>{n} {ts('articles')}</option>)}
222|            </select>
223|            {saved === 'articlesPerPage' && <span className="text-[10px] font-medium text-emerald-500">✓ Saved</span>}
224|          </div>
225|        </SettingRow>
226|
227|        <SettingRow label={ts('autoRefresh')} desc={ts('autoRefreshDesc')}>
228|          <Toggle
229|            id="auto-refresh"
230|            checked={!!prefs.autoRefresh}
231|            onChange={v => savePreference('autoRefresh', v)}
232|          />
233|        </SettingRow>
234|      </Section>
235|
236|      {/* Notifications */}
237|      <Section title={ts('notifications')} icon={<Bell size={16} className="text-purple-500" />}>
238|        {isGuest && (
239|          <p className="text-xs text-gray-500 dark:text-gray-400 italic -mt-2 mb-2">
240|            Preferences saved locally on this device.
241|          </p>
242|        )}
243|        <SettingRow label={ts('emailNotifications')} desc={ts('emailNotificationsDesc')}>
244|          <Toggle
245|            id="email-notif"
246|            checked={isGuest ? (guestNotifPrefs.emailNotifications !== false) : (prefs.emailNotifications !== false)}
247|            onChange={v => saveNotificationPref('emailNotifications', v)}
248|          />
249|        </SettingRow>
250|
251|        <SettingRow label={ts('crisisAlerts')} desc={ts('crisisAlertsDesc')}>
252|          <Toggle
253|            id="alert-notif"
254|            checked={isGuest ? (guestNotifPrefs.alertNotifications !== false) : (prefs.alertNotifications !== false)}
255|            onChange={v => saveNotificationPref('alertNotifications', v)}
256|          />
257|        </SettingRow>
258|      </Section>
259|
260|      {/* Language */}
261|      <Section title={ts('languageRegion')} icon={<Globe size={16} className="text-cyan-500" />}>
262|        <SettingRow label={ts('interfaceLanguage')} desc={ts('interfaceLanguageDesc')}>
263|          <div className="flex items-center gap-2">
264|            <select
265|              className="px-3 py-1.5 text-sm bg-gray-50 dark:bg-white/5 border border-[#eee] dark:border-[#2a2a2a] rounded-lg outline-none text-gray-700 dark:text-gray-300"
266|              value={lang}
267|              onChange={e => savePreference('language', e.target.value)}
268|            >
269|              {LANG_OPTIONS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
270|            </select>
271|            {saved === 'language' && <span className="text-[10px] font-medium text-emerald-500">✓ Saved</span>}
272|          </div>
273|        </SettingRow>
274|      </Section>
275|
276|      {/* Security */}
277|      <Section title={ts('security')} icon={<Shield size={16} className="text-red-500" />}>
278|        {isGuest ? (
279|          <div className="text-center py-4">
280|            <p className="text-sm text-gray-500 dark:text-gray-400">{ts('securitySignInMsg')}</p>
281|            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{ts('securitySignInDesc')}</p>
282|          </div>
283|        ) : (
284|          <>
285|            <SettingRow label={ts('password')} desc={ts('passwordDesc')}>
286|              <button className="px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg opacity-50 cursor-not-allowed">
287|                Change Password
288|              </button>
289|            </SettingRow>
290|            <SettingRow label={ts('twoFactorAuth')} desc={ts('twoFactorAuthDesc')}>
291|              <button className="px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg opacity-50 cursor-not-allowed">
292|                Setup 2FA
293|              </button>
294|            </SettingRow>
295|          </>
296|        )}
297|      </Section>
298|
299|      {/* Billing */}
300|      <Section title={ts('billing')} icon={<CreditCard size={16} className="text-emerald-500" />}>
301|        <SettingRow label={ts('currentPlan')} desc={isGuest ? ts('currentPlanDescGuest') : ts('currentPlanDescLoggedIn')}>
302|          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600">
303|            {(!isGuest && safeUser.plan === 'pro') ? ts('proPlan') : ts('freePlan')}
304|          </span>
305|        </SettingRow>
306|        {isGuest && (
307|          <p className="text-xs text-gray-500 dark:text-gray-400 italic">
308|            {ts('billingSignInMsg')}
309|          </p>
310|        )}
311|      </Section>
312|
313|      {/* Account Profile */}
314|      <Section title={ts('accountProfile')} icon={<User size={16} className="text-indigo-500" />}>
315|        <SettingRow label={ts('displayPhoto')} desc={isGuest ? ts('displayPhotoDescGuest') : ts('displayPhotoDesc')}>
316|          <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 flex items-center justify-center text-sm font-bold overflow-hidden">
317|            {!isGuest && safeUser.avatar ? (
318|              <img src={safeUser.avatar} alt="Current" className="w-full h-full object-cover" loading="lazy" decoding="async" />
319|            ) : (
320|              (name || safeUser.name || '?').charAt(0).toUpperCase()
321|            )}
322|          </div>
323|        </SettingRow>
324|
325|        <SettingRow label={ts('displayName')} desc={ts('displayNameDesc')}>
326|          <div className="flex items-center gap-2">
327|            <input
328|              type="text"
329|              className="px-3 py-1.5 text-sm bg-gray-50 dark:bg-white/5 border border-[#eee] dark:border-[#2a2a2a] rounded-lg outline-none focus:border-blue-500 text-gray-900 dark:text-white w-40 transition-colors"
330|              value={name}
331|              onChange={e => setName(e.target.value)}
332|            />
333|            <button
334|              className="px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
335|              onClick={handleSaveProfile}
336|              disabled={profileSaving}
337|            >
338|              {profileSaving ? ts('saving') : profileSaved ? ts('saved') : ts('save')}
339|            </button>
340|          </div>
341|        </SettingRow>
342|
343|        <SettingRow label={ts('emailAuth')} desc={ts('emailAuthDesc')}>
344|          <div className="text-right">
345|            <p className="text-xs text-gray-700 dark:text-gray-300">{safeUser.email || ts('noEmailRegistered')}</p>
346|            <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-gray-100 dark:bg-white/5 text-gray-500">
347|              {isGuest
348|                ? ts('guestMode')
349|                : safeUser.provider === 'google'
350|                  ? ts('verifiedViaGoogle')
351|                  : ts('standardAccount')}
352|            </span>
353|          </div>
354|        </SettingRow>
355|      </Section>
356|
357|      {/* About */}
358|      <Section title={ts('about')} icon={<Info size={16} className="text-gray-400" />}>
359|        <SettingRow label={ts('application')} desc={ts('appName')}>
360|          <span className="text-xs text-gray-500 font-mono">{ts('appVersion')}</span>
361|        </SettingRow>
362|        <SettingRow label={ts('dataSource')}>
363|          <span className="text-xs text-gray-500">{ts('dataSources')}</span>
364|        </SettingRow>
365|      </Section>
366|
367|      {/* Session */}
368|      <motion.div
369|        initial={{ opacity: 0, y: 8 }}
370|        animate={{ opacity: 1, y: 0 }}
371|        className="bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] rounded-2xl p-5 mb-4"
372|      >
373|        {isGuest ? (
374|          <div className="flex items-center justify-between">
375|            <div>
376|              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{ts('signIn')}</span>
377|              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{ts('signInDesc')}</p>
378|            </div>
379|            <button
380|              onClick={() => navigate('/login')}
381|              className="px-4 py-2 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
382|            >
383|              Sign In
384|            </button>
385|          </div>
386|        ) : (
387|          <div className="flex items-center justify-between">
388|            <div>
389|              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{ts('signOut')}</span>
390|              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{ts('signOutDesc')}</p>
391|            </div>
392|            <button
393|              onClick={handleLogout}
394|              className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-red-50 dark:bg-red-500/10 text-red-600 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-xl transition-colors"
395|            >
396|              <LogOut size={14} /> Sign Out
397|            </button>
398|          </div>
399|        )}
400|      </motion.div>
401|    </div>
402|  );
403|};
404|
405|export default SettingsPage;
406|