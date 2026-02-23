/**
 * API utilities
 * Functions for API calls and authentication state management.
 */

import { getApiUrl } from './env';

export const getLoginLoading = (setLoginLoading: (loading: boolean) => void) => () => {
  setLoginLoading(window.location?.search?.indexOf("?code=") === 0);
};

interface AuthUser {
  signInUserSession?: {
    idToken?: {
      jwtToken: string;
    };
  };
}

export const getAccount = (
  loggedIn: AuthUser | null,
  setAccount: (account: unknown) => void,
  setAccountLoading: (loading: boolean) => void
) => () => {
  if (loggedIn) {
    setAccountLoading(true);
    const jwtToken = loggedIn?.signInUserSession?.idToken?.jwtToken;
    const url = `${getApiUrl()}/account`;
    fetch(url, {
      method: "GET",
      headers: { Authorization: jwtToken || '' },
    })
      .then((response) => response.json())
      .then((data) => setAccount(data))
      .catch((err) => console.error(err))
      .finally(() => setAccountLoading(false));
  }
};
