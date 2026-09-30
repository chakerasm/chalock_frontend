import { timeBlockFromAPISchema } from '@/features/planner/schemas/planner.schemas'
import type { TimeBlockFromAPI } from '@/features/planner/types/planner.types'

const storageKey = 'chalock.planner.v1'

export function getTimeBlocksFromStorage(): TimeBlockFromAPI[] {
  if (typeof window === 'undefined') return []

  const stored = window.localStorage.getItem(storageKey)
  if (!stored) return []

  try {
    return timeBlockFromAPISchema.array().parse(JSON.parse(stored))
  } catch {
    window.localStorage.removeItem(storageKey)
    return []
  }
}

export function saveTimeBlocksToStorage(blocks: TimeBlockFromAPI[]) {
  if (typeof window !== 'undefined')
    window.localStorage.setItem(storageKey, JSON.stringify(blocks))
}
