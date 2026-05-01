// usePointsCounter hook — proportional live points accumulation during playback
import { useCallback, useEffect, useRef, useState } from 'react';
import { useProgress } from 'react-native-track-player';
import { useUserStore } from '../stores/userStore';
import { PROGRESS_POLL_INTERVAL_MS, NEAR_COMPLETE_RATIO } from '../constants/theme';
import type { PointsCounterConfig, UsePointsCounterReturn } from '../types';

export const usePointsCounter = (): UsePointsCounterReturn => {
  const [isActive, setIsActive] = useState(false);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [progress, setProgress] = useState(0);

  // Stable ref for the current session config — avoids stale closure in effect
  const configRef = useRef<PointsCounterConfig | null>(null);
  // Tracks cumulative amount already passed to addPoints — used to compute delta
  const prevAwardedRef = useRef<number>(0);

  const addPoints = useUserStore((s) => s.addPoints);

  const trackProgress = useProgress(PROGRESS_POLL_INTERVAL_MS);

  // Run on every progress tick — calculate and award delta points
  useEffect(() => {
    if (!isActive || !configRef.current) return;

    const { totalPoints, durationSeconds } = configRef.current;
    if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) return;

    const position = trackProgress.position;
    // When position is ≥99% of duration, award full points — trackProgress.position
    // rarely equals durationSeconds exactly, so Math.floor would cap at totalPoints-1.
    const ratio = position / durationSeconds;
    const newEarned = ratio >= NEAR_COMPLETE_RATIO ? totalPoints : Math.floor(ratio * totalPoints);
    const clamped = Math.min(newEarned, totalPoints);
    const delta = clamped - prevAwardedRef.current;

    if (delta > 0) {
      prevAwardedRef.current = clamped;
      setPointsEarned(clamped);
      addPoints(delta);
    }

    const newProgress = (position / durationSeconds) * 100;
    // Use Math.max to prevent progress bar from going backwards on seek
    setProgress((prev) => Math.max(prev, Math.min(newProgress, 100)));
  }, [trackProgress.position, isActive, addPoints]);

  const stopCounting = useCallback((): void => {
    setIsActive(false);
  }, []);

  // Resume without resetting progress/points — used when resuming the same track after pause.
  const resumeCounting = useCallback((): void => {
    setIsActive(true);
  }, []);

  const resetProgress = useCallback((): void => {
    setPointsEarned(0);
    setProgress(0);
    prevAwardedRef.current = 0;
  }, []);

  const startCounting = useCallback(
    (config: PointsCounterConfig): void => {
      // Stop any existing session and reset local state before starting new session.
      // resetProgress must be called so Math.max on setProgress doesn't carry over stale values.
      stopCounting();
      configRef.current = config;
      resetProgress();
      setIsActive(true);
    },
    [stopCounting, resetProgress],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCounting();
    };
  }, [stopCounting]);

  return {
    pointsEarned,
    progress,
    isActive,
    startCounting,
    stopCounting,
    resumeCounting,
    resetProgress,
  };
};
