// Shared utility functions for challenge display

import { BRAND } from '../constants/theme';
import type { MusicChallenge } from '../types';

/** Format seconds into `m:ss` display string. */
export const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/** Map difficulty level to its brand color (constant across themes). */
export const getDifficultyColor = (difficulty: MusicChallenge['difficulty']): string => {
  switch (difficulty) {
    case 'easy':
      return BRAND.secondary;
    case 'medium':
      return BRAND.accent;
    case 'hard':
      return BRAND.primary;
    default:
      return BRAND.primary;
  }
};
