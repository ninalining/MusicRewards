// usePointsCounter hook — proportional live points accumulation during playback
import { useCallback, useEffect, useRef, useState } from 'react';
import { useProgress } from 'react-native-track-player';
import { useUserStore } from '../stores/userStore';
import { PROGRESS_POLL_INTERVAL_MS } from '../constants/theme';
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
  // currentPoints subscribes to totalPoints for reactive display in callers.
  // No circular re-render risk: the points effect depends on trackProgress.position,
  // not on totalPoints — so a re-render from addPoints does NOT re-trigger the effect.
  const currentPoints = useUserStore((s) => s.totalPoints);

  const trackProgress = useProgress(PROGRESS_POLL_INTERVAL_MS);

  // Run on every progress tick — calculate and award delta points
  useEffect(() => {
    if (!isActive || !configRef.current) return;

    const { totalPoints, durationSeconds } = configRef.current;
    if (!durationSeconds || durationSeconds === 0) return;

    const position = trackProgress.position;
    const newEarned = Math.floor((position / durationSeconds) * totalPoints);
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

  const startCounting = useCallback((config: PointsCounterConfig): void => {
    // Stop any existing session first
    stopCounting();
    configRef.current = config;
    prevAwardedRef.current = 0;
    setIsActive(true);
  }, [stopCounting]);

  const resetProgress = useCallback((): void => {
    setPointsEarned(0);
    setProgress(0);
    prevAwardedRef.current = 0;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCounting();
    };
  }, [stopCounting]);

  return {
    currentPoints,
    pointsEarned,
    progress,
    isActive,
    startCounting,
    stopCounting,
    resetProgress,
  };
};
