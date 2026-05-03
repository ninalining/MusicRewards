import { useCallback, useEffect, useRef, useState } from 'react';
import { useProgress } from 'react-native-track-player';
import { useUserStore } from '../stores/userStore';
import { PROGRESS_POLL_INTERVAL_MS, NEAR_COMPLETE_RATIO } from '../constants/theme';
import type { PointsCounterConfig, UsePointsCounterReturn } from '../types';

export const usePointsCounter = (): UsePointsCounterReturn => {
  const [isActive, setIsActive] = useState(false);
  const [currentPoints, setCurrentPoints] = useState(0);
  const [progress, setProgress] = useState(0);

  // Stable ref — avoids stale closure in the progress-tick effect.
  const configRef = useRef<PointsCounterConfig | null>(null);
  // Cumulative amount already passed to addPoints — used to compute delta.
  const prevAwardedRef = useRef<number>(0);

  const addPoints = useUserStore((s) => s.addPoints);

  const trackProgress = useProgress(PROGRESS_POLL_INTERVAL_MS);

  useEffect(() => {
    if (!isActive || !configRef.current) return;

    const { totalPoints, durationSeconds } = configRef.current;
    if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) return;

    const position = trackProgress.position;
    // Award full points at ≥99% — position rarely equals duration exactly.
    const ratio = position / durationSeconds;
    const newEarned = ratio >= NEAR_COMPLETE_RATIO ? totalPoints : Math.floor(ratio * totalPoints);
    const clamped = Math.min(newEarned, totalPoints);
    const delta = clamped - prevAwardedRef.current;

    if (delta > 0) {
      prevAwardedRef.current = clamped;
      setCurrentPoints(clamped);
      addPoints(delta);
    }

    const newProgress = (position / durationSeconds) * 100;
    setProgress(Math.min(newProgress, 100));
  }, [trackProgress.position, isActive, addPoints]);

  const stopCounting = useCallback((): void => {
    setIsActive(false);
  }, []);

  // Resume without resetting progress — for resuming the same track after pause.
  const resumeCounting = useCallback((): void => {
    setIsActive(true);
  }, []);

  const resetProgress = useCallback((): void => {
    setCurrentPoints(0);
    setProgress(0);
    prevAwardedRef.current = 0;
  }, []);

  const startCounting = useCallback(
    (config: PointsCounterConfig): void => {
      stopCounting();
      configRef.current = config;

      // Seed the baseline from a previously saved progress so that re-opening a
      // partially-listened track does not re-award points the user already earned.
      const baseline =
        config.initialProgressPercent != null && config.initialProgressPercent > 0
          ? Math.floor((config.initialProgressPercent / 100) * config.totalPoints)
          : 0;
      prevAwardedRef.current = baseline;
      setCurrentPoints(baseline);
      setProgress(config.initialProgressPercent ?? 0);

      setIsActive(true);
    },
    [stopCounting],
  );

  // Cleanup on unmount — useProgress() is managed by RNTP internally.
  useEffect(() => {
    return () => {
      stopCounting();
    };
  }, [stopCounting]);

  return {
    currentPoints,
    progress,
    isActive,
    startCounting,
    stopCounting,
    resumeCounting,
    resetProgress,
  };
};
