import { describe, expect, it } from 'vitest'
import type { PomodoroCycle } from '../types/focus.types'
import {
  cancelPomodoro,
  completePomodoroPhase,
  getPomodoroSessionNumber,
  skipPomodoroPhase,
  startPomodoro,
} from './pomodoro-cycle.service'

function completeCurrentPhase(cycle: PomodoroCycle, now: number) {
  return completePomodoroPhase(cycle, now).cycle
}

describe('Pomodoro cycle transitions', () => {
  it('uses a long break after four completed focus phases', () => {
    let now = 0
    let cycle = startPomodoro({}, now)

    for (let session = 1; session <= 4; session += 1) {
      now += cycle.focusDurationSeconds * 1_000
      const completedFocus = completePomodoroPhase(cycle, now)
      cycle = completedFocus.cycle

      if (session === 4) {
        expect(cycle.phase).toBe('long_break')
        expect(cycle.completedFocusSessions).toBe(4)
        expect(completedFocus.record?.completionState).toBe('completed')
        break
      }

      expect(cycle.phase).toBe('short_break')
      now += cycle.shortBreakDurationSeconds * 1_000
      cycle = completeCurrentPhase(cycle, now)
    }
  })

  it('does not increment the focus count when a focus phase is skipped', () => {
    const cycle = startPomodoro({}, 0)
    const skipped = skipPomodoroPhase(cycle, 60_000)
    const resumedFocus = completeCurrentPhase(
      skipped.cycle,
      60_000 + skipped.cycle.shortBreakDurationSeconds * 1_000,
    )

    expect(skipped.record?.completionState).toBe('skipped')
    expect(skipped.cycle.completedFocusSessions).toBe(0)
    expect(resumedFocus.phase).toBe('focus')
    expect(getPomodoroSessionNumber(resumedFocus)).toBe(1)
  })

  it('records a cancelled focus phase without treating it as completed', () => {
    const cycle = startPomodoro({}, 0)
    const cancelled = cancelPomodoro(cycle, 120_000)

    expect(cancelled?.completionState).toBe('cancelled')
    expect(cancelled?.durationSeconds).toBe(120)
  })
})
