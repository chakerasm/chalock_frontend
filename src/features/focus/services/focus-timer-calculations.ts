import type { ActiveFocusTimer } from '../types/focus.types'

function toIsoString(now: number) {
  return new Date(now).toISOString()
}

export function getFocusElapsedSeconds(
  session: ActiveFocusTimer,
  now = Date.now(),
) {
  if (session.status !== 'active' || !session.runningSince) {
    return session.durationSeconds
  }

  return (
    session.durationSeconds +
    Math.max(0, Math.floor((now - Date.parse(session.runningSince)) / 1_000))
  )
}

export function getFocusRemainingSeconds(
  session: ActiveFocusTimer,
  now = Date.now(),
) {
  if (!session.plannedDurationSeconds) return undefined
  return Math.max(
    0,
    session.plannedDurationSeconds - getFocusElapsedSeconds(session, now),
  )
}

export function formatFocusTimerDuration(totalSeconds: number) {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds))
  const hours = Math.floor(safeSeconds / 3_600)
  const minutes = Math.floor((safeSeconds % 3_600) / 60)
  const seconds = safeSeconds % 60

  return hours > 0
    ? [hours, minutes, seconds]
        .map((value) => String(value).padStart(2, '0'))
        .join(':')
    : [minutes, seconds]
        .map((value) => String(value).padStart(2, '0'))
        .join(':')
}

export function completeFocusTimer(
  session: ActiveFocusTimer,
  now = Date.now(),
): ActiveFocusTimer {
  const elapsedSeconds = getFocusElapsedSeconds(session, now)
  const durationSeconds = session.plannedDurationSeconds
    ? Math.min(elapsedSeconds, session.plannedDurationSeconds)
    : elapsedSeconds

  return {
    ...session,
    durationSeconds,
    endedAt: toIsoString(now),
    runningSince: undefined,
    status: 'completed',
  }
}
