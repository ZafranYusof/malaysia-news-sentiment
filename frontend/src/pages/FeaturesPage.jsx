import React from 'react';
import { useNavigate } from 'react-router-dom';

const FeaturesPage = () => {
  const navigate = useNavigate();

  const features = [
    { icon: '📡', title: 'Multi-Source Aggregation', desc: 'Real-time RSS feeds from Astro Awani, FMT, Malaysiakini and other major Malaysian news outlets — all in one dashboard.', color: '#3b82f6' },
    { icon: '🤖', title: 'AI Sentiment Analysis', desc: 'Triple-layer AI: Gemini Pro for accuracy, Malaya NLP for Bahasa Malaysia, and rule-based fallback for 100% uptime.', color: '#8b5cf6' },
    { icon: '📊', title: 'Interactive Dashboard', desc: 'Pie charts, bar charts, trend lines, word clouds, and regional heatmaps — all updating in real-time.', color: '#10b981' },
    { icon: '🌐', title: 'Bilingual Support', desc: 'Full BM/EN interface with one-click language toggle. AI understands both languages natively.', color: '#f59e0b' },
    { icon: '🔮', title: '7-Day AI Forecast', desc: 'Predict sentiment trends for the next week based on current news patterns and historical data.', color: '#ef4444' },
    { icon: '📥', title: 'Export & Reports', desc: 'One-click CSV export, printable reports, and bookmarking for articles that matter most.', color: '#06b6d4' },
    { icon: '🗺️', title: 'Regional Heatmap', desc: 'Visualize sentiment distribution across all 13 Malaysian states and federal territories.', color: '#ec4899' },
    { icon: '🔔', title: 'Crisis Alerts', desc: 'Automatic detection of crisis keywords (banjir, rasuah, kemalangan) with real-time alert badges.', color: '#f97316' },
    { icon: '🔐', title: 'Secure Authentication', desc: 'Firebase Auth + Google OAuth + JWT tokens. Email verification and password reset included.', color: '#6366f1' },
  ];

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', system-ui, sans-serif", color: '#1e293b' }}>
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .anim { animation: fadeInUp 0.6s ease-out forwards; }
        .hlift { transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .hlift:hover { transform: translateY(-6px); }
        .feat-card:hover { border-color: #3b82f6 !important; box-shadow: 0 12px 40px rgba(59,130,246,0.08) !important; }
      `}</style>

      {/* Nav */}
      <nav style={{ padding: '16px 0', borderBottom: '1px solid #e2e8f0', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', color: '#64748b', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>← Back to Home</button>
          <span style={{ fontWeight: 900, fontSize: 18, color: '#0f172a' }}>MY News <span style={{ color: '#3b82f6' }}>Sentiment</span></span>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', color: '#0f172a', padding: '10px 16px', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>Login</button>
            <button onClick={() => navigate('/register')} style={{ background: '#0f172a', color: 'white', padding: '10px 24px', borderRadius: 12, border: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer' }} className="hlift">Get Started</button>
          </div>
        </div>
      </nav>

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '100px 24px' }}>
        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: 80 }} className="anim">
          <span style={{ display: 'inline-block', background: '#f5f3ff', color: '#8b5cf6', padding: '6px 16px', borderRadius: 100, fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 24 }}>Platform Capabilities</span>
          <h1 style={{ fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 24 }}>
            Everything you need to{' '}
            <span style={{ background: 'linear-gradient(135deg, #3b82f6, #9333ea)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>decode the news</span>
          </h1>
          <p style={{ fontSize: 20, color: '#64748b', lineHeight: 1.8, maxWidth: 650, margin: '0 auto' }}>
            Built for researchers, analysts, and anyone who wants to understand Malaysian media sentiment at scale.
          </p>
        </div>

        {/* Features Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginBottom: 100 }}>
          {features.map((f, i) => (
            <div key={f.title} className="hlift feat-card" style={{ background: 'white', border: '1px solid #e2e8f0', padding: '40px', borderRadius: 24, transition: 'all 0.3s', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', animation: `fadeInUp 0.6s ease-out ${i * 0.08}s forwards`, opacity: 0 }}>
              <div style={{ fontSize: 40, marginBottom: 20 }}>{f.icon}</div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', marginBottom: 12 }}>{f.title}</h3>
              <p style={{ color: '#64748b', lineHeight: 1.7, fontSize: 15 }}>{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Tech Stack */}
        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 32, padding: '60px 48px', marginBottom: 80 }} className="anim">
          <h2 style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', marginBottom: 8, textAlign: 'center' }}>Built with Modern Tech</h2>
          <p style={{ color: '#64748b', textAlign: 'center', marginBottom: 40, fontSize: 16 }}>Enterprise-grade stack for reliability and performance</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center' }}>
            {['React 19', 'Express 5', 'MongoDB', 'Socket.io', 'Gemini AI', 'Malaya NLP', 'Firebase Auth', 'Vite', 'Recharts', 'JWT', 'Node.js', 'Python FastAPI'].map(tech => (
              <span key={tech} style={{ background: '#f1f5f9', padding: '10px 20px', borderRadius: 12, fontSize: 14, fontWeight: 700, color: '#475569', border: '1px solid #e2e8f0' }}>{tech}</span>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center', background: '#0f172a', borderRadius: 32, padding: '80px 40px', position: 'relative', overflow: 'hidden' }} className="anim">
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 50%, rgba(59,130,246,0.15), transparent 70%)' }} />
          <div style={{ position: 'relative' }}>
            <h2 style={{ fontSize: 36, fontWeight: 900, color: 'white', marginBottom: 16 }}>Ready to get started?</h2>
            <p style={{ color: '#94a3b8', fontSize: 18, marginBottom: 32, maxWidth: 500, margin: '0 auto 32px' }}>Join analysts using MY News Sentiment for media intelligence.</p>
            <button onClick={() => navigate('/register')} className="hlift" style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '16px 40px', borderRadius: 14, fontWeight: 800, fontSize: 16, cursor: 'pointer', boxShadow: '0 10px 30px rgba(59,130,246,0.3)' }}>Create Free Account →</button>
          </div>
        </div>
      </main>

      <footer style={{ padding: '40px 0', borderTop: '1px solid #e2e8f0', textAlign: 'center', color: '#94a3b8', fontSize: 14, marginTop: 80 }}>
        © {new Date().getFullYear()} MY News Sentiment Analysis — UMPSA FYP Project
      </footer>
    </div>
  );
};

export default FeaturesPage;
