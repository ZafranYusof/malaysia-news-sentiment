// #8 Swipe between tabs hook
import { useRef, useCallback } from 'react';

const SWIPE_THRESHOLD = 50;

export default function useSwipeTabs(tabs, currentTab, setTab) {
  const touchStart = useRef({ x: 0, y: 0 });
  const swiping = useRef(false);

  const onTouchStart = useCallback((e) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    swiping.current = true;
  }, []);

  const onTouchEnd = useCallback((e) => {
    if (!swiping.current) return;
    swiping.current = false;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    // Only horizontal swipes
    if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dy) > Math.abs(dx)) return;
    const idx = tabs.indexOf(currentTab);
    if (dx < 0 && idx < tabs.length - 1) {
      setTab(tabs[idx + 1]);
    } else if (dx > 0 && idx > 0) {
      setTab(tabs[idx - 1]);
    }
  }, [tabs, currentTab, setTab]);

  return { onTouchStart, onTouchEnd };
}
