import type { WeeklyReflectionFromAPI } from '@/features/weekly-review/types/weekly-review.types'

const storageKey = 'chalock.weekly-reflections.v1'

function getAll() {
  if (typeof window === 'undefined')
    return {} as Record<string, WeeklyReflectionFromAPI>
  try {
    return JSON.parse(
      window.localStorage.getItem(storageKey) ?? '{}',
    ) as Record<string, WeeklyReflectionFromAPI>
  } catch {
    window.localStorage.removeItem(storageKey)
    return {} as Record<string, WeeklyReflectionFromAPI>
  }
}

export function getWeeklyReflectionFromStorage(weekStart: string) {
  return getAll()[weekStart]
}

export function saveWeeklyReflectionToStorage(
  reflection: WeeklyReflectionFromAPI,
) {
  if (typeof window === 'undefined') return
  const reflections = getAll()
  window.localStorage.setItem(
    storageKey,
    JSON.stringify({ ...reflections, [reflection.weekStart]: reflection }),
  )
}
