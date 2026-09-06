import { defineArrayMember, defineField, defineType } from 'sanity'

/**
 * Life. A singleton: one document, because there is one of him.
 *
 * The home page shows the opening and a couple of photographs. Everything else
 * is at /life, which is why the story is split in two fields rather than
 * truncated: what a visitor sees first is chosen here, not by a character
 * count.
 */
export const life = defineType({
  name: 'life',
  title: 'Life',
  type: 'document',
  description: 'Who you are, where you are from, how you grew up. Written by you, not generated.',
  fields: [
    defineField({
      name: 'intro',
      title: 'Opening',
      type: 'text',
      rows: 6,
      description:
        'The part that appears on the home page, above the link through to the full page. A few sentences is plenty. Leave it empty and the whole section stays hidden.',
      validation: (rule) => rule.max(700),
    }),
    defineField({
      name: 'body',
      title: 'The rest of it',
      type: 'blockContent',
      description: 'Shown only on /life, below the opening.',
    }),
    defineField({
      name: 'photos',
      title: 'Photographs',
      type: 'array',
      description:
        'You and your family. The first few appear on the home page in black and white, the way every photograph of a person on this site does. All of them appear on /life in colour.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'lifePhoto',
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
              description:
                'Also the alt text, so describe what is in the frame rather than how it feels.',
              validation: (rule) => rule.required().max(200),
            }),
          ],
          preview: { select: { title: 'caption', media: 'image' } },
        }),
      ],
    }),
  ],
  preview: {
    select: { subtitle: 'intro' },
    prepare: ({ subtitle }) => ({ title: 'Life', subtitle: subtitle ?? 'Not written yet' }),
  },
})
