/**
 * API utilities
 * Functions for API calls and authentication state management.
 */

import { getApiUrl } from './env';

export const getLoginLoading = (setLoginLoading: any) => () => {
  setLoginLoading(window.location?.search?.indexOf("?code=") === 0);
};

export const getAccount = (
  loggedIn: any,
  setAccount: any,
  setAccountLoading: any
) => () => {
  if (loggedIn) {
    setAccountLoading(true);
    const jwtToken = loggedIn?.signInUserSession?.idToken?.jwtToken;
    const url = `${getApiUrl()}/account`;
    fetch(url, {
      method: "GET",
      headers: { Authorization: jwtToken },
    })
      .then((response) => response.json())
      .then((data) => setAccount(data))
      .catch((err) => console.error(err))
      .finally(() => setAccountLoading(false));
  }
};
