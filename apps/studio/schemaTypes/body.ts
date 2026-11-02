import {defineArrayMember, defineField, defineType} from 'sanity'
import {CircleIcon} from '@sanity/icons/Circle'

export const body = defineType({
  name: 'body',
  type: 'document',
  icon: CircleIcon,
  fields: [
    defineField({
      name: 'name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      description: 'The URL identifier for this body, such as earth or europa.',
      options: {source: 'name', maxLength: 96},
      validation: (rule) =>
        rule.required().custom(async (slug, context) => {
          if (!slug?.current) return 'Required'
          if (!/^[a-z0-9-]+$/.test(slug.current)) {
            return 'Slug must be lowercase with hyphens only'
          }
          const client = context.getClient({apiVersion: '2026-11-02'})
          const id = context.document?._id?.replace(/^drafts\./, '')
          const existing = await client.fetch(
            `count(*[_type == "body" && slug.current == $slug && _id != $id])`,
            {slug: slug.current, id},
          )
          return existing === 0 || 'Slug already exists'
        }),
    }),
    defineField({
      name: 'kind',
      type: 'string',
      description: 'Star for the Sun, planet for the eight planets, moon for a body that orbits a planet.',
      options: {
        list: [
          {title: 'Star', value: 'star'},
          {title: 'Planet', value: 'planet'},
          {title: 'Moon', value: 'moon'},
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'orbits',
      type: 'reference',
      to: [{type: 'body'}],
      description: 'The planet this moon orbits.',
      hidden: ({parent}) => parent?.kind !== 'moon',
      validation: (rule) =>
        rule.custom((value, context) => {
          const kind = (context.parent as {kind?: string} | undefined)?.kind
          if (kind === 'moon' && !value) return 'A moon must orbit a planet'
          if (kind !== 'moon' && value) return 'Only a moon orbits another body'
          return true
        }),
    }),
    defineField({
      name: 'description',
      type: 'text',
      rows: 4,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'image',
      type: 'image',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          type: 'string',
          title: 'Alternative Text',
          validation: (rule) => rule.required().warning('Alt text is important for SEO'),
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'facts',
      type: 'array',
      of: [defineArrayMember({type: 'fact'})],
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: {
    select: {
      title: 'name',
      kind: 'kind',
      orbits: 'orbits.name',
      media: 'image',
    },
    prepare({title, kind, orbits, media}) {
      const subtitle = kind === 'moon' && orbits ? `moon, orbits ${orbits}` : kind
      return {title, subtitle, media}
    },
  },
})
