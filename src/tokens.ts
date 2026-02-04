/**
 * Design Tokens - Centralized color and style constants
 * 
 * This file contains all design tokens used throughout the application.
 * Import from here instead of hardcoding values in components.
 */

// Brand Colors
export const colors = {
  // Bitcoin/Crypto theme
  bitcoin: '#F7931A',
  
  // Signal colors
  buy: 'lime',
  sell: 'red',
  hodl: '#F7931A',
  
  // Toggle/UI accent colors
  accentCyan: '#52e5ff',
  accentMagenta: 'magenta',
  
  // Neutral colors
  white: 'rgba(255, 255, 255, 0.85)',
  gray: 'rgba(255, 255, 255, 0.3)',
  transparent: 'transparent',
} as const;

// Signal-specific color mapping
export const signalColors = {
  BUY: colors.buy,
  SELL: colors.sell,
  HODL: colors.hodl,
} as const;

// Signal emojis
export const signalEmojis = {
  BUY: '🚀',
  SELL: '💥',
} as const;

// Toggle component colors
export const toggleColors = {
  gray: colors.gray,
  selected: colors.bitcoin,
  thumbActive: colors.accentMagenta,
  thumbInactive: colors.accentCyan,
  outlineActive: colors.accentCyan,
  outlineInactive: colors.accentMagenta,
  text: colors.white,
} as const;

// Type exports for type safety
export type SignalType = keyof typeof signalColors;
export type SignalColorValue = typeof signalColors[SignalType];
