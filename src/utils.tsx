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

import { Segmented } from "antd";
import styled from "styled-components";

// Re-export all utilities for backwards compatibility
export * from './utils/index';

// Re-export from centralized tokens
export { signalColors, signalEmojis, toggleColors } from './tokens';
import { toggleColors, colors } from './tokens';

// Styled Components - kept here as they depend on styled-components
export const Toggle = styled(Segmented)`

  .ant-segmented-item-selected {
    background-color: ${(props: { var: string, val: boolean }) => (props.var == 'home' ? (props.val ? colors.bitcoin : toggleColors.gray) : 'unset')};
    outline: ${(props: { var: string, val: boolean }) => (props.var === 'home' ? "unset" : "1px solid " + (props.val ? toggleColors.outlineActive : toggleColors.outlineInactive))};
    color: ${toggleColors.text};
  }

  .ant-segmented-item:hover,
  .ant-segmented-item:focus {
    color: ${toggleColors.text};
  }

  .ant-segmented-thumb {
    background-color: ${(props: { var: string, val: boolean }) => (props.var === 'home' ? colors.transparent : (props.val ? toggleColors.thumbActive : toggleColors.thumbInactive))};
    border-width: ${(props: { var: string, val: boolean }) => (props.var === 'home' ? '1px' : 'unset')};
    border-style: ${(props: { var: string, val: boolean }) => (props.var === 'home' ? 'solid' : 'unset')};
    border-left-color: ${(props: { var: string, val: boolean }) => (props.var === 'home' ? (props.val ? toggleColors.gray : colors.bitcoin) : 'unset')};
    border-top-color: ${(props: { var: string, val: boolean }) => (props.var === 'home' ? (props.val ? toggleColors.gray : colors.bitcoin) : 'unset')};
    border-right-color: ${(props: { var: string, val: boolean }) => (props.var === 'home' ? (props.val ? toggleColors.gray : colors.bitcoin) : 'unset')};
    border-bottom-color: ${(props: { var: string, val: boolean }) => (props.var === 'home' ? (props.val ? toggleColors.gray : colors.bitcoin) : 'unset')};
  }
`;

export const isEmpty = (obj: Object) => !(obj && Object.keys(obj).length)