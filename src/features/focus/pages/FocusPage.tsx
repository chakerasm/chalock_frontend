import {
  Box,
  Button,
  Container,
  HStack,
  Stack,
  Switch,
  Text,
} from '@chakra-ui/react'
import { Link as RouterLink } from '@tanstack/react-router'
import { TimerReset } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PageHeader } from '@/components/shared/PageHeader/PageHeader'
import { toast } from '@/components/ui/Toaster/Toaster'
import { ActiveFocusTimerCard } from '@/features/focus/components/ActiveFocusTimerCard'
import { FocusTimerSetup } from '@/features/focus/components/FocusTimerSetup'
import { SavedFocusSessions } from '@/features/focus/components/SavedFocusSessions'
import { useFocusTimer } from '@/features/focus/hooks/use-focus-timer'
import type { StartFocusTimerInput } from '@/features/focus/types/focus.types'
import { useTasks } from '@/features/tasks/hooks/use-tasks'
import { useTodayDashboard } from '@/features/today/hooks/use-today-dashboard'

function playCompletionSound() {
  try {
    const audioContext = new AudioContext()
    const oscillator = audioContext.createOscillator()
    const gain = audioContext.createGain()

    oscillator.frequency.value = 880
    gain.gain.setValueAtTime(0.08, audioContext.currentTime)
    oscillator.connect(gain)
    gain.connect(audioContext.destination)
    oscillator.start()
    oscillator.stop(audioContext.currentTime + 0.18)
    oscillator.addEventListener('ended', () => void audioContext.close())
  } catch {
    // Sound is an optional enhancement and must not interrupt timer completion.
  }
}

export function FocusPage() {
  const { t } = useTranslation()
  const timer = useFocusTimer()
  const tasksQuery = useTasks()
  const dashboardQuery = useTodayDashboard()
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const completedTimerRef = useRef<string | undefined>(undefined)

  useEffect(() => {
    const activeTimer = timer.activeTimer
    if (activeTimer?.status !== 'completed' || activeTimer.type !== 'timer') {
      return
    }
    if (completedTimerRef.current === activeTimer.id) return

    completedTimerRef.current = activeTimer.id
    if (soundEnabled) playCompletionSound()

    if (
      notificationsEnabled &&
      'Notification' in window &&
      Notification.permission === 'granted'
    ) {
      new Notification(t('focus.timerFinished'))
    }
  }, [notificationsEnabled, soundEnabled, t, timer.activeTimer])

  function handleStart(input: StartFocusTimerInput) {
    timer.start(input)
  }

  function handleSave() {
    timer.save()
    toast.success({ title: t('focus.sessionSaved') })
  }

  return (
    <Container maxW="6xl" py={{ base: '6', md: '10' }}>
      <Stack gap={{ base: '5', md: '7' }}>
        <PageHeader
          actions={
            <Button asChild colorPalette="brand" variant="outline">
              <RouterLink to="/focus/pomodoro">
                <TimerReset aria-hidden="true" size={17} />
                {t('focus.openPomodoro')}
              </RouterLink>
            </Button>
          }
          description={t('focus.description')}
          eyebrow={t('focus.eyebrow')}
          title={t('focus.title')}
        />
        {timer.activeTimer ? (
          <ActiveFocusTimerCard
            elapsedSeconds={timer.elapsedSeconds}
            onCancel={timer.cancel}
            onPause={timer.pause}
            onReset={timer.reset}
            onRestart={timer.restart}
            onResume={timer.resume}
            onSave={handleSave}
            remainingSeconds={timer.remainingSeconds}
            timer={timer.activeTimer}
          />
        ) : timer.activePomodoro ? (
          <Box bg="bg.subtle" borderWidth="1px" p="5" rounded="l2">
            <Stack align="start" gap="3">
              <Text fontWeight="semibold">{t('focus.pomodoroActive')}</Text>
              <Button asChild colorPalette="brand" size="sm">
                <RouterLink to="/focus/pomodoro">
                  {t('focus.openPomodoro')}
                </RouterLink>
              </Button>
            </Stack>
          </Box>
        ) : (
          <FocusTimerSetup onStart={handleStart} />
        )}
        <Box bg="bg.subtle" borderWidth="1px" p="4" rounded="l2">
          <Stack gap="3">
            <Text fontSize="sm" fontWeight="semibold">
              {t('focus.completionOptions')}
            </Text>
            <HStack align="start" gap="6" wrap="wrap">
              <Switch.Root
                checked={soundEnabled}
                onCheckedChange={({ checked }) =>
                  setSoundEnabled(checked === true)
                }
              >
                <Switch.HiddenInput />
                <Switch.Control>
                  <Switch.Thumb />
                </Switch.Control>
                <Switch.Label>{t('focus.playCompletionSound')}</Switch.Label>
              </Switch.Root>
              <Switch.Root
                checked={notificationsEnabled}
                onCheckedChange={({ checked }) =>
                  setNotificationsEnabled(checked === true)
                }
              >
                <Switch.HiddenInput />
                <Switch.Control>
                  <Switch.Thumb />
                </Switch.Control>
                <Switch.Label>{t('focus.notifyWhenAllowed')}</Switch.Label>
              </Switch.Root>
            </HStack>
            <Text color="fg.muted" fontSize="sm">
              {t('focus.notificationPermissionHint')}
            </Text>
          </Stack>
        </Box>
        <SavedFocusSessions
          goals={dashboardQuery.data?.activeGoals ?? []}
          sessions={timer.savedSessions}
          tasks={tasksQuery.data ?? []}
        />
      </Stack>
    </Container>
  )
}
