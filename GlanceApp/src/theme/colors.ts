/**
 * Glance App - Centralized Color Palette
 * 
 * All screens should import colors from here.
 * Total: 10 core colors + 1 supplementary text color
 */

export const Colors = {
  // Backgrounds
  background: '#000000',
  card: '#1C1C1E',
  border: '#2C2C2E',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#9CA3AF',
  textTertiary: '#6B7280',
  textLight: '#D1D5DB',

  // Semantic
  positive: '#22C55E',   // green - bullish, gains, success
  negative: '#EF4444',   // red - bearish, losses, warnings
  accent: '#3B82F6',     // blue - primary actions, links, info
  neutral: '#FBBF24',    // yellow - neutral sentiment, caution

  // Transparent variants (for subtle backgrounds)
  positiveBg: 'rgba(34, 197, 94, 0.15)',
  negativeBg: 'rgba(239, 68, 68, 0.15)',
  accentBg: 'rgba(59, 130, 246, 0.15)',
  neutralBg: 'rgba(251, 191, 36, 0.15)',
} as const;

export type ColorKey = keyof typeof Colors;
