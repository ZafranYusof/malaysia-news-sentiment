import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import SentimentBadge from './SentimentBadge';
import AlertBadge from './AlertBadge';
import { trackView, voteSentiment, toggleBookmark } from '../services/api';

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-MY', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
};

const ArticlePreviewModal = ({ article, isOpen, onClose }) => {
  const [voted, setVoted] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [localFeedback, setLocalFeedback] = useState(article?.feedback || null);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    if (isOpen && article?._id) {
      document.body.style.overflow = 'hidden';
      trackView(article._id).catch(() => {});
    }

    return () => {
      document.body.style.overflow = originalOverflow || '';
    };
  }, [isOpen, article?._id]);

  if (!isOpen || !article) return null;

  const {
    _id, title, description, source, url, urlToImage,
    publishedAt, topic, sentiment, aiSentiment, reason, confidence, isAlert, content
  } = article;

  const handleVote = async (s) => {
    try {
      const res = await voteSentiment(_id, { sentiment: s });
      setLocalFeedback(res.feedback);
      setVoted(true);
      toast.success('Feedback recorded!');
    } catch {
      toast.error('Failed to submit vote');
    }
  };

  const handleBookmark = async () => {
    try {
      const res = await toggleBookmark(_id);
      setIsBookmarked(res.bookmarked);
      toast.success(res.bookmarked ? 'Saved!' : 'Removed!');
    } catch {
      toast.error('Bookmark error');
    }
  };

  const cleanHtml = (html) => {
    if (!html) return '';
    // Strip dangerous tags and attributes for XSS prevention
    let clean = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    clean = clean.replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '');
    clean = clean.replace(/<object[^>]*>[\s\S]*?<\/object>/gi, '');
    clean = clean.replace(/<embed[^>]*>/gi, '');
    clean = clean.replace(/<link[^>]*>/gi, '');
    // Strip image/figure tags that might break layout
    clean = clean.replace(/<figure[^>]*>[\s\S]*?<\/figure>/gi, '');
    clean = clean.replace(/<img[^>]*>/gi, '');
    // Remove event handlers (onclick, onerror, onload, etc.)
    clean = clean.replace(/\son\w+\s*=\s*["'][^"']*["']/gi, '');
    clean = clean.replace(/\son\w+\s*=\s*[^\s>]*/gi, '');
    // Remove javascript: URLs
    clean = clean.replace(/href\s*=\s*["']javascript:[^"']*["']/gi, '');
    // Remove complex style attributes
    clean = clean.replace(/style="[^"]*"/gi, '');
    return clean;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close modal">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>

        <div className="modal-content">
          <header className="modal-header">
            <div className="modal-meta-row">
              <span className="modal-source-pill">{source}</span>
              <span className="modal-date-text">{formatDate(publishedAt)}</span>
              {topic && <span className="modal-topic-chip">#{topic}</span>}
              <button 
                className="btn-bookmark" 
                onClick={handleBookmark} 
                title={isBookmarked ? "Remove bookmark" : "Add to bookmarks"}
                style={{ 
                  marginLeft: 'auto', 
                  marginRight: '48px',
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer', 
                  color: isBookmarked ? 'var(--neu)' : 'var(--text-400)',
                  transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill={isBookmarked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
              </button>
            </div>
            {isAlert && <AlertBadge />}
            <h2 className="modal-title">{title}</h2>
          </header>

          <div className="modal-body">
            {urlToImage && (
              <div className="modal-image-wrapper">
                <img src={urlToImage} alt={title} className="modal-image" />
              </div>
            )}

            <div className="modal-analysis-section">
              <div className="modal-section-grid">
                <div className="analysis-card-main">
                  <h4 className="modal-section-label">Sentiment Analysis (Hybrid)</h4>
                  <div className="modal-sentiment-row">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                       <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-400)', textTransform: 'uppercase' }}>AI Classifier:</span>
                       <SentimentBadge sentiment={aiSentiment || sentiment} />
                    </div>
                    <div className="modal-confidence-bar-group">
                       <span className="modal-conf-value">{Math.round((confidence || 0) * 100)}% Confidence</span>
                       <div className="modal-conf-track">
                         <div 
                           className="modal-conf-fill" 
                           style={{ width: `${Math.round((confidence || 0) * 100)}%`, background: `var(--${(aiSentiment || sentiment).toLowerCase()})` }} 
                         />
                       </div>
                    </div>
                  </div>
                </div>

                <div className="analysis-card-reason">
                  <h4 className="modal-section-label">Strategic Reasoning</h4>
                  <div className="modal-reason-box">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--brand)', marginTop: 2 }}>
                      <path d="M12 22v-5"/><path d="M9 18l3 3 3-3"/><circle cx="12" cy="7" r="5"/><path d="M12 12V2"/>
                    </svg>
                    <p className="modal-reason-text">
                      {reason || 'Standard keyword indicators detected (Local fallback analysis).'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="vote-section">
                <span className="vote-label">User Feedback:</span>
                <div className="vote-options">
                   {['Positive', 'Neutral', 'Negative'].map(s => (
                     <button 
                       key={s} 
                       className={`btn-vote ${voted ? 'disabled' : ''}`}
                       onClick={() => !voted && handleVote(s)}
                       disabled={voted}
                     >
                       {s} {localFeedback?.[s] > 0 && `(${localFeedback[s]})`}
                     </button>
                   ))}
                </div>
              </div>
            </div>

            <div className="modal-text-section">
              <h4 className="modal-section-label">Description</h4>
              <p className="modal-full-text">{description}</p>
              
               {content && (
                <div className="modal-excerpt-container">
                  <h4 className="modal-section-label">Strategic Excerpt</h4>
                  <div 
                    className="modal-excerpt-text"
                    dangerouslySetInnerHTML={{ 
                      __html: cleanHtml(
                        (content.split('[+')[0].length > 450 
                          ? content.split('[+')[0].slice(0, 450) + '...' 
                          : content.split('[+')[0])
                      ) 
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          <footer className="modal-footer">
            {url ? (
              <button 
                onClick={() => window.open(url, '_blank')}
                className="modal-cta-primary"
              >
                Read Full Story on {source || 'Media Source'}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 8 }}>
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
              </button>
            ) : (
              <button className="modal-cta-primary" disabled style={{ opacity: 0.6, cursor: 'not-allowed' }}>
                Full Story Source Unavailable
              </button>
            )}
            <button className="btn-outline" onClick={onClose} style={{ marginLeft: 12 }}>
              Close Preview
            </button>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default ArticlePreviewModal;
