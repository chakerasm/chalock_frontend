import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { focusQueryKey } from '@/features/focus/hooks/use-focus-timer'
import {
  startPomodoroCycle,
  updatePomodoroCycle,
  getFocusSnapshot,
} from '@/features/focus/services/focus-timer.service'
import {
  getPomodoroPhaseElapsedSeconds,
  getPomodoroProgress,
  getPomodoroRemainingSeconds,
  getPomodoroSessionNumber,
} from '@/features/focus/services/pomodoro-cycle.service'
import type { StartPomodoroInput } from '@/features/focus/types/focus.types'

export function usePomodoro() {
  const client = useQueryClient()
  const snapshotQuery = useQuery({
    queryKey: focusQueryKey,
    queryFn: getFocusSnapshot,
    refetchInterval: 15_000,
  })
  const invalidate = () => client.invalidateQueries({ queryKey: focusQueryKey })
  const startMutation = useMutation({
    mutationFn: startPomodoroCycle,
    onSuccess: invalidate,
  })
  const actionMutation = useMutation({
    mutationFn: ({
      id,
      action,
    }: {
      id: string
      action: 'pause' | 'resume' | 'skip_phase' | 'cancel'
    }) => updatePomodoroCycle(id, action),
    onSuccess: invalidate,
  })
  const [now, setNow] = useState(Date.now())
  const cycle = snapshotQuery.data?.activePomodoro ?? null
  useEffect(() => {
    if (cycle?.status !== 'active') return undefined
    const tick = () => setNow(Date.now())
    const interval = window.setInterval(tick, 1_000)
    return () => window.clearInterval(interval)
  }, [cycle?.status])
  const action = (action: 'pause' | 'resume' | 'skip_phase' | 'cancel') => {
    if (cycle) actionMutation.mutate({ id: cycle.id, action })
  }
  return {
    activeFocusTimer: snapshotQuery.data?.activeTimer ?? null,
    cycle,
    history: snapshotQuery.data?.pomodoroHistory ?? [],
    elapsedSeconds: cycle ? getPomodoroPhaseElapsedSeconds(cycle, now) : 0,
    remainingSeconds: cycle ? getPomodoroRemainingSeconds(cycle, now) : 0,
    progress: cycle ? getPomodoroProgress(cycle, now) : 0,
    sessionNumber: cycle ? getPomodoroSessionNumber(cycle) : 0,
    start: (input: StartPomodoroInput) => startMutation.mutate(input),
    pause: () => action('pause'),
    resume: () => action('resume'),
    skip: () => action('skip_phase'),
    stop: () => action('cancel'),
  }
}
