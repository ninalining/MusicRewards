// useChallenges hook — orchestrates challenge data from musicStore + userStore
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
        setError(err instanceof Error ? err.message : 'Failed to refresh challenges');
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
    return () => {
      isMounted.current = false;
    };
  }, [refreshChallenges]);

  const completeChallenge = useCallback(async (challengeId: string): Promise<void> => {
    try {
      useMusicStore.getState().markChallengeComplete(challengeId);
      useUserStore.getState().completeChallenge(challengeId);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to complete challenge';
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
