import type { TodayDashboardFromAPI } from '@/features/today/types/today.types'

function getTodayDate() {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')

  return `${now.getFullYear()}-${month}-${day}`
}

export function createTodayDashboardMock(): TodayDashboardFromAPI {
  const now = new Date()

  return {
    activeFocusSession: {
      elapsedSeconds: 0,
      id: 'focus-1',
      startedAt: new Date(now.getTime() - 25 * 60 * 1_000).toISOString(),
      status: 'running',
      taskTitle: 'Outline the project proposal',
    },
    activeGoals: [
      {
        currentValue: 7,
        id: 'goal-1',
        name: 'Read 12 books this year',
        targetDate: `${now.getFullYear()}-12-31`,
        targetValue: 12,
      },
      {
        currentValue: 18,
        id: 'goal-2',
        name: 'Build a 30-day movement streak',
        targetValue: 30,
      },
      {
        currentValue: 65,
        id: 'goal-3',
        name: 'Complete the product design course',
        targetDate: `${now.getFullYear()}-11-15`,
        targetValue: 100,
      },
      {
        currentValue: 2,
        id: 'goal-4',
        name: 'Host four community dinners',
        targetValue: 4,
      },
    ],
    date: getTodayDate(),
    focusSummary: {
      completedMinutes: 50,
      completedSessions: 2,
    },
    scheduledHabits: [
      {
        completed: false,
        currentCount: 5,
        id: 'habit-1',
        name: 'Water',
        targetCount: 8,
      },
      {
        completed: true,
        id: 'habit-2',
        name: 'Morning walk',
      },
      {
        completed: false,
        id: 'habit-3',
        name: 'Read for 20 minutes',
      },
    ],
    tasks: [],
  }
}

export const todayDashboardMock = createTodayDashboardMock()
