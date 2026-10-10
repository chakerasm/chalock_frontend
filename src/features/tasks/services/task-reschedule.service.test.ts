import { describe, expect, it } from 'vitest'
import {
  getPreviousLocalDate,
  getQuickRescheduleDate,
} from '@/features/tasks/services/task-reschedule.service'

describe('quick task rescheduling', () => {
  it('uses local calendar dates across a year boundary', () => {
    const lateNewYearsEve = new Date(2026, 11, 31, 23, 59)

    expect(getQuickRescheduleDate('today', lateNewYearsEve)).toBe('2026-12-31')
    expect(getQuickRescheduleDate('tomorrow', lateNewYearsEve)).toBe(
      '2027-01-01',
    )
    expect(getPreviousLocalDate(new Date(2027, 0, 1, 0, 1))).toBe('2026-12-31')
  })

  it('chooses the next Saturday and next Monday predictably', () => {
    const friday = new Date(2026, 9, 9, 12)

    expect(getQuickRescheduleDate('weekend', friday)).toBe('2026-10-10')
    expect(getQuickRescheduleDate('next-week', friday)).toBe('2026-10-12')
  })
})
