import {
  getWeeklyReflectionFromStorage,
  saveWeeklyReflectionToStorage,
} from '@/features/weekly-review/api/weekly-reflections.local-storage'
import {
  mapWeeklyReflectionFromAPI,
  mapWeeklyReflectionToAPI,
} from '@/features/weekly-review/mappers/weekly-review.mapper'
import { weeklyReflectionSchema } from '@/features/weekly-review/schemas/weekly-review.schemas'
import type { WeeklyReflection } from '@/features/weekly-review/types/weekly-review.types'

export async function getWeeklyReflection(weekStart: string) {
  const stored = getWeeklyReflectionFromStorage(weekStart)
  return stored ? mapWeeklyReflectionFromAPI(stored) : undefined
}

export async function saveWeeklyReflection(
  reflection: Omit<WeeklyReflection, 'updatedAt'>,
): Promise<WeeklyReflection> {
  const parsed = weeklyReflectionSchema.parse(reflection)
  const saved: WeeklyReflection = {
    difficult: parsed.difficult || undefined,
    focusNextWeek: parsed.focusNextWeek || undefined,
    updatedAt: new Date().toISOString(),
    weekStart: parsed.weekStart,
    wentWell: parsed.wentWell || undefined,
  }
  saveWeeklyReflectionToStorage(mapWeeklyReflectionToAPI(saved))
  return saved
}
