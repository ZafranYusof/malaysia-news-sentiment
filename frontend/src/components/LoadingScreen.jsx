import React, { useState, useEffect } from 'react';

const TIPS = [
  "Preparing your intelligence dashboard...",
  "Connecting to news sources...",
  "Warming up AI models...",
  "Almost there...",
];

const LoadingScreen = ({ message = "Loading..." }) => {
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex(prev => (prev + 1) % TIPS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="loading-overlay">
      <style>{`
        .loading-overlay {
          position: fixed;
          inset: 0;
          background: #1D1F27;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 10000;
        }

        .loading-brand {
          font-size: 28px;
          font-weight: 800;
          color: #EEEFE9;
          margin-bottom: 48px;
          letter-spacing: -0.5px;
        }

        .loading-brand span {
          background: linear-gradient(135deg, #1D4AFF, #5B7FFF);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .loading-dots-container {
          display: flex;
          gap: 8px;
          margin-bottom: 32px;
        }

        .loading-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #1D4AFF;
          animation: dotPulse 1.4s ease-in-out infinite;
        }

        .loading-dot:nth-child(2) { animation-delay: 0.2s; }
        .loading-dot:nth-child(3) { animation-delay: 0.4s; }

        @keyframes dotPulse {
          0%, 80%, 100% {
            transform: scale(0.6);
            opacity: 0.4;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .loading-progress-track {
          width: 200px;
          height: 4px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 99px;
          overflow: hidden;
          margin-bottom: 24px;
        }

        .loading-progress-bar {
          height: 100%;
          width: 40%;
          background: linear-gradient(90deg, #1D4AFF, #5B7FFF);
          border-radius: 99px;
          animation: progressSlide 1.8s ease-in-out infinite;
        }

        @keyframes progressSlide {
          0% { transform: translateX(-100%); width: 40%; }
          50% { width: 60%; }
          100% { transform: translateX(350%); width: 40%; }
        }

        .loading-message {
          font-size: 14px;
          font-weight: 600;
          color: #EEEFE9;
          margin-bottom: 8px;
          letter-spacing: 0.3px;
        }

        .loading-tip {
          font-size: 12px;
          color: #7A7B74;
          animation: fadeSwitch 2.5s ease infinite;
        }

        @keyframes fadeSwitch {
          0%, 90%, 100% { opacity: 1; }
          95% { opacity: 0; }
        }
      `}</style>

      <div className="loading-brand">
        MY<span>News</span> Sentiment
      </div>

      <div className="loading-dots-container">
        <div className="loading-dot" />
        <div className="loading-dot" />
        <div className="loading-dot" />
      </div>

      <div className="loading-progress-track">
        <div className="loading-progress-bar" />
      </div>

      <p className="loading-message">{message}</p>
      <p className="loading-tip">{TIPS[tipIndex]}</p>
    </div>
  );
};

export default LoadingScreen;
