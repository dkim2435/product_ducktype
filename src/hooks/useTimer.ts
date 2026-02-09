import { useState, useRef, useCallback, useEffect } from 'react';

interface UseTimerOptions {
  mode: 'countdown' | 'stopwatch';
  initialTime: number; // seconds (for countdown)
  onTick?: (elapsed: number) => void;
  onFinish?: () => void;
}

interface UseTimerReturn {
  time: number; // current display time (countdown: remaining, stopwatch: elapsed)
  elapsed: number;
  isRunning: boolean;
  start: () => void;
  stop: () => void;
  reset: (newTime?: number) => void;
}

export function useTimer({
  mode,
  initialTime,
  onTick,
  onFinish,
}: UseTimerOptions): UseTimerReturn {
  const [time, setTime] = useState(mode === 'countdown' ? initialTime : 0);
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const onTickRef = useRef(onTick);
  const onFinishRef = useRef(onFinish);

  onTickRef.current = onTick;
  onFinishRef.current = onFinish;

  const stop = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
  }, []);

  const start = useCallback(() => {
    if (intervalRef.current !== null) return;
    startTimeRef.current = Date.now();
    setIsRunning(true);

    intervalRef.current = window.setInterval(() => {
      const elapsedMs = Date.now() - startTimeRef.current;
      const elapsedSec = Math.floor(elapsedMs / 1000);
      setElapsed(elapsedSec);

      if (mode === 'countdown') {
        const remaining = Math.max(0, initialTime - elapsedSec);
        setTime(remaining);
        onTickRef.current?.(elapsedSec);
        if (remaining <= 0) {
          stop();
          onFinishRef.current?.();
        }
      } else {
        setTime(elapsedSec);
        onTickRef.current?.(elapsedSec);
      }
    }, 100);
  }, [mode, initialTime, stop]);

  const reset = useCallback((newTime?: number) => {
    stop();
    const t = newTime ?? initialTime;
    setTime(mode === 'countdown' ? t : 0);
    setElapsed(0);
  }, [mode, initialTime, stop]);

  useEffect(() => {
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return { time, elapsed, isRunning, start, stop, reset };
}
