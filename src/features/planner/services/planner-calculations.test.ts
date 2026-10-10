import { describe, expect, it } from 'vitest'
import { timeBlockInputSchema } from '@/features/planner/schemas/planner.schemas'
import {
  findTimeBlockOverlaps,
  getFocusTimerInputForTimeBlock,
  getTimeBlockDurationMinutes,
  isTimeBlockCurrent,
} from './planner-calculations'
import type { TimeBlock } from '@/features/planner/types/planner.types'

const block = (overrides: Partial<TimeBlock> = {}): TimeBlock => ({
  createdAt: '2026-09-30T08:00:00.000Z',
  date: '2026-09-30',
  endTime: '11:30',
  id: 'deep-work',
  startTime: '10:00',
  status: 'planned',
  title: 'Deep work',
  updatedAt: '2026-09-30T08:00:00.000Z',
  ...overrides,
})

describe('planner time calculations', () => {
  it('calculates a block duration', () => {
    expect(getTimeBlockDurationMinutes(block())).toBe(90)
  })

  it('rejects an end time that is not after the start time', () => {
    expect(
      timeBlockInputSchema.safeParse({
        date: '2026-09-30',
        endTime: '09:00',
        startTime: '09:15',
        title: 'Invalid block',
      }).success,
    ).toBe(false)
  })

  it('detects cross and contained overlaps, but not adjacent blocks', () => {
    const blocks = [block()]
    expect(
      findTimeBlockOverlaps(blocks, {
        date: '2026-09-30',
        endTime: '12:00',
        startTime: '11:00',
      }),
    ).toHaveLength(1)
    expect(
      findTimeBlockOverlaps(blocks, {
        date: '2026-09-30',
        endTime: '12:00',
        startTime: '10:30',
      }),
    ).toHaveLength(1)
    expect(
      findTimeBlockOverlaps(blocks, {
        date: '2026-09-30',
        endTime: '12:00',
        startTime: '11:30',
      }),
    ).toHaveLength(0)
  })

  it('identifies only a block happening now', () => {
    expect(isTimeBlockCurrent(block(), new Date('2026-09-30T10:45:00'))).toBe(
      true,
    )
    expect(isTimeBlockCurrent(block(), new Date('2026-09-30T09:45:00'))).toBe(
      false,
    )
    expect(isTimeBlockCurrent(block(), new Date('2026-09-30T11:30:00'))).toBe(
      false,
    )
  })

  it('forwards linked task, goal, and planner block IDs to the focus timer', () => {
    expect(
      getFocusTimerInputForTimeBlock(
        block({ goalId: 'goal-1', taskId: 'task-1' }),
        new Date('2026-09-30T08:00:00'),
      ),
    ).toEqual({
      goalId: 'goal-1',
      plannedDurationSeconds: 5_400,
      plannerBlockId: 'deep-work',
      taskId: 'task-1',
      type: 'timer',
    })
  })
})
