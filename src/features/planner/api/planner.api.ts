import { timeBlockFromAPISchema } from '@/features/planner/schemas/planner.schemas'
import type {
  CreateTimeBlockInput,
  TimeBlockFromAPI,
  UpdateTimeBlockInput,
} from '@/features/planner/types/planner.types'
import { apiFetch } from '@/lib/api/client'
const endpoint = '/api/time-blocks'
const json = <T>(p: Promise<Response>, s: { parse: (x: unknown) => T }) =>
  p.then(async (r) => s.parse(await r.json()))
const request = (method: 'POST' | 'PATCH', body: unknown) => ({
  body: JSON.stringify(body),
  headers: { 'Content-Type': 'application/json' },
  method,
})
const listSchema = {
  parse: (value: unknown) =>
    Array.isArray(value)
      ? value.map((item) => timeBlockFromAPISchema.parse(item))
      : (value as { data: unknown[] }).data.map((item) =>
          timeBlockFromAPISchema.parse(item),
        ),
}
export function getTimeBlocksFromAPI(query = ''): Promise<TimeBlockFromAPI[]> {
  return json(apiFetch(`${endpoint}${query}`), listSchema)
}
export function createTimeBlockFromAPI(input: CreateTimeBlockInput) {
  return json(
    apiFetch(endpoint, request('POST', input)),
    timeBlockFromAPISchema,
  )
}
export function updateTimeBlockFromAPI({
  timeBlockId,
  ...input
}: UpdateTimeBlockInput) {
  return json(
    apiFetch(
      `${endpoint}/${encodeURIComponent(timeBlockId)}`,
      request('PATCH', input),
    ),
    timeBlockFromAPISchema,
  )
}
export async function deleteTimeBlockFromAPI(id: string) {
  await apiFetch(`${endpoint}/${encodeURIComponent(id)}`, { method: 'DELETE' })
}
