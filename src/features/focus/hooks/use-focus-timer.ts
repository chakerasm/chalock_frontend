import { useCallback, useEffect, useRef, useState } from 'react'
import {
  completeFocusTimer,
  getFocusElapsedSeconds,
  getFocusRemainingSeconds,
  getFocusTimerSnapshot,
  pauseFocusTimer,
  persistFocusTimerSnapshot,
  resetStopwatch,
  restartFocusTimer,
  resumeFocusTimer,
  saveFocusTimerSession,
  startFocusTimer,
} from '@/features/focus/services/focus-timer.service'
import type {
  ActiveFocusTimer,
  FocusTimerSnapshot,
  StartFocusTimerInput,
} from '@/features/focus/types/focus.types'

export function useFocusTimer() {
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
    if (snapshot.activeTimer?.status !== 'active') return undefined

    const updateNow = () => setNow(Date.now())
    const intervalId = window.setInterval(updateNow, 1_000)
    document.addEventListener('visibilitychange', updateNow)

    return () => {
      window.clearInterval(intervalId)
      document.removeEventListener('visibilitychange', updateNow)
    }
  }, [snapshot.activeTimer?.status])

  const activeTimer = snapshot.activeTimer
  const elapsedSeconds = activeTimer
    ? getFocusElapsedSeconds(activeTimer, now)
    : 0
  const remainingSeconds = activeTimer
    ? getFocusRemainingSeconds(activeTimer, now)
    : undefined
  const isCountdownComplete =
    activeTimer?.type === 'timer' &&
    activeTimer.status === 'active' &&
    remainingSeconds === 0

  useEffect(() => {
    if (!isCountdownComplete) return
    commit((current) => ({
      ...current,
      activeTimer: current.activeTimer
        ? completeFocusTimer(current.activeTimer)
        : null,
    }))
  }, [commit, isCountdownComplete])

  function start(input: StartFocusTimerInput): ActiveFocusTimer | null {
    let startedTimer: ActiveFocusTimer | null = null
    commit((current) => {
      if (current.activePomodoro || current.activeTimer) return current
      const nextTimer = startFocusTimer(input)
      startedTimer = nextTimer
      return { ...current, activeTimer: nextTimer }
    })
    return startedTimer
  }

  function pause() {
    commit((current) => ({
      ...current,
      activeTimer: current.activeTimer
        ? pauseFocusTimer(current.activeTimer)
        : null,
    }))
  }

  function resume() {
    commit((current) => ({
      ...current,
      activeTimer: current.activeTimer
        ? resumeFocusTimer(current.activeTimer)
        : null,
    }))
  }

  function reset() {
    commit((current) => ({
      ...current,
      activeTimer: current.activeTimer
        ? resetStopwatch(current.activeTimer)
        : null,
    }))
  }

  function restart() {
    commit((current) => ({
      ...current,
      activeTimer: current.activeTimer
        ? restartFocusTimer(current.activeTimer)
        : null,
    }))
  }

  function cancel() {
    commit((current) => ({ ...current, activeTimer: null }))
  }

  function save() {
    commit((current) => saveFocusTimerSession(current))
  }

  return {
    activePomodoro: snapshot.activePomodoro,
    activeTimer,
    cancel,
    elapsedSeconds,
    pause,
    remainingSeconds,
    reset,
    restart,
    resume,
    savedSessions: snapshot.savedSessions,
    save,
    start,
  }
}
