import {
  Box,
  Button,
  Container,
  Field,
  Flex,
  HStack,
  IconButton,
  Input,
  NativeSelect,
  SimpleGrid,
  Stack,
  Switch,
  Tabs,
  Text,
} from '@chakra-ui/react'
import { Link as RouterLink } from '@tanstack/react-router'
import {
  Check,
  Clock3,
  ListTodo,
  Music2,
  Pause,
  Play,
  Save,
  TimerReset,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PrivateText } from '@/components/ui/PrivateText/PrivateText'
import { toast } from '@/components/ui/Toaster/Toaster'
import { SavedFocusSessions } from '@/features/focus/components/SavedFocusSessions'
import { useFocusTimer } from '@/features/focus/hooks/use-focus-timer'
import { formatFocusTimerDuration } from '@/features/focus/services/focus-timer.service'
import type { StartFocusTimerInput } from '@/features/focus/types/focus.types'
import { useTasks } from '@/features/tasks/hooks/use-tasks'
import { useTodayDashboard } from '@/features/today/hooks/use-today-dashboard'
import { APP_ROUTES } from '@/lib/routes'

const timerPresets = [5, 10, 15, 25, 30, 45, 60]
const focusViews = ['timer', 'sessions', 'analytics', 'settings'] as const
type FocusView = (typeof focusViews)[number]
type TimerMode = 'timer' | 'stopwatch'

function isFocusView(value: string): value is FocusView {
  return focusViews.some((focusView) => focusView === value)
}

