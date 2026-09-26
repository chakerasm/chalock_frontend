import { useCallback, useEffect, useRef, useState } from 'react'
import { startPomodoroInputSchema } from '@/features/focus/schemas/focus.schemas'
import {
  getFocusTimerSnapshot,
  persistFocusTimerSnapshot,
} from '@/features/focus/services/focus-timer.service'
import {
  cancelPomodoro,
  completePomodoroPhase,
  getPomodoroPhaseElapsedSeconds,
  getPomodoroProgress,
  getPomodoroRemainingSeconds,
  getPomodoroSessionNumber,
  pausePomodoro,
  resumePomodoro,
  skipPomodoroPhase,
  startPomodoro,
} from '@/features/focus/services/pomodoro-cycle.service'
import type {
  FocusTimerSnapshot,
  StartPomodoroInput,
} from '@/features/focus/types/focus.types'

export function usePomodoro() {
  const [snapshot, setSnapshot] = useState<FocusTimerSnapshot>(() =>
    getFocusTimerSnapshot(),
  )
  const snapshotRef = useRef(snapshot)
  const [now, setNow] = useState(Date.now())

  const commit = useCallback(
    (update: (current: FocusTimerSnapshot) => FocusTimerSnapshot) => {
      const nextSnapshot = update(snapshotRef.current)
      snapshotRef.current = nextSnapshot
      persistFocusTimerSnapshot(nextSnapshot)
      setSnapshot(nextSnapshot)
      setNow(Date.now())
    },
    [],
  )

  useEffect(() => {
    if (snapshot.activePomodoro?.status !== 'active') return undefined

    const updateNow = () => setNow(Date.now())
    const intervalId = window.setInterval(updateNow, 1_000)
    document.addEventListener('visibilitychange', updateNow)

    return () => {
      window.clearInterval(intervalId)
      document.removeEventListener('visibilitychange', updateNow)
    }
  }, [snapshot.activePomodoro?.status])

  const cycle = snapshot.activePomodoro
  const elapsedSeconds = cycle ? getPomodoroPhaseElapsedSeconds(cycle, now) : 0
  const remainingSeconds = cycle ? getPomodoroRemainingSeconds(cycle, now) : 0
  const progress = cycle ? getPomodoroProgress(cycle, now) : 0
  const isPhaseComplete = cycle?.status === 'active' && remainingSeconds === 0

  useEffect(() => {
    if (!isPhaseComplete) return
    commit((current) => {
      if (!current.activePomodoro) return current
      const { cycle: nextCycle, record } = completePomodoroPhase(
        current.activePomodoro,
      )
      return {
        ...current,
        activePomodoro: nextCycle,
        pomodoroHistory: record
          ? [record, ...current.pomodoroHistory].slice(0, 50)
          : current.pomodoroHistory,
      }
    })
  }, [commit, isPhaseComplete])

  function start(input: StartPomodoroInput) {
    const request = startPomodoroInputSchema.parse(input)
    commit((current) => {
      if (current.activeTimer || current.activePomodoro) return current
      return { ...current, activePomodoro: startPomodoro(request) }
    })
  }

  function pause() {
    commit((current) => ({
      ...current,
      activePomodoro: current.activePomodoro
        ? pausePomodoro(current.activePomodoro)
        : null,
    }))
  }

  function resume() {
    commit((current) => ({
      ...current,
      activePomodoro: current.activePomodoro
        ? resumePomodoro(current.activePomodoro)
        : null,
    }))
  }

  function skip() {
    commit((current) => {
      if (!current.activePomodoro) return current
      const { cycle: nextCycle, record } = skipPomodoroPhase(
        current.activePomodoro,
      )
      return {
        ...current,
        activePomodoro: nextCycle,
        pomodoroHistory: record
          ? [record, ...current.pomodoroHistory].slice(0, 50)
          : current.pomodoroHistory,
      }
    })
  }

  function stop() {
    commit((current) => {
      if (!current.activePomodoro) return current
      const record = cancelPomodoro(current.activePomodoro)
      return {
        ...current,
        activePomodoro: null,
        pomodoroHistory: record
          ? [record, ...current.pomodoroHistory].slice(0, 50)
          : current.pomodoroHistory,
      }
    })
  }

  return {
    activeFocusTimer: snapshot.activeTimer,
    cycle,
    elapsedSeconds,
    history: snapshot.pomodoroHistory,
    pause,
    progress,
    remainingSeconds,
    resume,
    sessionNumber: cycle ? getPomodoroSessionNumber(cycle) : 0,
    skip,
    start,
    stop,
  }
}
