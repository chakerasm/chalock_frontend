import type { Template } from '@/features/templates/types/templates.types'
export function mapTemplateFromAPI(template: Template): Template { return structuredClone(template) }
export function mapTemplateToAPI(template: Omit<Template, 'id' | 'createdAt' | 'updatedAt' | 'usageCount' | 'lastUsedAt'>) { return structuredClone(template) }
