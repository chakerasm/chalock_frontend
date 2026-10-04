export type FocusSessionType = 'stopwatch' | 'timer' | 'manual'

export type FocusAction = 'pause' | 'resume' | 'complete' | 'cancel'

export type FocusSessionStatus = 'active' | 'paused' | 'completed' | 'cancelled'

export type FocusSessionFromAPI = {
  durationSeconds: number
  endedAt?: string
  goalId?: string
  id: string
  plannedDurationSeconds?: number
  startedAt?: string
  status: FocusSessionStatus
  taskId?: string
  type: FocusSessionType
}

export type FocusSession = FocusSessionFromAPI

export type ActiveFocusTimerFromAPI = FocusSessionFromAPI & {
  runningSince?: string
}

export type ActiveFocusTimer = ActiveFocusTimerFromAPI

export type PomodoroPhase = 'focus' | 'short_break' | 'long_break'

export type PomodoroPhaseStatus = 'active' | 'paused'

export type PomodoroCompletionState = 'completed' | 'skipped' | 'cancelled'

export type PomodoroCycleFromAPI = {
  completedFocusSessions: number
  focusDurationSeconds: number
  focusSessionsUntilLongBreak: number
  goalId?: string
  id: string
  intention?: string
  longBreakDurationSeconds: number
  phase: PomodoroPhase
  phaseElapsedSeconds: number
  phaseStartedAt?: string
  shortBreakDurationSeconds: number
  startedAt: string
  status: PomodoroPhaseStatus
  taskId?: string
}

export type PomodoroCycle = PomodoroCycleFromAPI

export type PomodoroHistoryItemFromAPI = {
  completionState: PomodoroCompletionState
  durationSeconds: number
  endedAt: string
  goalId?: string
  id: string
  intention?: string
  taskId?: string
}

export type PomodoroHistoryItem = PomodoroHistoryItemFromAPI

export type FocusTimerSnapshotFromAPI = {
  activePomodoro: PomodoroCycleFromAPI | null
  activeTimer: ActiveFocusTimerFromAPI | null
  pomodoroHistory: PomodoroHistoryItemFromAPI[]
  savedSessions: FocusSessionFromAPI[]
}

export type FocusTimerSnapshot = {
  activePomodoro: PomodoroCycle | null
  activeTimer: ActiveFocusTimer | null
  pomodoroHistory: PomodoroHistoryItem[]
  savedSessions: FocusSession[]
}

export type StartFocusTimerInput = {
  goalId?: string
  plannedDurationSeconds?: number
  taskId?: string
  type: 'stopwatch' | 'timer'
}

export type UpdateFocusSessionInput = {
  action: FocusAction
  observedDurationSeconds?: number
}

export type StartPomodoroInput = {
  goalId?: string
  intention?: string
  taskId?: string
}
