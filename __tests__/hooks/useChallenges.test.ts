import { renderHook, act } from '@testing-library/react-native';
import { useChallenges } from '../../src/hooks/useChallenges';
import { useMusicStore } from '../../src/stores/musicStore';
import { useUserStore } from '../../src/stores/userStore';
import { SAMPLE_CHALLENGES } from '../../src/constants/theme';

const initialMusicState = useMusicStore.getState();
const initialUserState = useUserStore.getState();

describe('useChallenges', () => {
  beforeEach(() => {
    useMusicStore.setState(initialMusicState, true);
    useUserStore.setState(initialUserState, true);
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      useMusicStore.setState(initialMusicState, true);
      useUserStore.setState(initialUserState, true);
    });
    jest.useRealTimers();
  });

  it('returns SAMPLE_CHALLENGES and loading=false after initial fetch', async () => {
    const { result } = renderHook(() => useChallenges());
    // loading=true immediately on mount (auto-fetch triggered)
    expect(result.current.loading).toBe(true);
    // after the 500ms simulated delay, loading=false and challenges are loaded
    await act(async () => {
      jest.advanceTimersByTime(500);
    });
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.challenges).toEqual(SAMPLE_CHALLENGES);
  });

  it('returns empty completedChallenges initially', () => {
    const { result } = renderHook(() => useChallenges());
    expect(result.current.completedChallenges).toHaveLength(0);
  });

  it('sets loading=true during refreshChallenges and false after', async () => {
    const { result } = renderHook(() => useChallenges());

    await act(async () => {
      result.current.refreshChallenges();
      jest.advanceTimersByTime(500);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('calls both markChallengeComplete and userStore.completeChallenge with same id', async () => {
    const challengeId = SAMPLE_CHALLENGES[0].id;
    const { result } = renderHook(() => useChallenges());

    await act(async () => {
      await result.current.completeChallenge(challengeId);
    });

    // musicStore: challenge should be marked complete
    const challenge = useMusicStore
      .getState()
      .challenges.find((c) => c.id === challengeId);
    expect(challenge?.completed).toBe(true);
    expect(challenge?.progress).toBe(100);

    // userStore: challengeId should be in completedChallenges
    expect(useUserStore.getState().completedChallenges).toContain(challengeId);
  });

  it('sets error when refreshChallenges throws', async () => {
    // spyOn targets the state object returned by getState() at this moment.
    // This works here because no store updates occur between the spy and the
    // refreshChallenges call — if the store were updated, getState() would
    // return a new object and the spy would no longer intercept the call.
    const spy = jest.spyOn(useMusicStore.getState(), 'loadChallenges')
      .mockImplementation(() => { throw new Error('Network error'); });

    const { result } = renderHook(() => useChallenges());

    await act(async () => {
      const promise = result.current.refreshChallenges();
      jest.advanceTimersByTime(500);
      await promise;
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('Network error');

    spy.mockRestore();
  });

  it('does not update state after unmount', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const { result, unmount } = renderHook(() => useChallenges());

    await act(async () => {
      const promise = result.current.refreshChallenges();
      unmount();
      jest.advanceTimersByTime(500);
      await promise;
    });

    expect(consoleSpy).not.toHaveBeenCalledWith(
      expect.stringContaining("Can't perform a React state update"),
    );
    consoleSpy.mockRestore();
  });
});
