import React, { useState, useEffect } from 'react';

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled up to given distance
  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Custom cinematic smooth scroll with easing
  const scrollToTop = () => {
    const scrollDuration = 800; // ms
    const scrollStep = -window.scrollY / (scrollDuration / 15);
    
    // Simple cubic ease-in-out
    const start = window.pageYOffset;
    const startTime = 'now' in window.performance ? performance.now() : new Date().getTime();

    const easeInOutCubic = (t) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;

    const scroll = () => {
      const now = 'now' in window.performance ? performance.now() : new Date().getTime();
      const time = Math.min(1, (now - startTime) / scrollDuration);
      const timeFunction = easeInOutCubic(time);
      
      window.scroll(0, Math.ceil(timeFunction * (0 - start) + start));

      if (window.pageYOffset === 0 || time === 1) return;
      requestAnimationFrame(scroll);
    };

    // Add a quick launch animation to the button
    const btn = document.querySelector('.scroll-to-top-btn');
    if (btn) btn.classList.add('launching');
    
    scroll();

    // Reset button after scroll finishes
    setTimeout(() => {
      if (btn) btn.classList.remove('launching');
    }, scrollDuration);
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  return (
    <>
      <style>{`
        .scroll-to-top-btn {
          position: fixed;
          bottom: 40px;
          right: 40px;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background-color: rgb(20, 20, 20);
          border: none;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0px 0px 0px 4px rgba(180, 160, 255, 0.253);
          cursor: pointer;
          transition: width 0.3s, border-radius 0.3s, background-color 0.3s, opacity 0.3s, visibility 0.3s, transform 0.3s;
          overflow: hidden;
          z-index: 9999;
          opacity: 0;
          visibility: hidden;
        }

        .scroll-to-top-btn.visible {
          opacity: 1;
          visibility: visible;
        }

        .scroll-to-top-btn.launching {
          transform: translateY(-20px) scale(1.1);
          background-color: #6366f1;
        }

        .scroll-to-top-btn .svgIcon {
          width: 12px;
          transition-duration: 0.3s;
        }

        .scroll-to-top-btn .svgIcon path {
          fill: white;
        }

        .scroll-to-top-btn:hover {
          width: 140px;
          border-radius: 50px;
          background-color: rgb(181, 160, 255);
        }

        .scroll-to-top-btn:hover .svgIcon {
          transform: translateY(-200%);
        }

        .scroll-to-top-btn::before {
          position: absolute;
          bottom: -20px;
          content: "Back to Top";
          color: white;
          font-size: 0px;
          transition: font-size 0.3s, opacity 0.3s, bottom 0.3s;
          opacity: 0;
        }

        .scroll-to-top-btn:hover::before {
          font-size: 13px;
          opacity: 1;
          bottom: unset;
          transition-duration: 0.3s;
        }
      `}</style>
      <button 
        className={`scroll-to-top-btn ${isVisible ? 'visible' : ''}`}
        onClick={scrollToTop}
        aria-label="Scroll to top"
      >
        <svg className="svgIcon" viewBox="0 0 384 512">
          <path
            d="M214.6 41.4c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 141.2V448c0 17.7 14.3 32 32 32s32-14.3 32-32V141.2L329.4 246.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-160-160z"
          ></path>
        </svg>
      </button>
    </>
  );
};

export default ScrollToTop;
