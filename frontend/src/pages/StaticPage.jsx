import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';

/* ─── Root wrapper forces light theme & adds animations ───── */
const PageRoot = ({ children }) => (
  <div className="static-page-root" style={{ background: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', system-ui, sans-serif", color: '#1e293b', overflowX: 'hidden' }}>
    <style>{`
      body { background: #f8fafc !important; margin: 0; padding: 0; }
      * { box-sizing: border-box; }
      
      @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      @keyframes pulse {
        0% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.2); opacity: 0.7; }
        100% { transform: scale(1); opacity: 1; }
      }

      @keyframes slideInRight {
        from { transform: translateX(30px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }

      .animate-fade-in { animation: fadeInUp 0.6s ease-out forwards; }
      .delay-1 { animation-delay: 0.1s; }
      .delay-2 { animation-delay: 0.2s; }
      .delay-3 { animation-delay: 0.3s; }
      
      .hover-lift { transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
      .hover-lift:hover { transform: translateY(-8px); }
      
      .glass-card {
        background: rgba(255, 255, 255, 0.8);
        backdrop-filter: blur(12px);
        border: 1px solid rgba(226, 232, 240, 0.5);
      }
      
      .pricing-toggle {
        display: flex;
        background: #f1f5f9;
        padding: 4px;
        border-radius: 12px;
        width: fit-content;
        margin: 0 auto 40px;
        border: 1px solid #e2e8f0;
      }
      
      .pricing-toggle button {
        padding: 8px 16px;
        border-radius: 8px;
        border: none;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s;
        font-size: 14px;
      }
      
      .pricing-toggle button.active {
        background: white;
        color: #3b82f6;
        box-shadow: 0 4px 12px rgba(0,0,0,0.05);
      }
      
      .pulse-dot {
        width: 8px;
        height: 8px;
        background: #10b981;
        border-radius: 50%;
        display: inline-block;
        margin-right: 8px;
        animation: pulse 2s infinite;
      }
    `}</style>
    <div className="animate-fade-in">
      {children}
    </div>
  </div>
);

/* ─── Shared Nav ─────────────────────────────────────────── */
const Nav = () => {
  const navigate = useNavigate();
  return (
    <nav style={{ padding: '16px 0', borderBottom: '1px solid #e2e8f0', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 100 }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', color: '#64748b', fontWeight: 700, cursor: 'pointer', fontSize: 13, transition: 'color 0.2s' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Back to Home
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg, #3b82f6, #2563eb)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(59,130,246,0.3)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
          </div>
          <span style={{ fontWeight: 900, fontSize: 18, color: '#0f172a', letterSpacing: '-0.02em' }}>MY News <span style={{ color: '#3b82f6' }}>Sentiment</span></span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', color: '#0f172a', padding: '10px 16px', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>Login</button>
          <button onClick={() => navigate('/register')} style={{ background: '#0f172a', border: 'none', color: 'white', padding: '10px 24px', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: '0 4px 14px rgba(0,0,0,0.1)', transition: 'transform 0.2s' }} className="hover-lift">Get Started</button>
        </div>
      </div>
    </nav>
  );
};

/* ─── Shared Footer ──────────────────────────────────────── */
const Footer = () => (
  <footer style={{ padding: '80px 0 40px', borderTop: '1px solid #e2e8f0', background: '#f8fafc', marginTop: 100 }}>
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 60, marginBottom: 60 }}>
        <div style={{ gridColumn: 'span 2' }}>
          <div style={{ fontWeight: 900, fontSize: 20, marginBottom: 16, color: '#0f172a' }}>MY News <span style={{ color: '#3b82f6' }}>Sentiment</span></div>
          <p style={{ color: '#64748b', fontSize: 15, lineHeight: 1.8, maxWidth: 360 }}>Decentralized Malaysian news intelligence platform powered by advanced NLP and real-time inference engines.</p>
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 24, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Product</div>
          {[['Dashboard', '/dashboard'], ['API Docs', '/api'], ['Pricing', '/pricing']].map(([label, path]) => (
            <Link key={path} to={path} style={{ display: 'block', color: '#64748b', fontSize: 15, marginBottom: 12, textDecoration: 'none', fontWeight: 500 }}>{label}</Link>
          ))}
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 24, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Company</div>
          {[['About Us', '/about'], ['Careers', '/jobs'], ['Privacy', '/privacy']].map(([label, path]) => (
            <Link key={path} to={path} style={{ display: 'block', color: '#64748b', fontSize: 15, marginBottom: 12, textDecoration: 'none', fontWeight: 500 }}>{label}</Link>
          ))}
        </div>
      </div>
      <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 32, textAlign: 'center', color: '#94a3b8', fontSize: 14, fontWeight: 500 }}>
        &copy; {new Date().getFullYear()} MY News Sentiment Analysis. All rights reserved.
      </div>
    </div>
  </footer>
);

