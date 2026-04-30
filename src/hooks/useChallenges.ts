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

  const markChallengeComplete = useMusicStore((s) => s.markChallengeComplete);
  const completeInUserStore = useUserStore((s) => s.completeChallenge);
  const loadChallenges = useMusicStore((s) => s.loadChallenges);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const refreshChallenges = useCallback(async (): Promise<void> => {
    if (!isMounted.current) return;
    setLoading(true);
    setError(null);
    try {
      // TODO: replace with real API call in Phase 4
      // Simulated async delay — no real API in this phase
      await new Promise<void>((resolve) => setTimeout(resolve, 500));
      loadChallenges();
    } catch (err) {
      if (isMounted.current) {
        setError(err instanceof Error ? err.message : 'Failed to refresh challenges');
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [loadChallenges]);

  const completeChallenge = useCallback(async (challengeId: string): Promise<void> => {
    // Atomic: both store actions called together
    markChallengeComplete(challengeId);
    completeInUserStore(challengeId);
  }, [markChallengeComplete, completeInUserStore]);

  return {
    challenges,
    completedChallenges,
    loading,
    error,
    refreshChallenges,
    completeChallenge,
  };
};
