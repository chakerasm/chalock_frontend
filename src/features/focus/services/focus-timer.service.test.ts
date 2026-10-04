import { describe, expect, it } from 'vitest'
import type { ActiveFocusTimer } from '../types/focus.types'
import {
  completeFocusTimer,
  getFocusElapsedSeconds,
  getFocusRemainingSeconds,
} from './focus-timer-calculations'

describe('focus timer timestamps', () => {
  it('uses the backend startedAt field when runningSince is absent', () => {
    const stopwatch: ActiveFocusTimer = {
      durationSeconds: 0,
      id: 'focus-1',
      startedAt: new Date(0).toISOString(),
      status: 'active',
      type: 'stopwatch',
    }

    expect(getFocusElapsedSeconds(stopwatch, 8_500)).toBe(8)
  })

  it('derives stopwatch elapsed time from real timestamps across pauses', () => {
    const stopwatch: ActiveFocusTimer = {
      durationSeconds: 0,
      id: 'focus-1',
      runningSince: new Date(0).toISOString(),
      startedAt: new Date(0).toISOString(),
      status: 'active',
      type: 'stopwatch',
    }
    const paused: ActiveFocusTimer = {
      ...stopwatch,
      durationSeconds: getFocusElapsedSeconds(stopwatch, 6_500),
      runningSince: undefined,
      status: 'paused',
    }
    const resumed: ActiveFocusTimer = {
      ...paused,
      runningSince: new Date(10_000).toISOString(),
      status: 'active',
    }

    expect(getFocusElapsedSeconds(stopwatch, 6_500)).toBe(6)
    expect(paused.durationSeconds).toBe(6)
    expect(getFocusElapsedSeconds(resumed, 14_500)).toBe(10)
  })

  it('derives countdown completion from timestamps and clamps its duration', () => {
    const timer: ActiveFocusTimer = {
      durationSeconds: 0,
      id: 'focus-2',
      plannedDurationSeconds: 300,
      runningSince: new Date(0).toISOString(),
      startedAt: new Date(0).toISOString(),
      status: 'active',
      type: 'timer',
    }

    expect(getFocusRemainingSeconds(timer, 45_000)).toBe(255)

    const completed = completeFocusTimer(timer, 360_000)
    expect(completed.durationSeconds).toBe(300)
    expect(completed.status).toBe('completed')
    expect(getFocusRemainingSeconds(completed)).toBe(0)
  })
})
