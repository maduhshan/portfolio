import { defineField, defineType } from 'sanity'

export const project = defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  groups: [
    { name: 'meta', title: 'Meta', default: true },
    { name: 'story', title: 'Case study' },
  ],
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      group: 'meta',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      group: 'meta',
      options: { source: 'title', maxLength: 72 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'organisation',
      type: 'string',
      group: 'meta',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'period',
      type: 'string',
      group: 'meta',
      description: 'Free text, e.g. "2025 to present" or "2019 to 2022".',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'featured',
      type: 'boolean',
      group: 'meta',
      initialValue: false,
      description: 'Featured projects get a larger row and a visible plate on the index.',
    }),
    defineField({
      name: 'order',
      type: 'number',
      group: 'meta',
      description: 'Ascending. Sets the plate number on the index.',
      validation: (rule) => rule.required().integer().positive(),
    }),
    defineField({
      name: 'productUrl',
      type: 'url',
      group: 'meta',
      title: 'Live product',
      description: 'Optional. A third-party site, so the page links to it and nothing more.',
    }),
    defineField({
      name: 'productName',
      type: 'string',
      group: 'meta',
      title: 'Product name',
      description: 'The link text. Falls back to the project title. Never "View live".',
    }),
    defineField({
      name: 'stack',
      type: 'array',
      group: 'meta',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'problem',
      title: 'The problem',
      type: 'blockContent',
      group: 'story',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'whatIDid',
      title: 'What I did',
      type: 'blockContent',
      group: 'story',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'impact',
      title: 'What changed',
      type: 'blockContent',
      group: 'story',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'coverImage',
      type: 'image',
      group: 'meta',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          type: 'string',
          title: 'Alt text',
          validation: (rule) => rule.required(),
        }),
      ],
    }),
  ],
  orderings: [
    { title: 'Order', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] },
  ],
  preview: {
    select: { title: 'title', subtitle: 'organisation', media: 'coverImage' },
  },
})
