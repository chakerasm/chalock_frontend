import type {
  ActiveFocusTimer,
  ActiveFocusTimerFromAPI,
  FocusSession,
  FocusSessionFromAPI,
  FocusTimerSnapshot,
  FocusTimerSnapshotFromAPI,
} from '@/features/focus/types/focus.types'

export function mapFocusSessionFromAPI(
  session: FocusSessionFromAPI,
): FocusSession {
  return { ...session }
}

export function mapFocusSessionToAPI(
  session: FocusSession,
): FocusSessionFromAPI {
  return { ...session }
}

function mapActiveFocusTimerFromAPI(
  timer: ActiveFocusTimerFromAPI,
): ActiveFocusTimer {
  return { ...timer }
}

export function mapFocusTimerSnapshotFromAPI(
  snapshot: FocusTimerSnapshotFromAPI,
): FocusTimerSnapshot {
  return {
    activeTimer: snapshot.activeTimer
      ? mapActiveFocusTimerFromAPI(snapshot.activeTimer)
      : null,
    savedSessions: snapshot.savedSessions.map(mapFocusSessionFromAPI),
  }
}
