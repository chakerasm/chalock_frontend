import {
  getFocusTimerSnapshotFromStorage,
  saveFocusTimerSnapshotToStorage,
} from '@/features/focus/api/focus.local-storage'
import { mapFocusTimerSnapshotFromAPI } from '@/features/focus/mappers/focus.mapper'
import { startFocusTimerInputSchema } from '@/features/focus/schemas/focus.schemas'
import type {
  ActiveFocusTimer,
  FocusSession,
  FocusTimerSnapshot,
  StartFocusTimerInput,
} from '@/features/focus/types/focus.types'
import {
  completeFocusTimer,
  formatFocusTimerDuration,
  getFocusElapsedSeconds,
  getFocusRemainingSeconds,
} from './focus-timer-calculations'

function createSessionId() {
  return `focus-${crypto.randomUUID()}`
}

export {
  completeFocusTimer,
  formatFocusTimerDuration,
  getFocusElapsedSeconds,
  getFocusRemainingSeconds,
}

export function getFocusTimerSnapshot(): FocusTimerSnapshot {
  return mapFocusTimerSnapshotFromAPI(getFocusTimerSnapshotFromStorage())
}

export function persistFocusTimerSnapshot(snapshot: FocusTimerSnapshot) {
  saveFocusTimerSnapshotToStorage(snapshot)
}

export function startFocusTimer(
  input: StartFocusTimerInput,
  now = Date.now(),
): ActiveFocusTimer {
  const parsedInput = startFocusTimerInputSchema.parse(input)
  const timestamp = new Date(now).toISOString()

  return {
    durationSeconds: 0,
    goalId: parsedInput.goalId,
    id: createSessionId(),
    plannedDurationSeconds: parsedInput.plannedDurationSeconds,
    runningSince: timestamp,
    startedAt: timestamp,
    status: 'active',
    taskId: parsedInput.taskId,
    type: parsedInput.type,
  }
}

export function pauseFocusTimer(
  session: ActiveFocusTimer,
  now = Date.now(),
): ActiveFocusTimer {
  return {
    ...session,
    durationSeconds: getFocusElapsedSeconds(session, now),
    runningSince: undefined,
    status: 'paused',
  }
}

export function resumeFocusTimer(
  session: ActiveFocusTimer,
  now = Date.now(),
): ActiveFocusTimer {
  const timestamp = new Date(now).toISOString()
  return {
    ...session,
    runningSince: timestamp,
    startedAt: session.startedAt ?? timestamp,
    status: 'active',
  }
}

export function resetStopwatch(session: ActiveFocusTimer): ActiveFocusTimer {
  return {
    ...session,
    durationSeconds: 0,
    endedAt: undefined,
    runningSince: undefined,
    startedAt: undefined,
    status: 'paused',
  }
}

export function restartFocusTimer(
  session: ActiveFocusTimer,
  now = Date.now(),
): ActiveFocusTimer {
  return startFocusTimer(
    {
      goalId: session.goalId,
      plannedDurationSeconds: session.plannedDurationSeconds,
      taskId: session.taskId,
      type: session.type === 'timer' ? 'timer' : 'stopwatch',
    },
    now,
  )
}

export function saveFocusTimerSession(
  snapshot: FocusTimerSnapshot,
  now = Date.now(),
): FocusTimerSnapshot {
  if (!snapshot.activeTimer) return snapshot

  const completedSession = completeFocusTimer(snapshot.activeTimer, now)
  const { runningSince: _runningSince, ...session } = completedSession
  const savedSession: FocusSession = session

  return {
    activeTimer: null,
    savedSessions: [savedSession, ...snapshot.savedSessions].slice(0, 50),
  }
}
