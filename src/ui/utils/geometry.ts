/**
 * Geometry utilities
 * 3D geometry functions for plane finding and circle generation.
 */

import { dot, cross, subtract, add, divide, norm, dist, linspace } from './math';

export const findPlane = (pt1: number[], pt2: number[], pt3: number[]) => {
  const u = subtract(pt2, pt1);
  const v = subtract(pt3, pt1);

  const normal = cross(u, v);
  const [a, b, c] = normal;
  const point = pt1.map((x: number) => -x);
  const d = dot(point, normal);
  return [a, b, c, d];
};

// https://math.stackexchange.com/a/73242
export const get3DCircle = (
  center: number[],
  pt1: number[],
  pt2: number[],
  refinement = 360
) => {
  const plane = findPlane(center, pt1, pt2);
  const normal = plane.slice(0, 3);
  const unitNormal = divide(normal, norm(normal));

  let q1 = divide(pt1, norm(pt1));
  let q2 = add(center, cross(q1, unitNormal));
  // 0 -> 360 degrees in radians
  const angles = linspace(0, 2 * Math.PI, refinement, false);

  const radius = dist(center, pt1);

  q1 = divide(q1, norm(q1));
  q2 = add(center, cross(q1, unitNormal));

  const convertToXYZ = (theta: number, idx: number) =>
    center[idx] +
    radius * Math.cos(theta) * q1[idx] +
    radius * Math.sin(theta) * q2[idx];

  const circle = angles.map((theta) =>
    ["x", "y", "z"].reduce(
      (point, axis, dim) => ({ ...point, [axis]: convertToXYZ(theta, dim) }),
      {}
    )
  );
  return circle;
};
