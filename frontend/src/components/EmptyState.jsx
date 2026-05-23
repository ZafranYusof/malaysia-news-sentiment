import React from 'react';

const EmptyState = () => (
  <div className="empty-state">
    <div className="empty-state__illustration">
      <svg width="200" height="200" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r="80" fill="#f5f5f5" />
        <text x="100" y="105" textAnchor="middle" fontSize="48">📊</text>
      </svg>
    </div>
    <h3>No Data Available</h3>
    <p>Articles are being collected and analysed. Check back soon for sentiment insights.</p>
  </div>
);

export default EmptyState;
