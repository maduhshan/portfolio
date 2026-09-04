import { defineField, defineType } from 'sanity'

/**
 * Posts written here rather than on Medium. Technical writing tends to go to
 * Medium and is pulled in through the feed; anything else can live here, where
 * nobody else owns it.
 */
export const post = defineType({
  name: 'post',
  title: 'Blog post',
  type: 'document',
  fields: [
    defineField({ name: 'title', type: 'string', validation: (rule) => rule.required() }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'publishedAt',
      type: 'datetime',
      title: 'Published',
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'category',
      type: 'string',
      description: 'Which half of the blog this belongs to.',
      options: {
        list: [
          { title: 'Technology', value: 'Technology' },
          { title: 'Misc', value: 'Misc' },
        ],
        layout: 'radio',
      },
      initialValue: 'Misc',
    }),
    defineField({
      name: 'topics',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
      description: 'Two or three. They sit beside the date on the index.',
    }),
    defineField({
      name: 'excerpt',
      type: 'text',
      rows: 3,
      description: 'Optional. Left empty, the index uses the opening of the post.',
      validation: (rule) => rule.max(300),
    }),
    defineField({ name: 'body', type: 'blockContent', validation: (rule) => rule.required() }),
  ],
  orderings: [
    { title: 'Newest', name: 'publishedDesc', by: [{ field: 'publishedAt', direction: 'desc' }] },
  ],
  preview: {
    select: { title: 'title', date: 'publishedAt' },
    prepare: ({ title, date }) => ({
      title,
      subtitle: date ? new Date(date).toDateString() : 'Unpublished',
    }),
  },
})
