/**
 * Environment utilities
 * Handles environment detection, hostname resolution, and API URL construction.
 */

export const domain = import.meta.env.VITE_APP_DOMAIN;

export const getEnvironment = () => {
  const hostname = window.location.hostname;
  switch (hostname) {
    case "localhost":
      return "local";
    case `dev.${domain}`:
      return "dev";
    default:
      return "prod";
  }
};

export const getHostname = (env: string | boolean) => {
  switch (env) {
    case "local":
      return "localhost";
    case "dev":
      return `dev.${domain}`;
    case "prod":
      return domain;
    default:
      return window.location.hostname;
  }
};

export const getApiUrl = ({ localOverride } = { localOverride: "" }) => {
  const isLocal = getEnvironment() === "local";
  const useLocal = isLocal && !localOverride;
  const hostname = getHostname(isLocal && localOverride);
  const url = useLocal ? "/api" : `https://api.${hostname}`;
  return url;
};
