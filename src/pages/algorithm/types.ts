/**
 * Algorithm page type definitions
 */

export interface MetadataItem {
  key: number;
  metadata: string;
  stat: string | number;
}

export interface ActualData {
  BUY?: number[];
  SELL?: number[];
}

export interface Viz2DData {
  grid: number[][];
  preds: number[];
  actual: ActualData[];
}

export interface Viz3DData {
  grid: number[][];
  preds: number[];
  actual: ActualData[];
}
