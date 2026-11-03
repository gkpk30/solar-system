import type {SanityImageSource} from "@sanity/image-url";

import {urlFor} from "@/sanity/image";

import {phaseFromSlug, visualMoonDistance, visualPlanetDistance, visualRadius} from "./scale";

type Rings = {
  innerRadiusKm: number | null;
  outerRadiusKm: number | null;
};

type Physical = {
  meanRadiusKm: number | null;
  rotationPeriodHours: number | null;
  axialTiltDegrees: number | null;
  semiMajorAxisKm: number | null;
  orbitalPeriodDays: number | null;
  eccentricity: number | null;
  inclinationDegrees: number | null;
  rings: Rings | null;
};

export type SourceBody = {
  _id: string;
  name: string | null;
  slug: string | null;
  kind: string | null;
  image: SanityImageSource | null;
  physical: Physical | null;
  moons?: Array<SourceBody | null> | null;
};

export type ModelBody = {
  id: string;
  name: string;
  slug: string;
  kind: "star" | "planet" | "moon";
  radius: number;
  rotationPeriodHours: number;
  axialTiltDegrees: number;
  phase: number;
  textureUrl: string | null;
  orbit: {
    distance: number;
    eccentricity: number;
    periodDays: number;
    inclinationDegrees: number;
  } | null;
  rings: {inner: number; outer: number} | null;
  moons: ModelBody[];
};

export type PreparedModel =
  | {ok: true; star: ModelBody; planets: ModelBody[]}
  | {ok: false; reason: string};

function textureUrl(image: SanityImageSource | null) {
  if (!image || typeof image !== "object" || !("asset" in image) || !image.asset) return null;
  return urlFor(image).width(256).height(256).fit("crop").url();
}

function hasSpin(physical: Physical | null): physical is Physical & {
  meanRadiusKm: number;
  rotationPeriodHours: number;
  axialTiltDegrees: number;
} {
  return (
    physical?.meanRadiusKm != null &&
    physical.meanRadiusKm > 0 &&
    physical.rotationPeriodHours != null &&
    physical.rotationPeriodHours !== 0 &&
    physical.axialTiltDegrees != null
  );
}

function hasOrbit(physical: Physical) {
  return (
    physical.semiMajorAxisKm != null &&
    physical.semiMajorAxisKm > 0 &&
    physical.orbitalPeriodDays != null &&
    physical.orbitalPeriodDays > 0 &&
    physical.eccentricity != null &&
    physical.eccentricity >= 0 &&
    physical.eccentricity < 1 &&
    physical.inclinationDegrees != null
  );
}

function ringsFor(physical: Physical, radius: number) {
  const innerKm = physical.rings?.innerRadiusKm;
  const outerKm = physical.rings?.outerRadiusKm;
  if (
    innerKm == null ||
    outerKm == null ||
    physical.meanRadiusKm == null ||
    innerKm <= physical.meanRadiusKm ||
    outerKm <= innerKm
  ) {
    return null;
  }
  return {
    inner: radius * (innerKm / physical.meanRadiusKm),
    outer: radius * (outerKm / physical.meanRadiusKm),
  };
}

function toMoon(body: SourceBody, parentRadiusKm: number, parentVisualRadius: number, clearance: number) {
  if (!body.slug || !body.name || !hasSpin(body.physical) || !hasOrbit(body.physical)) return null;
  const radius = visualRadius(body.physical.meanRadiusKm);
  return {
    id: body._id,
    name: body.name,
    slug: body.slug,
    kind: "moon",
    radius,
    rotationPeriodHours: body.physical.rotationPeriodHours,
    axialTiltDegrees: body.physical.axialTiltDegrees,
    phase: phaseFromSlug(body.slug),
    textureUrl: textureUrl(body.image),
    orbit: {
      distance: visualMoonDistance(
        body.physical.semiMajorAxisKm!,
        parentRadiusKm,
        parentVisualRadius,
        clearance,
      ),
      eccentricity: body.physical.eccentricity!,
      periodDays: body.physical.orbitalPeriodDays!,
      inclinationDegrees: body.physical.inclinationDegrees!,
    },
    rings: null,
    moons: [],
  } satisfies ModelBody;
}

export function prepareModel(bodies: Array<SourceBody | null> | null): PreparedModel {
  const list = (bodies ?? []).flatMap((body) => (body ? [body] : []));
  const stars = list.filter((body) => body.kind === "star");
  if (stars.length !== 1) {
    return {ok: false, reason: "The model needs exactly one star to use as its origin."};
  }

  const star = stars[0];
  if (!star.slug || !star.name || !hasSpin(star.physical)) {
    return {ok: false, reason: "The star is missing the measurements the model needs."};
  }

  const starRadius = visualRadius(star.physical.meanRadiusKm);
  const planets = list.flatMap((body) => {
    if (body.kind !== "planet" || !body.slug || !body.name || !hasSpin(body.physical) || !hasOrbit(body.physical)) {
      return [];
    }
    const radius = visualRadius(body.physical.meanRadiusKm);
    const rings = ringsFor(body.physical, radius);
    const clearance = Math.max(radius, rings?.outer ?? 0) * 1.35;
    const moons = (body.moons ?? []).flatMap((moon) => {
      if (!moon) return [];
      const prepared = toMoon(moon, body.physical!.meanRadiusKm!, radius, clearance);
      return prepared ? [prepared] : [];
    });
    return [
      {
        id: body._id,
        name: body.name,
        slug: body.slug,
        kind: "planet",
        radius,
        rotationPeriodHours: body.physical.rotationPeriodHours,
        axialTiltDegrees: body.physical.axialTiltDegrees,
        phase: phaseFromSlug(body.slug),
        textureUrl: textureUrl(body.image),
        orbit: {
          distance: visualPlanetDistance(body.physical.semiMajorAxisKm!),
          eccentricity: body.physical.eccentricity!,
          periodDays: body.physical.orbitalPeriodDays!,
          inclinationDegrees: body.physical.inclinationDegrees!,
        },
        rings,
        moons,
      } satisfies ModelBody,
    ];
  });

  return {
    ok: true,
    star: {
      id: star._id,
      name: star.name,
      slug: star.slug,
      kind: "star",
      radius: starRadius,
      rotationPeriodHours: star.physical.rotationPeriodHours,
      axialTiltDegrees: star.physical.axialTiltDegrees,
      phase: phaseFromSlug(star.slug),
      textureUrl: textureUrl(star.image),
      orbit: null,
      rings: null,
      moons: [],
    },
    planets,
  };
}