/* ─── UI Components ──────────────────────────────────────── */
const Badge = ({ children, color = '#3b82f6', bg = '#eff6ff' }) => (
  <span style={{ display: 'inline-block', background: bg, color, padding: '6px 16px', borderRadius: 100, fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 24 }}>{children}</span>
);

const GradientText = ({ children }) => (
  <span style={{ background: 'linear-gradient(135deg, #3b82f6, #9333ea)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontWeight: 900 }}>{children}</span>
);

/* ─── API PAGE ───────────────────────────────────────────── */
const ApiPage = () => {
  const navigate = useNavigate();
  const [activeEndpoint, setActiveEndpoint] = useState(null);

  const endpoints = [
    { method: 'GET', path: '/api/news', desc: 'Fetch latest Malaysian news with real-time sentiment.', response: '{ \"articles\": [...], \"total\": 150239 }' },
    { method: 'POST', path: '/api/news/analyze', desc: 'Submit text for GPT-4o inference analysis.', response: '{ \"sentiment\": \"Positive\", \"score\": 0.89, \"impact\": \"High\" }' },
    { method: 'GET', path: '/api/trends', desc: 'Retrieve trending Malaysian narrative trajectories.', response: '{ \"trends\": [\"Budget 2024\", \"Digital Ringgit\"] }' },
  ];

  return (
    <PageRoot>
      <Nav />
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '100px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 100 }} className="animate-fade-in">
          <Badge>Developer Ecosystem</Badge>
          <h1 style={{ fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 24 }}>
            The Global Engine for <br/><GradientText>News Intelligence</GradientText>
          </h1>
          <p style={{ fontSize: 20, color: '#64748b', lineHeight: 1.8, maxWidth: 650, margin: '0 auto 48px' }}>
            Scale your applications with real-time sentiment vectors. Our low-latency API delivers deep insights into Malaysian media dynamics at 300ms intervals.
          </p>
          <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/register')} style={{ background: '#0f172a', color: 'white', padding: '16px 40px', borderRadius: 14, border: 'none', fontWeight: 800, fontSize: 16, cursor: 'pointer', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} className="hover-lift">Get API Key</button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f1f5f9', padding: '14px 24px', borderRadius: 14, border: '1px solid #e2e8f0', color: '#0f172a', fontWeight: 700, fontSize: 15 }}>
              <span className="pulse-dot"></span> System Status: Online
            </div>
          </div>
        </div>

        {/* Live Code Playground */}
        <div style={{ background: '#0f172a', borderRadius: 32, overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.2)', marginBottom: 120 }} className="animate-fade-in delay-1">
          <div style={{ padding: '24px 32px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f56' }}></div>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ffbd2e' }}></div>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#27c93f' }}></div>
            </div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: 700, letterSpacing: '0.1em' }}>TERMINAL — INTERACTIVE API DOCS</div>
            <div></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 1.5fr', minHeight: 400 }}>
            <div style={{ borderRight: '1px solid rgba(255,255,255,0.1)', padding: '32px' }}>
              <h3 style={{ color: 'white', fontSize: 18, fontWeight: 800, marginBottom: 24 }}>Select Endpoint</h3>
              {endpoints.map((ep, i) => (
                <div 
                  key={ep.path} 
                  onClick={() => setActiveEndpoint(i)}
                  style={{ 
                    padding: '16px', borderRadius: 12, marginBottom: 12, cursor: 'pointer',
                    background: activeEndpoint === i ? 'rgba(59,130,246,0.15)' : 'transparent',
                    border: activeEndpoint === i ? '1px solid rgba(59,130,246,0.3)' : '1px solid transparent',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ color: ep.method === 'POST' ? '#3b82f6' : '#10b981', fontWeight: 900, fontSize: 12, fontFamily: 'monospace' }}>{ep.method}</span>
                    <span style={{ color: 'white', fontWeight: 700, fontSize: 14 }}>{ep.path}</span>
                  </div>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>{ep.desc}</p>
                </div>
              ))}
            </div>
            <div style={{ padding: '40px', background: 'rgba(0,0,0,0.3)' }}>
              {activeEndpoint !== null ? (
                <div key={activeEndpoint} className="animate-fade-in">
                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 16 }}>// Response Payload</div>
                  <pre style={{ color: '#10b981', fontFamily: 'monospace', fontSize: 16, lineHeight: 1.6, overflowX: 'auto' }}>
                    {endpoints[activeEndpoint].response}
                  </pre>
                  <div style={{ marginTop: 40, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 20 }}>
                     <button style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '12px 20px', borderRadius: 10, fontWeight: 800, cursor: 'pointer' }}>Try with Auth Token</button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'rgba(255,255,255,0.2)', fontSize: 18, fontWeight: 700 }}>
                  ← Select an endpoint to see inference results
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </PageRoot>
  );
};

