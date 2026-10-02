import { z } from 'zod'
import { weeklyReflectionSchema } from '@/features/weekly-review/schemas/weekly-review.schemas'
import type { WeeklyReflectionFromAPI } from '@/features/weekly-review/types/weekly-review.types'
import { ApiError, apiFetch } from '@/lib/api/client'
import { parseApiJson } from '@/lib/api/response'

const schema = weeklyReflectionSchema.extend({
  updatedAt: z.string().datetime(),
})
const endpoint = (week: string) =>
  `/api/weekly-reviews/${encodeURIComponent(week)}`

export async function getWeeklyReflectionFromAPI(
  week: string,
): Promise<WeeklyReflectionFromAPI | undefined> {
  try {
    return await parseApiJson(apiFetch(endpoint(week)), schema)
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return undefined
    throw error
  }
}

export async function saveWeeklyReflectionToAPI(
  reflection: Omit<WeeklyReflectionFromAPI, 'updatedAt'>,
): Promise<WeeklyReflectionFromAPI> {
  return parseApiJson(
    apiFetch(endpoint(reflection.weekStart), {
      method: 'PUT',
      body: JSON.stringify(reflection),
      headers: { 'Content-Type': 'application/json' },
    }),
    schema,
  )
}
