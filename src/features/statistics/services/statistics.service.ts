import { getGoalProgressSummary } from '@/features/goals/services/goal-progress.service'
import {
  addLocalDays,
  getHabitStreak,
  getLocalDate,
  getWeekStart,
  isHabitScheduledOnDate,
} from '@/features/habits/services/habit-calendar.service'
import type {
  DailyStatistic,
  HabitConsistencyDay,
  StatisticsDateFilter,
  StatisticsDateRange,
  StatisticsOverview,
  StatisticsPreset,
  StatisticsSource,
} from '@/features/statistics/types/statistics.types'

export function getStatisticsDateRange(
  filter: StatisticsDateFilter,
  now = new Date(),
): StatisticsDateRange {
  if (filter.type === 'custom') return { from: filter.from, to: filter.to }

  const today = getLocalDate(now)
  if (filter.preset === 'this-month') {
    return { from: `${today.slice(0, 7)}-01`, to: today }
  }

  const days = filter.preset === 'last-7-days' ? 7 : 30
  return { from: addLocalDays(today, -(days - 1)), to: today }
}

export function getStatisticsOverview({
  focusSnapshot,
  goals,
  habitLogs,
  habits,
  now = new Date(),
  range,
  tasks,
  timeZone,
}: StatisticsSource): StatisticsOverview {
  const dates = getDatesInRange(range)
  const daily = new Map<string, DailyStatistic>(
    dates.map((date) => [
      date,
      {
        completedHabits: 0,
        completedTasks: 0,
        date,
        focusSeconds: 0,
        scheduledHabits: 0,
      },
    ]),
  )

  const completedFocusSessions = getCompletedFocusSessions(
    focusSnapshot,
    range,
    timeZone,
  )
  for (const session of completedFocusSessions) {
    const day = daily.get(session.date)
    if (day) day.focusSeconds += session.durationSeconds
  }

  const completedTasks = tasks.filter((task) => {
    if (task.status !== 'completed' || !task.completedAt) return false
    const date = getDateInTimeZone(task.completedAt, timeZone)
    return Boolean(date && isDateInRange(date, range))
  })
  for (const task of completedTasks) {
    const date = task.completedAt
      ? getDateInTimeZone(task.completedAt, timeZone)
      : undefined
    const day = date ? daily.get(date) : undefined
    if (day) day.completedTasks++
  }

  const habitStatistics = getHabitStatistics({
    dates,
    habitLogs,
    habits,
    now,
    range,
  })
  for (const day of habitStatistics.consistency) {
    const dailyStatistic = daily.get(day.date)
    if (!dailyStatistic) continue
    dailyStatistic.completedHabits = day.completed
    dailyStatistic.scheduledHabits = day.scheduled
  }

  const dailyStatistics = dates.map((date) => daily.get(date) as DailyStatistic)
  const focusDaily = dailyStatistics.filter((day) => day.focusSeconds > 0)
  const totalFocusSeconds = completedFocusSessions.reduce(
    (total, session) => total + session.durationSeconds,
    0,
  )
  const mostProductiveDate =
    focusDaily.length >= 3
      ? focusDaily.reduce((mostProductive, day) =>
          day.focusSeconds > mostProductive.focusSeconds ? day : mostProductive,
        ).date
      : null

  const priorityCounts = { high: 0, low: 0, medium: 0 }
  for (const task of completedTasks) priorityCounts[task.priority]++

  const activeGoals = goals
    .filter((goal) => goal.status === 'active')
    .map((goal) => ({
      id: goal.id,
      progress: getGoalProgressSummary(goal, tasks).progress,
      title: goal.title,
    }))
    .sort(
      (left, right) =>
        right.progress - left.progress || left.title.localeCompare(right.title),
    )

  return {
    focus: {
      averageSessionSeconds:
        completedFocusSessions.length > 0
          ? Math.round(totalFocusSeconds / completedFocusSessions.length)
          : null,
      daily: dailyStatistics,
      mostProductiveDate,
      sessionCount: completedFocusSessions.length,
      totalSeconds: totalFocusSeconds,
    },
    goals: { activeCount: activeGoals.length, goals: activeGoals },
    habits: habitStatistics,
    range,
    summary: {
      focusSessions: completedFocusSessions.length,
      habitCompletionRate: habitStatistics.completionRate,
      tasksCompleted: completedTasks.length,
      totalFocusSeconds,
    },
    tasks: {
      completedCount: completedTasks.length,
      daily: dailyStatistics,
      priorityCounts,
    },
  }
}

export function getDateInTimeZone(value: string | Date, timeZone: string) {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return undefined

  const parts = new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    month: '2-digit',
    timeZone,
    year: 'numeric',
  }).formatToParts(date)
  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, part.value]),
  )
  return `${values.year}-${values.month}-${values.day}`
}

