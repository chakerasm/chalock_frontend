import type {
  Habit,
  HabitLog,
  HabitWeekday,
} from '@/features/habits/types/habits.types'

export function getLocalDate(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function addLocalDays(date: string, amount: number) {
  const [year, month, day] = date.split('-').map(Number)
  const next = new Date(year, month - 1, day + amount, 12)
  return getLocalDate(next)
}

export function getLocalWeekday(date: string): HabitWeekday {
  const [year, month, day] = date.split('-').map(Number)
  const weekday = new Date(year, month - 1, day, 12).getDay()
  return (weekday === 0 ? 7 : weekday) as HabitWeekday
}

export function getWeekStart(date: string) {
  return addLocalDays(date, 1 - getLocalWeekday(date))
}

export function isHabitScheduledOnDate(habit: Habit, date: string) {
  if (habit.schedule.type !== 'weekdays') return true
  return habit.schedule.weekdays.includes(getLocalWeekday(date))
}

export function getHabitStreak(
  habit: Habit,
  logs: HabitLog[],
  today = getLocalDate(),
) {
  const completedByDate = new Map(
    logs
      .filter((log) => log.habitId === habit.id)
      .map((log) => [log.date, log.completed]),
  )

  if (habit.schedule.type === 'weekly-target') {
    const target = habit.targetCount ?? 0
    if (target <= 0) return 0

    let weekStart = getWeekStart(today)
    const currentWeekProgress = getWeekProgress(habit, logs, weekStart)
    if (currentWeekProgress < target) weekStart = addLocalDays(weekStart, -7)

    let streak = 0
    for (let weeks = 0; weeks < 5_200; weeks += 1) {
      if (getWeekProgress(habit, logs, weekStart) < target) break
      streak += 1
      weekStart = addLocalDays(weekStart, -7)
    }
    return streak
  }

  let date = today
  let streak = 0
  let isToday = true
  for (let days = 0; days < 36_525; days += 1) {
    if (isHabitScheduledOnDate(habit, date)) {
      if (!completedByDate.get(date)) {
        if (isToday) {
          date = addLocalDays(date, -1)
          isToday = false
          continue
        }
        break
      }
      streak += 1
    }
    date = addLocalDays(date, -1)
    isToday = false
  }
  return streak
}

function getWeekProgress(habit: Habit, logs: HabitLog[], weekStart: string) {
  const weekEnd = addLocalDays(weekStart, 6)
  return logs
    .filter(
      (log) =>
        log.habitId === habit.id &&
        log.date >= weekStart &&
        log.date <= weekEnd,
    )
    .reduce((total, log) => total + log.progress, 0)
}

export function isHabitLogCompleted(
  habit: Habit,
  date: string,
  progress: number,
  logs: HabitLog[],
) {
  if (habit.schedule.type === 'weekly-target') {
    const weekStart = getWeekStart(date)
    const weekEnd = addLocalDays(weekStart, 6)
    const priorProgress = logs
      .filter(
        (log) =>
          log.habitId === habit.id &&
          log.date !== date &&
          log.date >= weekStart &&
          log.date <= weekEnd,
      )
      .reduce((total, log) => total + log.progress, 0)
    return priorProgress + progress >= (habit.targetCount ?? 0)
  }
  return habit.targetCount === undefined
    ? progress > 0
    : progress >= habit.targetCount
}
