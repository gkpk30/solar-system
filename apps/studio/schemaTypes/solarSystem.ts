import {defineArrayMember, defineField, defineType} from 'sanity'
import {EarthGlobeIcon} from '@sanity/icons/EarthGlobe'

export const solarSystem = defineType({
  name: 'solarSystem',
  type: 'document',
  icon: EarthGlobeIcon,
  fields: [
    defineField({
      name: 'name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'bodies',
      type: 'array',
      description:
        'The star and the planets, in display order. The star is the origin of the model. Moons are not listed here.',
      of: [defineArrayMember({type: 'reference', to: [{type: 'body'}]})],
      validation: (rule) =>
        rule.unique().custom(async (bodies, context) => {
          const ids = (bodies ?? []).flatMap((body) => {
            const ref = (body as {_ref?: string})._ref
            return ref ? [ref] : []
          })
          if (!ids.length) return true
          const client = context.getClient({apiVersion: '2026-11-02'})
          const counts = await client.fetch<{stars: number; moons: number}>(
            `{
              "stars": count(*[_id in $ids && kind == "star"]),
              "moons": count(*[_id in $ids && kind == "moon"])
            }`,
            {ids},
          )
          if (counts.moons > 0) return 'List moons on the planet they orbit, not on the system'
          if (counts.stars !== 1)
            return 'The system needs exactly one star, which the model uses as its origin'
          return true
        }),
    }),
  ],
  preview: {
    select: {
      title: 'name',
    },
  },
})
