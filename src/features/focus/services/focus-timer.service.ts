import {
  getFocusTimerSnapshotFromAPI,
  startFocusTimerFromAPI,
  startPomodoroFromAPI,
  updateFocusTimerFromAPI,
  updatePomodoroFromAPI,
} from '@/features/focus/api/focus.api'
import type {
  FocusTimerSnapshot,
  StartFocusTimerInput,
  StartPomodoroInput,
} from '@/features/focus/types/focus.types'
import {
  formatFocusTimerDuration,
  getFocusElapsedSeconds,
  getFocusRemainingSeconds,
} from './focus-timer-calculations'

export {
  formatFocusTimerDuration,
  getFocusElapsedSeconds,
  getFocusRemainingSeconds,
}
export const getFocusTimerSnapshot = (): FocusTimerSnapshot => ({
  activeTimer: null,
  activePomodoro: null,
  savedSessions: [],
  pomodoroHistory: [],
})
export const getFocusSnapshot = getFocusTimerSnapshotFromAPI
export const startFocusTimer = startFocusTimerFromAPI
export const updateFocusTimer = updateFocusTimerFromAPI
export const startPomodoroCycle = startPomodoroFromAPI
export const updatePomodoroCycle = updatePomodoroFromAPI
export function persistFocusTimerSnapshot(_: FocusTimerSnapshot) {}
export function subscribeToFocusTimerSnapshot(_: () => void) {
  return () => undefined
}
export type { StartFocusTimerInput, StartPomodoroInput }
