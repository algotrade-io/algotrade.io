/**
 * Custom hooks for API calls and authentication state
 */

import { useState, useEffect, useCallback } from 'react';
import { getApiUrl } from '@/utils/env';
import type { AuthUser, Account } from '@/types';

interface UseApiOptions {
  /** Whether to require authentication */
  auth?: boolean;
  /** JWT token for authenticated requests */
  jwtToken?: string;
  /** API key for X-API-Key header */
  apiKey?: string;
  /** HTTP method (default: GET) */
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  /** Request body for POST/PUT requests */
  body?: unknown;
  /** Override for local/dev/prod environment */
  localOverride?: string;
  /** Whether to fetch on mount (default: true) */
  fetchOnMount?: boolean;
  /** Dependencies that trigger refetch */
  deps?: unknown[];
}

interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Generic hook for API calls with loading and error states.
 * @param endpoint - API endpoint path (e.g., '/preview')
 * @param options - Configuration options
 */
export function useApi<T>(
  endpoint: string,
  options: UseApiOptions = {}
): UseApiResult<T> {
  const {
    auth = false,
    jwtToken,
    apiKey,
    method = 'GET',
    body,
    localOverride,
    fetchOnMount = true,
    deps = [],
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(fetchOnMount);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    // Don't fetch if auth is required but no token provided
    if (auth && !jwtToken && !apiKey) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const url = `${getApiUrl({ localOverride: localOverride || '' })}${endpoint}`;
      const headers: HeadersInit = {};

      if (jwtToken) {
        headers['Authorization'] = jwtToken;
      }
      if (apiKey) {
        headers['X-API-Key'] = apiKey;
      }

      const fetchOptions: RequestInit = {
        method,
        headers,
      };

      if (body && (method === 'POST' || method === 'PUT')) {
        fetchOptions.body = JSON.stringify(body);
      }

      const response = await fetch(url, fetchOptions);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const responseData = await response.json();
      setData(responseData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      console.error(`API error for ${endpoint}:`, err);
    } finally {
      setLoading(false);
    }
  }, [endpoint, auth, jwtToken, apiKey, method, body, localOverride]);

  useEffect(() => {
    if (fetchOnMount) {
      fetchData();
    }
  }, [fetchData, fetchOnMount]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook to detect login redirect state.
 * Returns true when URL contains ?code= from OAuth callback.
 */
export function useLoginLoading(): boolean {
  const [loginLoading, setLoginLoading] = useState(false);

  useEffect(() => {
    setLoginLoading(window.location?.search?.indexOf('?code=') === 0);
  }, []);

  return loginLoading;
}

/**
 * Hook to fetch account data when logged in.
 */
export function useFetchAccount(
  loggedIn: AuthUser | null | undefined,
  setAccount: (account: Account | null) => void,
  setAccountLoading: (loading: boolean) => void
): void {
  useEffect(() => {
    if (loggedIn) {
      setAccountLoading(true);
      const jwtToken = loggedIn?.signInUserSession?.idToken?.jwtToken;
      const url = `${getApiUrl()}/account`;
      
      fetch(url, {
        method: 'GET',
        headers: { Authorization: jwtToken || '' },
      })
        .then((response) => response.json())
        .then((data) => setAccount(data))
        .catch((err) => console.error(err))
        .finally(() => setAccountLoading(false));
    }
  }, [loggedIn, setAccount, setAccountLoading]);
}

/**
 * Hook for posting to account endpoint.
 */
export function useAccountPost(jwtToken: string | undefined) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const postAccount = useCallback(
    async <T = unknown>(body: unknown): Promise<T | null> => {
      if (!jwtToken) {
        setError(new Error('Not authenticated'));
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const url = `${getApiUrl()}/account`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { Authorization: jwtToken },
          body: JSON.stringify(body),
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Request failed');
        }

        return data as T;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        console.error('Account POST error:', err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [jwtToken]
  );

  return { postAccount, loading, error };
}
