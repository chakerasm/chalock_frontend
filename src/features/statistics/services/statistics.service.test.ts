import { describe, expect, it } from 'vitest'
import { getStatisticsOverview } from './statistics.service'

describe('getStatisticsOverview', () => {
  it('groups completed activity by date without inventing a productivity score', () => {
    const overview = getStatisticsOverview({
      focusSnapshot: {
        activePomodoro: null,
        activeTimer: null,
        pomodoroHistory: [
          {
            completionState: 'completed',
            durationSeconds: 1_800,
            endedAt: '2026-09-22T12:00:00.000Z',
            id: 'pomodoro-1',
          },
        ],
        savedSessions: [
          {
            durationSeconds: 1_200,
            endedAt: '2026-09-20T12:00:00.000Z',
            id: 'focus-1',
            status: 'completed',
            type: 'timer',
          },
          {
            durationSeconds: 600,
            endedAt: '2026-09-21T12:00:00.000Z',
            id: 'focus-2',
            status: 'completed',
            type: 'stopwatch',
          },
          {
            durationSeconds: 900,
            endedAt: '2026-09-23T12:00:00.000Z',
            id: 'focus-3',
            status: 'cancelled',
            type: 'timer',
          },
        ],
      },
      goals: [
        {
          createdAt: '2026-09-01T12:00:00.000Z',
          id: 'goal-1',
          progress: 40,
          progressStrategy: { mode: 'manual' },
          status: 'active',
          title: 'Read more',
          updatedAt: '2026-09-20T12:00:00.000Z',
        },
      ],
      habitLogs: [
        {
          completed: true,
          createdAt: '2026-09-20T12:00:00.000Z',
          date: '2026-09-20',
          habitId: 'habit-1',
          progress: 1,
          timeZone: 'UTC',
          updatedAt: '2026-09-20T12:00:00.000Z',
        },
        {
          completed: false,
          createdAt: '2026-09-21T12:00:00.000Z',
          date: '2026-09-21',
          habitId: 'habit-1',
          progress: 0,
          timeZone: 'UTC',
          updatedAt: '2026-09-21T12:00:00.000Z',
        },
        {
          completed: true,
          createdAt: '2026-09-22T12:00:00.000Z',
          date: '2026-09-22',
          habitId: 'habit-1',
          progress: 1,
          timeZone: 'UTC',
          updatedAt: '2026-09-22T12:00:00.000Z',
        },
      ],
      habits: [
        {
          createdAt: '2026-09-01T12:00:00.000Z',
          id: 'habit-1',
          name: 'Read',
          schedule: { type: 'daily' },
          state: 'active',
          updatedAt: '2026-09-20T12:00:00.000Z',
        },
      ],
      now: new Date('2026-09-26T12:00:00.000Z'),
      range: { from: '2026-09-20', to: '2026-09-26' },
      tasks: [
        {
          completedAt: '2026-09-21T12:00:00.000Z',
          createdAt: '2026-09-20T12:00:00.000Z',
          id: 'task-1',
          priority: 'high',
          status: 'completed',
          title: 'Complete project brief',
          updatedAt: '2026-09-21T12:00:00.000Z',
        },
      ],
      timeZone: 'UTC',
    })

    expect(overview.summary).toEqual({
      focusSessions: 3,
      habitCompletionRate: 2 / 7,
      tasksCompleted: 1,
      totalFocusSeconds: 3_600,
    })
    expect(overview.focus.averageSessionSeconds).toBe(1_200)
    expect(overview.focus.mostProductiveDate).toBe('2026-09-22')
    expect(overview.tasks.priorityCounts).toEqual({
      high: 1,
      low: 0,
      medium: 0,
    })
    expect(overview.goals.goals).toEqual([
      { id: 'goal-1', progress: 40, title: 'Read more' },
    ])
  })

  it('withholds the most-productive-day insight until three active days exist', () => {
    const overview = getStatisticsOverview({
      focusSnapshot: {
        activePomodoro: null,
        activeTimer: null,
        pomodoroHistory: [],
        savedSessions: [
          {
            durationSeconds: 600,
            endedAt: '2026-09-20T12:00:00.000Z',
            id: 'focus-1',
            status: 'completed',
            type: 'timer',
          },
          {
            durationSeconds: 1_200,
            endedAt: '2026-09-21T12:00:00.000Z',
            id: 'focus-2',
            status: 'completed',
            type: 'timer',
          },
        ],
      },
      goals: [],
      habitLogs: [],
      habits: [],
      now: new Date('2026-09-21T12:00:00.000Z'),
      range: { from: '2026-09-20', to: '2026-09-21' },
      tasks: [],
      timeZone: 'UTC',
    })

    expect(overview.focus.mostProductiveDate).toBeNull()
  })
})
