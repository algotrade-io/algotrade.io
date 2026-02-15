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

const CONTEXT_ERROR = 'useAccount must be used within an AccountContext.Provider';

/**
 * Default context value that throws on any property access.
 * Provides clear error messages if context is used outside provider.
 */
const throwingDefault = new Proxy({} as AccountContextType, {
  get(_, prop) {
    throw new Error(`${CONTEXT_ERROR} (accessed: ${String(prop)})`);
  },
});

/**
 * Context for account state. Use useAccount() hook for type-safe access.
 */
export const AccountContext = createContext<AccountContextType>(throwingDefault);

/**
 * Hook for accessing account context with type safety.
 * @throws Error if used outside of AccountContext.Provider
 */
export const useAccount = (): AccountContextType => useContext(AccountContext);
