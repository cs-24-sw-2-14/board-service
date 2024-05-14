import { CoordinateSet } from "./types";

/**
 * Calculates the distance between two coordinates
 * @param coord1, the first coordinate
 * @param coord2, the second coordinate
 * @return distance between coordinates
 */
export function calculateDistance(
  coord1: CoordinateSet,
  coord2: CoordinateSet,
): number {
  return Math.sqrt(
    Math.pow(coord1.x - coord2.x, 2) + Math.pow(coord1.y - coord2.y, 2),
  );
}
