export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'cancelled'

export type TaskPriority = 'low' | 'medium' | 'high'

export type TaskFromAPI = {
  completedAt?: string
  createdAt: string
  description?: string
  dueDate?: string
  dueTime?: string
  estimatedMinutes?: number
  goalId?: string | null
  id: string
  priority: TaskPriority
  /** The local date represented by a generated series occurrence. */
  occurrenceDate?: string
  recurrence?: RecurrenceRule
  seriesId?: string
  status: TaskStatus
  title: string
  updatedAt: string
}

export type Task = TaskFromAPI

export type TaskListResponseFromAPI = {
  data: TaskFromAPI[]
  nextCursor: string | null
}

export type CreateTaskInput = {
  description?: string
  dueDate?: string
  dueTime?: string
  estimatedMinutes?: number
  goalId?: string | null
  priority?: TaskPriority
  recurrence?: RecurrenceRule
  title: string
}

/** Task data accepted by the Goal bulk-import endpoint. */
export type BulkCreateGoalTaskInput = Omit<CreateTaskInput, 'goalId'>

export type BulkCreateGoalTasksRequest = {
  tasks: BulkCreateGoalTaskInput[]
}

export type BulkCreateGoalTasksResponseFromAPI = {
  created: number
}

export type BulkTaskValidationIssue = {
  code?: string
  field?: keyof BulkCreateGoalTaskInput
  index: number
  message: string
}

export type TaskFormSubmitInput = Omit<CreateTaskInput, 'goalId'> & {
  goalId?: string | null
}

export type UpdateTaskInput = {
  description?: string
  /** Use null to explicitly remove an existing due date. */
  dueDate?: string | null
  dueTime?: string
  estimatedMinutes?: number
  goalId?: string | null
  priority?: TaskPriority
  /** Required for a generated occurrence; scopes match Planner. */
  occurrenceDate?: string
  recurrence?: RecurrenceRule
  scope?: RecurringEditScope
  status?: TaskStatus
  taskId: string
  /** Required by the backend because UpdateTaskDto extends CreateTaskDto. */
  title: string
}

export type DeleteTaskInput = {
  occurrenceDate?: string
  scope?: RecurringEditScope
  taskId: string
}

export type TaskListFilters = {
  cursor?: string
  dueFrom?: string
  dueTo?: string
  goalId?: string
  limit?: number
  priority?: TaskPriority
  search?: string
  status?: TaskStatus
}

export type TaskView = 'today' | 'upcoming' | 'all' | 'completed'

import type {
  RecurrenceRule,
  RecurringEditScope,
} from '@/lib/recurrence/recurrence.types'
