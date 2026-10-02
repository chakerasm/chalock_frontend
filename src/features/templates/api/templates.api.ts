import { apiFetch } from '@/lib/api/client'
import { parseApiJson } from '@/lib/api/response'
import {
  createTemplateInputSchema,
  templateFromAPISchema,
  templatesFromAPISchema,
  updateTemplateInputSchema,
} from '@/features/templates/schemas/templates.schemas'
import type {
  CreateTemplateInput,
  Template,
  TemplateFilters,
  UpdateTemplateInput,
} from '@/features/templates/types/templates.types'

const templatesEndpoint = '/api/templates'

function request(method: 'PATCH' | 'POST', body?: unknown) {
  return {
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    headers: { 'Content-Type': 'application/json' },
    method,
  }
}

function query(filters: TemplateFilters) {
  const params = new URLSearchParams()
  if (filters.type) params.set('type', filters.type)
  if (filters.favorite) params.set('favorite', 'true')
  if (filters.search) params.set('search', filters.search)
  const value = params.toString()
  return value ? `?${value}` : ''
}

export function getTemplatesFromAPI(filters: TemplateFilters = {}) {
  return parseApiJson(
    apiFetch(`${templatesEndpoint}${query(filters)}`),
    templatesFromAPISchema,
  )
}

export function getTemplateFromAPI(templateId: string): Promise<Template> {
  return parseApiJson(
    apiFetch(`${templatesEndpoint}/${encodeURIComponent(templateId)}`),
    templateFromAPISchema,
  )
}

export function createTemplateFromAPI(input: CreateTemplateInput): Promise<Template> {
  return parseApiJson(
    apiFetch(templatesEndpoint, request('POST', createTemplateInputSchema.parse(input))),
    templateFromAPISchema,
  )
}

export function updateTemplateFromAPI({
  templateId,
  type: _immutableType,
  ...input
}: UpdateTemplateInput & { type?: Template['type'] }): Promise<Template> {
  return parseApiJson(
    apiFetch(
      `${templatesEndpoint}/${encodeURIComponent(templateId)}`,
      request('PATCH', updateTemplateInputSchema.parse(input)),
    ),
    templateFromAPISchema,
  )
}

export async function deleteTemplateFromAPI(templateId: string) {
  await apiFetch(`${templatesEndpoint}/${encodeURIComponent(templateId)}`, {
    method: 'DELETE',
  })
}

export function duplicateTemplateFromAPI(templateId: string): Promise<Template> {
  return parseApiJson(
    apiFetch(
      `${templatesEndpoint}/${encodeURIComponent(templateId)}/duplicate`,
      request('POST'),
    ),
    templateFromAPISchema,
  )
}
