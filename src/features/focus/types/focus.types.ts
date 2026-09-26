export type FocusSessionType = 'stopwatch' | 'timer' | 'pomodoro' | 'manual'

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

export type FocusTimerSnapshotFromAPI = {
  activeTimer: ActiveFocusTimerFromAPI | null
  savedSessions: FocusSessionFromAPI[]
}

export type FocusTimerSnapshot = {
  activeTimer: ActiveFocusTimer | null
  savedSessions: FocusSession[]
}

export type StartFocusTimerInput = {
  goalId?: string
  plannedDurationSeconds?: number
  taskId?: string
  type: 'stopwatch' | 'timer'
}
