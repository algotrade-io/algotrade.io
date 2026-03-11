/**
 * Design Tokens — Centralized color and style constants
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
  hodlMagenta: '#DF00DF',
  
  // Swagger/API colors
  swaggerGreen: '#49cc90',
  
  // Neutral colors
  white: 'rgba(255, 255, 255, 0.85)',
  whiteSecondary: 'rgba(255, 255, 255, 0.65)',
  whiteTertiary: 'rgba(255, 255, 255, 0.45)',
  gray: 'rgba(255, 255, 255, 0.3)',
  transparent: 'transparent',
  
  // Background colors
  bgBase: 'black',
  bgElevated: '#1f1f1f',
  bgHover: '#262626',
  bgContainer: '#141414',
} as const;

// Signal-specific color mapping
export const signalColors: { [key: string]: string } = {
  BUY: colors.buy,
  SELL: colors.sell,
  HODL: colors.hodl,
};

// Signal emojis
export const signalEmojis: { [key: string]: string } = {
  BUY: '🚀',
  SELL: '💥',
};

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
