import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import {
  getFocusElapsedSeconds,
  getFocusRemainingSeconds,
  getFocusSnapshot,
  startFocusTimer,
  updateFocusTimer,
} from '@/features/focus/services/focus-timer.service'
import type {
  FocusTimerSnapshot,
  StartFocusTimerInput,
} from '@/features/focus/types/focus.types'

export const focusQueryKey = ['focus', 'snapshot'] as const
export function useFocusTimer() {
  const client = useQueryClient()
  const snapshotQuery = useQuery({
    queryKey: focusQueryKey,
    queryFn: getFocusSnapshot,
    refetchInterval: 15_000,
  })
  const invalidate = async () => {
    await Promise.all([
      client.invalidateQueries({ queryKey: focusQueryKey }),
      client.invalidateQueries({ queryKey: ['tasks'] }),
      client.invalidateQueries({ queryKey: ['goals'] }),
      client.invalidateQueries({ queryKey: ['planner'] }),
      client.invalidateQueries({ queryKey: ['today-dashboard'] }),
      client.invalidateQueries({ queryKey: ['statistics'] }),
    ])
  }
  const startMutation = useMutation({
    mutationFn: startFocusTimer,
    onSuccess: invalidate,
  })
  const actionMutation = useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string
      input: {
        action: 'pause' | 'resume' | 'complete' | 'cancel'
        observedDurationSeconds?: number
      }
    }) => updateFocusTimer(id, input),
    onError: invalidate,
    onSuccess: async (session) => {
      client.setQueryData<FocusTimerSnapshot>(focusQueryKey, (snapshot) => {
        if (!snapshot) return snapshot
        return {
          ...snapshot,
          activeTimer:
            session.status === 'active' || session.status === 'paused'
              ? session
              : null,
        }
      })
      await invalidate()
    },
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
      actionMutation.mutate({
        id: activeTimer.id,
        input: {
          action: 'complete',
          observedDurationSeconds: elapsedSeconds,
        },
      })
  }, [activeTimer, actionMutation, remainingSeconds])
  const action = (action: 'pause' | 'resume' | 'complete' | 'cancel') => {
    if (
      !activeTimer ||
      actionMutation.isPending ||
      (activeTimer.status === 'active' && action === 'resume') ||
      (activeTimer.status === 'paused' && action === 'pause')
    )
      return Promise.resolve(undefined)
    return actionMutation.mutateAsync({
      id: activeTimer.id,
      input: {
        action,
        ...(action === 'resume'
          ? {}
          : { observedDurationSeconds: elapsedSeconds }),
      },
    })
  }
  return {
    activePomodoro: snapshotQuery.data?.activePomodoro ?? null,
    activeTimer,
    savedSessions: snapshotQuery.data?.savedSessions ?? [],
    elapsedSeconds,
    remainingSeconds,
    isPending:
      snapshotQuery.isPending ||
      startMutation.isPending ||
      actionMutation.isPending,
    start: (input: StartFocusTimerInput) => startMutation.mutateAsync(input),
    pause: () => action('pause'),
    resume: () => action('resume'),
    save: () => action('complete'),
    cancel: () => action('cancel'),
  }
}