function playCompletionSound(volume: number) {
  try {
    const audioContext = new AudioContext()
    const oscillator = audioContext.createOscillator()
    const gain = audioContext.createGain()

    oscillator.frequency.value = 880
    gain.gain.setValueAtTime(volume, audioContext.currentTime)
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
  const [view, setView] = useState<FocusView>('timer')
  const [mode, setMode] = useState<TimerMode>('timer')
  const [selectedPreset, setSelectedPreset] = useState(25)
  const [customMinutes, setCustomMinutes] = useState('')
  const [taskId, setTaskId] = useState('')
  const [goalId, setGoalId] = useState('')
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [soundVolume, setSoundVolume] = useState(0.08)
  const completedTimerRef = useRef<string | undefined>(undefined)
  const tasks = tasksQuery.data ?? []
  const goals = dashboardQuery.data?.activeGoals ?? []
  const focusSummary = dashboardQuery.data?.focusSummary
  const activeTimer = timer.activeTimer
  const isCountdown = activeTimer?.type === 'timer'
  const isActive = activeTimer?.status === 'active'
  const isCompleted = activeTimer?.status === 'completed'
  const customDuration = Number(customMinutes)
  const selectedDurationMinutes = customMinutes
    ? customDuration
    : selectedPreset
  const hasValidCustomDuration =
    Number.isInteger(customDuration) &&
    customDuration > 0 &&
    customDuration <= 1_440
  const hasValidTimerDuration = !customMinutes || hasValidCustomDuration
  const displayedSeconds = activeTimer
    ? isCountdown
      ? (timer.remainingSeconds ?? 0)
      : timer.elapsedSeconds
    : mode === 'timer'
      ? selectedDurationMinutes * 60
      : 0
  const todayMinutes = focusSummary?.completedMinutes ?? 0
  const todaySessions = focusSummary?.completedSessions ?? 0

  useEffect(() => {
    if (activeTimer?.status !== 'completed' || activeTimer.type !== 'timer') {
      return
    }
    if (completedTimerRef.current === activeTimer.id) return

    completedTimerRef.current = activeTimer.id
    if (soundEnabled) playCompletionSound(soundVolume)

    if (
      notificationsEnabled &&
      'Notification' in window &&
      Notification.permission === 'granted'
    ) {
      new Notification(t('focus.timerFinished'))
    }
  }, [activeTimer, notificationsEnabled, soundEnabled, soundVolume, t])

  function handleStart() {
    const input: StartFocusTimerInput = {
      goalId: goalId || undefined,
      taskId: taskId || undefined,
      type: mode === 'timer' ? 'timer' : 'stopwatch',
      ...(mode === 'timer'
        ? { plannedDurationSeconds: selectedDurationMinutes * 60 }
        : {}),
    }
    timer.start(input)
  }

  async function handleSave() {
    const session = await timer.save()
    if (session) toast.success({ title: t('focus.sessionSaved') })
  }

  return (
    <Container maxW="7xl" py={{ base: '5', md: '7' }}>
      <Tabs.Root
        onValueChange={(event) => {
          if (isFocusView(event.value)) setView(event.value)
        }}
        value={view}
        variant="plain"
      >
        <Stack gap="5">
          <Flex
            align={{ base: 'start', lg: 'end' }}
            justify="space-between"
            wrap="wrap"
            gap="4"
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
              p="1"
              rounded="l2"
              overflowX="auto"
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
                  backgroundImage="linear-gradient(180deg, rgba(8, 12, 20, 0.48), rgba(8, 12, 20, 0.78)), url('https://images.wallpaperscraft.com/image/single/panther_predator_big_cat_125419_1280x720.jpg')"
                  backgroundPosition="center"
                  backgroundSize="cover"
                  borderColor="border.subtle"
                  borderWidth="1px"
                  color="white"
                  gridColumn={{ base: 'span 1', xl: 'span 8' }}
                  minH={{ base: '22rem', lg: '23rem' }}
                  overflow="hidden"
                  p={{ base: '4', md: '5' }}
                  position="relative"
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
                      bg="rgba(10, 13, 20, 0.42)"
                      borderColor="rgba(255,255,255,0.16)"
                      borderWidth="1px"
                      gap="1"
                      p="1"
                      rounded="full"
                      role="group"
                    >
                      <Button asChild size="sm" variant="ghost">
                        <RouterLink to={APP_ROUTES.pomodoro}>
                          <TimerReset aria-hidden="true" size={15} />
                          {t('pomodoro.title')}
                        </RouterLink>
                      </Button>
                      <Button
                        aria-pressed={mode === 'timer'}
                        colorPalette={mode === 'timer' ? 'brand' : undefined}
                        onClick={() => setMode('timer')}
                        size="sm"
                        variant={mode === 'timer' ? 'solid' : 'ghost'}
                      >
                        {t('focus.customMode')}
                      </Button>
                      <Button
                        aria-pressed={mode === 'stopwatch'}
                        colorPalette={
                          mode === 'stopwatch' ? 'brand' : undefined
                        }
                        onClick={() => setMode('stopwatch')}
                        size="sm"
                        variant={mode === 'stopwatch' ? 'solid' : 'ghost'}
                      >
                        {t('focus.stopwatchTitle')}
                      </Button>
                    </HStack>

                    {timer.activePomodoro && !activeTimer ? (
                      <Stack align="center" gap="3" textAlign="center">
                        <Text fontSize="xl" fontWeight="semibold">
                          {t('focus.pomodoroActive')}
                        </Text>
                        <Button asChild colorPalette="brand">
                          <RouterLink to={APP_ROUTES.pomodoro}>
                            {t('focus.openPomodoro')}
                          </RouterLink>
                        </Button>
                      </Stack>
                    ) : (
                      <Stack align="center" gap="2" textAlign="center">
                        <Text
                          color="whiteAlpha.800"
                          fontSize="sm"
                          fontWeight="medium"
                        >
                          {isCompleted
                            ? t('focus.completed')
                            : t('pomodoro.phases.focus')}
                        </Text>
                        <Text
                          aria-live="off"
                          fontSize={{ base: '5xl', md: '7xl' }}
                          fontVariantNumeric="tabular-nums"
                          fontWeight="bold"
                          lineHeight="1"
                        >
                          {formatFocusTimerDuration(displayedSeconds)}
                        </Text>
                        <Text color="whiteAlpha.800" fontSize="sm">
                          {activeTimer
                            ? isCountdown
                              ? t('focus.remaining')
                              : t('focus.elapsed')
                            : mode === 'timer'
                              ? t('focus.timerTitle')
                              : t('focus.stopwatchTitle')}
                        </Text>
                        {isCountdown && activeTimer?.plannedDurationSeconds ? (
                          <Text color="whiteAlpha.800" fontSize="xs">
                            {t('focus.originalDuration', {
                              duration: formatFocusTimerDuration(
                                activeTimer.plannedDurationSeconds,
                              ),
                            })}
                          </Text>
                        ) : null}
                      </Stack>
                    )}

                    <HStack align="center" gap="3">
                      {activeTimer ? (
                        <>
                          <IconButton
                            aria-label={
                              isActive ? t('focus.pause') : t('focus.resume')
                            }
                            colorPalette="brand"
                            disabled={isCompleted || timer.isPending}
                            onClick={isActive ? timer.pause : timer.resume}
                            rounded="full"
                            size="2xl"
                            title={
                              isActive ? t('focus.pause') : t('focus.resume')
                            }
                          >
                            {isActive ? (
                              <Pause aria-hidden="true" size={24} />
                            ) : (
                              <Play aria-hidden="true" size={24} />
                            )}
                          </IconButton>
                          <Button
                            disabled={timer.isPending}
                            onClick={handleSave}
                          >
                            {isCompleted ? (
                              <Check aria-hidden="true" size={16} />
                            ) : (
                              <Save aria-hidden="true" size={16} />
                            )}
                            {isCompleted
                              ? t('focus.saveSession')
                              : t('focus.finishAndSave')}
                          </Button>
                          {!isCompleted ? (
                            <Button
                              disabled={timer.isPending}
                              onClick={timer.cancel}
                              variant="ghost"
                            >
                              {t('focus.cancel')}
                            </Button>
                          ) : null}
                        </>
                      ) : (
                        <IconButton
                          aria-label={
                            mode === 'timer'
                              ? t('focus.startTimer')
                              : t('focus.startStopwatch')
                          }
                          colorPalette="brand"
                          disabled={mode === 'timer' && !hasValidTimerDuration}
                          onClick={handleStart}
                          rounded="full"
                          size="2xl"
                          title={
                            mode === 'timer'
                              ? t('focus.startTimer')
                              : t('focus.startStopwatch')
                          }
                        >
                          <Play aria-hidden="true" size={26} />
                        </IconButton>
                      )}
                    </HStack>
                  </Stack>
                </Box>

                <Stack gridColumn={{ base: 'span 1', xl: 'span 4' }} gap="3">
                  <Box bg="bg.panel" borderWidth="1px" p="4" rounded="l2">
                    <Stack gap="3">
                      <Flex align="center" justify="space-between">
                        <HStack gap="2">
                          <ListTodo aria-hidden="true" size={17} />
                          <Text fontSize="sm" fontWeight="semibold">
                            {t('focus.focusOn')}
                          </Text>
                        </HStack>
                        <Button
                          onClick={() => {
                            setTaskId('')
                            setGoalId('')
                          }}
                          size="xs"
                          variant="ghost"
                        >
                          {t('focus.clear')}
                        </Button>
                      </Flex>
                      <Field.Root>
                        <Field.Label>{t('focus.taskLabel')}</Field.Label>
                        <NativeSelect.Root>
                          <NativeSelect.Field
                            onChange={(event) => setTaskId(event.target.value)}
                            value={taskId}
                          >
                            <option value="">{t('focus.noTask')}</option>
                            {tasks
                              .filter((task) => task.status !== 'completed')
                              .map((task) => (
                                <option key={task.id} value={task.id}>
                                  <PrivateText>{task.title}</PrivateText>
                                </option>
                              ))}
                          </NativeSelect.Field>
                          <NativeSelect.Indicator />
                        </NativeSelect.Root>
                      </Field.Root>
                      <Field.Root>
                        <Field.Label>{t('focus.goalLabel')}</Field.Label>
                        <NativeSelect.Root>
                          <NativeSelect.Field
                            onChange={(event) => setGoalId(event.target.value)}
                            value={goalId}
                          >
                            <option value="">{t('focus.noGoal')}</option>
                            {goals.map((goal) => (
                              <option key={goal.id} value={goal.id}>
                                <PrivateText>{goal.name}</PrivateText>
                              </option>
                            ))}
                          </NativeSelect.Field>
                          <NativeSelect.Indicator />
                        </NativeSelect.Root>
                      </Field.Root>
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

                  {!activeTimer ? (
                    <Box bg="bg.panel" borderWidth="1px" p="4" rounded="l2">
                      <Stack gap="3">
                        <Text fontSize="sm" fontWeight="semibold">
                          {t('focus.duration')}
                        </Text>
                        <HStack gap="2" wrap="wrap">
                          {timerPresets.map((minutes) => (
                            <Button
                              aria-pressed={
                                !customMinutes && selectedPreset === minutes
                              }
                              colorPalette={
                                !customMinutes && selectedPreset === minutes
                                  ? 'brand'
                                  : undefined
                              }
                              key={minutes}
                              onClick={() => {
                                setCustomMinutes('')
                                setSelectedPreset(minutes)
                              }}
                              size="xs"
                              variant={
                                !customMinutes && selectedPreset === minutes
                                  ? 'subtle'
                                  : 'outline'
                              }
                            >
                              {t('focus.minutes', { minutes })}
                            </Button>
                          ))}
                        </HStack>
                        {mode === 'timer' ? (
                          <Field.Root
                            invalid={
                              Boolean(customMinutes) && !hasValidCustomDuration
                            }
                          >
                            <Field.Label>
                              {t('focus.customDuration')}
                            </Field.Label>
                            <Input
                              max="1440"
                              min="1"
                              onChange={(event) =>
                                setCustomMinutes(event.target.value)
                              }
                              placeholder={t('focus.customDurationPlaceholder')}
                              type="number"
                              value={customMinutes}
                            />
                            {customMinutes && !hasValidCustomDuration ? (
                              <Field.ErrorText>
                                {t('focus.invalidDuration')}
                              </Field.ErrorText>
                            ) : null}
                          </Field.Root>
                        ) : null}
                      </Stack>
                    </Box>
                  ) : null}
                </Stack>
              </SimpleGrid>

              <SimpleGrid columns={{ base: 1, lg: 3 }} gap="3">
                <Box bg="bg.panel" borderWidth="1px" p="4" rounded="l2">
                  <Stack gap="3">
                    <Text fontSize="sm" fontWeight="semibold">
                      {t('focus.todaysFocus')}
                    </Text>
                    <Stack gap="1">
                      <Flex align="end" gap="2">
                        <Text fontSize="3xl" fontWeight="bold" lineHeight="1">
                          {todayMinutes}
                        </Text>
                        <Text color="fg.muted" fontSize="sm" pb="1">
                          {t('focus.minutesUnit')}
                        </Text>
                      </Flex>
                      <Stack gap="1">
                        <Text fontSize="sm">
                          {todaySessions} {t('focus.sessionsCompleted')}
                        </Text>
                        <Text color="fg.muted" fontSize="xs">
                          {t('focus.completedToday')}
                        </Text>
                      </Stack>
                    </Stack>
                  </Stack>
                </Box>

                <Box bg="bg.panel" borderWidth="1px" p="4" rounded="l2">
                  <Stack gap="3">
                    <Text fontSize="sm" fontWeight="semibold">
                      {t('focus.sessionProgress')}
                    </Text>
                    <Flex align="end" gap="2">
                      <Text fontSize="3xl" fontWeight="bold" lineHeight="1">
                        {todaySessions}
                      </Text>
                      <Text color="fg.muted" fontSize="sm" pb="1">
                        {t('focus.sessionsCompleted')}
                      </Text>
                    </Flex>
                    <Text color="fg.muted" fontSize="xs">
                      {t('focus.sessionProgressDescription')}
                    </Text>
                  </Stack>
                </Box>

                <Box bg="bg.panel" borderWidth="1px" p="4" rounded="l2">
                  <Flex align="center" justify="space-between" mb="3">
                    <Text fontSize="sm" fontWeight="semibold">
                      {t('focus.recentSessions')}
                    </Text>
                    <Button
                      onClick={() => setView('sessions')}
                      size="xs"
                      variant="ghost"
                    >
                      {t('focus.viewAll')}
                    </Button>
                  </Flex>
                  {timer.savedSessions.length ? (
                    <Stack gap="2">
                      {timer.savedSessions.slice(0, 3).map((session) => {
                        const task = tasks.find(
                          (item) => item.id === session.taskId,
                        )
                        return (
                          <Flex
                            align="center"
                            gap="2"
                            justify="space-between"
                            key={session.id}
                          >
                            <Stack gap="0" minW="0">
                              <Text
                                fontSize="xs"
                                fontWeight="medium"
                                lineClamp="1"
                              >
                                {task?.title ??
                                  t(
                                    `focus.${session.type === 'timer' ? 'timerTitle' : 'stopwatchTitle'}`,
                                  )}
                              </Text>
                              <Text color="fg.muted" fontSize="2xs">
                                {t('focus.completed')}
                              </Text>
                            </Stack>
                            <Text
                              fontSize="xs"
                              fontVariantNumeric="tabular-nums"
                              fontWeight="semibold"
                            >
                              {formatFocusTimerDuration(
                                session.durationSeconds,
                              )}
                            </Text>
                          </Flex>
                        )
                      })}
                    </Stack>
                  ) : (
                    <Text color="fg.muted" fontSize="xs">
                      {t('focus.savedSessionsEmptyTitle')}
                    </Text>
                  )}
                </Box>
              </SimpleGrid>
            </Stack>
          </Tabs.Content>
          <Tabs.Content value="sessions">
            <SavedFocusSessions
              goals={goals}
              sessions={timer.savedSessions}
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
                  {t('focus.sessionsCompleted')}
                </Text>
                <Text fontSize="3xl" fontWeight="bold">
                  {todaySessions}
                </Text>
                <Text color="fg.muted" fontSize="sm">
                  {t('focus.sessionProgressDescription')}
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
