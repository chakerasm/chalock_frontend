export type QuickRescheduleOption =
  | 'today'
  | 'tomorrow'
  | 'weekend'
  | 'next-week'
  | 'no-date'

function toDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** Returns a local calendar date, avoiding UTC date shifts around midnight. */
export function getQuickRescheduleDate(
  option: Exclude<QuickRescheduleOption, 'no-date'>,
  now = new Date(),
) {
  const date = new Date(now)
  date.setHours(12, 0, 0, 0)

  if (option === 'today') return toDateKey(date)
  if (option === 'tomorrow') {
    date.setDate(date.getDate() + 1)
    return toDateKey(date)
  }
  if (option === 'weekend') {
    const daysUntilSaturday = (6 - date.getDay() + 7) % 7
    date.setDate(date.getDate() + daysUntilSaturday)
    return toDateKey(date)
  }

  const daysUntilNextMonday = (8 - date.getDay()) % 7 || 7
  date.setDate(date.getDate() + daysUntilNextMonday)
  return toDateKey(date)
}

export function getPreviousLocalDate(now = new Date()) {
  const date = new Date(now)
  date.setHours(12, 0, 0, 0)
  date.setDate(date.getDate() - 1)
  return toDateKey(date)
}
