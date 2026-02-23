/**
 * Math utilities
 * Vector operations: dot product, cross product, add, subtract, divide, norm, distance.
 */

// https://stackoverflow.com/questions/17428587/transposing-a-2d-array-in-javascript
export const transpose = <T>(matrix: T[][]) =>
  matrix[0].map((_, i) => matrix.map((row) => row[i]));

// dot product
export const dot = (v1: number[], v2: number[]) =>
  v1.reduce((sum, val, idx) => sum + val * v2[idx], 0);

// cross product
export const cross = (v1: number[], v2: number[]) =>
  Array(3)
    .fill(0)
    .map(
      (_, idx) =>
        v1[(idx + 1) % 3] * v2[(idx + 2) % 3] -
        v1[(idx + 2) % 3] * v2[(idx + 1) % 3]
    );

// add
export const add = (v1: number[], v2: number[]) => v1.map((val, idx) => val + v2[idx]);

// subtract
export const subtract = (v1: number[], v2: number[]) =>
  v1.map((val, idx) => val - v2[idx]);

// divide
export const divide = (v1: number[], divisor: number) =>
  v1.map((val) => val / divisor);

// distance
export const dist = (pt1: number[], pt2: number[]) =>
  Math.sqrt(pt1.reduce((sum, val, idx) => sum + (val - pt2[idx]) ** 2, 0));

// norm
export const norm = (v1: number[]) => dist(v1, Array(v1.length).fill(0));

// linspace
export const linspace = (
  start: number,
  end: number,
  numPoints: number,
  includeEndpoint = true
) =>
  Array(numPoints)
    .fill(0)
    .map(
      (_, idx) =>
        start +
        idx *
        ((end - (includeEndpoint ? 0 : end / numPoints) - start) /
          (numPoints - 1))
    );
