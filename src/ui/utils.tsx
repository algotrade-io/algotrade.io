/**
 * Frontend Utilities
 * 
 * This file re-exports domain-specific utilities and contains
 * shared UI components.
 * 
 * For new code, prefer importing from specific utility modules:
 * - import { getApiUrl } from '@/utils/env';
 * - import { getDayDiff } from '@/utils/date';
 */

import React from "react";
import { Segmented, SegmentedProps } from "antd";
import styles from './components/Toggle.module.less';

// Re-export all utilities for backwards compatibility
export * from './utils/index';

// Re-export from centralized tokens
export { signalColors, signalEmojis, toggleColors, colors } from './tokens';

// Toggle component props
interface ToggleProps extends Omit<SegmentedProps, 'ref'> {
  var?: string;
  val?: boolean;
}

// Toggle component - uses CSS Modules with data attributes for dynamic styling
export const Toggle: React.FC<ToggleProps> = ({ var: variant, val, className, ...props }) => {
  const dataVariant = variant === 'home' ? 'home' : 'default';
  const dataVal = val ? 'true' : 'false';

  return (
    <Segmented
      className={className ? `${styles.toggle} ${className}` : styles.toggle}
      data-variant={dataVariant}
      data-val={dataVal}
      {...props}
    />
  );
};

export const isEmpty = (obj: object) => !(obj && Object.keys(obj).length)