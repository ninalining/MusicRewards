// Belong design tokens and theme constants
import type { ColorPalette } from '../types/theme';

// Brand colors — constant across themes
export const BRAND = {
  primary: '#7553DB', // Belong purple
  secondary: '#34CB76', // Belong green
  accent: '#FCBE25', // Belong yellow
} as const;

/** Dark mode color palette */
export const darkPalette: ColorPalette = {
  surfacePrimary: '#1a1a1a',
  surfaceSecondary: '#2a2a2a',
  surfaceGlass: 'rgba(255, 255, 255, 0.1)',
  surfaceGlassStrong: 'rgba(255, 255, 255, 0.15)',
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  textTertiary: 'rgba(255, 255, 255, 0.5)',
  brandPrimary: BRAND.primary,
  brandSecondary: BRAND.secondary,
  brandAccent: BRAND.accent,
  textOnBrand: '#FFFFFF',
  border: 'rgba(255, 255, 255, 0.2)',
  error: '#FF6B6B',
  glassPrimary: ['rgba(117, 83, 219, 0.3)', 'rgba(117, 83, 219, 0.1)'],
  glassSecondary: ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)'],
  glassCard: ['rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.05)'],
};

/** Light mode color palette */
export const lightPalette: ColorPalette = {
  surfacePrimary: '#FFFFFF',
  surfaceSecondary: '#F5F5F7',
  surfaceGlass: 'rgba(0, 0, 0, 0.05)',
  surfaceGlassStrong: 'rgba(0, 0, 0, 0.08)',
  textPrimary: '#1a1a1a',
  textSecondary: 'rgba(0, 0, 0, 0.6)',
  textTertiary: 'rgba(0, 0, 0, 0.4)',
  brandPrimary: BRAND.primary,
  brandSecondary: BRAND.secondary,
  brandAccent: BRAND.accent,
  textOnBrand: '#FFFFFF',
  border: 'rgba(0, 0, 0, 0.12)',
  error: '#DC3545',
  glassPrimary: ['rgba(117, 83, 219, 0.2)', 'rgba(117, 83, 219, 0.08)'],
  glassSecondary: ['rgba(0, 0, 0, 0.06)', 'rgba(0, 0, 0, 0.03)'],
  glassCard: ['rgba(0, 0, 0, 0.08)', 'rgba(0, 0, 0, 0.03)'],
};

export const THEME = {
  /** @deprecated Use `darkPalette` / `lightPalette` via `useTheme()` hook instead. */
  colors: {
    primary: '#7553DB', // Belong purple
    secondary: '#34CB76', // Belong green
    accent: '#FCBE25', // Belong yellow
    background: '#1a1a1a', // Dark background
    glass: 'rgba(255, 255, 255, 0.1)',
    text: {
      primary: '#FFFFFF',
      secondary: 'rgba(255, 255, 255, 0.7)',
      tertiary: 'rgba(255, 255, 255, 0.5)',
    },
    border: 'rgba(255, 255, 255, 0.2)',
    error: '#FF6B6B',
  },
  fonts: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
    sizes: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 24,
      xxl: 32,
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  sizing: {
    buttonHeight: 48,
    skeletonCardHeight: 120,
    skeletonTitleHeight: 16,
    skeletonSubtitleHeight: 12,
    skeletonChipWidth: 60,
  },
  borderRadius: {
    sm: 8,
    md: 16,
    lg: 24,
  },
  glass: {
    blurIntensity: 20,
    gradientColors: {
      primary: ['rgba(117, 83, 219, 0.3)', 'rgba(117, 83, 219, 0.1)'],
      secondary: ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)'],
      card: ['rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.05)'],
    },
  },
};

// Audio playback constants
export const PROGRESS_POLL_INTERVAL_MS = 250;

/** Ratio threshold (0–1) at which near-complete playback awards full points. */
export const NEAR_COMPLETE_RATIO = 0.99;

// Sample challenge data with actual Belong tracks
export const SAMPLE_CHALLENGES = [
  {
    id: 'challenge-1',
    title: 'All Night',
    artist: 'Camo & Krooked',
    duration: 219, // 3:39
    points: 150,
    audioUrl:
      'https://belong-dev-public2.s3.us-east-1.amazonaws.com/misc/Camo-Krooked-All-Night.mp3',
    description: 'Listen to this drum & bass classic to earn points',
    difficulty: 'easy' as const,
    completed: false,
    progress: 0,
  },
  {
    id: 'challenge-2',
    title: 'New Forms',
    artist: 'Roni Size',
    duration: 464, // 7:44
    points: 300,
    audioUrl: 'https://belong-dev-public2.s3.us-east-1.amazonaws.com/misc/New-Forms-Roni+Size.mp3',
    description: 'Complete this legendary track for bonus points',
    difficulty: 'medium' as const,
    completed: false,
    progress: 0,
  },
  {
    id: 'challenge-3',
    title: 'Bonus Challenge',
    artist: 'Camo & Krooked',
    duration: 219, // 3:39
    points: 250,
    audioUrl:
      'https://belong-dev-public2.s3.us-east-1.amazonaws.com/misc/Camo-Krooked-All-Night.mp3',
    description: 'Listen again for extra points - test repeat functionality',
    difficulty: 'hard' as const,
    completed: false,
    progress: 0,
  },
];
