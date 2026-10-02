import {
  Box,
  Button,
  Container,
  Field,
  Flex,
  HStack,
  Input,
  SimpleGrid,
  Stack,
  Switch,
  Tabs,
  Text,
} from '@chakra-ui/react'
import { Link as RouterLink } from '@tanstack/react-router'
import { Clock3, ListTodo, Music2, TimerReset } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from '@/components/ui/Toaster/Toaster'
import { PomodoroHistory } from '@/features/focus/components/PomodoroHistory'
import { PomodoroSessionView } from '@/features/focus/components/PomodoroSessionView'
import { PomodoroStartPanel } from '@/features/focus/components/PomodoroStartPanel'
import { usePomodoro } from '@/features/focus/hooks/use-pomodoro'
import { formatFocusTimerDuration } from '@/features/focus/services/focus-timer.service'
import type { StartPomodoroInput } from '@/features/focus/types/focus.types'
import { useTasks } from '@/features/tasks/hooks/use-tasks'
import { useTodayDashboard } from '@/features/today/hooks/use-today-dashboard'
import { APP_ROUTES } from '@/lib/routes'

const focusViews = ['timer', 'sessions', 'analytics', 'settings'] as const
type FocusView = (typeof focusViews)[number]

function playPhaseSound(volume: number) {
  try {
    const audioContext = new AudioContext()
    const oscillator = audioContext.createOscillator()
    const gain = audioContext.createGain()

    oscillator.frequency.value = 660
    gain.gain.setValueAtTime(volume, audioContext.currentTime)
    oscillator.connect(gain)
    gain.connect(audioContext.destination)
    oscillator.start()
    oscillator.stop(audioContext.currentTime + 0.2)
    oscillator.addEventListener('ended', () => void audioContext.close())
  } catch {
    // Optional audio must not interrupt a Pomodoro phase transition.
  }
}

function isFocusView(value: string): value is FocusView {
  return focusViews.some((focusView) => focusView === value)
}

