import { defineField, defineType } from 'sanity'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site settings',
  type: 'document',
  fields: [
    defineField({ name: 'name', type: 'string', validation: (rule) => rule.required() }),
    defineField({
      name: 'headline',
      type: 'string',
      title: 'Opening statement',
      description:
        'The paragraph under the figures in the hero. Search and social use the first 155 characters, so make the opening sentence stand on its own. Say what you do, not what you are called. No job titles, no adjectives like passionate or driven.',
      validation: (rule) => rule.required().max(600),
    }),
    defineField({
      name: 'heroNote',
      type: 'text',
      rows: 2,
      title: 'Second line of the opening',
      description:
        'Sits under the opening sentence, quieter. The other half of what you do.',
      validation: (rule) => rule.max(180),
    }),
    defineField({
      name: 'heroImage',
      type: 'image',
      title: 'Opening photograph',
      description:
        'Fills the first screen. Its own slot — it is deliberately not taken from the gallery, so the gallery stays photographs of the field.',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          type: 'string',
          title: 'Alt text',
          description: 'Describe what is in the frame, for anyone who cannot see it.',
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'credit',
          type: 'string',
          description: 'The small line under the photograph. A place, or a species. Optional.',
        }),
      ],
    }),
    defineField({ name: 'bio', type: 'blockContent', validation: (rule) => rule.required() }),
    defineField({
      name: 'stats',
      type: 'array',
      title: 'Figures',
      description: 'Two or three at most. Any more and the band starts to read as a dashboard.',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'value', type: 'string', validation: (rule: any) => rule.required() },
            { name: 'label', type: 'string', validation: (rule: any) => rule.required() },
          ],
          preview: { select: { title: 'value', subtitle: 'label' } },
        },
      ],
      validation: (rule) => rule.max(4),
    }),
    defineField({
      name: 'industries',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'The range is the point. Set as a quiet horizontal list, never as tags.',
    }),
    defineField({
      name: 'positioning',
      type: 'blockContent',
      title: 'How I work',
      description:
        'One or two plain sentences on the modes of work. Sits under the industries.',
    }),
    defineField({
      name: 'competencies',
      type: 'array',
      title: 'Technical competencies',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'area', type: 'string', validation: (rule: any) => rule.required() },
            { name: 'items', type: 'array', of: [{ type: 'string' }], options: { layout: 'tags' } },
          ],
          preview: { select: { title: 'area' } },
        },
      ],
    }),
    defineField({
      name: 'availabilityStatus',
      type: 'string',
      title: 'Availability',
      description:
        'Drives the indicator in the navigation. "Not currently available" hides the indicator rather than announcing it.',
      options: {
        list: [
          { title: 'Available for consulting', value: 'Available for consulting' },
          { title: 'Open to selected work', value: 'Open to selected work' },
          { title: 'Not currently available', value: 'Not currently available' },
        ],
        layout: 'radio',
      },
      initialValue: 'Open to selected work',
    }),
    defineField({
      name: 'availabilityDetail',
      type: 'text',
      rows: 3,
      title: 'What kind of work',
      description: 'One or two lines. Sits above the links in the contact section.',
      validation: (rule) => rule.max(280),
    }),
    defineField({
      name: 'calendarLink',
      type: 'url',
      title: 'Booking link',
      description: 'Optional. A Cal.com or Calendly link, if you ever want one.',
    }),
    defineField({
      name: 'email',
      type: 'string',
      validation: (rule) => rule.required().email(),
    }),
    defineField({
      name: 'pinnedPosts',
      type: 'array',
      of: [{ type: 'string' }],
      title: 'Pinned posts',
      description:
        'Paste the URL of a post to put it at the front of the Instagram grid and the gallery, in this order. Instagram does not expose highlights or pinned posts through its API, so this is how you choose them.',
      validation: (rule) => rule.max(12),
    }),
    defineField({
      name: 'whatsapp',
      type: 'string',
      title: 'WhatsApp',
      description:
        'In international format, spaces are fine: +65 9396 0940. The link is built from the digits.',
    }),
    defineField({ name: 'linkedin', type: 'url', title: 'LinkedIn' }),
    defineField({ name: 'github', type: 'url', title: 'GitHub' }),
    defineField({ name: 'instagram', type: 'url' }),
    defineField({
      name: 'mediumHandle',
      type: 'string',
      description: 'Without the @, e.g. mchathuranga4',
    }),
    defineField({ name: 'cvFile', type: 'file', title: 'CV' }),
  ],
  preview: {
    prepare: () => ({ title: 'Site settings' }),
  },
})