function getCompletedFocusSessions(
  snapshot: StatisticsSource['focusSnapshot'],
  range: StatisticsDateRange,
  timeZone: string,
) {
  const timers = snapshot.savedSessions
    .filter(
      (session) =>
        session.status === 'completed' &&
        session.durationSeconds > 0 &&
        Boolean(session.endedAt),
    )
    .map((session) => ({
      date: getDateInTimeZone(session.endedAt as string, timeZone),
      durationSeconds: session.durationSeconds,
    }))
  const pomodoros = snapshot.pomodoroHistory
    .filter(
      (session) =>
        session.completionState === 'completed' && session.durationSeconds > 0,
    )
    .map((session) => ({
      date: getDateInTimeZone(session.endedAt, timeZone),
      durationSeconds: session.durationSeconds,
    }))

  return [...timers, ...pomodoros].filter(
    (session): session is { date: string; durationSeconds: number } =>
      Boolean(session.date && isDateInRange(session.date, range)),
  )
}

function getHabitStatistics({
  dates,
  habitLogs,
  habits,
  now,
  range,
}: Pick<StatisticsSource, 'habitLogs' | 'habits' | 'now' | 'range'> & {
  dates: string[]
}) {
  const today = getLocalDate(now)
  const consistency: HabitConsistencyDay[] = dates.map((date) => ({
    completed: 0,
    date,
    rate: null,
    scheduled: 0,
  }))
  const consistencyByDate = new Map(consistency.map((day) => [day.date, day]))
  const logsByHabitAndDate = new Map(
    habitLogs.map((log) => [`${log.habitId}:${log.date}`, log]),
  )

  let completedOpportunities = 0
  let scheduledOpportunities = 0

  for (const habit of habits.filter((item) => item.state === 'active')) {
    const createdOn = getLocalDate(new Date(habit.createdAt))
    if (habit.schedule.type === 'weekly-target') {
      const weeklyResults = getCompletedWeeklyTargets(
        habit,
        habitLogs,
        range,
        today,
        createdOn,
      )
      completedOpportunities += weeklyResults.completed
      scheduledOpportunities += weeklyResults.scheduled
      continue
    }

    for (const date of dates) {
      if (
        date > today ||
        date < createdOn ||
        !isHabitScheduledOnDate(habit, date)
      ) {
        continue
      }
      const day = consistencyByDate.get(date)
      if (!day) continue
      scheduledOpportunities++
      day.scheduled++
      if (logsByHabitAndDate.get(`${habit.id}:${date}`)?.completed) {
        completedOpportunities++
        day.completed++
      }
    }
  }

  for (const day of consistency) {
    day.rate = day.scheduled > 0 ? day.completed / day.scheduled : null
  }

  const streaks = habits
    .filter((habit) => habit.state === 'active')
    .map((habit) => ({
      count: getHabitStreak(habit, habitLogs, today),
      habitId: habit.id,
      name: habit.name,
      unit:
        habit.schedule.type === 'weekly-target'
          ? ('weeks' as const)
          : ('days' as const),
    }))
    .filter((streak) => streak.count > 0)
    .sort(
      (left, right) =>
        right.count - left.count || left.name.localeCompare(right.name),
    )

  return {
    completedOpportunities,
    completionRate:
      scheduledOpportunities > 0
        ? completedOpportunities / scheduledOpportunities
        : null,
    consistency,
    scheduledOpportunities,
    streaks,
  }
}

function getCompletedWeeklyTargets(
  habit: StatisticsSource['habits'][number],
  logs: StatisticsSource['habitLogs'],
  range: StatisticsDateRange,
  today: string,
  createdOn: string,
) {
  let completed = 0
  let scheduled = 0
  let weekStart = getWeekStart(range.from)
  if (weekStart < range.from) weekStart = addLocalDays(weekStart, 7)

  while (weekStart <= range.to) {
    const weekEnd = addLocalDays(weekStart, 6)
    if (weekEnd > range.to || weekEnd > today) break
    if (createdOn <= weekEnd) {
      scheduled++
      const progress = logs
        .filter(
          (log) =>
            log.habitId === habit.id &&
            log.date >= weekStart &&
            log.date <= weekEnd,
        )
        .reduce((total, log) => total + log.progress, 0)
      if (progress >= (habit.targetCount ?? 0)) completed++
    }
    weekStart = addLocalDays(weekStart, 7)
  }

  return { completed, scheduled }
}

function getDatesInRange(range: StatisticsDateRange) {
  const dates: string[] = []
  for (
    let date = range.from;
    date <= range.to && dates.length < 366;
    date = addLocalDays(date, 1)
  ) {
    dates.push(date)
  }
  return dates
}

function isDateInRange(date: string, range: StatisticsDateRange) {
  return date >= range.from && date <= range.to
}

export function getStatisticsPresetRange(
  preset: StatisticsPreset,
  now = new Date(),
) {
  return getStatisticsDateRange({ preset, type: 'preset' }, now)
}
