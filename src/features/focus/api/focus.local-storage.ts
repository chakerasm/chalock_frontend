import { focusTimerSnapshotFromAPISchema } from '@/features/focus/schemas/focus.schemas'
import type { FocusTimerSnapshotFromAPI } from '@/features/focus/types/focus.types'

const focusTimerStorageKey = 'daymark.focus-timer.v1'

const emptyFocusTimerSnapshot: FocusTimerSnapshotFromAPI = {
  activePomodoro: null,
  activeTimer: null,
  pomodoroHistory: [],
  savedSessions: [],
}

export function getFocusTimerSnapshotFromStorage(): FocusTimerSnapshotFromAPI {
  if (typeof window === 'undefined') return emptyFocusTimerSnapshot

  const savedValue = window.localStorage.getItem(focusTimerStorageKey)
  if (!savedValue) return emptyFocusTimerSnapshot

  try {
    return focusTimerSnapshotFromAPISchema.parse(JSON.parse(savedValue))
  } catch {
    window.localStorage.removeItem(focusTimerStorageKey)
    return emptyFocusTimerSnapshot
  }
}

export function saveFocusTimerSnapshotToStorage(
  snapshot: FocusTimerSnapshotFromAPI,
) {
  if (typeof window === 'undefined') return

  window.localStorage.setItem(focusTimerStorageKey, JSON.stringify(snapshot))
}
