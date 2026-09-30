import { describe, expect, it } from 'vitest'
import {
  getLocalActivityDate,
  groupActivitiesByDate,
} from '@/features/activity/services/activity.service'
import type { Activity } from '@/features/activity/types/activity.types'

const activity = (id: string, occurredAt: string): Activity => ({
  category: 'productivity',
  entityId: id,
  entityType: 'task',
  id,
  occurredAt,
  title: id,
  type: 'task_completed',
})

describe('activity service', () => {
  it('groups chronologically ordered activities by local date', () => {
    const groups = groupActivitiesByDate([
      activity('older', '2026-09-28T10:00:00.000Z'),
      activity('newer', '2026-09-30T14:00:00.000Z'),
      activity('same-day', '2026-09-30T09:00:00.000Z'),
    ])

    expect(groups).toHaveLength(2)
    expect(groups[0]?.items.map((item) => item.id)).toEqual([
      'newer',
      'same-day',
    ])
    expect(groups[1]?.items.map((item) => item.id)).toEqual(['older'])
  })

  it('returns a stable local date key for grouping', () => {
    expect(getLocalActivityDate(new Date(2026, 8, 30, 8, 30))).toBe(
      '2026-09-30',
    )
  })
})
