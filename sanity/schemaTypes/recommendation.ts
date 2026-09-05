import { defineField, defineType } from 'sanity'

export const recommendation = defineType({
  name: 'recommendation',
  title: 'Recommendation',
  type: 'document',
  description:
    'Recommendations written about you on LinkedIn. Only ones you have received belong here, never ones you have given. LinkedIn has no API for these, so they are copied across by hand.',
  fields: [
    defineField({
      name: 'name',
      title: 'Who wrote it',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'role',
      title: 'Their role at the time',
      type: 'string',
      description: 'As it appears on the recommendation, e.g. "Engineering Manager".',
    }),
    defineField({
      name: 'company',
      type: 'string',
      description: 'Where they were when they wrote it.',
    }),
    defineField({
      name: 'relationship',
      type: 'string',
      description:
        'The line LinkedIn puts above the text, e.g. "Managed Madushan directly". Copy it as written: it is what tells a reader how much the words are worth.',
      validation: (rule) => rule.max(160),
    }),
    defineField({
      name: 'body',
      title: 'The recommendation',
      type: 'text',
      rows: 8,
      description: 'Exactly as written. Do not edit somebody else’s words.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'receivedOn',
      title: 'Date received',
      type: 'date',
      options: { dateFormat: 'MMM YYYY' },
    }),
    defineField({
      name: 'profileUrl',
      title: 'Their LinkedIn profile',
      type: 'url',
      description: 'Optional. Their name links here, so a reader can see who is speaking.',
    }),
    defineField({
      name: 'order',
      type: 'number',
      description: 'Ascending. 1 shows first.',
      validation: (rule) => rule.required().integer().positive(),
    }),
  ],
  orderings: [
    {
      title: 'Order',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
  ],
  preview: {
    select: { title: 'name', subtitle: 'relationship' },
  },
})