export function PomodoroPage() {
  const { t } = useTranslation()
  const pomodoro = usePomodoro()
  const tasksQuery = useTasks()
  const dashboardQuery = useTodayDashboard()
  const [view, setView] = useState<FocusView>('timer')
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [soundVolume, setSoundVolume] = useState(0.08)
  const previousPhaseRef = useRef(pomodoro.cycle?.phase)
  const tasks = tasksQuery.data ?? []
  const goals = dashboardQuery.data?.activeGoals ?? []
  const focusSummary = dashboardQuery.data?.focusSummary
  const cycle = pomodoro.cycle
  const todayMinutes = focusSummary?.completedMinutes ?? 0
  const todaySessions = focusSummary?.completedSessions ?? 0

  useEffect(() => {
    if (!cycle) {
      previousPhaseRef.current = undefined
      return
    }

    if (previousPhaseRef.current && previousPhaseRef.current !== cycle.phase) {
      if (soundEnabled) playPhaseSound(soundVolume)
      if (
        notificationsEnabled &&
        'Notification' in window &&
        Notification.permission === 'granted'
      ) {
        new Notification(t(`pomodoro.phases.${cycle.phase}`))
      }
    }

    previousPhaseRef.current = cycle.phase
  }, [cycle, notificationsEnabled, soundEnabled, soundVolume, t])

  function handleStart(input: StartPomodoroInput) {
    pomodoro.start(input)
  }

  function handleStop() {
    pomodoro.stop()
    toast.warning({ title: t('pomodoro.sessionCancelled') })
  }

  return (
    <Container maxW="7xl" py={{ base: '5', md: '7' }}>
      <Tabs.Root
        onValueChange={(event) => {
          if (isFocusView(event.value)) setView(event.value)
        }}
        value={view}
      >
        <Stack gap="5">
          <Flex
            align={{ base: 'start', lg: 'end' }}
            gap="4"
            justify="space-between"
            wrap="wrap"
          >
            <Stack gap="1">
              <Text
                color="brand.fg"
                fontSize="xs"
                fontWeight="bold"
                textTransform="uppercase"
              >
                {t('focus.eyebrow')}
              </Text>
              <Text as="h1" fontSize="3xl" fontWeight="bold" lineHeight="1.1">
                {t('focus.workspaceTitle')}
              </Text>
              <Text color="fg.muted" fontSize="sm">
                {t('focus.workspaceDescription')}
              </Text>
            </Stack>
            <Tabs.List
              aria-label={t('focus.workspaceViews')}
              bg="bg.subtle"
              borderWidth="1px"
              overflowX="auto"
              p="1"
              rounded="l2"
            >
              <Tabs.Trigger value="timer">
                <Clock3 aria-hidden="true" size={15} />
                {t('focus.timerTab')}
              </Tabs.Trigger>
              <Tabs.Trigger value="sessions">
                <ListTodo aria-hidden="true" size={15} />
                {t('focus.sessionsTab')}
              </Tabs.Trigger>
              <Tabs.Trigger value="analytics">
                {t('focus.analyticsTab')}
              </Tabs.Trigger>
              <Tabs.Trigger value="settings">
                {t('focus.settingsTab')}
              </Tabs.Trigger>
              <Tabs.Indicator bg="brand.solid" rounded="l1" />
            </Tabs.List>
          </Flex>

          <Tabs.Content value="timer">
            <Stack gap="3">
              <SimpleGrid columns={{ base: 1, xl: 12 }} gap="3">
                <Box
                  aria-label={t('focus.timerStage')}
                  as="section"
                  backgroundImage="linear-gradient(180deg, rgba(8, 12, 20, 0.42), rgba(8, 12, 20, 0.78)), url('https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1800&q=85')"
                  backgroundPosition="center"
                  backgroundSize="cover"
                  borderColor="border.subtle"
                  borderWidth="1px"
                  color="white"
                  gridColumn={{ base: 'span 1', xl: 'span 8' }}
                  minH={{ base: '22rem', lg: '23rem' }}
                  overflow="hidden"
                  p={{ base: '4', md: '5' }}
                  rounded="l2"
                >
                  <Stack
                    align="center"
                    h="full"
                    justify="space-between"
                    minH={{ base: '19rem', lg: '20rem' }}
                  >
                    <HStack
                      aria-label={t('focus.timerModes')}
                      bg="rgba(10, 13, 20, 0.5)"
                      borderColor="rgba(255,255,255,0.18)"
                      borderWidth="1px"
                      gap="1"
                      p="1"
                      rounded="full"
                      role="group"
                    >
                      <Button aria-pressed colorPalette="brand" size="sm">
                        <TimerReset aria-hidden="true" size={15} />
                        {t('pomodoro.title')}
                      </Button>
                      <Button asChild size="sm" variant="ghost">
                        <RouterLink to={APP_ROUTES.focus}>
                          {t('focus.customMode')}
                        </RouterLink>
                      </Button>
                      <Button asChild size="sm" variant="ghost">
                        <RouterLink to={APP_ROUTES.focus}>
                          {t('focus.stopwatchTitle')}
                        </RouterLink>
                      </Button>
                    </HStack>

                    {cycle ? (
                      <PomodoroSessionView
                        cycle={cycle}
                        onPause={pomodoro.pause}
                        onResume={pomodoro.resume}
                        onSkip={pomodoro.skip}
                        onStop={handleStop}
                        progress={pomodoro.progress}
                        remainingSeconds={pomodoro.remainingSeconds}
                        sessionNumber={pomodoro.sessionNumber}
                      />
                    ) : (
                      <PomodoroStartPanel
                        blockedByActiveTimer={Boolean(
                          pomodoro.activeFocusTimer,
                        )}
                        onStart={handleStart}
                      />
                    )}
                  </Stack>
                </Box>

                <Stack gridColumn={{ base: 'span 1', xl: 'span 4' }} gap="3">
                  <Box bg="bg.panel" borderWidth="1px" p="4" rounded="l2">
                    <Stack gap="3">
                      <HStack gap="2">
                        <ListTodo aria-hidden="true" size={17} />
                        <Text fontSize="sm" fontWeight="semibold">
                          {t('focus.focusOn')}
                        </Text>
                      </HStack>
                      {cycle ? (
                        <Stack gap="2">
                          <Text fontSize="sm" fontWeight="medium">
                            {tasks.find((task) => task.id === cycle.taskId)
                              ?.title ?? t('pomodoro.noTask')}
                          </Text>
                          <Text color="fg.muted" fontSize="xs">
                            {goals.find((goal) => goal.id === cycle.goalId)
                              ?.name ?? t('pomodoro.noGoal')}
                          </Text>
                          {cycle.intention ? (
                            <Text color="fg.muted" fontSize="sm">
                              {cycle.intention}
                            </Text>
                          ) : null}
                        </Stack>
                      ) : (
                        <Text color="fg.muted" fontSize="sm">
                          {t('pomodoro.readyDescription')}
                        </Text>
                      )}
                    </Stack>
                  </Box>

                  <Box bg="bg.panel" borderWidth="1px" p="4" rounded="l2">
                    <Stack gap="3">
                      <HStack gap="2">
                        <Music2 aria-hidden="true" size={17} />
                        <Text fontSize="sm" fontWeight="semibold">
                          {t('focus.soundSettings')}
                        </Text>
                      </HStack>
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
                        <Switch.Label>
                          {t('focus.playCompletionSound')}
                        </Switch.Label>
                      </Switch.Root>
                      <Field.Root disabled={!soundEnabled}>
                        <Field.Label>{t('focus.volume')}</Field.Label>
                        <Input
                          aria-label={t('focus.volume')}
                          max="0.16"
                          min="0"
                          onChange={(event) =>
                            setSoundVolume(Number(event.target.value))
                          }
                          step="0.01"
                          type="range"
                          value={soundVolume}
                        />
                      </Field.Root>
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
                        <Switch.Label>
                          {t('focus.notifyWhenAllowed')}
                        </Switch.Label>
                      </Switch.Root>
                    </Stack>
                  </Box>
                </Stack>
              </SimpleGrid>

              <SimpleGrid columns={{ base: 1, lg: 3 }} gap="3">
                <Box bg="bg.panel" borderWidth="1px" p="4" rounded="l2">
                  <Stack gap="3">
                    <Text fontSize="sm" fontWeight="semibold">
                      {t('focus.todaysFocus')}
                    </Text>
                    <HStack gap="4">
                      <Box
                        alignItems="center"
                        aria-label={t('focus.focusMinutesToday', {
                          minutes: todayMinutes,
                        })}
                        aspectRatio="1"
                        background={`conic-gradient(var(--chakra-colors-brand-solid) ${Math.min(todayMinutes / 240, 1) * 100}%, var(--chakra-colors-bg-muted) 0)`}
                        display="flex"
                        justifyContent="center"
                        rounded="full"
                        w="5rem"
                      >
                        <Flex
                          align="center"
                          bg="bg.panel"
                          direction="column"
                          h="4rem"
                          justify="center"
                          rounded="full"
                          w="4rem"
                        >
                          <Text fontSize="sm" fontWeight="bold">
                            {todayMinutes}m
                          </Text>
                          <Text color="fg.muted" fontSize="2xs">
                            {t('focus.today')}
                          </Text>
                        </Flex>
                      </Box>
                      <Stack gap="1">
                        <Text fontSize="sm">
                          <strong>{todaySessions}</strong>{' '}
                          {t('focus.sessionsCompleted')}
                        </Text>
                        <Text color="fg.muted" fontSize="xs">
                          {t('focus.completedToday')}
                        </Text>
                      </Stack>
                    </HStack>
                  </Stack>
                </Box>

                <Box bg="bg.panel" borderWidth="1px" p="4" rounded="l2">
                  <Stack gap="3">
                    <Text fontSize="sm" fontWeight="semibold">
                      {t('focus.sessionProgress')}
                    </Text>
                    <Flex align="end" gap="2">
                      <Text fontSize="3xl" fontWeight="bold" lineHeight="1">
                        {cycle?.completedFocusSessions ?? 0}
                      </Text>
                      <Text color="fg.muted" fontSize="sm" pb="1">
                        {t('pomodoro.sessionOf', {
                          current: pomodoro.sessionNumber || 1,
                          total: cycle?.focusSessionsUntilLongBreak ?? 4,
                        })}
                      </Text>
                    </Flex>
                    <HStack gap="2">
                      {Array.from(
                        { length: cycle?.focusSessionsUntilLongBreak ?? 4 },
                        (_, index) => ({
                          id: `focus-phase-${index + 1}`,
                          completed:
                            index < (cycle?.completedFocusSessions ?? 0),
                        }),
                      ).map((phase) => (
                        <Box
                          aria-hidden="true"
                          bg={phase.completed ? 'brand.solid' : 'bg.muted'}
                          h="2"
                          key={phase.id}
                          rounded="full"
                          w="full"
                        />
                      ))}
                    </HStack>
                    <Text color="fg.muted" fontSize="xs">
                      {t('focus.sessionProgressDescription')}
                    </Text>
                  </Stack>
                </Box>

                <Box bg="bg.panel" borderWidth="1px" p="4" rounded="l2">
                  <Text fontSize="sm" fontWeight="semibold" mb="3">
                    {t('focus.recentSessions')}
                  </Text>
                  {pomodoro.history.length ? (
                    <Stack gap="2">
                      {pomodoro.history.slice(0, 3).map((record) => (
                        <Flex
                          align="center"
                          gap="2"
                          justify="space-between"
                          key={record.id}
                        >
                          <Stack gap="0" minW="0">
                            <Text
                              fontSize="xs"
                              fontWeight="medium"
                              lineClamp="1"
                            >
                              {record.intention ?? t('pomodoro.unlinked')}
                            </Text>
                            <Text color="fg.muted" fontSize="2xs">
                              {t(
                                `pomodoro.historyState.${record.completionState}`,
                              )}
                            </Text>
                          </Stack>
                          <Text
                            fontSize="xs"
                            fontVariantNumeric="tabular-nums"
                            fontWeight="semibold"
                          >
                            {formatFocusTimerDuration(record.durationSeconds)}
                          </Text>
                        </Flex>
                      ))}
                    </Stack>
                  ) : (
                    <Text color="fg.muted" fontSize="xs">
                      {t('pomodoro.historyEmpty')}
                    </Text>
                  )}
                </Box>
              </SimpleGrid>
            </Stack>
          </Tabs.Content>

          <Tabs.Content value="sessions">
            <PomodoroHistory
              goals={goals}
              history={pomodoro.history}
              tasks={tasks}
            />
          </Tabs.Content>
          <Tabs.Content value="analytics">
            <SimpleGrid columns={{ base: 1, md: 2 }} gap="3">
              <Box bg="bg.panel" borderWidth="1px" p="5" rounded="l2">
                <Text color="fg.muted" fontSize="sm">
                  {t('focus.todaysFocus')}
                </Text>
                <Text fontSize="3xl" fontWeight="bold">
                  {todayMinutes} {t('focus.minutesUnit')}
                </Text>
                <Text color="fg.muted" fontSize="sm">
                  {t('focus.completedToday')}
                </Text>
              </Box>
              <Box bg="bg.panel" borderWidth="1px" p="5" rounded="l2">
                <Text color="fg.muted" fontSize="sm">
                  {t('focus.sessionProgress')}
                </Text>
                <Text fontSize="3xl" fontWeight="bold">
                  {todaySessions}
                </Text>
                <Text color="fg.muted" fontSize="sm">
                  {t('focus.sessionsCompleted')}
                </Text>
              </Box>
            </SimpleGrid>
          </Tabs.Content>
          <Tabs.Content value="settings">
            <Box bg="bg.panel" borderWidth="1px" maxW="2xl" p="5" rounded="l2">
              <Stack gap="4">
                <Text fontSize="lg" fontWeight="semibold">
                  {t('focus.completionOptions')}
                </Text>
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
                <Text color="fg.muted" fontSize="sm">
                  {t('focus.notificationPermissionHint')}
                </Text>
              </Stack>
            </Box>
          </Tabs.Content>
        </Stack>
      </Tabs.Root>
    </Container>
  )
}
