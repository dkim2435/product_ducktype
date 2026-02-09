import { useState, useEffect, useRef, useCallback } from 'react';

interface CaretPosition {
  left: number;
  top: number;
  height: number;
}

export function useCaret(
  currentWordIndex: number,
  currentLetterIndex: number,
  isTyping: boolean
) {
  const [position, setPosition] = useState<CaretPosition>({ left: 0, top: 0, height: 0 });
  const [isBlinking, setIsBlinking] = useState(true);
  const blinkTimeoutRef = useRef<number | null>(null);
  const wordsContainerRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    const container = wordsContainerRef.current;
    if (!container) return;

    const wordElements = container.querySelectorAll('[data-word]');
    const currentWordEl = wordElements[currentWordIndex] as HTMLElement;
    if (!currentWordEl) return;

    const letterElements = currentWordEl.querySelectorAll('[data-letter]');
    // Use container's getBoundingClientRect as reference
    const containerRect = container.getBoundingClientRect();

    let targetEl: Element | null = null;
    let isAfterLetter = false;

    if (currentLetterIndex < letterElements.length) {
      targetEl = letterElements[currentLetterIndex];
    } else if (letterElements.length > 0) {
      targetEl = letterElements[letterElements.length - 1];
      isAfterLetter = true;
    } else {
      const wordRect = currentWordEl.getBoundingClientRect();
      setPosition({
        left: wordRect.left - containerRect.left,
        top: wordRect.top - containerRect.top,
        height: wordRect.height,
      });
      return;
    }

    if (targetEl) {
      const rect = targetEl.getBoundingClientRect();
      setPosition({
        left: (isAfterLetter ? rect.right : rect.left) - containerRect.left,
        top: rect.top - containerRect.top,
        height: rect.height,
      });
    }
  }, [currentWordIndex, currentLetterIndex]);

  useEffect(() => {
    // Double rAF ensures DOM has settled after React render + margin changes
    requestAnimationFrame(() => {
      requestAnimationFrame(updatePosition);
    });
  }, [updatePosition]);

  useEffect(() => {
    if (isTyping) {
      setIsBlinking(false);
      if (blinkTimeoutRef.current) clearTimeout(blinkTimeoutRef.current);
      blinkTimeoutRef.current = window.setTimeout(() => {
        setIsBlinking(true);
      }, 500);
    }
    return () => {
      if (blinkTimeoutRef.current) clearTimeout(blinkTimeoutRef.current);
    };
  }, [isTyping, currentLetterIndex, currentWordIndex]);

  useEffect(() => {
    const handleResize = () => updatePosition();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updatePosition]);

  return { position, isBlinking, wordsContainerRef, updatePosition };
}
