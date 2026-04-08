import React from 'react';

const AiDigestCard = ({ digest, loading, topic }) => {
  if (loading) {
    return (
      <div className="digest-panel is-loading">
        <div className="digest-avatar">🤖</div>
        <div className="digest-body">
          <div className="digest-header">
            <span className="digest-tag">AI Digest</span>
            <span className="digest-topic">Generating summary...</span>
          </div>
          <div className="digest-skeleton">
            <div className="skeleton" style={{ height: 13, width: '90%', borderRadius: 6 }} />
            <div className="skeleton" style={{ height: 13, width: '75%', borderRadius: 6 }} />
            <div className="skeleton" style={{ height: 13, width: '55%', borderRadius: 6 }} />
          </div>
        </div>
      </div>
    );
  }

  if (!digest) return null;

  return (
    <div className="digest-panel">
      <div className="digest-avatar">🤖</div>
      <div className="digest-body">
        <div className="digest-header">
          <span className="digest-tag">AI Digest</span>
          <span className="digest-topic">Topic: <strong>{topic}</strong></span>
        </div>
        <p className="digest-text">{digest}</p>
      </div>
    </div>
  );
};

export default AiDigestCard;
