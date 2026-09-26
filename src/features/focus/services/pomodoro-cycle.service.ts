import type {
  PomodoroCompletionState,
  PomodoroCycle,
  PomodoroHistoryItem,
  StartPomodoroInput,
} from '../types/focus.types'

export const pomodoroDefaults = {
  focusDurationSeconds: 25 * 60,
  focusSessionsUntilLongBreak: 4,
  longBreakDurationSeconds: 15 * 60,
  shortBreakDurationSeconds: 5 * 60,
} as const

function createPomodoroId(prefix: 'pomodoro' | 'pomodoro-phase') {
  return `${prefix}-${crypto.randomUUID()}`
}

function toIsoString(now: number) {
  return new Date(now).toISOString()
}

export function getPomodoroPhaseDuration(cycle: PomodoroCycle) {
  if (cycle.phase === 'focus') return cycle.focusDurationSeconds
  if (cycle.phase === 'short_break') return cycle.shortBreakDurationSeconds
  return cycle.longBreakDurationSeconds
}

export function getPomodoroPhaseElapsedSeconds(
  cycle: PomodoroCycle,
  now = Date.now(),
) {
  if (cycle.status !== 'active' || !cycle.phaseStartedAt) {
    return cycle.phaseElapsedSeconds
  }

  return (
    cycle.phaseElapsedSeconds +
    Math.max(0, Math.floor((now - Date.parse(cycle.phaseStartedAt)) / 1_000))
  )
}

export function getPomodoroRemainingSeconds(
  cycle: PomodoroCycle,
  now = Date.now(),
) {
  return Math.max(
    0,
    getPomodoroPhaseDuration(cycle) -
      getPomodoroPhaseElapsedSeconds(cycle, now),
  )
}

export function getPomodoroProgress(cycle: PomodoroCycle, now = Date.now()) {
  return Math.min(
    100,
    (getPomodoroPhaseElapsedSeconds(cycle, now) /
      getPomodoroPhaseDuration(cycle)) *
      100,
  )
}

export function getPomodoroSessionNumber(cycle: PomodoroCycle) {
  if (cycle.phase === 'focus') return cycle.completedFocusSessions + 1
  return Math.max(1, cycle.completedFocusSessions)
}

export function startPomodoro(
  input: StartPomodoroInput,
  now = Date.now(),
): PomodoroCycle {
  const timestamp = toIsoString(now)

  return {
    ...pomodoroDefaults,
    completedFocusSessions: 0,
    goalId: input.goalId,
    id: createPomodoroId('pomodoro'),
    intention: input.intention,
    phase: 'focus',
    phaseElapsedSeconds: 0,
    phaseStartedAt: timestamp,
    startedAt: timestamp,
    status: 'active',
    taskId: input.taskId,
  }
}

export function pausePomodoro(
  cycle: PomodoroCycle,
  now = Date.now(),
): PomodoroCycle {
  return {
    ...cycle,
    phaseElapsedSeconds: getPomodoroPhaseElapsedSeconds(cycle, now),
    phaseStartedAt: undefined,
    status: 'paused',
  }
}

export function resumePomodoro(
  cycle: PomodoroCycle,
  now = Date.now(),
): PomodoroCycle {
  return {
    ...cycle,
    phaseStartedAt: toIsoString(now),
    status: 'active',
  }
}

function createHistoryItem(
  cycle: PomodoroCycle,
  completionState: PomodoroCompletionState,
  now: number,
): PomodoroHistoryItem {
  return {
    completionState,
    durationSeconds: Math.min(
      getPomodoroPhaseElapsedSeconds(cycle, now),
      getPomodoroPhaseDuration(cycle),
    ),
    endedAt: toIsoString(now),
    goalId: cycle.goalId,
    id: createPomodoroId('pomodoro-phase'),
    intention: cycle.intention,
    taskId: cycle.taskId,
  }
}

function getNextPhase(
  cycle: PomodoroCycle,
  completionState: PomodoroCompletionState,
) {
  if (cycle.phase === 'short_break') {
    return {
      completedFocusSessions: cycle.completedFocusSessions,
      phase: 'focus' as const,
    }
  }

  if (cycle.phase === 'long_break') {
    return { completedFocusSessions: 0, phase: 'focus' as const }
  }

  const completedFocusSessions =
    completionState === 'completed'
      ? cycle.completedFocusSessions + 1
      : cycle.completedFocusSessions
  const shouldTakeLongBreak =
    completedFocusSessions === cycle.focusSessionsUntilLongBreak

  return {
    completedFocusSessions,
    phase: shouldTakeLongBreak
      ? ('long_break' as const)
      : ('short_break' as const),
  }
}

function moveToNextPhase(
  cycle: PomodoroCycle,
  completionState: PomodoroCompletionState,
  now: number,
) {
  const next = getNextPhase(cycle, completionState)
  const record =
    cycle.phase === 'focus'
      ? createHistoryItem(cycle, completionState, now)
      : undefined

  return {
    cycle: {
      ...cycle,
      ...next,
      phaseElapsedSeconds: 0,
      phaseStartedAt: cycle.status === 'active' ? toIsoString(now) : undefined,
    },
    record,
  }
}

export function completePomodoroPhase(cycle: PomodoroCycle, now = Date.now()) {
  return moveToNextPhase(cycle, 'completed', now)
}

export function skipPomodoroPhase(cycle: PomodoroCycle, now = Date.now()) {
  return moveToNextPhase(cycle, 'skipped', now)
}

export function cancelPomodoro(cycle: PomodoroCycle, now = Date.now()) {
  return cycle.phase === 'focus'
    ? createHistoryItem(cycle, 'cancelled', now)
    : undefined
}
