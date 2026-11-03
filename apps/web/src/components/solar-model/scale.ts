const EARTH_RADIUS_KM = 6371;
const AU_KM = 149_597_870;

// One clock makes either the orbits look frozen or the spins look like a blur.
// Orbits stay in proportion to each other, and spins stay in proportion to each other.
export const ORBIT_DAYS_PER_SECOND = 40;
export const SPIN_DAYS_PER_SECOND = 0.05;

export function visualRadius(kilometers: number) {
  return Math.max(0.12, 0.45 * Math.pow(kilometers / EARTH_RADIUS_KM, 0.42));
}

export function visualPlanetDistance(kilometers: number) {
  return 14 * Math.pow(kilometers / AU_KM, 0.5);
}

export function visualMoonDistance(
  kilometers: number,
  parentRadiusKm: number,
  parentVisualRadius: number,
  clearance: number,
) {
  const radiiAway = kilometers / parentRadiusKm;
  return clearance + Math.log2(Math.max(radiiAway, 1.01)) * parentVisualRadius * 0.45;
}

export function phaseFromSlug(slug: string) {
  let hash = 0;
  for (const char of slug) hash = (hash * 33 + char.charCodeAt(0)) >>> 0;
  return ((hash % 1000) / 1000) * Math.PI * 2;
}
