import {
  addLocalDays,
  getWeekStart,
} from '@/features/habits/services/habit-calendar.service'
import type { Habit, HabitLog } from '@/features/habits/types/habits.types'

export type HabitThresholdState =
  | 'target_met'
  | 'safe'
  | 'approaching_limit'
  | 'limit_reached'
  | 'exceeded'

export function getHabitPeriodRange(habit: Habit, date: string) {
  const period =
    habit.period ?? (habit.schedule.type === 'weekly-target' ? 'week' : 'day')
  if (period === 'day') return { from: date, to: date }
  if (period === 'week') {
    const from = getWeekStart(date)
    return { from, to: addLocalDays(from, 6) }
  }
  const [year, month] = date.split('-').map(Number)
  const from = `${year}-${String(month).padStart(2, '0')}-01`
  return {
    from,
    to: `${year}-${String(month).padStart(2, '0')}-${new Date(year, month, 0).getDate()}`,
  }
}

export function getHabitSummary(habit: Habit, logs: HabitLog[], date: string) {
  const { from, to } = getHabitPeriodRange(habit, date)
  const value = logs
    .filter(
      (log) => log.habitId === habit.id && log.date >= from && log.date <= to,
    )
    .reduce((total, log) => total + log.progress, 0)
  const target = habit.targetCount ?? (habit.behavior === 'quit' ? 0 : 1)
  const behavior = habit.behavior ?? 'build'
  const warning = habit.warningThreshold ?? 80
  const state: HabitThresholdState =
    behavior === 'build'
      ? value >= target
        ? 'target_met'
        : 'safe'
      : value > target
        ? 'exceeded'
        : value === target
          ? 'limit_reached'
          : target > 0 && (value / target) * 100 >= warning
            ? 'approaching_limit'
            : 'safe'
  return {
    ...getHabitPeriodRange(habit, date),
    remaining:
      behavior === 'build'
        ? Math.max(0, target - value)
        : Math.max(0, target - value),
    state,
    target,
    value,
  }
}
