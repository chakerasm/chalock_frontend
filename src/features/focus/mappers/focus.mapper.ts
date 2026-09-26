import type {
  ActiveFocusTimer,
  ActiveFocusTimerFromAPI,
  FocusSession,
  FocusSessionFromAPI,
  FocusTimerSnapshot,
  FocusTimerSnapshotFromAPI,
  PomodoroCycle,
  PomodoroCycleFromAPI,
  PomodoroHistoryItem,
  PomodoroHistoryItemFromAPI,
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

export function mapPomodoroCycleFromAPI(
  cycle: PomodoroCycleFromAPI,
): PomodoroCycle {
  return { ...cycle }
}

export function mapPomodoroCycleToAPI(
  cycle: PomodoroCycle,
): PomodoroCycleFromAPI {
  return { ...cycle }
}

export function mapPomodoroHistoryItemFromAPI(
  item: PomodoroHistoryItemFromAPI,
): PomodoroHistoryItem {
  return { ...item }
}

export function mapPomodoroHistoryItemToAPI(
  item: PomodoroHistoryItem,
): PomodoroHistoryItemFromAPI {
  return { ...item }
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
    activePomodoro: snapshot.activePomodoro
      ? mapPomodoroCycleFromAPI(snapshot.activePomodoro)
      : null,
    activeTimer: snapshot.activeTimer
      ? mapActiveFocusTimerFromAPI(snapshot.activeTimer)
      : null,
    pomodoroHistory: snapshot.pomodoroHistory.map(
      mapPomodoroHistoryItemFromAPI,
    ),
    savedSessions: snapshot.savedSessions.map(mapFocusSessionFromAPI),
  }
}
