/**
 * Header styled components
 */

import styled from 'styled-components';

// Re-export for backwards compatibility
export { headerHeight as HeaderHeight } from './config';

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
