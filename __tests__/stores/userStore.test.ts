import { useUserStore } from '../../src/stores/userStore';

const initialState = useUserStore.getState();

describe('userStore', () => {
  beforeEach(() => {
    useUserStore.setState(initialState, true);
  });

  it('adds points correctly', () => {
    useUserStore.getState().addPoints(50);
    expect(useUserStore.getState().totalPoints).toBe(50);
  });

  it('accumulates points across multiple calls', () => {
    useUserStore.getState().addPoints(50);
    useUserStore.getState().addPoints(30);
    expect(useUserStore.getState().totalPoints).toBe(80);
  });

  it('completes a challenge and adds to array', () => {
    useUserStore.getState().completeChallenge('track-1');
    expect(useUserStore.getState().completedChallenges).toContain('track-1');
  });

  it('does not duplicate completed challenges', () => {
    useUserStore.getState().completeChallenge('track-1');
    useUserStore.getState().completeChallenge('track-1');
    expect(useUserStore.getState().completedChallenges).toHaveLength(1);
  });

  it('resets progress to initial state', () => {
    useUserStore.getState().addPoints(100);
    useUserStore.getState().completeChallenge('track-1');
    useUserStore.getState().resetProgress();
    expect(useUserStore.getState().totalPoints).toBe(0);
    expect(useUserStore.getState().completedChallenges).toHaveLength(0);
  });
});
