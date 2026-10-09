export type GoalStatus = 'active' | 'paused' | 'completed' | 'archived'

export type GoalProgressMode = 'manual' | 'task-based'

export type GoalProgressStrategy = { mode: 'manual' } | { mode: 'task-based' }

export type GoalFromAPI = {
  completedAt?: string
  createdAt: string
  description?: string
  goalImageUrl?: string
  id: string
  progress: number
  progressStrategy: GoalProgressStrategy
  status: GoalStatus
  targetDate?: string
  title: string
  updatedAt: string
}

export type Goal = GoalFromAPI

type GoalInputBase = {
  description?: string
  goalImageUrl?: string
  targetDate?: string
  title: string
}

export type CreateGoalInput =
  | (GoalInputBase & {
      progress: number
      progressStrategy: { mode: 'manual' }
    })
  | (GoalInputBase & {
      progressStrategy: { mode: 'task-based' }
    })

export type UpdateGoalInput = Partial<CreateGoalInput> & {
  goalId: string
  status?: GoalStatus
}

export type GoalListFilter = { from?: string; status?: GoalStatus; to?: string }

export type GoalProgressSummary = {
  completedTasks: number
  isAvailable: boolean
  progress: number
  totalTasks: number
}

export type GoalFocusSummary = {
  sessionCount: number
  totalSeconds: number
}
