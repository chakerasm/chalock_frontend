import { describe, expect, it } from 'vitest'
import { getHabitSummary } from './habit-summary.service'
import type { Habit, HabitLog } from '@/features/habits/types/habits.types'

const habit: Habit = {
  id: 'dota',
  name: 'Dota',
  behavior: 'limit',
  metric: 'minutes',
  period: 'week',
  targetCount: 360,
  schedule: { type: 'weekly-target' },
  state: 'active',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}
const log = (date: string, progress: number): HabitLog => ({
  habitId: 'dota',
  date,
  progress,
  completed: false,
  timeZone: 'UTC',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
})
describe('getHabitSummary', () => {
  it('reports remaining weekly limit', () =>
    expect(
      getHabitSummary(
        habit,
        [log('2026-10-12', 95), log('2026-10-14', 120), log('2026-10-16', 45)],
        '2026-10-16',
      ),
    ).toMatchObject({ value: 260, remaining: 100, state: 'safe' }))
  it('reports exceeded limits without capping actual usage', () =>
    expect(
      getHabitSummary(habit, [log('2026-10-12', 390)], '2026-10-16'),
    ).toMatchObject({ value: 390, remaining: 0, state: 'exceeded' }))
})
