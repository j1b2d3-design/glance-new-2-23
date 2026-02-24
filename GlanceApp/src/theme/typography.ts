/**
 * Glance App - Typography & Spacing System
 * 
 * Based on:
 * - Robinhood/Wealthfront design patterns
 * - Nielsen's heuristics (visibility, hierarchy)
 * - UI Finesse: radius nesting, text hierarchy, motion
 * 
 * Type Scale: 4pt grid (10, 11, 12, 13, 14, 16, 18, 20, 24, 32, 42)
 * Spacing Scale: 4pt grid (4, 8, 12, 16, 20, 24, 32, 40, 48)
 */

import { Platform } from 'react-native';

// Typography Scale
export const Typography = {
  // Display - Large portfolio values, hero numbers
  display: {
    fontSize: 42,
    fontWeight: '700' as const,
    letterSpacing: -1,
    lineHeight: 48,
  },
  
  // H1 - Screen titles, section headers
  h1: {
    fontSize: 24,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
    lineHeight: 30,
  },

  // H2 - Card titles, sub-headers
  h2: {
    fontSize: 20,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
    lineHeight: 26,
  },

  // H3 - Section sub-titles
  h3: {
    fontSize: 18,
    fontWeight: '600' as const,
    letterSpacing: 0,
    lineHeight: 24,
  },

  // Title - Stock symbols, card headers
  title: {
    fontSize: 16,
    fontWeight: '600' as const,
    letterSpacing: 0,
    lineHeight: 22,
  },

  // Body - Main content text
  body: {
    fontSize: 14,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 20,
  },

  // Body Bold
  bodyBold: {
    fontSize: 14,
    fontWeight: '600' as const,
    letterSpacing: 0,
    lineHeight: 20,
  },

  // Caption - Secondary info, timestamps, labels
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    letterSpacing: 0.2,
    lineHeight: 16,
  },

  // Caption Bold - Badges, small labels
  captionBold: {
    fontSize: 12,
    fontWeight: '600' as const,
    letterSpacing: 0.2,
    lineHeight: 16,
  },

  // Overline - ALL CAPS labels
  overline: {
    fontSize: 11,
    fontWeight: '600' as const,
    letterSpacing: 1,
    lineHeight: 14,
    textTransform: 'uppercase' as const,
  },

  // Micro - Very small text (percentages, sub-labels)
  micro: {
    fontSize: 10,
    fontWeight: '500' as const,
    letterSpacing: 0.3,
    lineHeight: 14,
  },
} as const;

// Spacing Scale (4pt grid)
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  huge: 48,
} as const;

// Border Radius with nesting support
// Rule from PDF: Inner radius = Outer radius - padding
export const Radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
  // Helper: card outer = lg (16), inner element = lg - padding
  cardOuter: 16,
  cardInner: (padding: number) => Math.max(16 - padding, 4),
} as const;

// Shadows for elevation hierarchy
export const Shadows = {
  none: {},
  sm: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.15,
      shadowRadius: 3,
    },
    android: {
      elevation: 2,
    },
  }),
  md: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 6,
    },
    android: {
      elevation: 4,
    },
  }),
  lg: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 12,
    },
    android: {
      elevation: 8,
    },
  }),
} as const;
