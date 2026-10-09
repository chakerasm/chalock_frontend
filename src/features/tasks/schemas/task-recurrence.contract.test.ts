import { describe, expect, it } from 'vitest'
import {
  createTaskInputSchema,
  taskFromAPISchema,
  updateTaskInputSchema,
} from '@/features/tasks/schemas/tasks.schemas'

const recurrence = (overrides = {}) => ({
  ends: 'never' as const,
  frequency: 'weekly' as const,
  interval: 1,
  startsOn: '2026-10-01',
  timezone: 'Africa/Casablanca',
  weekdays: [1],
  ...overrides,
})

describe('Task recurrence contract', () => {
  it('accepts daily, selected-weekday, monthly first-Sunday, and yearly series', () => {
    for (const rule of [
      recurrence({ frequency: 'daily', weekdays: undefined }),
      recurrence({ weekdays: [1, 3, 5] }),
      recurrence({
        frequency: 'monthly',
        weekday: 0,
        weekdays: undefined,
        weekOfMonth: 1,
      }),
      recurrence({
        dayOfMonth: 1,
        frequency: 'yearly',
        month: 1,
        weekdays: undefined,
      }),
    ])
      expect(
        createTaskInputSchema.safeParse({
          recurrence: rule,
          title: 'Review finances',
        }).success,
      ).toBe(true)
  })

  it('accepts occurrence completion and scoped series updates', () => {
    expect(
      updateTaskInputSchema.safeParse({
        occurrenceDate: '2026-10-04',
        scope: 'this',
        status: 'completed',
        title: 'Review finances',
      }).success,
    ).toBe(true)
    expect(
      updateTaskInputSchema.safeParse({
        recurrence: recurrence({
          ends: 'after_occurrences',
          occurrenceCount: 12,
        }),
        scope: 'future',
        title: 'Review finances',
      }).success,
    ).toBe(true)
  })

  it('models a skipped or modified generated occurrence without duplicating its identity', () => {
    expect(
      taskFromAPISchema.safeParse({
        createdAt: '2026-10-01T00:00:00.000Z',
        dueDate: '2026-10-04',
        id: 'series-1',
        occurrenceDate: '2026-10-04',
        priority: 'medium',
        recurrence: recurrence(),
        seriesId: 'series-1',
        status: 'cancelled',
        title: 'Review finances',
        updatedAt: '2026-10-01T00:00:00.000Z',
      }).success,
    ).toBe(true)
  })
})
