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

export type TimeBlockFromAPI = {
  category?: TimeBlockCategory
  createdAt: string
  date: string
  description?: string
  endTime: string
  focusSessionId?: string
  goalId?: string
  id: string
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
>

export type UpdateTimeBlockInput = Partial<CreateTimeBlockInput> & {
  focusSessionId?: string
  status?: TimeBlockStatus
  timeBlockId: string
}
