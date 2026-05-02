import { useUserStore, migrateUserStore } from '../../src/stores/userStore';

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

describe('migrateUserStore', () => {
  it('migrates v0 state with missing fields to v1 defaults', () => {
    const result = migrateUserStore({}, 0);
    expect(result).toEqual({ totalPoints: 0, completedChallenges: [] });
  });

  it('migrates v0 state preserving existing data', () => {
    const result = migrateUserStore({ totalPoints: 100, completedChallenges: ['t-1'] }, 0);
    expect(result).toEqual({ totalPoints: 100, completedChallenges: ['t-1'] });
  });

  it('returns state unchanged for current version', () => {
    const state = { totalPoints: 50, completedChallenges: ['t-2'] };
    const result = migrateUserStore(state, 1);
    expect(result).toEqual(state);
  });
});
