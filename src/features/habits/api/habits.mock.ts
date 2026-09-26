import {
  addLocalDays,
  getLocalDate,
  getWeekStart,
  isHabitLogCompleted,
} from '@/features/habits/services/habit-calendar.service'
import type {
  HabitFromAPI,
  HabitLogFromAPI,
} from '@/features/habits/types/habits.types'

const timestamp = new Date().toISOString()

export const habitsMock: HabitFromAPI[] = [
  {
    createdAt: timestamp,
    id: 'habit-reading',
    name: 'Reading',
    schedule: { type: 'daily' },
    state: 'active',
    targetCount: 30,
    unit: 'minutes',
    updatedAt: timestamp,
  },
  {
    createdAt: timestamp,
    id: 'habit-gym',
    name: 'Gym',
    schedule: { type: 'weekdays', weekdays: [1, 3, 5] },
    state: 'active',
    updatedAt: timestamp,
  },
  {
    createdAt: timestamp,
    id: 'habit-workout',
    name: 'Workout',
    schedule: { type: 'weekly-target' },
    state: 'active',
    targetCount: 3,
    unit: 'sessions',
    updatedAt: timestamp,
  },
  {
    createdAt: timestamp,
    id: 'habit-study',
    name: 'Study',
    schedule: { type: 'daily' },
    state: 'active',
    updatedAt: timestamp,
  },
  {
    createdAt: timestamp,
    id: 'habit-water',
    name: 'Water',
    schedule: { type: 'daily' },
    state: 'active',
    targetCount: 8,
    unit: 'glasses',
    updatedAt: timestamp,
  },
]

const today = getLocalDate()
const thisWeek = getWeekStart(today)

export const habitLogsMock: HabitLogFromAPI[] = [
  makeLog('habit-reading', today, 30, true),
  makeLog('habit-water', today, 5, false),
  makeLog('habit-workout', addLocalDays(today, -1), 1, false),
  makeLog('habit-workout', addLocalDays(today, -2), 1, false),
  makeLog('habit-gym', thisWeek, 1, true),
  makeLog('habit-gym', addLocalDays(thisWeek, 2), 1, true),
]

function makeLog(
  habitId: string,
  date: string,
  progress: number,
  completed: boolean,
): HabitLogFromAPI {
  const now = new Date().toISOString()
  return {
    completed,
    createdAt: now,
    date,
    habitId,
    progress,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    updatedAt: now,
  }
}

export function getTodayHabitProjection(date: string) {
  return habitsMock
    .filter((habit) => habit.state === 'active')
    .filter((habit) => {
      if (habit.schedule.type === 'weekdays') {
        const [year, month, day] = date.split('-').map(Number)
        const weekday = new Date(year, month - 1, day, 12).getDay()
        const isoWeekday = weekday === 0 ? 7 : weekday
        if (
          !habit.schedule.weekdays.includes(
            isoWeekday as 1 | 2 | 3 | 4 | 5 | 6 | 7,
          )
        ) {
          return false
        }
      }
      if (habit.schedule.type === 'weekly-target') {
        const start = getWeekStart(date)
        const end = addLocalDays(start, 6)
        const weeklyProgress = habitLogsMock
          .filter(
            (log) =>
              log.habitId === habit.id && log.date >= start && log.date <= end,
          )
          .reduce((total, log) => total + log.progress, 0)
        return weeklyProgress < (habit.targetCount ?? 0)
      }
      return true
    })
    .map((habit) => {
      const todayLog = habitLogsMock.find(
        (log) => log.habitId === habit.id && log.date === date,
      )
      const weeklyTarget = habit.schedule.type === 'weekly-target'
      const start = getWeekStart(date)
      const currentCount = weeklyTarget
        ? habitLogsMock
            .filter(
              (log) =>
                log.habitId === habit.id &&
                log.date >= start &&
                log.date <= addLocalDays(start, 6),
            )
            .reduce((total, log) => total + log.progress, 0)
        : todayLog?.progress

      return {
        completed: weeklyTarget
          ? (currentCount ?? 0) >= (habit.targetCount ?? 0)
          : (todayLog?.completed ?? false),
        currentCount,
        currentDayCount: todayLog?.progress ?? 0,
        id: habit.id,
        isWeeklyTarget: weeklyTarget,
        name: habit.name,
        targetCount: habit.targetCount,
      }
    })
}

export function upsertHabitLog(
  habitId: string,
  date: string,
  progress: number,
  timeZone: string,
) {
  const habit = habitsMock.find((item) => item.id === habitId)
  if (!habit) throw new Error('Habit not found.')
  const existing = habitLogsMock.find(
    (log) => log.habitId === habitId && log.date === date,
  )
  const now = new Date().toISOString()
  const log: HabitLogFromAPI = {
    completed: isHabitLogCompleted(habit, date, progress, habitLogsMock),
    createdAt: existing?.createdAt ?? now,
    date,
    habitId,
    progress,
    timeZone,
    updatedAt: now,
  }
  if (existing) Object.assign(existing, log)
  else habitLogsMock.push(log)
  return log
}

export { thisWeek }
