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
      description: 'The bodies in this system, in display order.',
      of: [defineArrayMember({type: 'reference', to: [{type: 'body'}]})],
      validation: (rule) => rule.unique(),
    }),
  ],
  preview: {
    select: {
      title: 'name',
    },
  },
})
