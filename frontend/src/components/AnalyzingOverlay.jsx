import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FUN_FACTS = [
  "💡 Did you know? Sentiment analysis can detect sarcasm with 65% accuracy",
  "📊 The average news article contains 3-5 key entities",
  "🇲🇾 Malaysian news covers 14 states and 3 federal territories",
  "🤖 AI can analyze sentiment in Bahasa Melayu and English",
  "📰 Over 50,000 news articles are published daily in Malaysia",
  "🧠 NLP models can understand context, not just keywords",
  "📈 Positive news tends to get 40% more engagement",
  "🔍 Sentiment trends help predict market movements",
  "💬 Social media sentiment differs from news sentiment by ~20%",
  "⚡ Our AI processes each article in under 2 seconds",
];

const AnalyzingOverlay = ({ progress }) => {
  const [factIndex, setFactIndex] = useState(0);
  const [particles, setParticles] = useState([]);

  // Rotate facts every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setFactIndex(prev => (prev + 1) % FUN_FACTS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Generate floating particles
  useEffect(() => {
    const newParticles = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 3 + Math.random() * 2,
    }));
    setParticles(newParticles);
  }, []);

  if (!progress || progress.total === 0) return null;

  const pct = Math.round((progress.done / progress.total) * 100);

  return (
    <motion.div 
      className="analyzing-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Floating Particles Background */}
      <div className="analyzing-particles">
        {particles.map(particle => (
          <motion.div
            key={particle.id}
            className="analyzing-particle"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Main Card */}
      <motion.div 
        className="analyzing-card"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ 
          type: "spring", 
          stiffness: 200, 
          damping: 20 
        }}
      >
        {/* Animated Spinner with Pulse */}
        <div className="analyzing-icon">
          <motion.div 
            className="analyzing-spinner-modern"
            animate={{ rotate: 360 }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity, 
              ease: "linear" 
            }}
          >
            <div className="spinner-ring spinner-ring-1"></div>
            <div className="spinner-ring spinner-ring-2"></div>
            <div className="spinner-ring spinner-ring-3"></div>
          </motion.div>
          
          {/* Pulse Effect */}
          <motion.div
            className="analyzing-pulse"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>

        {/* Title with Gradient Animation */}
        <motion.h3 
          className="analyzing-title"
          animate={{
            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          Analyzing Articles
        </motion.h3>

        {/* Count with Number Animation */}
        <motion.p 
          className="analyzing-count"
          key={progress.done}
          initial={{ scale: 1.2, color: "#14b8a6" }}
          animate={{ scale: 1, color: "#64748b" }}
          transition={{ duration: 0.3 }}
        >
          {progress.done} of {progress.total} completed
        </motion.p>
        
        {/* Progress Bar with Shimmer */}
        <div className="analyzing-progress-track">
          <motion.div 
            className="analyzing-progress-fill-modern"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <motion.div
              className="analyzing-shimmer"
              animate={{
                x: ["-100%", "200%"],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          </motion.div>
        </div>

        {/* Percentage with Scale Animation */}
        <motion.span 
          className="analyzing-pct"
          key={pct}
          initial={{ scale: 1.3 }}
          animate={{ scale: 1 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 15 
          }}
        >
          {pct}%
        </motion.span>

        {/* Fun Facts with Slide Animation */}
        <div className="analyzing-fact-container">
          <AnimatePresence mode="wait">
            <motion.div
              key={factIndex}
              className="analyzing-fact"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
            >
              {FUN_FACTS[factIndex]}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AnalyzingOverlay;
