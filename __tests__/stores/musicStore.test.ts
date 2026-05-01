import { useMusicStore, selectTotalAvailablePoints } from '../../src/stores/musicStore';
import { SAMPLE_CHALLENGES } from '../../src/constants/theme';

const initialState = useMusicStore.getState();

describe('musicStore', () => {
  beforeEach(() => {
    useMusicStore.setState(initialState, true);
  });

  it('initialises with SAMPLE_CHALLENGES', () => {
    expect(useMusicStore.getState().challenges).toEqual(SAMPLE_CHALLENGES);
  });

  it('updates progress for a challenge', () => {
    const challengeId = SAMPLE_CHALLENGES[0].id;
    useMusicStore.getState().updateProgress(challengeId, 50);
    const updated = useMusicStore.getState().challenges.find((c) => c.id === challengeId);
    expect(updated?.progress).toBe(50);
  });

  it('clamps progress to 100 when given a value above 100', () => {
    const challengeId = SAMPLE_CHALLENGES[0].id;
    useMusicStore.getState().updateProgress(challengeId, 150);
    const updated = useMusicStore.getState().challenges.find((c) => c.id === challengeId);
    expect(updated?.progress).toBe(100);
  });

  it('marks a challenge as complete with completedAt timestamp', () => {
    const challengeId = SAMPLE_CHALLENGES[0].id;
    useMusicStore.getState().markChallengeComplete(challengeId);
    const updated = useMusicStore.getState().challenges.find((c) => c.id === challengeId);
    expect(updated?.completed).toBe(true);
    expect(updated?.progress).toBe(100);
    expect(typeof updated?.completedAt).toBe('string');
    expect(Date.now() - new Date(updated!.completedAt!).getTime()).toBeLessThan(5000);
  });

  it('does not affect other challenges when marking one complete', () => {
    const firstId = SAMPLE_CHALLENGES[0].id;
    const secondId = SAMPLE_CHALLENGES[1].id;
    useMusicStore.getState().markChallengeComplete(firstId);
    const other = useMusicStore.getState().challenges.find((c) => c.id === secondId);
    expect(other?.completed).toBe(false);
    expect(other?.progress).toBe(0);
  });

  it('resets challenges via loadChallenges', () => {
    const challengeId = SAMPLE_CHALLENGES[0].id;
    useMusicStore.getState().updateProgress(challengeId, 75);
    useMusicStore.getState().loadChallenges();
    const reset = useMusicStore.getState().challenges.find((c) => c.id === challengeId);
    expect(reset?.progress).toBe(0);
  });

  it('sets currentTrack', () => {
    const track = SAMPLE_CHALLENGES[0];
    useMusicStore.getState().setCurrentTrack(track);
    expect(useMusicStore.getState().currentTrack).toEqual(track);
  });

  it('sets isPlaying', () => {
    useMusicStore.getState().setIsPlaying(true);
    expect(useMusicStore.getState().isPlaying).toBe(true);
  });

  it('sets currentPosition', () => {
    useMusicStore.getState().setCurrentPosition(42);
    expect(useMusicStore.getState().currentPosition).toBe(42);
  });

  describe('selectTotalAvailablePoints', () => {
    it('sums points across all challenges', () => {
      const total = selectTotalAvailablePoints(useMusicStore.getState());
      const expected = SAMPLE_CHALLENGES.reduce((sum, c) => sum + c.points, 0);
      expect(total).toBe(expected);
    });

    it('returns 0 for an empty challenges array', () => {
      useMusicStore.setState({ challenges: [] });
      expect(selectTotalAvailablePoints(useMusicStore.getState())).toBe(0);
    });
  });
});
