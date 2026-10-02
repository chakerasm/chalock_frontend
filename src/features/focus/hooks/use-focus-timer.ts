import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import {
  getFocusElapsedSeconds,
  getFocusRemainingSeconds,
  getFocusSnapshot,
  startFocusTimer,
  updateFocusTimer,
} from '@/features/focus/services/focus-timer.service'
import type { StartFocusTimerInput } from '@/features/focus/types/focus.types'

export const focusQueryKey = ['focus', 'snapshot'] as const
export function useFocusTimer() {
  const client = useQueryClient()
  const snapshotQuery = useQuery({
    queryKey: focusQueryKey,
    queryFn: getFocusSnapshot,
    refetchInterval: 15_000,
  })
  const invalidate = () => client.invalidateQueries({ queryKey: focusQueryKey })
  const startMutation = useMutation({
    mutationFn: startFocusTimer,
    onSuccess: invalidate,
  })
  const actionMutation = useMutation({
    mutationFn: ({
      id,
      action,
    }: {
      id: string
      action: 'pause' | 'resume' | 'complete' | 'cancel'
    }) => updateFocusTimer(id, action),
    onSuccess: invalidate,
  })
  const [now, setNow] = useState(Date.now())
  const activeTimer = snapshotQuery.data?.activeTimer ?? null
  useEffect(() => {
    if (activeTimer?.status !== 'active') return undefined
    const tick = () => setNow(Date.now())
    const interval = window.setInterval(tick, 1_000)
    document.addEventListener('visibilitychange', tick)
    return () => {
      window.clearInterval(interval)
      document.removeEventListener('visibilitychange', tick)
    }
  }, [activeTimer?.status])
  const elapsedSeconds = activeTimer
    ? getFocusElapsedSeconds(activeTimer, now)
    : 0
  const remainingSeconds = activeTimer
    ? getFocusRemainingSeconds(activeTimer, now)
    : undefined
  useEffect(() => {
    if (
      activeTimer?.type === 'timer' &&
      activeTimer.status === 'active' &&
      remainingSeconds === 0
    )
      actionMutation.mutate({ id: activeTimer.id, action: 'complete' })
  }, [activeTimer, actionMutation, remainingSeconds])
  const action = (action: 'pause' | 'resume' | 'complete' | 'cancel') => {
    if (activeTimer) actionMutation.mutate({ id: activeTimer.id, action })
  }
  return {
    activePomodoro: snapshotQuery.data?.activePomodoro ?? null,
    activeTimer,
    savedSessions: snapshotQuery.data?.savedSessions ?? [],
    elapsedSeconds,
    remainingSeconds,
    isPending: snapshotQuery.isPending,
    start: (input: StartFocusTimerInput) => startMutation.mutateAsync(input),
    pause: () => action('pause'),
    resume: () => action('resume'),
    save: () => action('complete'),
    cancel: () => action('cancel'),
    reset: () => action('cancel'),
    restart: () => action('cancel'),
  }
}
