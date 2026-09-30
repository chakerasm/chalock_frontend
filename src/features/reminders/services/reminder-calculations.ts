import type {
  Reminder,
  ReminderEntityReference,
  ReminderRecurrence,
  ResolvedReminder,
} from '@/features/reminders/types/reminders.types'

const offsetMilliseconds = {
  minute: 60_000,
  hour: 3_600_000,
  day: 86_400_000,
  week: 604_800_000,
}

function atLocalDay(date: Date, hours: number, minutes: number) {
  const result = new Date(date)
  result.setHours(hours, minutes, 0, 0)
  return result
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate()
}

export function getRelativeTriggerAt(
  referenceAt: string,
  offset: NonNullable<Reminder['advanceOffset']>,
) {
  return new Date(
    Date.parse(referenceAt) - offset.value * offsetMilliseconds[offset.unit],
  ).toISOString()
}

export function getNextRecurringTriggerAt(
  startAt: string,
  recurrence: ReminderRecurrence,
  after = new Date(),
) {
  const start = new Date(startAt)
  const hours = start.getHours()
  const minutes = start.getMinutes()
  const afterTime = after.getTime()
  const isAllowed = (date: Date) => date.getTime() > afterTime
  const hasEnded = (date: Date) =>
    recurrence.endDate && date > new Date(`${recurrence.endDate}T23:59:59`)

  if (recurrence.frequency === 'daily') {
    const candidate = atLocalDay(after, hours, minutes)
    if (!isAllowed(candidate))
      candidate.setDate(candidate.getDate() + recurrence.interval)
    return hasEnded(candidate) ? undefined : candidate.toISOString()
  }

  if (recurrence.frequency === 'weekly') {
    const weekdays = recurrence.daysOfWeek ?? [start.getDay()]
    for (let offset = 0; offset < 7 * recurrence.interval + 7; offset += 1) {
      const candidate = atLocalDay(after, hours, minutes)
      candidate.setDate(after.getDate() + offset)
      const weekDifference = Math.floor(
        (Date.UTC(
          candidate.getFullYear(),
          candidate.getMonth(),
          candidate.getDate(),
        ) -
          Date.UTC(start.getFullYear(), start.getMonth(), start.getDate())) /
          604_800_000,
      )
      if (
        weekDifference >= 0 &&
        weekDifference % recurrence.interval === 0 &&
        weekdays.includes(candidate.getDay()) &&
        isAllowed(candidate)
      )
        return hasEnded(candidate) ? undefined : candidate.toISOString()
    }
  }

  if (recurrence.frequency === 'monthly') {
    const day = recurrence.dayOfMonth ?? start.getDate()
    for (let offset = 0; offset < 240; offset += recurrence.interval) {
      const candidate = new Date(
        after.getFullYear(),
        after.getMonth() + offset,
        1,
      )
      candidate.setDate(
        Math.min(
          day,
          daysInMonth(candidate.getFullYear(), candidate.getMonth() + 1),
        ),
      )
      candidate.setHours(hours, minutes, 0, 0)
      if (isAllowed(candidate))
        return hasEnded(candidate) ? undefined : candidate.toISOString()
    }
  }

  const month = (recurrence.month ?? start.getMonth() + 1) - 1
  const day = recurrence.dayOfMonth ?? start.getDate()
  for (
    let year = after.getFullYear();
    year < after.getFullYear() + 20;
    year += recurrence.interval
  ) {
    const candidate = new Date(
      year,
      month,
      Math.min(day, daysInMonth(year, month + 1)),
      hours,
      minutes,
    )
    if (isAllowed(candidate))
      return hasEnded(candidate) ? undefined : candidate.toISOString()
  }
  return undefined
}

export function resolveReminder(
  reminder: Reminder,
  references: ReminderEntityReference[],
  now = new Date(),
): ResolvedReminder {
  const reference = references.find(
    (item) =>
      item.id === reminder.entityId && item.type === reminder.entityType,
  )
  const baseTrigger =
    reminder.advanceOffset && reference?.referenceAt
      ? getRelativeTriggerAt(reference.referenceAt, reminder.advanceOffset)
      : reminder.triggerAt
  const nextTriggerAt =
    reminder.snoozedUntil ??
    (baseTrigger && reminder.recurrence
      ? getNextRecurringTriggerAt(
          baseTrigger,
          reminder.recurrence,
          reminder.lastHandledAt
            ? new Date(reminder.lastHandledAt)
            : new Date(now.getTime() - 1),
        )
      : baseTrigger)
  const due = nextTriggerAt && Date.parse(nextTriggerAt) <= now.getTime()
  const resolvedStatus =
    reminder.status === 'scheduled' && due ? 'triggered' : reminder.status
  return {
    ...reminder,
    isOverdue: Boolean(
      due && nextTriggerAt && Date.parse(nextTriggerAt) < now.getTime(),
    ),
    nextTriggerAt,
    resolvedStatus,
  }
}

export function formatReminderWhen(
  triggerAt: string,
  locale: string,
  now = new Date(),
) {
  const trigger = new Date(triggerAt)
  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime()
  const tomorrow = today + 86_400_000
  const day = new Date(
    trigger.getFullYear(),
    trigger.getMonth(),
    trigger.getDate(),
  ).getTime()
  const time = new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(trigger)
  if (day === today) return `Today at ${time}`
  if (day === tomorrow) return `Tomorrow at ${time}`
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(trigger)
}
