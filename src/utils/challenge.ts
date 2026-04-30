// Shared utility functions for challenge display

import { THEME } from '../constants/theme';

/** Format seconds into `m:ss` display string. */
export const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/** Map difficulty level to its THEME color. */
export const getDifficultyColor = (difficulty: string): string => {
  switch (difficulty) {
    case 'easy': return THEME.colors.secondary;
    case 'medium': return THEME.colors.accent;
    case 'hard': return THEME.colors.primary;
    default: return THEME.colors.text.secondary;
  }
};
