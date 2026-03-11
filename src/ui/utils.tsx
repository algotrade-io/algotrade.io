/**
 * Frontend Utilities
 * 
 * This file re-exports domain-specific utilities and contains
 * UI components.
 * 
 * For new code, prefer importing from specific utility modules:
 * - import { getApiUrl } from '@/utils/env';
 * - import { getDayDiff } from '@/utils/date';
 */

import React from "react";
import { Segmented, SegmentedProps } from "antd";

// Re-export all utilities for backwards compatibility
export * from './utils/index';

// Re-export from centralized tokens
export { signalColors, signalEmojis, toggleColors } from './tokens';
import { toggleColors, colors } from './tokens';

// Toggle component props
interface ToggleProps extends Omit<SegmentedProps, 'ref'> {
  var?: string;
  val?: boolean;
}

// Toggle component - uses CSS custom properties for dynamic styling
export const Toggle: React.FC<ToggleProps> = ({ var: variant, val, style, ...props }) => {
  const isHome = variant === 'home';
  
  // Set CSS custom properties based on variant and value
  const cssVars: React.CSSProperties = {
    '--toggle-selected-bg': isHome 
      ? (val ? colors.bitcoin : toggleColors.gray) 
      : 'unset',
    '--toggle-selected-outline': isHome 
      ? 'unset' 
      : `1px solid ${val ? toggleColors.outlineActive : toggleColors.outlineInactive}`,
    '--toggle-thumb-bg': isHome 
      ? colors.transparent 
      : (val ? toggleColors.thumbActive : toggleColors.thumbInactive),
    '--toggle-thumb-border-width': isHome ? '1px' : 'unset',
    '--toggle-thumb-border-style': isHome ? 'solid' : 'unset',
    '--toggle-thumb-border-color': isHome 
      ? (val ? toggleColors.gray : colors.bitcoin) 
      : 'unset',
    ...style,
  } as React.CSSProperties;

  return (
    <Segmented
      className="custom-toggle"
      style={cssVars}
      {...props}
    />
  );
};

export const isEmpty = (obj: object) => !(obj && Object.keys(obj).length)