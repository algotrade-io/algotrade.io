/**
 * Account Context
 * Provides account state and authentication utilities throughout the app.
 */

import { createContext, useContext } from 'react';
import type { Account, SetState } from '@/types';

export interface AccountContextType {
  account: Account | null;
  accountLoading: boolean;
  loginLoading: boolean;
  setShowLogin: SetState<boolean>;
  setAccount: SetState<Account | null>;
}

/**
 * Context for account state. Use useAccount() hook for type-safe access.
 */
export const AccountContext = createContext<AccountContextType | null>(null);

/**
 * Hook for accessing account context with type safety.
 * @throws Error if used outside of AccountContext.Provider
 */
export const useAccount = (): AccountContextType => {
  const context = useContext(AccountContext);
  if (!context) {
    throw new Error('useAccount must be used within an AccountContext.Provider');
  }
  return context;
};

/**
 * Hook for optional account context access (doesn't throw if context is null).
 * Useful for components that may be rendered outside the provider.
 */
export const useAccountOptional = (): AccountContextType | null => {
  return useContext(AccountContext);
};
