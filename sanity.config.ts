import { visionTool } from '@sanity/vision'
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'

import { apiVersion, dataset, projectId } from './sanity/env'
import { schemaTypes } from './sanity/schemaTypes'
import { structure } from './sanity/structure'

export default defineConfig({
  name: 'default',
  title: 'Madushan Chathuranga',
  basePath: '/studio',
  projectId,
  dataset,
  schema: { types: schemaTypes },
  plugins: [structureTool({ structure }), visionTool({ defaultApiVersion: apiVersion })],
  document: {
    // Both singletons; keep them out of the "create new" menu.
    newDocumentOptions: (prev) =>
      prev.filter((item) => !['siteSettings', 'life'].includes(item.templateId ?? '')),
  },
})
