import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const FeaturesPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('fp-visible'); }),
      { threshold: 0.1 }
    );
    document.querySelectorAll('.fp-reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const features = [
    { icon: '📡', title: 'Multi-Source Aggregation', desc: 'Real-time RSS feeds from Astro Awani, FMT, Malaysiakini and other major Malaysian news outlets — all in one dashboard.', color: '#4D7AFF' },
    { icon: '🧠', title: 'AI Sentiment Analysis', desc: 'Triple-layer AI: GPT-4o-mini for accuracy, Malaya NLP for Bahasa Malaysia, and rule-based fallback for 100% uptime.', color: '#30CF79' },
    { icon: '📊', title: 'Interactive Dashboard', desc: 'Pie charts, bar charts, trend lines, word clouds, and regional heatmaps — all updating in real-time.', color: '#F7A501' },
    { icon: '🌐', title: 'Bilingual Support', desc: 'Full BM/EN interface with one-click language toggle. AI understands both languages natively.', color: '#4D7AFF' },
    { icon: '📈', title: '7-Day AI Forecast', desc: 'Predict sentiment trends for the next week based on current news patterns and historical data.', color: '#F54E4E' },
    { icon: '📄', title: 'Export and Reports', desc: 'One-click CSV export, printable reports, and bookmarking for articles that matter most.', color: '#30CF79' },
    { icon: '🗺️', title: 'Regional Heatmap', desc: 'Visualize sentiment distribution across all 13 Malaysian states and federal territories.', color: '#F7A501' },
    { icon: '🚨', title: 'Crisis Alerts', desc: 'Automatic detection of crisis keywords (banjir, rasuah, kemalangan) with real-time alert badges.', color: '#F54E4E' },
    { icon: '🔒', title: 'Secure Authentication', desc: 'Firebase Auth + Google OAuth + JWT tokens. Email verification and password reset included.', color: '#4D7AFF' },
  ];

  return (
    <div style={{ background: '#1D1F27', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", color: '#EEEFE9' }}>
      <style>{`
        .fp-reveal { opacity: 0; transform: translateY(30px); transition: all 0.6s ease; }
        .fp-visible { opacity: 1; transform: translateY(0); }
        .fp-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; background: rgba(29,31,39,0.85); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(255,255,255,0.06); padding: 16px 0; }
        .fp-nav-inner { max-width: 1200px; margin: 0 auto; padding: 0 32px; display: flex; align-items: center; justify-content: space-between; }
        .fp-logo { font-size: 18px; font-weight: 800; color: #EEEFE9; text-decoration: none; }
        .fp-logo span { color: #4D7AFF; }
        .fp-nav-links { display: flex; gap: 32px; align-items: center; }
        .fp-nav-links a { color: #9BA1B0; text-decoration: none; font-size: 14px; font-weight: 500; transition: color 0.2s; }
        .fp-nav-links a:hover { color: #EEEFE9; }
        .fp-btn { padding: 10px 24px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; text-decoration: none; border: none; }
        .fp-btn-solid { background: #3366FF; color: #fff; }
        .fp-btn-solid:hover { background: #5588FF; transform: translateY(-1px); }
        .fp-btn-ghost { background: transparent; color: #9BA1B0; border: 1px solid rgba(255,255,255,0.1); }
        .fp-btn-ghost:hover { color: #EEEFE9; border-color: rgba(255,255,255,0.2); }
        .fp-hero { padding: 140px 32px 80px; text-align: center; max-width: 800px; margin: 0 auto; }
        .fp-badge { display: inline-block; padding: 6px 16px; border-radius: 99px; font-size: 12px; font-weight: 600; color: #4D7AFF; background: rgba(77,122,255,0.1); border: 1px solid rgba(77,122,255,0.2); margin-bottom: 24px; text-transform: uppercase; letter-spacing: 1px; }
        .fp-title { font-size: 48px; font-weight: 800; line-height: 1.1; margin-bottom: 20px; letter-spacing: -1px; }
        .fp-title span { color: #4D7AFF; }
        .fp-subtitle { font-size: 18px; color: #9BA1B0; line-height: 1.6; max-width: 600px; margin: 0 auto; }
        .fp-grid { max-width: 1200px; margin: 0 auto; padding: 0 32px 80px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        .fp-card { background: #252730; border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; padding: 32px; transition: all 0.3s ease; cursor: default; }
        .fp-card:hover { transform: translateY(-4px); border-color: rgba(77,122,255,0.3); box-shadow: 0 12px 40px rgba(0,0,0,0.3); }
        .fp-card-icon { font-size: 32px; margin-bottom: 16px; display: block; }
        .fp-card h3 { font-size: 18px; font-weight: 700; margin-bottom: 10px; color: #EEEFE9; }
        .fp-card p { font-size: 14px; color: #9BA1B0; line-height: 1.6; }
        .fp-cta { text-align: center; padding: 80px 32px; }
        .fp-cta h2 { font-size: 36px; font-weight: 800; margin-bottom: 16px; }
        .fp-cta p { color: #9BA1B0; font-size: 16px; margin-bottom: 32px; }
        .fp-footer { border-top: 1px solid rgba(255,255,255,0.06); padding: 32px; text-align: center; color: #5A5B55; font-size: 13px; }
        @media (max-width: 768px) {
          .fp-grid { grid-template-columns: 1fr; }
          .fp-title { font-size: 32px; }
          .fp-nav-links { display: none; }
        }
      `}</style>

      {/* Navbar */}
      <nav className="fp-nav">
        <div className="fp-nav-inner">
          <Link to="/" className="fp-logo">MY <span>News</span> Sentiment</Link>
          <div className="fp-nav-links">
            <Link to="/features">Features</Link>
            <Link to="/pricing">Pricing</Link>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Link to="/login" className="fp-btn fp-btn-ghost">Log In</Link>
            <button className="fp-btn fp-btn-solid" onClick={() => navigate('/register')}>Get Started</button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="fp-hero fp-reveal">
        <div className="fp-badge">Platform Capabilities</div>
        <h1 className="fp-title">Everything you need to <span>decode the news</span></h1>
        <p className="fp-subtitle">Built for researchers, analysts, and anyone who wants to understand Malaysian media sentiment at scale.</p>
      </div>

      {/* Features Grid */}
      <div className="fp-grid">
        {features.map((f, i) => (
          <div key={i} className="fp-card fp-reveal" style={{ transitionDelay: `${i * 80}ms` }}>
            <span className="fp-card-icon">{f.icon}</span>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="fp-cta fp-reveal">
        <h2>Ready to get started?</h2>
        <p>Start analyzing Malaysian news sentiment for free. No credit card required.</p>
        <button className="fp-btn fp-btn-solid" style={{ padding: '14px 40px', fontSize: '16px' }} onClick={() => navigate('/register')}>Start Free</button>
      </div>

      {/* Footer */}
      <div className="fp-footer">
        2026 MY News Sentiment. Built at UMPSA.
      </div>
    </div>
  );
};

export default FeaturesPage;
