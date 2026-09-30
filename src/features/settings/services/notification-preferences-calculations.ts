import type { QuietHours } from '@/features/settings/types/notification-preferences.types'

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

export function isWithinQuietHours(
  quietHours: QuietHours,
  currentTime: string,
) {
  if (!quietHours.enabled) return false
  const current = timeToMinutes(currentTime)
  const start = timeToMinutes(quietHours.start)
  const end = timeToMinutes(quietHours.end)

  return start < end
    ? current >= start && current < end
    : current >= start || current < end
}

export function getTimeInTimezone(date: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    hourCycle: 'h23',
    minute: '2-digit',
    timeZone: timezone,
  }).formatToParts(date)
  const hour = parts.find((part) => part.type === 'hour')?.value ?? '00'
  const minute = parts.find((part) => part.type === 'minute')?.value ?? '00'
  return `${hour}:${minute}`
}
