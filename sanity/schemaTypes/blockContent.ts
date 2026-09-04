import { defineArrayMember, defineType } from 'sanity'

/**
 * Deliberately restrained rich text. The type scale has one prose size and one
 * sub-heading; giving the editor more styles than the design supports is how
 * rich text ends up looking unstyled.
 */
export const blockContent = defineType({
  name: 'blockContent',
  title: 'Rich text',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [
        { title: 'Paragraph', value: 'normal' },
        { title: 'Sub-heading', value: 'h3' },
      ],
      lists: [{ title: 'Bullet', value: 'bullet' }],
      marks: {
        decorators: [
          {
            title: 'Figure',
            value: 'strong',
            // Renders as tabular mono inline — how numbers stay glanceable
            // without a stat block.
          },
          { title: 'Species / caption', value: 'em' },
          { title: 'Code', value: 'code' },
        ],
        annotations: [
          {
            name: 'link',
            type: 'object',
            title: 'Link',
            fields: [
              {
                name: 'href',
                type: 'url',
                title: 'URL',
                validation: (rule) =>
                  rule.required().uri({ scheme: ['http', 'https', 'mailto'] }),
              },
            ],
          },
        ],
      },
    }),
  ],
})