/* ─── PRICING PAGE ───────────────────────────────────────── */
const PricingPage = () => {
  const navigate = useNavigate();
  const [isYearly, setIsYearly] = useState(false);

  const plans = [
    {
      name: 'Starter', price: isYearly ? 'Free' : 'Free', period: 'forever',
      desc: 'Ideal for academic research and personal news monitoring.',
      features: ['100 API calls/day', '7-day data history', 'Community support'],
      cta: 'Begin Research', bg: 'white', dark: false
    },
    {
      name: 'Professional', price: isYearly ? 'RM 39' : 'RM 49', period: isYearly ? '/ month (billed yearly)' : '/ month',
      desc: 'Advanced intelligence for independent analysts and small teams.',
      features: ['10k API calls/day', 'Full Data Streams', 'Priority inference queue', 'Regional heatmaps'],
      cta: 'Activate Intelligence', popular: true, bg: 'linear-gradient(135deg, #1e293b, #0f172a)', dark: true
    },
    {
      name: 'Enterprise', price: 'Custom', period: 'per organization',
      desc: 'Full-scale narrative management for government and media.',
      features: ['Unlimited Scale', 'Custom LLM Fine-tuning', 'On-premise deployment', '24/7 Intel Ops'],
      cta: 'Contact Strategic Rep', bg: 'white', dark: false
    }
  ];

  return (
    <PageRoot>
      <Nav />
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '100px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }} className="animate-fade-in">
          <Badge>Transparent Scaling</Badge>
          <h1 style={{ fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.03em', marginBottom: 24 }}>
            Intelligence that <GradientText>scales with you.</GradientText>
          </h1>
          
          <div className="pricing-toggle">
            <button className={!isYearly ? 'active' : ''} onClick={() => setIsYearly(false)}>Monthly</button>
            <button className={isYearly ? 'active' : ''} onClick={() => setIsYearly(true)}>Yearly <span style={{ color: '#10b981', fontSize: 11, marginLeft: 4 }}>-20%</span></button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 32, marginBottom: 120 }}>
          {plans.map((plan, i) => (
            <div key={plan.name} className={`hover-lift animate-fade-in delay-${i}`} style={{
              background: plan.bg,
              padding: '48px 40px',
              borderRadius: 32,
              border: plan.popular ? 'none' : '1px solid #e2e8f0',
              boxShadow: plan.popular ? '0 30px 60px rgba(59,130,246,0.15)' : '0 4px 15px rgba(0,0,0,0.02)',
              color: plan.dark ? 'white' : '#0f172a',
              position: 'relative'
            }}>
              {plan.popular && <div style={{ position: 'absolute', top: 20, right: 30, background: '#3b82f6', color: 'white', padding: '4px 16px', borderRadius: 100, fontSize: 12, fontWeight: 900, textTransform: 'uppercase' }}>Most Strategic</div>}
              <div style={{ fontSize: 14, fontWeight: 800, color: plan.dark ? '#3b82f6' : '#6366f1', textTransform: 'uppercase', marginBottom: 16 }}>{plan.name}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 48, fontWeight: 900 }}>{plan.price}</span>
                <span style={{ color: plan.dark ? '#94a3b8' : '#64748b', fontSize: 15, fontWeight: 600 }}>{plan.period}</span>
              </div>
              <p style={{ fontSize: 16, lineHeight: 1.6, color: plan.dark ? '#94a3b8' : '#64748b', marginBottom: 40 }}>{plan.desc}</p>
              
              <div style={{ height: 1, background: plan.dark ? 'rgba(255,255,255,0.1)' : '#e2e8f0', marginBottom: 40 }}></div>
              
              <div style={{ marginBottom: 48 }}>
                {plan.features.map(f => (
                  <div key={f} style={{ display: 'flex', gap: 12, marginBottom: 16, fontSize: 15, fontWeight: 600 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={plan.dark ? '#3b82f6' : '#2563eb'} strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
                    {f}
                  </div>
                ))}
              </div>
              
              <button onClick={() => navigate('/register')} style={{ 
                width: '100%', padding: '16px', borderRadius: 14, border: 'none', 
                background: plan.dark ? '#3b82f6' : '#0f172a', 
                color: 'white', fontWeight: 900, fontSize: 16, cursor: 'pointer',
                boxShadow: plan.dark ? '0 10px 20px rgba(59,130,246,0.3)' : 'none'
              }}>{plan.cta}</button>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </PageRoot>
  );
};

/* ─── ABOUT PAGE ─────────────────────────────────────────── */
const AboutPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ indexed: 0, accuracy: 0, sources: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      setStats(prev => ({
        indexed: Math.min(prev.indexed + 1500, 150000),
        accuracy: Math.min(prev.accuracy + 1, 98),
        sources: Math.min(prev.sources + 1, 14),
      }));
    }, 40);
    return () => clearInterval(timer);
  }, []);

  return (
    <PageRoot>
      <Nav />
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '100px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 100 }} className="animate-fade-in">
          <Badge>Our Narrative</Badge>
          <h1 style={{ fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 24 }}>
            Decoding the <GradientText>Pulse of Malaysia</GradientText>
          </h1>
          <p style={{ fontSize: 20, color: '#64748b', lineHeight: 1.8, maxWidth: 700, margin: '0 auto' }}>
            We're building the infrastructure to monitor, analyze, and predict news sentiments in a multilingual, high-velocity media landscape.
          </p>
        </div>

        {/* Stats Section with Pulse */}
        <div style={{ background: '#0f172a', borderRadius: 32, padding: '80px 40px', marginBottom: 120, position: 'relative', overflow: 'hidden' }} className="animate-fade-in delay-1">
          <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, background: 'radial-gradient(circle at 70% 30%, rgba(59,130,246,0.1), transparent 70%)' }}></div>
          <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 48, textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: 48, fontWeight: 900, color: '#3b82f6', marginBottom: 8 }}>{stats.indexed.toLocaleString()}+</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: 13 }}>Articles Indexed</div>
            </div>
            <div>
              <div style={{ fontSize: 48, fontWeight: 900, color: '#10b981', marginBottom: 8 }}>{stats.accuracy}%</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: 13 }}>Sentiment Precision</div>
            </div>
            <div>
              <div style={{ fontSize: 48, fontWeight: 900, color: '#9333ea', marginBottom: 8 }}>{stats.sources}</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: 13 }}>Primary Core Nodes</div>
            </div>
          </div>
        </div>

        {/* Mission Pillars */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24, marginBottom: 120 }}>
          {[
            { title: 'Transparency', desc: 'Eliminating dark patterns in news sentiment reporting through open analysis benchmarks.', color: '#3b82f6' },
            { title: 'Inference', desc: 'Leveraging custom LLM clusters optimized for Malay and Malaysian English dialects.', color: '#10b981' },
            { title: 'Velocity', desc: 'Real-time narrative tracking that updates faster than traditional news cycles.', color: '#9333ea' },
          ].map((item, i) => (
            <div key={item.title} className={`hover-lift animate-fade-in delay-${i}`} style={{ background: 'white', border: '1px solid #e2e8f0', padding: '40px', borderRadius: 24 }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: item.color, marginBottom: 20 }}></div>
              <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12 }}>{item.title}</h3>
              <p style={{ color: '#64748b', lineHeight: 1.7 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </PageRoot>
  );
};

