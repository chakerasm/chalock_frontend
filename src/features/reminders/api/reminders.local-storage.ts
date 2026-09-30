import { reminderFromAPISchema } from '@/features/reminders/schemas/reminders.schemas'
import type { ReminderFromAPI } from '@/features/reminders/types/reminders.types'

const storageKey = 'chalock.reminders.v1'

export function getRemindersFromStorage(): ReminderFromAPI[] {
  if (typeof window === 'undefined') return []
  const value = window.localStorage.getItem(storageKey)
  if (!value) return []
  try {
    return reminderFromAPISchema.array().parse(JSON.parse(value))
  } catch {
    window.localStorage.removeItem(storageKey)
    return []
  }
}

export function saveRemindersToStorage(reminders: ReminderFromAPI[]) {
  if (typeof window !== 'undefined')
    window.localStorage.setItem(storageKey, JSON.stringify(reminders))
}
