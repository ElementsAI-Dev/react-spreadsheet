import { Point } from "../core/point";

/**
 * Convert point to hash string.
 * Using template literal is faster than string concatenation in modern JS engines.
 */
export function toString(point: Point): string {
  return `${point.row},${point.column}`;
}

/**
 * Convert hash string back to point.
 * Using indexOf + substring is faster than split for simple cases.
 */
export function fromString(hash: string): Point {
  const commaIndex = hash.indexOf(",");
  return {
    row: parseInt(hash.substring(0, commaIndex), 10),
    column: parseInt(hash.substring(commaIndex + 1), 10),
  };
}
