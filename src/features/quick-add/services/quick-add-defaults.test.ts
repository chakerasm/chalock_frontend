import { describe, expect, it } from 'vitest'
import { getQuickAddTimeRange } from '@/features/quick-add/services/quick-add-defaults'

describe('getQuickAddTimeRange', () => {
  it('rounds the start time up to the selected planner increment', () => {
    expect(getQuickAddTimeRange(new Date(2026, 8, 30, 9, 8), 15, 60)).toEqual({
      endTime: '10:15',
      startTime: '09:15',
    })
  })

  it('keeps a default block within the current day', () => {
    expect(getQuickAddTimeRange(new Date(2026, 8, 30, 23, 53), 15, 60)).toEqual(
      {
        endTime: '23:45',
        startTime: '22:45',
      },
    )
  })
})
