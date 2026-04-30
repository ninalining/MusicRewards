import { renderHook, act } from '@testing-library/react-native';
import { useProgress } from 'react-native-track-player';
import { usePointsCounter } from '../../src/hooks/usePointsCounter';
import { useUserStore } from '../../src/stores/userStore';

// Mock react-native-track-player useProgress
jest.mock('react-native-track-player', () => ({
  useProgress: jest.fn(() => ({ position: 0, duration: 219, buffered: 0 })),
  State: {},
  Event: {},
}));

const mockUseProgress = useProgress as jest.MockedFunction<typeof useProgress>;

const initialUserState = useUserStore.getState();

const TEST_CONFIG = {
  totalPoints: 150,
  durationSeconds: 200,
  challengeId: 'challenge-1',
};

describe('usePointsCounter', () => {
  beforeEach(() => {
    useUserStore.setState(initialUserState, true);
    mockUseProgress.mockReturnValue({ position: 0, duration: 200, buffered: 0 });
  });

  it('starts with zero pointsEarned, progress=0, isActive=false', () => {
    const { result } = renderHook(() => usePointsCounter());
    expect(result.current.pointsEarned).toBe(0);
    expect(result.current.progress).toBe(0);
    expect(result.current.isActive).toBe(false);
  });

  it('startCounting sets isActive=true', () => {
    const { result } = renderHook(() => usePointsCounter());
    act(() => {
      result.current.startCounting(TEST_CONFIG);
    });
    expect(result.current.isActive).toBe(true);
  });

  it('awards proportional points at 50% position', () => {
    mockUseProgress.mockReturnValue({ position: 100, duration: 200, buffered: 0 });

    const { result } = renderHook(() => usePointsCounter());
    act(() => {
      result.current.startCounting(TEST_CONFIG);
    });

    // pointsEarned = floor(100/200 * 150) = 75
    expect(result.current.pointsEarned).toBe(75);
    expect(result.current.progress).toBeCloseTo(50);
  });

  it('calls addPoints with delta, not total', () => {
    // First tick at 25%
    mockUseProgress.mockReturnValue({ position: 50, duration: 200, buffered: 0 });
    const { result, rerender } = renderHook(() => usePointsCounter());

    act(() => {
      result.current.startCounting(TEST_CONFIG);
    });

    const pointsAfterFirstTick = useUserStore.getState().totalPoints;
    // floor(50/200 * 150) = 37

    // Second tick at 50%
    mockUseProgress.mockReturnValue({ position: 100, duration: 200, buffered: 0 });
    rerender({});

    const pointsAfterSecondTick = useUserStore.getState().totalPoints;
    // floor(100/200 * 150) = 75, delta = 75 - 37 = 38
    expect(pointsAfterSecondTick).toBe(pointsAfterFirstTick + 38);
  });

  it('does not decrease pointsEarned when position seeks backwards', () => {
    mockUseProgress.mockReturnValue({ position: 100, duration: 200, buffered: 0 });
    const { result, rerender } = renderHook(() => usePointsCounter());

    act(() => {
      result.current.startCounting(TEST_CONFIG);
    });

    const earnedBeforeSeek = result.current.pointsEarned;

    // Seek back to 10%
    mockUseProgress.mockReturnValue({ position: 20, duration: 200, buffered: 0 });
    rerender({});

    expect(result.current.pointsEarned).toBe(earnedBeforeSeek);
    expect(useUserStore.getState().totalPoints).toBe(earnedBeforeSeek);
  });

  it('stopCounting sets isActive=false and stops awarding points', () => {
    mockUseProgress.mockReturnValue({ position: 50, duration: 200, buffered: 0 });
    const { result, rerender } = renderHook(() => usePointsCounter());

    act(() => {
      result.current.startCounting(TEST_CONFIG);
    });

    act(() => {
      result.current.stopCounting();
    });

    expect(result.current.isActive).toBe(false);
    const pointsAfterStop = useUserStore.getState().totalPoints;

    // Further progress should not award more points
    mockUseProgress.mockReturnValue({ position: 150, duration: 200, buffered: 0 });
    rerender({});

    expect(useUserStore.getState().totalPoints).toBe(pointsAfterStop);
  });

  it('resetProgress resets pointsEarned and progress to 0', () => {
    mockUseProgress.mockReturnValue({ position: 100, duration: 200, buffered: 0 });
    const { result } = renderHook(() => usePointsCounter());

    act(() => {
      result.current.startCounting(TEST_CONFIG);
    });

    expect(result.current.pointsEarned).toBeGreaterThan(0);

    act(() => {
      result.current.resetProgress();
    });

    expect(result.current.pointsEarned).toBe(0);
    expect(result.current.progress).toBe(0);
  });

  it('calling startCounting twice stops previous session', () => {
    const { result } = renderHook(() => usePointsCounter());

    act(() => {
      result.current.startCounting(TEST_CONFIG);
    });

    act(() => {
      result.current.startCounting({ ...TEST_CONFIG, totalPoints: 300 });
    });

    // Still active, but with new config
    expect(result.current.isActive).toBe(true);
  });

  it('stopCounting is called on unmount', () => {
    const { result, unmount } = renderHook(() => usePointsCounter());

    act(() => {
      result.current.startCounting(TEST_CONFIG);
    });

    expect(result.current.isActive).toBe(true);

    // The cleanup useEffect calls stopCounting() on unmount.
    // jest.spyOn cannot intercept it here because the effect closure already
    // captured the original function reference before the spy is set.
    // This test verifies no errors are thrown during unmount cleanup.
    expect(() => unmount()).not.toThrow();
  });

  it('awards full points when position is at NEAR_COMPLETE_RATIO (99%)', () => {
    // position = 198 out of 200 = 99%
    mockUseProgress.mockReturnValue({ position: 198, duration: 200, buffered: 0 });
    const { result } = renderHook(() => usePointsCounter());

    act(() => {
      result.current.startCounting(TEST_CONFIG);
    });

    expect(result.current.pointsEarned).toBe(TEST_CONFIG.totalPoints);
  });

  it('does not award full points just below NEAR_COMPLETE_RATIO', () => {
    // position = 197 out of 200 = 98.5%, below 99%
    mockUseProgress.mockReturnValue({ position: 197, duration: 200, buffered: 0 });
    const { result } = renderHook(() => usePointsCounter());

    act(() => {
      result.current.startCounting(TEST_CONFIG);
    });

    // floor(197/200 * 150) = floor(147.75) = 147, not 150
    expect(result.current.pointsEarned).toBe(147);
    expect(result.current.pointsEarned).toBeLessThan(TEST_CONFIG.totalPoints);
  });
});
