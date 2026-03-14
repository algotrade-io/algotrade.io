/**
 * Frontend Utilities
 * 
 * This file re-exports domain-specific utilities and contains
 * UI components that depend on styled-components.
 * 
 * For new code, prefer importing from specific utility modules:
 * - import { getApiUrl } from '@/utils/env';
 * - import { getDayDiff } from '@/utils/date';
 */

import React, { useId } from "react";
import { Segmented, SegmentedProps } from "antd";
import styled from "styled-components"; // eslint-disable-line @typescript-eslint/no-unused-vars

// Re-export all utilities for backwards compatibility
export * from './utils/index';

// Re-export from centralized tokens
export { signalColors, signalEmojis, toggleColors, colors } from './tokens';
import { toggleColors, colors } from './tokens';

// Toggle component props
interface ToggleProps extends Omit<SegmentedProps, 'ref'> {
  var?: string;
  val?: boolean;
}

// Toggle component - injects dynamic CSS like styled-components
export const Toggle: React.FC<ToggleProps> = ({ var: variant, val, className, ...props }) => {
  const id = useId().replace(/:/g, '');
  const isHome = variant === 'home';

  // Generate CSS with exact same classes and values as styled-component version
  const css = `
    .toggle-${id} .ant-segmented-item-selected {
      background-color: ${isHome ? (val ? colors.bitcoin : toggleColors.gray) : 'unset'};
      outline: ${isHome ? 'unset' : '1px solid ' + (val ? toggleColors.outlineActive : toggleColors.outlineInactive)};
      color: ${toggleColors.text};
    }
    .toggle-${id} .ant-segmented-item:hover,
    .toggle-${id} .ant-segmented-item:focus {
      color: ${toggleColors.text};
    }
    .toggle-${id} .ant-segmented-thumb {
      background-color: ${isHome ? colors.transparent : (val ? toggleColors.thumbActive : toggleColors.thumbInactive)};
      border-width: ${isHome ? '1px' : 'unset'};
      border-style: ${isHome ? 'solid' : 'unset'};
      border-left-color: ${isHome ? (val ? toggleColors.gray : colors.bitcoin) : 'unset'};
      border-top-color: ${isHome ? (val ? toggleColors.gray : colors.bitcoin) : 'unset'};
      border-right-color: ${isHome ? (val ? toggleColors.gray : colors.bitcoin) : 'unset'};
      border-bottom-color: ${isHome ? (val ? toggleColors.gray : colors.bitcoin) : 'unset'};
    }
  `;

  return (
    <>
      <style>{css}</style>
      <Segmented className={className ? `toggle-${id} ${className}` : `toggle-${id}`} {...props} />
    </>
  );
};

// Original styled-components version (kept for reference)
// export const ToggleStyled = styled(Segmented)`
//
//   .ant-segmented-item-selected {
//     background-color: ${(props: { var: string, val: boolean }) => (props.var == 'home' ? (props.val ? colors.bitcoin : toggleColors.gray) : 'unset')};
//     outline: ${(props: { var: string, val: boolean }) => (props.var === 'home' ? "unset" : "1px solid " + (props.val ? toggleColors.outlineActive : toggleColors.outlineInactive))};
//     color: ${toggleColors.text};
//   }
//
//   .ant-segmented-item:hover,
//   .ant-segmented-item:focus {
//     color: ${toggleColors.text};
//   }
//
//   .ant-segmented-thumb {
//     background-color: ${(props: { var: string, val: boolean }) => (props.var === 'home' ? colors.transparent : (props.val ? toggleColors.thumbActive : toggleColors.thumbInactive))};
//     border-width: ${(props: { var: string, val: boolean }) => (props.var === 'home' ? '1px' : 'unset')};
//     border-style: ${(props: { var: string, val: boolean }) => (props.var === 'home' ? 'solid' : 'unset')};
//     border-left-color: ${(props: { var: string, val: boolean }) => (props.var === 'home' ? (props.val ? toggleColors.gray : colors.bitcoin) : 'unset')};
//     border-top-color: ${(props: { var: string, val: boolean }) => (props.var === 'home' ? (props.val ? toggleColors.gray : colors.bitcoin) : 'unset')};
//     border-right-color: ${(props: { var: string, val: boolean }) => (props.var === 'home' ? (props.val ? toggleColors.gray : colors.bitcoin) : 'unset')};
//     border-bottom-color: ${(props: { var: string, val: boolean }) => (props.var === 'home' ? (props.val ? toggleColors.gray : colors.bitcoin) : 'unset')};
//   }
// `;

export const isEmpty = (obj: object) => !(obj && Object.keys(obj).length)