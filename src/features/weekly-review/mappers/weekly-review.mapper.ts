import type {
  WeeklyReflection,
  WeeklyReflectionFromAPI,
} from '@/features/weekly-review/types/weekly-review.types'

export function mapWeeklyReflectionFromAPI(
  reflection: WeeklyReflectionFromAPI,
): WeeklyReflection {
  return { ...reflection }
}

export function mapWeeklyReflectionToAPI(
  reflection: WeeklyReflection,
): WeeklyReflectionFromAPI {
  return { ...reflection }
}
