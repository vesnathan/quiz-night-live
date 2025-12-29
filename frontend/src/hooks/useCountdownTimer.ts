import { useState, useEffect, useCallback } from 'react';

interface CountdownResult {
  timeLeft: string;
  totalSeconds: number;
  isExpired: boolean;
  minutes: number;
  seconds: number;
}

/**
 * Hook to manage countdown timer logic
 * @param targetTime - Unix timestamp (ms) to count down to
 * @returns Countdown state with formatted time and expiration status
 */
export function useCountdownTimer(targetTime: number): CountdownResult {
  const [state, setState] = useState<CountdownResult>(() => calculateTimeLeft(targetTime));

  useEffect(() => {
    const updateTimer = () => {
      setState(calculateTimeLeft(targetTime));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [targetTime]);

  return state;
}

function calculateTimeLeft(targetTime: number): CountdownResult {
  const now = Date.now();
  const diff = Math.max(0, targetTime - now);
  const totalSeconds = Math.ceil(diff / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const isExpired = diff <= 0;

  const timeLeft = isExpired
    ? '0:00'
    : `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return {
    timeLeft,
    totalSeconds,
    isExpired,
    minutes,
    seconds,
  };
}

/**
 * Hook for countdown with callback when expired
 */
export function useCountdownWithCallback(
  targetTime: number,
  onExpire?: () => void
): CountdownResult {
  const result = useCountdownTimer(targetTime);

  useEffect(() => {
    if (result.isExpired && onExpire) {
      onExpire();
    }
  }, [result.isExpired, onExpire]);

  return result;
}
