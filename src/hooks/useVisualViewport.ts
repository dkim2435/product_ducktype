import { useState, useEffect } from 'react';

/**
 * Detects mobile virtual keyboard visibility using the Visual Viewport API.
 * Returns the keyboard height in pixels (0 when keyboard is hidden).
 */
export function useKeyboardHeight(): number {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const handler = () => {
      // Difference between layout viewport and visual viewport = keyboard height
      const kbh = Math.round(window.innerHeight - vv.height);
      setHeight(kbh > 80 ? kbh : 0); // threshold to ignore minor toolbar changes
    };

    vv.addEventListener('resize', handler);
    vv.addEventListener('scroll', handler);
    return () => {
      vv.removeEventListener('resize', handler);
      vv.removeEventListener('scroll', handler);
    };
  }, []);

  return height;
}
