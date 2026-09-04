import { defineField, defineType } from 'sanity'

export const role = defineType({
  name: 'role',
  title: 'Role',
  type: 'document',
  fields: [
    defineField({
      name: 'company',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'title',
      type: 'string',
      description: 'Job title. Use an arc if it changed, e.g. "Intern to Senior Engineer".',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'companyUrl',
      type: 'url',
      title: 'Company website',
      description: 'The company name on the timeline links here.',
    }),
    defineField({
      name: 'location',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'startDate',
      type: 'date',
      options: { dateFormat: 'MMM YYYY' },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'endDate',
      type: 'date',
      options: { dateFormat: 'MMM YYYY' },
      description: 'Leave empty for the current role. The site reads empty as "still there".',
    }),
    defineField({
      name: 'summary',
      type: 'text',
      rows: 3,
      description:
        'Optional lead line. Leave it out when the highlights already say it — most roles do not need both.',
      validation: (rule) => rule.max(320),
    }),
    defineField({
      name: 'highlights',
      type: 'array',
      of: [{ type: 'string' }],
      description:
        'What you actually did. One line each, two or three per role. These carry the timeline.',
      validation: (rule) => rule.max(5),
    }),
    defineField({
      name: 'order',
      type: 'number',
      description: 'Ascending. 1 is the most recent role.',
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
    select: { title: 'company', subtitle: 'title', start: 'startDate', end: 'endDate' },
    prepare({ title, subtitle, start, end }) {
      const year = (d?: string) => (d ? d.slice(0, 4) : 'now')
      return {
        title,
        subtitle: `${subtitle} — ${year(start)} to ${year(end)}`,
      }
    },
  },
})
