/**
 * Trade page type definitions
 */

export interface Holding {
  symbol: string;
  quantity: string;
  price: string;
  percent_change: string;
  percentage: number | string;
  open_contracts: number;
  expiration?: string;
  strike?: number;
  chance?: number;
  loose?: number;
  id?: string;
  // Additional optional fields from API
  average_buy_price?: string;
  equity?: string;
  intraday_percent_change?: string;
  equity_change?: string;
  type?: string;
  name?: string;
  pe_ratio?: string | null;
  key?: number;
}

export interface TradeLeg {
  expiration_date: string;
  strike_price: string;
}

export interface TradeResult {
  direction: 'credit' | 'debit';
  premium: string;
  quantity: string;
  legs: TradeLeg[];
  error?: string;
}

export interface TradeMessage {
  message?: string;
  [symbol: string]: TradeResult | string | undefined;
}

export interface TradeLoadingState {
  [key: string]: Set<string>;
}

export interface QueueState {
  [key: string]: Set<string>;
}
