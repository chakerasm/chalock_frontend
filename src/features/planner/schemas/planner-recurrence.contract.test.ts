import { describe, expect, it } from 'vitest'
import { timeBlockInputSchema } from './planner.schemas'

const base = {
  date: '2026-10-12',
  endTime: '20:30',
  startTime: '19:30',
  title: 'Gym',
}

const recurrence = (overrides = {}) => ({
  ends: 'never' as const,
  frequency: 'weekly' as const,
  interval: 1,
  startsOn: '2026-10-12',
  timezone: 'Africa/Casablanca',
  ...overrides,
})

describe('Planner recurrence contract', () => {
  it('accepts daily, weekday, selected-weekday, and every-N-week rules', () => {
    expect(
      timeBlockInputSchema.safeParse({
        ...base,
        recurrence: recurrence({ frequency: 'daily' }),
      }).success,
    ).toBe(true)
    expect(
      timeBlockInputSchema.safeParse({
        ...base,
        recurrence: recurrence({ weekdays: [1, 2, 3, 4, 5] }),
      }).success,
    ).toBe(true)
    expect(
      timeBlockInputSchema.safeParse({
        ...base,
        recurrence: recurrence({ weekdays: [1, 3, 5] }),
      }).success,
    ).toBe(true)
    expect(
      timeBlockInputSchema.safeParse({
        ...base,
        recurrence: recurrence({ interval: 2, weekdays: [1] }),
      }).success,
    ).toBe(true)
  })

  it('supports monthly month-end, leap-year, and first-weekday-of-month rules', () => {
    expect(
      timeBlockInputSchema.safeParse({
        ...base,
        recurrence: recurrence({ dayOfMonth: 31, frequency: 'monthly' }),
      }).success,
    ).toBe(true)
    expect(
      timeBlockInputSchema.safeParse({
        ...base,
        recurrence: recurrence({
          dayOfMonth: 29,
          frequency: 'yearly',
          month: 2,
          startsOn: '2024-02-29',
        }),
      }).success,
    ).toBe(true)
    expect(
      timeBlockInputSchema.safeParse({
        ...base,
        recurrence: recurrence({
          frequency: 'monthly',
          weekday: 0,
          weekOfMonth: 1,
        }),
      }).success,
    ).toBe(true)
  })

  it('requires a valid inclusive end condition and timezone', () => {
    expect(
      timeBlockInputSchema.safeParse({
        ...base,
        recurrence: recurrence({ ends: 'on_date', endsOn: '2026-12-31' }),
      }).success,
    ).toBe(true)
    expect(
      timeBlockInputSchema.safeParse({
        ...base,
        recurrence: recurrence({
          ends: 'after_occurrences',
          occurrenceCount: 10,
        }),
      }).success,
    ).toBe(true)
    expect(
      timeBlockInputSchema.safeParse({
        ...base,
        recurrence: recurrence({ ends: 'on_date' }),
      }).success,
    ).toBe(false)
    expect(
      timeBlockInputSchema.safeParse({
        ...base,
        recurrence: recurrence({ timezone: '' }),
      }).success,
    ).toBe(false)
  })
})