/* ─── JOBS PAGE ──────────────────────────────────────────── */
const JobsPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const jobs = [
    { title: 'Senior AI Engineer', dept: 'Inference Lab', type: 'Full-time', location: 'Kuantan', status: 'Priority' },
    { title: 'Rust Backend Developer', dept: 'Real-time Mesh', type: 'Contract', location: 'Remote', status: 'Hot' },
    { title: 'Media Analyst (BM/EN)', dept: 'Narratives', type: 'Full-time', location: 'Cyberjaya', status: 'New' },
    { title: 'Security Ops Architect', dept: 'System Security', type: 'Full-time', location: 'Remote', status: null },
  ];

  const filteredJobs = useMemo(() => 
    jobs.filter(j => j.title.toLowerCase().includes(searchTerm.toLowerCase())), 
  [searchTerm]);

  return (
    <PageRoot>
      <Nav />
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '100px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 80 }} className="animate-fade-in">
          <Badge>Openings</Badge>
          <h1 style={{ fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.03em', marginBottom: 24 }}>
            Join the <GradientText>Intelligence Mission.</GradientText>
          </h1>
          <p style={{ fontSize: 20, color: '#64748b', lineHeight: 1.8, maxWidth: 600, margin: '0 auto 48px' }}>
            We're recruiting visionaries to build the future of news observability in Southeast Asia.
          </p>
          
          <div style={{ maxWidth: 600, margin: '0 auto', position: 'relative' }}>
            <input 
              type="text" 
              placeholder="Search positions (e.g., AI, Backend)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ 
                width: '100%', padding: '18px 24px 18px 56px', borderRadius: 20, border: '1px solid #e2e8f0', 
                fontSize: 16, background: 'white', outline: 'none', transition: 'box-shadow 0.2s',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
              }}
            />
            <svg style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </div>
        </div>

        <div style={{ display: 'grid', gap: 16, marginBottom: 100 }}>
          {filteredJobs.length > 0 ? filteredJobs.map((job, i) => (
            <div key={job.title} className="animate-fade-in" style={{ animationDelay: `${i*0.1}s`, background: 'white', border: '1px solid #e2e8f0', padding: '32px', borderRadius: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 24 }}>
              <div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8 }}>
                  <h3 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a' }}>{job.title}</h3>
                  {job.status && <span style={{ background: job.status === 'Priority' ? '#fee2e2' : '#dcfce7', color: job.status === 'Priority' ? '#ef4444' : '#10b981', padding: '4px 12px', borderRadius: 8, fontSize: 11, fontWeight: 900, textTransform: 'uppercase' }}>{job.status}</span>}
                </div>
                <div style={{ display: 'flex', gap: 16, color: '#64748b', fontSize: 14, fontWeight: 600 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>{job.dept}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>{job.type}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>{job.location}</span>
                </div>
              </div>
              <button onClick={() => navigate('/register')} style={{ background: '#0f172a', color: 'white', border: 'none', padding: '14px 28px', borderRadius: 12, fontWeight: 800, cursor: 'pointer' }} className="hover-lift">Apply Now</button>
            </div>
          )) : (
            <div style={{ textAlign: 'center', padding: '60px', color: '#64748b', fontSize: 18 }}>No strategic positions matching your search.</div>
          )}
        </div>
      </main>
      <Footer />
    </PageRoot>
  );
};

