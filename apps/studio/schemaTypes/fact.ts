import {defineField, defineType} from 'sanity'
import {InfoOutlineIcon} from '@sanity/icons/InfoOutline'

export const fact = defineType({
  name: 'fact',
  type: 'object',
  icon: InfoOutlineIcon,
  fields: [
    defineField({
      name: 'name',
      type: 'string',
      description: 'The attribute, such as mass or orbital period.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'value',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'value',
    },
  },
})
