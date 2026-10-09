export type TimeBlockCategory =
  | 'focus'
  | 'work'
  | 'personal'
  | 'study'
  | 'fitness'
  | 'break'
  | 'routine'
  | 'other'

export type TimeBlockStatus =
  | 'planned'
  | 'in_progress'
  | 'completed'
  | 'cancelled'

import type {
  RecurrenceRule,
  RecurringEditScope,
} from '@/lib/recurrence/recurrence.types'

export type PlannerRecurrence = RecurrenceRule
export type { RecurringEditScope }

export type TimeBlockFromAPI = {
  category?: TimeBlockCategory
  createdAt: string
  date: string
  description?: string
  endTime: string
  focusSessionId?: string
  goalId?: string
  id: string
  /** Present for generated occurrences returned by Planner range queries. */
  occurrenceDate?: string
  recurrence?: PlannerRecurrence
  seriesId?: string
  startTime: string
  status: TimeBlockStatus
  taskId?: string
  title: string
  updatedAt: string
}

export type TimeBlock = TimeBlockFromAPI

export type CreateTimeBlockInput = Pick<
  TimeBlock,
  | 'category'
  | 'date'
  | 'description'
  | 'endTime'
  | 'goalId'
  | 'startTime'
  | 'taskId'
  | 'title'
> & {
  recurrence?: PlannerRecurrence
}

export type UpdateTimeBlockInput = Partial<CreateTimeBlockInput> & {
  focusSessionId?: string
  status?: TimeBlockStatus
  /** Required by the API when changing a generated occurrence. */
  occurrenceDate?: string
  recurrence?: PlannerRecurrence
  scope?: RecurringEditScope
  timeBlockId: string
}

export type DeleteTimeBlockInput = {
  occurrenceDate?: string
  scope?: RecurringEditScope
  timeBlockId: string
}
