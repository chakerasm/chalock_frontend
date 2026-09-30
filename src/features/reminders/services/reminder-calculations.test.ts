import { describe, expect, it } from 'vitest'
import {
  getNextRecurringTriggerAt,
  getRelativeTriggerAt,
  resolveReminder,
} from './reminder-calculations'
import type { Reminder } from '@/features/reminders/types/reminders.types'

const reminder = (overrides: Partial<Reminder> = {}): Reminder => ({
  createdAt: '2026-01-01T00:00:00.000Z',
  id: 'reminder-1',
  status: 'scheduled',
  title: 'Review',
  triggerAt: '2026-01-01T09:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  ...overrides,
})

describe('reminder calculations', () => {
  it('calculates a relative trigger from the live source date', () => {
    expect(
      getRelativeTriggerAt('2026-10-20T09:00:00.000Z', {
        unit: 'day',
        value: 3,
      }),
    ).toBe('2026-10-17T09:00:00.000Z')
  })

  it('resolves an updated subscription source date instead of freezing the old trigger', () => {
    const resolved = resolveReminder(
      reminder({
        advanceOffset: { unit: 'day', value: 3 },
        entityId: 'sub-1',
        entityType: 'subscription',
        triggerAt: undefined,
      }),
      [
        {
          id: 'sub-1',
          label: 'Spotify',
          referenceAt: '2026-10-20T09:00:00.000Z',
          type: 'subscription',
        },
      ],
      new Date('2026-10-01T00:00:00.000Z'),
    )
    expect(resolved.nextTriggerAt).toBe('2026-10-17T09:00:00.000Z')
  })

  it('calculates daily, selected-weekday, monthly month-end, and yearly occurrences', () => {
    expect(
      getNextRecurringTriggerAt(
        '2026-01-01T09:00:00.000Z',
        { frequency: 'daily', interval: 1 },
        new Date('2026-01-02T08:00:00.000Z'),
      ),
    ).toBe('2026-01-02T09:00:00.000Z')
    expect(
      getNextRecurringTriggerAt(
        '2026-01-01T09:00:00.000Z',
        { daysOfWeek: [1, 3, 5], frequency: 'weekly', interval: 1 },
        new Date('2026-01-01T10:00:00.000Z'),
      ),
    ).toBe('2026-01-02T09:00:00.000Z')
    expect(
      getNextRecurringTriggerAt(
        '2026-01-31T09:00:00.000Z',
        { dayOfMonth: 31, frequency: 'monthly', interval: 1 },
        new Date('2026-02-01T00:00:00.000Z'),
      ),
    ).toMatch(/^2026-02-28T/)
    expect(
      getNextRecurringTriggerAt(
        '2026-09-30T09:00:00.000Z',
        { frequency: 'yearly', interval: 1 },
        new Date('2026-10-01T00:00:00.000Z'),
      ),
    ).toBe('2027-09-30T09:00:00.000Z')
  })

  it('keeps overdue reminders visible', () => {
    expect(
      resolveReminder(reminder(), [], new Date('2026-01-01T10:00:00.000Z'))
        .resolvedStatus,
    ).toBe('triggered')
  })
})
