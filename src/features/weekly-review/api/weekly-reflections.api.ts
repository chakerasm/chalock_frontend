import { z } from 'zod'
import { weeklyReflectionSchema } from '@/features/weekly-review/schemas/weekly-review.schemas'
import type { WeeklyReflectionFromAPI } from '@/features/weekly-review/types/weekly-review.types'
import { ApiError, apiFetch } from '@/lib/api/client'

const schema = weeklyReflectionSchema.extend({
  updatedAt: z.string().datetime(),
})
const endpoint = (week: string) =>
  `/api/weekly-reviews/${encodeURIComponent(week)}`

export async function getWeeklyReflectionFromAPI(
  week: string,
): Promise<WeeklyReflectionFromAPI | undefined> {
  try {
    return schema.parse(await (await apiFetch(endpoint(week))).json())
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return undefined
    throw error
  }
}

export async function saveWeeklyReflectionToAPI(
  reflection: Omit<WeeklyReflectionFromAPI, 'updatedAt'>,
): Promise<WeeklyReflectionFromAPI> {
  return schema.parse(
    await (
      await apiFetch(endpoint(reflection.weekStart), {
        method: 'PUT',
        body: JSON.stringify(reflection),
        headers: { 'Content-Type': 'application/json' },
      })
    ).json(),
  )
}
