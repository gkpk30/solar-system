# PRD: Solar system content experience

## Status

The reading pages and the homepage model match the app. The Studio schema and the published documents store the measurements that model reads.

## Goal

Build a content-driven web application that presents a solar system. Sanity stores the content. A Next.js frontend reads that content, renders facts and images, and draws an interactive Three.js model of the same system.

The content model describes a solar system. The content set for this phase is our own solar system.

## Requirements

1. The content backend is Sanity. Editors work in Sanity Studio, and the published documents live in the Sanity dataset.
2. The frontend is a Next.js app written in TypeScript and styled with Tailwind CSS.
3. Content is structured as a solar system, not as page layout. Presentation stays in the Next.js app.
4. The solar system represented is our own.
5. The frontend renders that content on a homepage and on a page for each body. The homepage shows the system, its star and planets, and the major moons nested under the planets they orbit. Each body name links to `/bodies/[slug]`.
6. The frontend reads facts and images from Sanity. It does not own them.
7. The homepage includes an interactive Three.js model of the published system. The model is calculated from each body's measurements. Sanity does not store positions, colors, camera settings, scale factors, or animation speed.
8. Choosing a body in the model opens that body's page. The reading pages stay as they are.

## Content model

Studio schema types are `solarSystem`, `body`, `physical`, `rings`, and `fact`.

**Solar system.** One document identifies the system. It has a name and an ordered list of references to body documents. That list is the star and the planets, in display order. It contains exactly one star. Moons are not in the list. The model uses that star as the origin.

**Body.** Each body is its own document, so it can be edited on its own. A body has:

- A name.
- A slug, used as the body’s URL identifier.
- A kind: star, planet, or moon.
- For a moon only, a reference to the planet it orbits. A moon must have that reference. A star or planet must not.
- A short description.
- One image, with hotspot editing and alternative text. The model uses this image as the body's surface.
- A physical measurement block.
- At least one fact.

**Physical.** Measurements belong to one body, so they are an embedded object rather than their own document. Every body has:

- Mean radius, in kilometers.
- Rotation period, in hours. A negative period means the body spins retrograde.
- Axial tilt, in degrees, from 0 to 180.

A planet or moon also has the orbit around the body it circles. A planet circles the star. A moon circles the planet in `orbits`. The star has no orbit. Those fields are:

- Semi-major axis, in kilometers.
- Orbital period, in days. This value stays positive.
- Eccentricity, from 0 up to but not including 1. Zero is a circle.
- Inclination, in degrees, from 0 to 180. For a planet this is against the system plane. For a moon this is against the equator of the planet it orbits. A value above 90 degrees is a retrograde orbit. The Moon is the exception: its stored inclination is 5.14 degrees to the system plane, because that orbit does not hold one angle to Earth's equator.

**Rings.** An optional embedded object on the physical block, for a body that has a ring system. It has an inner radius and an outer radius, both in kilometers from the center of the body. The inner edge sits outside the body, and the outer edge is farther out than the inner edge. Saturn is the body in this content set that has rings.

**Fact.** A fact is an embedded attribute of a body, not its own document. It has a name and a value, both text. Examples are mass and orbital period. The value is written out, such as `88 Earth days`, rather than stored as a number and a unit. The model does not parse facts. Editors keep the written fact and the matching measurement because one is read and the other is calculated.

## Initial content

The published dataset holds one solar system, named Solar System. Its bodies, in order, are the Sun, Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, and Neptune.

Major moons are body documents that orbit those planets:

- Earth: the Moon
- Mars: Phobos and Deimos
- Jupiter: Io, Europa, Ganymede, and Callisto
- Saturn: Mimas, Enceladus, Tethys, Dione, Rhea, Titan, and Iapetus
- Uranus: Miranda, Ariel, Umbriel, Titania, and Oberon
- Neptune: Triton

Mercury and Venus have no moons. Each body has a description, one image, its facts, and its physical measurements. Saturn's measurements include its rings. These are mean values an editor can correct. They are not a live ephemeris. The documents are stored in Sanity, not in the repository.

## Frontend

The homepage reads the published solar system and renders it.

The page shows the system name, then each body in the order stored on the solar system document. For each body it shows the image, kind, name, description, and facts. The name links to that body’s page. Moons of a planet are shown under that planet, ordered by name.

If no solar system is published, the page says so.

Each body also has its own page at `/bodies/[slug]`. That page shows the same image, kind, description, and facts. A moon links to the planet it orbits. A planet lists its moons and links to each of them.

### 3D model

The model is a Three.js scene in the Next.js homepage, rendered with React, and placed above the reading list. It is built from the published solar system and the physical measurements.

The star is the origin. Each planet in the system list orbits that star. Each moon orbits the planet named by `orbits`, and moons are included. Saturn's rings are a flat band between the two stored radii.

The scene maps content like this:

- Mean radius sizes the sphere.
- Semi-major axis, eccentricity, and inclination draw the orbit around the parent body.
- Orbital period sets the orbit speed. Periods stay in proportion to each other.
- Rotation period sets the spin speed and direction.
- Axial tilt sets the spin axis.
- The image is the surface.
- Name and slug label the body and link to `/bodies/[slug]`.

The visitor can drag to look around, zoom, and pause the motion. Choosing a body opens its page.

True kilometers would hide the planets in the gaps, so the app compresses distances and radii for display and speeds the whole system up so motion is visible. Those choices stay in the frontend. Editors do not enter a scale or a clock.

If the system does not contain exactly one star, the model does not pick an origin. A body with no physical measurements is left out of the model. Its reading page still renders.

## Out of scope for this phase

- Materials, lighting, the exact camera, and the exact compression formula
- N-body gravity and a live ephemeris
- Ring detail beyond an inner and an outer radius
- Atmospheres and extra textures
- Additional solar systems
- Dwarf planets and small irregular moons
- Draft preview and visual editing
