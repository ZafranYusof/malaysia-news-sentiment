import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const PageTransition = ({ children }) => {
  const location = useLocation();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [transitionStage, setTransitionStage] = useState('fade-in');

  useEffect(() => {
    if (children !== displayChildren) {
      setTransitionStage('fade-out');
    }
  }, [children, displayChildren]);

  const handleTransitionEnd = () => {
    if (transitionStage === 'fade-out') {
      setDisplayChildren(children);
      setTransitionStage('fade-in');
    }
  };

  return (
    <>
      <style>{`
        .page-transition {
          transition: opacity 0.2s ease, transform 0.2s ease;
        }
        .page-transition.fade-in {
          opacity: 1;
          transform: translateY(0);
        }
        .page-transition.fade-out {
          opacity: 0;
          transform: translateY(8px);
        }
      `}</style>
      <div
        className={`page-transition ${transitionStage}`}
        onTransitionEnd={handleTransitionEnd}
      >
        {displayChildren}
      </div>
    </>
  );
};

export default PageTransition;
