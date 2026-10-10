import { describe, expect, it } from 'vitest'
import {
  getEndTime,
  getPlanningWeekDates,
  getSuggestedStartTime,
} from '@/features/goals/services/goal-planning.service'

describe('goal planning', () => {
  it('derives a Monday-start planning week and task end time', () => {
    expect(getPlanningWeekDates(new Date(2026, 9, 9))).toEqual([
      '2026-10-05',
      '2026-10-06',
      '2026-10-07',
      '2026-10-08',
      '2026-10-09',
      '2026-10-10',
      '2026-10-11',
    ])
    expect(getEndTime('18:00', 90)).toBe('19:30')
  })

  it('suggests the first available 15-minute window', () => {
    expect(
      getSuggestedStartTime(
        [
          {
            date: '2026-10-07',
            endTime: '18:00',
            startTime: '06:00',
            status: 'planned',
          },
        ],
        '2026-10-07',
        60,
      ),
    ).toBe('18:00')
  })
})
