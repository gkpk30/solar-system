import {defineField, defineType} from 'sanity'
import {ActivityIcon} from '@sanity/icons/Activity'

function isStar(document: unknown) {
  return (document as {kind?: string} | undefined)?.kind === 'star'
}

function orbitingNumber(
  value: number | undefined,
  document: unknown,
  check: (value: number) => true | string,
): true | string {
  if (isStar(document)) return value == null || 'A star is the origin and has no orbit'
  if (value == null) return 'Required'
  return check(value)
}

export const rings = defineType({
  name: 'rings',
  type: 'object',
  fields: [
    defineField({
      name: 'innerRadiusKm',
      type: 'number',
      title: 'Inner radius (km)',
      description: 'Distance from the center of the body to the inner edge of the rings.',
      validation: (rule) => rule.required().positive(),
    }),
    defineField({
      name: 'outerRadiusKm',
      type: 'number',
      title: 'Outer radius (km)',
      description: 'Distance from the center of the body to the outer edge of the rings.',
      validation: (rule) =>
        rule
          .required()
          .positive()
          .custom((outer, context) => {
            const inner = (context.parent as {innerRadiusKm?: number} | undefined)?.innerRadiusKm
            if (inner != null && outer != null && outer <= inner) {
              return 'Outer radius must be greater than the inner radius'
            }
            return true
          }),
    }),
  ],
})

export const physical = defineType({
  name: 'physical',
  type: 'object',
  icon: ActivityIcon,
  description: 'Measured size, spin, and orbit. The site calculates the model from these numbers.',
  fields: [
    defineField({
      name: 'meanRadiusKm',
      type: 'number',
      title: 'Mean radius (km)',
      description: 'Average distance from the center of the body to its surface.',
      validation: (rule) => rule.required().positive(),
    }),
    defineField({
      name: 'rotationPeriodHours',
      type: 'number',
      title: 'Rotation period (hours)',
      description:
        'Sidereal day, in hours. Use a negative number when the body spins retrograde, as Venus does.',
      validation: (rule) =>
        rule.required().custom((value) => (value === 0 ? 'Rotation period cannot be zero' : true)),
    }),
    defineField({
      name: 'axialTiltDegrees',
      type: 'number',
      title: 'Axial tilt (degrees)',
      description: 'Tilt of the spin axis, from 0 to 180.',
      validation: (rule) => rule.required().min(0).max(180),
    }),
    defineField({
      name: 'semiMajorAxisKm',
      type: 'number',
      title: 'Semi-major axis (km)',
      description: 'Average distance from the center of the body this one orbits.',
      hidden: ({document}) => isStar(document),
      validation: (rule) =>
        rule.custom((value, context) =>
          orbitingNumber(value, context.document, (distance) =>
            distance > 0 ? true : 'Must be greater than zero',
          ),
        ),
    }),
    defineField({
      name: 'orbitalPeriodDays',
      type: 'number',
      title: 'Orbital period (days)',
      description:
        'Sidereal period of the orbit. Retrograde orbits are recorded with an inclination above 90 degrees.',
      hidden: ({document}) => isStar(document),
      validation: (rule) =>
        rule.custom((value, context) =>
          orbitingNumber(value, context.document, (period) =>
            period > 0 ? true : 'Must be greater than zero',
          ),
        ),
    }),
    defineField({
      name: 'eccentricity',
      type: 'number',
      description: 'Shape of the orbit. Zero is a circle, and the value stays below 1.',
      hidden: ({document}) => isStar(document),
      validation: (rule) =>
        rule.custom((value, context) =>
          orbitingNumber(value, context.document, (eccentricity) =>
            eccentricity >= 0 && eccentricity < 1
              ? true
              : 'Must be from 0 up to, but not including, 1',
          ),
        ),
    }),
    defineField({
      name: 'inclinationDegrees',
      type: 'number',
      title: 'Inclination (degrees)',
      description:
        'Tilt of the orbit. For a planet, this is against the system plane. For a moon, this is against the equator of the planet it orbits. A value above 90 degrees is a retrograde orbit, as with Triton.',
      hidden: ({document}) => isStar(document),
      validation: (rule) =>
        rule.custom((value, context) =>
          orbitingNumber(value, context.document, (inclination) =>
            inclination >= 0 && inclination <= 180 ? true : 'Must be from 0 to 180',
          ),
        ),
    }),
    defineField({
      name: 'rings',
      type: 'rings',
      description: 'Leave this empty unless the body has a ring system.',
      hidden: ({document}) => isStar(document),
      validation: (rule) =>
        rule.custom((value, context) => {
          const rings = value as {innerRadiusKm?: number} | undefined
          const radius = (context.parent as {meanRadiusKm?: number} | undefined)?.meanRadiusKm
          if (rings?.innerRadiusKm != null && radius != null && rings.innerRadiusKm <= radius) {
            return 'The inner edge must sit outside the body'
          }
          return true
        }),
    }),
  ],
})
