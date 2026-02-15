/**
 * Header styled components
 */

import styled from 'styled-components';
export { headerHeight as HeaderHeight } from './config';

// Re-export for backwards compatibility
// export const HeaderHeight = headerHeight;

export const HeaderWrapper = styled.span`
  display: flex;
  align-items: center;
`;

export const AuthActions = styled.span`
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: flex-end;
`;