/* ─── PRIVACY PAGE ───────────────────────────────────────── */
const PrivacyPage = () => (
  <PageRoot>
    <Nav />
    <main style={{ maxWidth: 800, margin: '0 auto', padding: '100px 24px' }}>
      <div style={{ marginBottom: 80 }} className="animate-fade-in">
        <Badge>Information Rights</Badge>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: 24 }}>Privacy Architecture</h1>
        <p style={{ fontSize: 18, color: '#64748b', lineHeight: 1.8 }}>Our commitment to data sovereignty and encryption standards in Southeast Asia.</p>
      </div>

      <div style={{ display: 'grid', gap: 40 }} className="animate-fade-in delay-1">
        {[
          { title: '1. Ingestion Privacy', content: 'We only process public media data. No private user communication is ever ingested by our mesh.' },
          { title: '2. Encryption at Edge', content: 'All API requests are encrypted using TLS 1.3 with P-384 perfect forward secrecy.' },
          { title: '3. Data Retention', content: 'We purge non-aggregated data every 30 days to maintain minimal entropy.' },
        ].map(s => (
          <div key={s.title}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginBottom: 16 }}>{s.title}</h2>
            <p style={{ color: '#64748b', fontSize: 16, lineHeight: 1.8 }}>{s.content}</p>
          </div>
        ))}
      </div>
    </main>
    <Footer />
  </PageRoot>
);

/* ─── Router ─────────────────────────────────────────────── */
const StaticPage = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);

  switch (pathname) {
    case '/api':      return <ApiPage />;
    case '/pricing':  return <PricingPage />;
    case '/about':    return <AboutPage />;
    case '/jobs':     return <JobsPage />;
    case '/privacy':  return <PrivacyPage />;
    default:          return <AboutPage />;
  }
};

export default StaticPage;
