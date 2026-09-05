import type { SchemaTypeDefinition } from 'sanity'

import { blockContent } from './blockContent'
import { photo } from './photo'
import { post } from './post'
import { project } from './project'
import { recommendation } from './recommendation'
import { role } from './role'
import { siteSettings } from './siteSettings'

export const schemaTypes: SchemaTypeDefinition[] = [
  role,
  project,
  post,
  photo,
  recommendation,
  siteSettings,
  blockContent,
]
