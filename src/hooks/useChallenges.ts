import { useCallback, useEffect, useRef, useState } from 'react';
import { useMusicStore, selectChallenges } from '../stores/musicStore';
import { useUserStore, selectCompletedChallenges } from '../stores/userStore';
import type { UseChallengesReturn } from '../types';

export const useChallenges = (): UseChallengesReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(false);

  const challenges = useMusicStore(selectChallenges);
  const completedChallenges = useUserStore(selectCompletedChallenges);

  const refreshChallenges = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      // TODO: replace with real API call when backend is available (Phase 5+)
      await new Promise<void>((resolve) => setTimeout(resolve, 500));
      if (!isMounted.current) return;
      useMusicStore.getState().loadChallenges();
    } catch (err) {
      if (isMounted.current) {
        const message =
          __DEV__ && err instanceof Error
            ? err.message
            : 'Unable to load challenges. Please try again.';
        setError(message);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;
    refreshChallenges();
    // Mark unmounted so in-flight refreshChallenges() calls skip setState.
    return () => {
      isMounted.current = false;
    };
  }, [refreshChallenges]);

  const completeChallenge = useCallback(async (challengeId: string): Promise<void> => {
    try {
      useMusicStore.getState().markChallengeComplete(challengeId);
      useUserStore.getState().completeChallenge(challengeId);
    } catch (err) {
      const message =
        __DEV__ && err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setError(message);
    }
  }, []);

  return {
    challenges,
    completedChallenges,
    loading,
    error,
    refreshChallenges,
    completeChallenge,
  };
};
