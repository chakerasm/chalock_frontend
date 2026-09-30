export type ReminderStatus =
  | 'scheduled'
  | 'triggered'
  | 'completed'
  | 'dismissed'
  | 'cancelled'

export type ReminderEntityType =
  | 'task'
  | 'subscription'
  | 'habit'
  | 'goal'
  | 'time_block'
  | 'custom'

export type ReminderOffsetUnit = 'minute' | 'hour' | 'day' | 'week'

export type ReminderOffset = {
  unit: ReminderOffsetUnit
  value: number
}

export type ReminderRecurrence = {
  dayOfMonth?: number
  daysOfWeek?: number[]
  endDate?: string
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
  interval: number
  month?: number
}

export type ReminderFromAPI = {
  advanceOffset?: ReminderOffset
  createdAt: string
  entityId?: string
  entityType?: ReminderEntityType
  id: string
  lastHandledAt?: string
  note?: string
  recurrence?: ReminderRecurrence
  snoozedUntil?: string
  status: ReminderStatus
  title: string
  triggerAt?: string
  updatedAt: string
}

export type Reminder = ReminderFromAPI

export type CreateReminderInput = Pick<
  Reminder,
  | 'advanceOffset'
  | 'entityId'
  | 'entityType'
  | 'note'
  | 'recurrence'
  | 'title'
  | 'triggerAt'
>

export type UpdateReminderInput = Partial<CreateReminderInput> & {
  reminderId: string
  status?: ReminderStatus
}

export type ReminderEntityReference = {
  id: string
  label: string
  referenceAt?: string
  type: Exclude<ReminderEntityType, 'custom'>
}

export type ResolvedReminder = Reminder & {
  isOverdue: boolean
  nextTriggerAt?: string
  resolvedStatus: ReminderStatus
}
