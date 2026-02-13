/**
 * Shared type definitions for the application
 */

// Auth types
export interface AuthUser {
  signInUserSession?: {
    idToken?: {
      jwtToken: string;
    };
  };
  attributes?: {
    name?: string;
    email?: string;
  };
}

// Account types
export interface AccountPermissions {
  read_disclaimer?: boolean;
}

export interface AccountAlerts {
  webhook?: string;
  email?: boolean;
}

export interface Account {
  email?: string;
  api_key?: string;
  customer_id?: string;
  in_beta?: boolean;
  subscribed?: boolean;
  permissions?: AccountPermissions;
  alerts?: AccountAlerts;
}

// API response types
export interface PreviewDataPoint {
  Name: string;
  Time: string;
  Bal: number;
  Sig?: boolean | null;
  Full_Sig?: boolean;
}

export interface PreviewStats {
  metric: string;
  HODL: string | number;
  hyperdrive: string | number;
}

export interface PreviewData {
  BTC: { data: PreviewDataPoint[]; stats: PreviewStats[] };
  USD: { data: PreviewDataPoint[]; stats: PreviewStats[] };
}

export interface SignalData {
  Date: string;
  Day: string;
  Signal: string;
  Asset: string;
}

export interface PlanData {
  unit_amount: number;
  recurring?: {
    interval: string;
    interval_count: number;
  };
}

// Utility types
export type SetState<T> = React.Dispatch<React.SetStateAction<T>>;
