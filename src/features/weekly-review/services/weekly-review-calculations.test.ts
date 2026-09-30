import { describe, expect, it } from 'vitest'
import {
  getWeeklyReviewRange,
  isDateInWeeklyReviewRange,
} from '@/features/weekly-review/services/weekly-review-calculations'

describe('weekly review date calculations', () => {
  it('uses Monday through Sunday for the current week', () => {
    expect(getWeeklyReviewRange(0, new Date(2026, 8, 30, 12))).toEqual({
      from: '2026-09-28',
      to: '2026-10-04',
    })
  })

  it('includes both bounds of a review week', () => {
    const range = { from: '2026-09-28', to: '2026-10-04' }
    expect(isDateInWeeklyReviewRange('2026-09-28', range)).toBe(true)
    expect(isDateInWeeklyReviewRange('2026-10-04', range)).toBe(true)
    expect(isDateInWeeklyReviewRange('2026-10-05', range)).toBe(false)
  })
})
