export type CalendarSourceType =
  | 'planner'
  | 'task'
  | 'reminder'
  | 'goal'
  | 'subscription'
  | 'finance'

export type CalendarItem = {
  allDay: boolean
  end?: string
  id: string
  sourceId: string
  sourceType: CalendarSourceType
  start: string
  status?: string
  title: string
}

/** Transport model returned by GET /api/v1/calendar. */
export type CalendarItemFromAPI = CalendarItem

export type CalendarQuery = {
  from: string
  to: string
}

export type CalendarFilter = 'all' | CalendarSourceType
export type CalendarView = 'month' | 'week'
