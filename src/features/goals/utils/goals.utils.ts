import type { TFunction } from 'i18next'

export const formatGoalTargetDate = (date: string, locale: string) => {
  const [year, month, day] = date.split('-').map(Number)
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, month - 1, day, 12))
}

export const formatGoalFocusTime = (seconds: number, t: TFunction) => {
  const totalMinutes = Math.round(seconds / 60)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return hours
    ? t('goals.focusDuration', { hours, minutes })
    : t('goals.focusMinutes', { minutes })
}

export const getGoalFocusElapsedSeconds = (
  elapsedSeconds: number,
  startedAt: string | undefined,
  status: 'active' | 'paused',
  now: number,
) =>
  status !== 'active' || !startedAt
    ? elapsedSeconds
    : elapsedSeconds +
      Math.max(0, Math.floor((now - Date.parse(startedAt)) / 1_000))

export const formatGoalElapsedTime = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60)
  return `${String(minutes).padStart(2, '0')}:${String(totalSeconds % 60).padStart(2, '0')}`
}
