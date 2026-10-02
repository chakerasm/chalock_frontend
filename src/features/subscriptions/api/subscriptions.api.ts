import { z } from 'zod'
import {
  subscriptionFromAPISchema,
  subscriptionsFromAPISchema,
} from '@/features/subscriptions/schemas/subscriptions.schemas'
import type {
  CreateSubscriptionInput,
  SubscriptionFromAPI,
  SubscriptionListFilter,
  UpdateSubscriptionInput,
} from '@/features/subscriptions/types/subscriptions.types'
import { apiFetch } from '@/lib/api/client'
import { parseApiJson } from '@/lib/api/response'

const subscriptionsEndpoint = '/api/subscriptions'
const subscriptionsListResponseSchema = z.union([
  subscriptionsFromAPISchema,
  z.object({ data: subscriptionsFromAPISchema }).transform(({ data }) => data),
])

async function parseResponse<T>(
  response: Response | Promise<Response>,
  schema: { parse: (data: unknown) => T },
): Promise<T> {
  return parseApiJson(response, schema)
}

function createSearchParams(filters: SubscriptionListFilter) {
  const params = new URLSearchParams()
  if (filters.status) params.set('status', filters.status)
  if (filters.category) params.set('category', filters.category)
  if (filters.search?.trim()) params.set('search', filters.search.trim())
  const query = params.toString()
  return query ? `?${query}` : ''
}

function jsonRequest(method: 'PATCH' | 'POST', body: unknown) {
  return {
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
    method,
  }
}

export function getSubscriptionsFromAPI(
  filters: SubscriptionListFilter = {},
): Promise<SubscriptionFromAPI[]> {
  return parseResponse(
    apiFetch(`${subscriptionsEndpoint}${createSearchParams(filters)}`),
    subscriptionsListResponseSchema,
  )
}

export function getSubscriptionFromAPI(subscriptionId: string) {
  return parseResponse(
    apiFetch(`${subscriptionsEndpoint}/${encodeURIComponent(subscriptionId)}`),
    subscriptionFromAPISchema,
  )
}

export function createSubscriptionFromAPI(input: CreateSubscriptionInput) {
  return parseResponse(
    apiFetch(subscriptionsEndpoint, jsonRequest('POST', input)),
    subscriptionFromAPISchema,
  )
}

export function updateSubscriptionFromAPI({
  subscriptionId,
  ...input
}: UpdateSubscriptionInput) {
  return parseResponse(
    apiFetch(
      `${subscriptionsEndpoint}/${encodeURIComponent(subscriptionId)}`,
      jsonRequest('PATCH', input),
    ),
    subscriptionFromAPISchema,
  )
}

export async function deleteSubscriptionFromAPI(subscriptionId: string) {
  await apiFetch(subscriptionsEndpoint + '/' + encodeURIComponent(subscriptionId), { method: 'DELETE' })
}
