import { defineField, defineType } from 'sanity'

export const photo = defineType({
  name: 'photo',
  title: 'Photograph',
  type: 'document',
  description:
    'Manual curation, and the fallback the gallery uses whenever Instagram is unavailable.',
  fields: [
    defineField({
      name: 'image',
      type: 'image',
      options: { hotspot: true },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'caption',
      type: 'string',
      description: 'Also used as the alt text. Describe what is in the frame.',
      validation: (rule) => rule.required().max(200),
    }),
    defineField({
      name: 'location',
      type: 'string',
    }),
    defineField({
      name: 'species',
      type: 'string',
      description: 'Binomial name if known — it is set in italic, field-guide style.',
    }),
    defineField({
      name: 'featured',
      type: 'boolean',
      initialValue: false,
      description: 'Featured photographs are given more room in the gallery.',
    }),
    defineField({
      name: 'order',
      type: 'number',
      validation: (rule) => rule.required().integer(),
    }),
  ],
  orderings: [
    { title: 'Order', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] },
  ],
  preview: {
    select: { title: 'caption', subtitle: 'location', media: 'image' },
  },
})
