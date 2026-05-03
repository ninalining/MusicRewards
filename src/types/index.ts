export interface MusicChallenge {
  id: string;
  title: string;
  artist: string;
  duration: number; // in seconds
  points: number;
  audioUrl: string;
  imageUrl?: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  completed: boolean;
  progress: number; // 0-100
  completedAt?: string;
}

export interface PointsCounterConfig {
  totalPoints: number;
  durationSeconds: number;
  challengeId: string;
}

export interface UseMusicPlayerReturn {
  isPlaying: boolean;
  currentTrack: MusicChallenge | null;
  currentPosition: number;
  duration: number;
  playbackRate: number;
  play: (track: MusicChallenge) => Promise<void>;
  pause: () => void;
  resume: () => void;
  seekTo: (seconds: number) => void;
  setPlaybackRate: (rate: number) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export interface UsePointsCounterReturn {
  currentPoints: number;
  progress: number; // 0-100
  isActive: boolean;
  startCounting: (config: PointsCounterConfig) => void;
  stopCounting: () => void;
  resumeCounting: () => void;
  resetProgress: () => void;
}

export interface UseChallengesReturn {
  challenges: MusicChallenge[];
  completedChallenges: string[];
  loading: boolean;
  error: string | null;
  refreshChallenges: () => Promise<void>;
  completeChallenge: (challengeId: string) => Promise<void>;
}
