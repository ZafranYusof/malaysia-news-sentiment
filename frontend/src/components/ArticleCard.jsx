import React, { useState, useEffect } from 'react';
import SentimentBadge from './SentimentBadge';
import AlertBadge from './AlertBadge';
import { useArticleAnalysis } from '../context/ArticleAnalysisContext';
import { useSocket } from '../context/SocketContext';
import { hapticImpact } from '../utils/haptics';
import toast from 'react-hot-toast';

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-MY', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
};

const deriveSourceLabel = (source, url) => {
  if (source && source !== 'Unknown' && source !== 'Source' && source !== 'Media Source') {
    return source;
  }

  if (!url) return 'News Source';

  try {
    const host = new URL(url).hostname.replace(/^www\./, '');
    const label = host.split('.')[0] || host;
    return label
      .split(/[-_]/)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  } catch {
    return 'News Source';
  }
};

const ArticleCard = ({ article, onPreview, onDelete, onBookmark, isBookmarked }) => {
  const { openArticlePanel } = useArticleAnalysis();
  const socket = useSocket();
  const [localViewCount, setLocalViewCount] = useState(article.viewCount || article.views || 0);
  const [localBookmarkCount, setLocalBookmarkCount] = useState(article.bookmarksCount || 0);

  useEffect(() => {
    if (!socket) return;

    const articleId = article._id || article.id;
    
    const handleViewUpdate = (data) => {
      if (data.articleId === articleId) {
        setLocalViewCount(data.viewCount);
      }
    };

    const handleBookmarkUpdate = (data) => {
      if (data.articleId === articleId) {
        setLocalBookmarkCount(data.bookmarksCount);
      }
    };

    socket.on('view_updated', handleViewUpdate);
    socket.on('bookmark_updated', handleBookmarkUpdate);

    return () => {
      socket.off('view_updated', handleViewUpdate);
      socket.off('bookmark_updated', handleBookmarkUpdate);
    };
  }, [socket, article._id, article.id]);

  const { 
    id, _id, title, description, source, url, urlToImage, 
    publishedAt, topic, sentiment, reason, confidence, isAlert 
  } = article;

  const articleId = _id || id;
  const sourceLabel = deriveSourceLabel(source, url);

  const handlePreview = (e) => {
    // If user clicks the direct link or delete/bookmark btn, don't open preview
    if (e.target.closest('.art-external-link')) return;
    if (e.target.closest('.art-delete-btn')) return;
    if (e.target.closest('.art-bookmark-btn')) return;
    
    e.preventDefault();
    if (onPreview) {
      onPreview(article);
    } else {
      openArticlePanel(article);
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (onDelete && articleId) onDelete(articleId);
  };

  const handleBookmark = (e) => {
    e.stopPropagation();
    hapticImpact('Light'); // #10 haptic on bookmark
    if (onBookmark && articleId) onBookmark(articleId);
  };

  // #9 Share article via Web Share API
  const handleShare = async (e) => {
    e.stopPropagation();
    const shareData = { title: title, text: description?.slice(0, 100) || title, url: url };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(url);
        toast.success('Link copied!');
      } catch {}
    }
  };

  return (
    <div
      onClick={handlePreview}
      className={`article-card ${isAlert ? 'article-card--alert' : 'article-card--interactive'}`}
      data-sentiment={sentiment}
      aria-label={`${title} — ${sentiment} sentiment${isAlert ? ' — Alert' : ''}`}
      style={{ cursor: 'pointer' }}
    >
      {/* Thumbnail - #6 lazy loading with blur placeholder */}
      <div className="art-thumb-container">
        {urlToImage ? (
          <img 
            src={urlToImage} 
            alt={title} 
            className="art-thumb" 
            loading="lazy"
            decoding="async"
            style={{ background: 'rgba(99,102,241,0.08)' }}
            onError={(e) => { 
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
            }} 
          />
        ) : null}
        
        {/* Placeholder (Hidden by default if img exists) */}
        <div className="art-thumb-ph" style={{ display: urlToImage ? 'none' : 'flex' }}>
          <div className="art-ph-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 0-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/>
              <path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6Z"/>
            </svg>
          </div>
          <div className="art-ph-bg" />
        </div>
      </div>

      {/* Body */}
      <div className="art-body">
        <div className="art-meta">
          <span className="art-source">{sourceLabel}</span>
          <span className="art-sep">·</span>
          <span className="art-date">{formatDate(publishedAt)}</span>
          {topic && <span className="art-topic">#{topic}</span>}
          {isAlert && <AlertBadge />}
        </div>

        <h3 className="art-title">{title}</h3>
        {description && <p className="art-desc">{description.slice(0, 160)}{description.length > 160 ? '...' : ''}</p>}

        <div className="art-footer">
          <div className="art-footer-left">
            <SentimentBadge sentiment={sentiment} />
            {confidence !== undefined && confidence > 0 && (
              <div className="art-confidence-container">
                <div className="art-confidence-track">
                  <div 
                    className="art-confidence-fill" 
                    style={{ width: `${Math.round(confidence * 100)}%`, background: `var(--${sentiment.toLowerCase()})` }}
                  />
                </div>
                <span className="art-conf-text">{Math.round(confidence * 100)}% confidence</span>
              </div>
            )}
          </div>
          
          <div className="art-footer-right" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
             <div className="art-view-pill" style={{ 
               display: 'flex', alignItems: 'center', gap: 6, 
               fontSize: 11, fontWeight: 700, color: 'var(--text-400)',
               padding: '2px 8px', borderRadius: 6, background: 'rgba(255,255,255,0.03)',
               border: '1px solid rgba(255,255,255,0.05)'
             }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                {localViewCount}
             </div>

             <div className="art-bookmark-pill" style={{ 
               display: 'flex', alignItems: 'center', gap: 6, 
               fontSize: 11, fontWeight: 700, color: localBookmarkCount > 0 ? '#f59e0b' : 'var(--text-400)',
               padding: '2px 8px', borderRadius: 6, background: 'rgba(255,255,255,0.03)',
               border: '1px solid rgba(255,255,255,0.05)',
               opacity: localBookmarkCount > 0 ? 1 : 0.6
             }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill={localBookmarkCount > 0 ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
                </svg>
                {localBookmarkCount}
             </div>

             {/* #9 Share button */}
             <button
               className="art-share-btn"
               onClick={handleShare}
               title="Share article"
               style={{
                 background: 'none', border: 'none', padding: 4, cursor: 'pointer',
                 color: 'var(--text-400)', transition: 'all 0.2s ease',
                 display: 'flex', alignItems: 'center', justifyContent: 'center'
               }}
             >
               <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                 <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                 <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
               </svg>
             </button>

             {onBookmark && (
               <button 
                className={`art-bookmark-btn ${isBookmarked ? 'active' : ''}`}
                onClick={handleBookmark}
                title={isBookmarked ? "Remove bookmark" : "Add to bookmarks"}
                style={{
                  background: 'none', border: 'none', padding: 4, cursor: 'pointer',
                  color: isBookmarked ? '#f59e0b' : 'var(--text-400)',
                  transition: 'all 0.2s ease',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
               >
                 <svg width="14" height="14" viewBox="0 0 24 24" fill={isBookmarked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                   <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
                 </svg>
               </button>
             )}

             {onDelete && (
               <button 
                 className="art-delete-btn"
                 onClick={handleDelete}
                 title="Delete permanently"
               >
                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                   <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                 </svg>
               </button>
             )}

             <a 
              href={url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="art-external-link"
              title="Open original source"
              onClick={(e) => e.stopPropagation()}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
            </a>
          </div>
        </div>
        
        {reason && <p className="art-reason-short">"{reason}"</p>}
      </div>
    </div>
  );
};

export default ArticleCard;
