import type { StructureResolver } from 'sanity/structure'

/**
 * Site settings is a singleton — one document, opened directly rather than as a
 * list of one. Everything else is an ordered list.
 */
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Site settings')
        .id('siteSettings')
        .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
      S.divider(),
      S.documentTypeListItem('role').title('Career'),
      S.documentTypeListItem('project').title('Work'),
      S.documentTypeListItem('post').title('Blog'),
      S.documentTypeListItem('photo').title('Photographs'),
      S.documentTypeListItem('recommendation').title('What people say'),
    ])
