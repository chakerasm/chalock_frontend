import { describe, expect, it } from 'vitest'
import { getTasksForView } from '@/features/tasks/services/task-view.service'
import type { Task } from '@/features/tasks/types/tasks.types'

const task = (overrides: Partial<Task>): Task => ({
  createdAt: '2026-01-01T00:00:00.000Z',
  id: 'task',
  priority: 'medium',
  status: 'todo',
  title: 'Routine',
  updatedAt: '2026-01-01T00:00:00.000Z',
  ...overrides,
})

describe('Task occurrence views', () => {
  it('keeps independently completed occurrences out of Today while pending occurrences remain', () => {
    const today = new Date().toLocaleDateString('en-CA')
    const tasks = getTasksForView(
      [
        task({
          id: 'october',
          occurrenceDate: today,
          seriesId: 'finance',
          status: 'completed',
          dueDate: today,
        }),
        task({
          id: 'november',
          occurrenceDate: today,
          seriesId: 'subscriptions',
          dueDate: today,
        }),
      ],
      'today',
    )
    expect(tasks.map((item) => item.id)).toEqual(['november'])
  })

  it('prevents duplicate occurrences returned for one series/date', () => {
    const future = '2099-01-01'
    const tasks = getTasksForView(
      [
        task({
          id: 'first',
          occurrenceDate: future,
          seriesId: 'series',
          dueDate: future,
        }),
        task({
          id: 'duplicate',
          occurrenceDate: future,
          seriesId: 'series',
          dueDate: future,
        }),
      ],
      'upcoming',
    )
    expect(tasks).toHaveLength(1)
  })
})
