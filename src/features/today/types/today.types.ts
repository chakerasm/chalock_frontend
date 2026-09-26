export type TodayTaskPriority = 'high' | 'low' | 'medium'

export type TodayTaskStatus = 'todo' | 'in_progress' | 'completed' | 'cancelled'

export type TodayTaskFromAPI = {
  dueTime?: string
  estimatedMinutes?: number
  id: string
  priority?: TodayTaskPriority
  status: TodayTaskStatus
  title: string
}

export type TodayTask = TodayTaskFromAPI

export type TodayHabitFromAPI = {
  completed: boolean
  currentCount?: number
  currentDayCount?: number
  id: string
  isWeeklyTarget?: boolean
  name: string
  targetCount?: number
}

export type TodayHabit = TodayHabitFromAPI

export type FocusSummaryFromAPI = {
  completedMinutes: number
  completedSessions: number
}

export type FocusSummary = FocusSummaryFromAPI

export type ActiveFocusSessionFromAPI = {
  elapsedSeconds: number
  id: string
  startedAt?: string
  status: 'active' | 'paused'
  taskTitle?: string
}

export type ActiveFocusSession = ActiveFocusSessionFromAPI

export type ActiveGoalFromAPI = {
  currentValue: number
  id: string
  name: string
  targetDate?: string
  targetValue: number
}

export type ActiveGoal = ActiveGoalFromAPI

export type TodayDashboardFromAPI = {
  activeFocusSession: ActiveFocusSessionFromAPI | null
  activeGoals: ActiveGoalFromAPI[]
  date: string
  focusSummary: FocusSummaryFromAPI
  scheduledHabits: TodayHabitFromAPI[]
  tasks: TodayTaskFromAPI[]
}

export type TodayDashboard = {
  activeFocusSession: ActiveFocusSession | null
  activeGoals: ActiveGoal[]
  date: string
  focusSummary: FocusSummary
  scheduledHabits: TodayHabit[]
  tasks: TodayTask[]
}

export type CreateTodayTaskInput = {
  title: string
}

export type UpdateTodayTaskInput = {
  completed: boolean
  taskId: string
}

export type UpdateHabitCheckInInput = {
  action: 'complete' | 'decrement' | 'increment'
  currentDayCount?: number
  habitId: string
  currentCount?: number
  isWeeklyTarget?: boolean
  targetCount?: number
}

export type UpdateFocusSessionInput = {
  elapsedSeconds: number
  sessionId: string
  status: 'active' | 'paused'
}

export type StartFocusSessionInput = {
  taskTitle?: string
}

export type CreateQuickNoteInput = {
  content: string
}

export type QuickNoteFromAPI = {
  content: string
  createdAt: string
  id: string
}

export type QuickNote = QuickNoteFromAPI
