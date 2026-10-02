import {
  getWeeklyReflectionFromAPI,
  saveWeeklyReflectionToAPI,
} from '@/features/weekly-review/api/weekly-reflections.api'
import { mapWeeklyReflectionFromAPI } from '@/features/weekly-review/mappers/weekly-review.mapper'
import { weeklyReflectionSchema } from '@/features/weekly-review/schemas/weekly-review.schemas'
import type { WeeklyReflection } from '@/features/weekly-review/types/weekly-review.types'
export async function getWeeklyReflection(week: string) {
  const value = await getWeeklyReflectionFromAPI(week)
  return value ? mapWeeklyReflectionFromAPI(value) : undefined
}
export async function saveWeeklyReflection(
  reflection: Omit<WeeklyReflection, 'updatedAt'>,
): Promise<WeeklyReflection> {
  return mapWeeklyReflectionFromAPI(
    await saveWeeklyReflectionToAPI(weeklyReflectionSchema.parse(reflection)),
  )
}
