/**
 * A local-calendar recurrence rule shared by scheduled product entities.
 * Weekdays are Sunday=0 through Saturday=6; dates must never be converted to UTC.
 */
export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly'

export type RecurrenceEnd = 'never' | 'on_date' | 'after_occurrences'

export type RecurrenceRule = {
  dayOfMonth?: number
  ends: RecurrenceEnd
  endsOn?: string
  frequency: RecurrenceFrequency
  interval: number
  month?: number
  occurrenceCount?: number
  startsOn: string
  timezone: string
  weekday?: number
  weekdays?: number[]
  weekOfMonth?: -1 | 1 | 2 | 3 | 4 | 5
}

export type RecurringEditScope = 'this' | 'future' | 'series'
