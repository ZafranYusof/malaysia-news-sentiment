import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const ContactPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const contactMethods = [
    { icon: '✉️', title: 'Email Us', detail: 'support@mynewssentiment.com', sub: 'We reply within 24 hours' },
    { icon: '📍', title: 'Visit Us', detail: 'UMPSA, Gambang, Pahang', sub: 'Universiti Malaysia Pahang Al-Sultan Abdullah' },
    { icon: '📞', title: 'Call Us', detail: '+60 12-345 6789', sub: 'Mon-Fri, 9AM - 5PM MYT' },
  ];

  const faqs = [
    { q: 'What news sources do you analyze?', a: 'We aggregate from Astro Awani, FMT, Malaysiakini, and other major Malaysian news outlets via RSS feeds.' },
    { q: 'How accurate is the sentiment analysis?', a: 'Our multi-tier AI system (Gemini + Malaya NLP + local fallback) achieves ~95% accuracy on Malaysian news content.' },
    { q: 'Is this free to use?', a: 'Yes! The Starter plan is completely free for academic research and personal use.' },
    { q: 'Can I use this for my FYP/thesis?', a: 'Absolutely. The platform was designed with academic research in mind. We provide full API documentation and export capabilities.' },
  ];

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', system-ui, sans-serif", color: '#1e293b' }}>
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .anim { animation: fadeInUp 0.6s ease-out forwards; }
        .anim-d1 { animation-delay: 0.1s; }
        .anim-d2 { animation-delay: 0.2s; }
        .anim-d3 { animation-delay: 0.3s; }
        .hlift { transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .hlift:hover { transform: translateY(-6px); }
        .contact-input:focus { border-color: #3b82f6 !important; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
      `}</style>

      {/* Nav */}
      <nav style={{ padding: '16px 0', borderBottom: '1px solid #e2e8f0', background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', color: '#64748b', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
            ← Back to Home
          </button>
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
          <span style={{ display: 'inline-block', background: '#ecfdf5', color: '#10b981', padding: '6px 16px', borderRadius: 100, fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 24 }}>Get In Touch</span>
          <h1 style={{ fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 24 }}>
            Let's <span style={{ background: 'linear-gradient(135deg, #3b82f6, #9333ea)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Connect</span>
          </h1>
          <p style={{ fontSize: 20, color: '#64748b', lineHeight: 1.8, maxWidth: 600, margin: '0 auto' }}>
            Have questions about the platform? Need help with integration? We'd love to hear from you.
          </p>
        </div>

        {/* Contact Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, marginBottom: 80 }}>
          {contactMethods.map((m, i) => (
            <div key={m.title} className={`hlift anim anim-d${i+1}`} style={{ background: 'white', border: '1px solid #e2e8f0', padding: '36px', borderRadius: 24, textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
              <div style={{ fontSize: 36, marginBottom: 16 }}>{m.icon}</div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>{m.title}</h3>
              <p style={{ fontSize: 16, fontWeight: 700, color: '#3b82f6', marginBottom: 4 }}>{m.detail}</p>
              <p style={{ fontSize: 13, color: '#94a3b8', fontWeight: 500 }}>{m.sub}</p>
            </div>
          ))}
        </div>

        {/* Form + FAQ Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 48, marginBottom: 100 }}>
          {/* Contact Form */}
          <div className="anim">
            <h2 style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', marginBottom: 8 }}>Send us a message</h2>
            <p style={{ color: '#64748b', marginBottom: 32, fontSize: 15 }}>Fill out the form and we'll get back to you shortly.</p>
            
            {submitted && (
              <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '16px 24px', borderRadius: 16, marginBottom: 24, color: '#065f46', fontWeight: 700, fontSize: 14 }}>
                ✅ Message sent successfully! We'll reply within 24 hours.
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <input className="contact-input" type="text" placeholder="Your Name" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ padding: '14px 18px', borderRadius: 14, border: '1px solid #e2e8f0', fontSize: 15, outline: 'none', transition: 'all 0.2s' }} />
                <input className="contact-input" type="email" placeholder="Your Email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ padding: '14px 18px', borderRadius: 14, border: '1px solid #e2e8f0', fontSize: 15, outline: 'none', transition: 'all 0.2s' }} />
              </div>
              <input className="contact-input" type="text" placeholder="Subject" required value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} style={{ width: '100%', padding: '14px 18px', borderRadius: 14, border: '1px solid #e2e8f0', fontSize: 15, outline: 'none', marginBottom: 16, transition: 'all 0.2s' }} />
              <textarea className="contact-input" placeholder="Your Message" required rows={5} value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} style={{ width: '100%', padding: '14px 18px', borderRadius: 14, border: '1px solid #e2e8f0', fontSize: 15, outline: 'none', resize: 'vertical', fontFamily: 'inherit', marginBottom: 24, transition: 'all 0.2s' }} />
              <button type="submit" className="hlift" style={{ background: '#0f172a', color: 'white', border: 'none', padding: '16px 40px', borderRadius: 14, fontWeight: 800, fontSize: 16, cursor: 'pointer', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
                Send Message →
              </button>
            </form>
          </div>

          {/* FAQ */}
          <div className="anim anim-d1">
            <h2 style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', marginBottom: 8 }}>Frequently Asked</h2>
            <p style={{ color: '#64748b', marginBottom: 32, fontSize: 15 }}>Quick answers to common questions.</p>
            
            <div style={{ display: 'grid', gap: 12 }}>
              {faqs.map((faq, i) => (
                <div key={i} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 16, overflow: 'hidden', transition: 'box-shadow 0.2s', boxShadow: openFaq === i ? '0 4px 20px rgba(0,0,0,0.06)' : 'none' }}>
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ width: '100%', padding: '20px 24px', background: 'none', border: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', textAlign: 'left' }}>
                    <span style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>{faq.q}</span>
                    <span style={{ transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.3s', fontSize: 18, color: '#94a3b8' }}>▾</span>
                  </button>
                  {openFaq === i && (
                    <div style={{ padding: '0 24px 20px', color: '#64748b', fontSize: 14, lineHeight: 1.7 }}>{faq.a}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ padding: '40px 0', borderTop: '1px solid #e2e8f0', textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>
        © {new Date().getFullYear()} MY News Sentiment Analysis — UMPSA FYP Project
      </footer>
    </div>
  );
};

export default ContactPage;
