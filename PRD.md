# PRD: Solar system content experience

## Status

This document matches the app as built. It records the content model, the seeded solar system, and the pages that render it. It does not specify a further visual design.

## Goal

Build a content-driven web application that presents a solar system. Sanity stores the content. A Next.js frontend reads that content and renders facts and images.

The content model describes a solar system. The content set for this phase is our own solar system.

## Requirements

1. The content backend is Sanity. Editors work in Sanity Studio, and the published documents live in the Sanity dataset.
2. The frontend is a Next.js app written in TypeScript and styled with Tailwind CSS.
3. Content is structured as a solar system, not as page layout. Presentation stays in the Next.js app.
4. The solar system represented is our own.
5. The frontend renders that content on a homepage and on a page for each body. The homepage shows the system, its star and planets, and the major moons nested under the planets they orbit. Each body name links to `/bodies/[slug]`.
6. The frontend reads facts and images from Sanity. It does not own them.

## Content model

Studio schema types are `solarSystem`, `body`, and `fact`.

**Solar system.** One document identifies the system. It has a name and an ordered list of references to body documents. That list is the Sun and the eight planets, in display order. Moons are not in the list.

**Body.** Each body is its own document, so it can be edited on its own. A body has:

- A name.
- A slug, used as the body’s URL identifier.
- A kind: star, planet, or moon.
- For a moon only, a reference to the planet it orbits. A moon must have that reference. A star or planet must not.
- A short description.
- One image, with hotspot editing and alternative text.
- At least one fact.

**Fact.** A fact is an embedded attribute of a body, not its own document. It has a name and a value, both text. Examples are mass and orbital period. The value is written out, such as `88 Earth days`, rather than stored as a number and a unit.

## Initial content

The published dataset holds one solar system, named Solar System. Its bodies, in order, are the Sun, Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, and Neptune.

Major moons are body documents that orbit those planets:

- Earth: the Moon
- Mars: Phobos and Deimos
- Jupiter: Io, Europa, Ganymede, and Callisto
- Saturn: Mimas, Enceladus, Tethys, Dione, Rhea, Titan, and Iapetus
- Uranus: Miranda, Ariel, Umbriel, Titania, and Oberon
- Neptune: Triton

Mercury and Venus have no moons. Each body has a description, one image, and its facts. These documents are stored in Sanity, not in the repository.

## Frontend

The homepage reads the published solar system and renders it.

The page shows the system name, then each body in the order stored on the solar system document. For each body it shows the image, kind, name, description, and facts. The name links to that body’s page. Moons of a planet are shown under that planet, ordered by name.

If no solar system is published, the page says so.

Each body also has its own page at `/bodies/[slug]`. That page shows the same image, kind, description, and facts. A moon links to the planet it orbits. A planet lists its moons and links to each of them.

## Out of scope for this phase

- Further visual design and interaction details
- Additional solar systems
- Dwarf planets and small irregular moons
- Draft preview and visual editing
