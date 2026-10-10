import {
  Badge,
  Box,
  Button,
  Checkbox,
  Dialog,
  Field,
  Flex,
  Grid,
  HStack,
  Input,
  NativeSelect,
  Portal,
  SimpleGrid,
  Stack,
  Text,
} from '@chakra-ui/react'
import { CalendarClock, Clock3, Plus, TriangleAlert } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PrivateText } from '@/components/ui/PrivateText/PrivateText'
import {
  getEndTime,
  getPlanningWeekDates,
  getSuggestedStartTime,
} from '@/features/goals/services/goal-planning.service'
import {
  formatDuration,
  timeToMinutes,
} from '@/features/planner/services/planner-calculations'
import type { TimeBlock } from '@/features/planner/types/planner.types'
import { deduplicateTasks } from '@/features/tasks/services/tasks.service'
import type { Task } from '@/features/tasks/types/tasks.types'

export type GoalPlanEntry = {
  date: string
  durationMinutes: number
  startTime: string
  taskId: string
}

type GoalPlanningDialogProps = {
  goalId: string
  isSaving: boolean
  onConfirm: (entries: GoalPlanEntry[]) => Promise<boolean>
  onOpenChange: (open: boolean) => void
  open: boolean
  plannerBlocks: TimeBlock[]
  tasks: Task[]
}

function formatDay(date: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    weekday: 'short',
  }).format(new Date(`${date}T12:00:00`))
}

export function GoalPlanningDialog({
  goalId,
  isSaving,
  onConfirm,
  onOpenChange,
  open,
  plannerBlocks,
  tasks,
}: GoalPlanningDialogProps) {
  const { i18n, t } = useTranslation()
  const weekDates = useMemo(() => getPlanningWeekDates(), [])
  const [selectedTaskId, setSelectedTaskId] = useState<string>()
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([])
  const [date, setDate] = useState(weekDates[0])
  const [startTime, setStartTime] = useState('09:00')
  const [durationMinutes, setDurationMinutes] = useState(60)
  const [allowOverlap, setAllowOverlap] = useState(false)
  const [entries, setEntries] = useState<GoalPlanEntry[]>([])
  const recurringTaskCount = new Set(
    tasks.filter((task) => task.seriesId).map((task) => task.seriesId),
  ).size
  const uniqueTasks = deduplicateTasks(tasks).filter((task) => !task.seriesId)
  const uniqueEntries = Array.from(
    new Map(entries.map((entry) => [entry.taskId, entry])).values(),
  )
  const scheduledTaskIds = new Set(
    plannerBlocks
      .filter((block) => block.goalId === goalId && block.taskId)
      .map((block) => block.taskId),
  )
  const stagedTaskIds = new Set(uniqueEntries.map((entry) => entry.taskId))
  const unscheduledTasks = uniqueTasks.filter(
    (task) =>
      task.status !== 'completed' &&
      task.status !== 'cancelled' &&
      !scheduledTaskIds.has(task.id) &&
      !stagedTaskIds.has(task.id),
  )
  const selectedTask = unscheduledTasks.find(
    (task) => task.id === selectedTaskId,
  )
  const selectedTasks = unscheduledTasks.filter((task) =>
    selectedTaskIds.includes(task.id),
  )
  const allTasksSelected =
    unscheduledTasks.length > 0 &&
    selectedTasks.length === unscheduledTasks.length
  const someTasksSelected = selectedTasks.length > 0 && !allTasksSelected
  const scheduledEntries = uniqueEntries.filter((entry) => entry.date === date)
  const endTime = getEndTime(startTime, durationMinutes)
  const conflicts = [
    ...plannerBlocks.map((block) => ({
      date: block.date,
      endTime: block.endTime,
      startTime: block.startTime,
    })),
    ...scheduledEntries.map((entry) => ({
      date: entry.date,
      endTime: getEndTime(entry.startTime, entry.durationMinutes),
      startTime: entry.startTime,
    })),
  ].filter(
    (block) =>
      block.date === date &&
      timeToMinutes(startTime) < timeToMinutes(block.endTime) &&
      timeToMinutes(endTime) > timeToMinutes(block.startTime),
  )

  const plannedMinutes = uniqueEntries.reduce(
    (total, entry) => total + entry.durationMinutes,
    0,
  )
  const remainingMinutes = unscheduledTasks.reduce(
    (total, task) => total + (task.estimatedMinutes ?? 0),
    0,
  )

  function selectTask(task: Task) {
    const suggestedStart = getSuggestedStartTime(
      plannerBlocks,
      date,
      task.estimatedMinutes ?? 60,
    )
    setSelectedTaskId(task.id)
    setDurationMinutes(task.estimatedMinutes ?? 60)
    setStartTime(suggestedStart ?? '09:00')
    setAllowOverlap(false)
  }

  function toggleTaskSelection(taskId: string, checked: boolean) {
    setSelectedTaskIds((current) =>
      checked
        ? [...new Set([...current, taskId])]
        : current.filter((id) => id !== taskId),
    )
  }

  function toggleAllTasks(checked: boolean) {
    setSelectedTaskIds(checked ? unscheduledTasks.map((task) => task.id) : [])
  }

  function stageSelectedTasks() {
    const tasksToStage = selectedTasks.length
      ? selectedTasks
      : selectedTask
        ? [selectedTask]
        : []
    const usesManualTime =
      tasksToStage.length === 1 && tasksToStage[0]?.id === selectedTask?.id

    if (
      !tasksToStage.length ||
      (usesManualTime && conflicts.length && !allowOverlap)
    )
      return

    const planningBlocks = [
      ...plannerBlocks,
      ...uniqueEntries.map((entry) => ({
        date: entry.date,
        endTime: getEndTime(entry.startTime, entry.durationMinutes),
        startTime: entry.startTime,
        status: 'planned' as const,
      })),
    ]
    const datesInOrder = [
      date,
      ...weekDates.filter((weekDate) => weekDate !== date),
    ]
    const nextEntries: GoalPlanEntry[] = []

    tasksToStage.forEach((task, index) => {
      const taskDuration =
        usesManualTime && index === 0
          ? durationMinutes
          : (task.estimatedMinutes ?? 60)
      const manualEntry =
        usesManualTime && index === 0
          ? { date, durationMinutes: taskDuration, startTime, taskId: task.id }
          : undefined
      const suggestedEntry = manualEntry
        ? manualEntry
        : datesInOrder.reduce<GoalPlanEntry | undefined>((entry, weekDate) => {
            if (entry) return entry
            const suggestedStart = getSuggestedStartTime(
              planningBlocks,
              weekDate,
              taskDuration,
            )
            return suggestedStart
              ? {
                  date: weekDate,
                  durationMinutes: taskDuration,
                  startTime: suggestedStart,
                  taskId: task.id,
                }
              : undefined
          }, undefined)

      if (!suggestedEntry) return
      nextEntries.push(suggestedEntry)
      planningBlocks.push({
        date: suggestedEntry.date,
        endTime: getEndTime(
          suggestedEntry.startTime,
          suggestedEntry.durationMinutes,
        ),
        startTime: suggestedEntry.startTime,
        status: 'planned',
      })
    })

    setEntries((current) => [
      ...current.filter(
        (entry) => !nextEntries.some((next) => next.taskId === entry.taskId),
      ),
      ...nextEntries,
    ])
    setSelectedTaskIds([])
    setSelectedTaskId(undefined)
  }

  async function confirm() {
    if (!uniqueEntries.length) return
    if (await onConfirm(uniqueEntries)) setEntries([])
  }

  return (
    <Dialog.Root
      onOpenChange={(details) => onOpenChange(details.open)}
      open={open}
      size="xl"
    >
      <Portal>
        <Dialog.Backdrop bg="bg.overlay" />
        <Dialog.Positioner p={{ base: '0', md: '4' }}>
          <Dialog.Content bg="bg.elevated" maxH="100dvh" maxW="6xl">
            <Dialog.Header>
              <Stack gap="1">
                <Dialog.Title>{t('goals.planning.title')}</Dialog.Title>
                <Dialog.Description>
                  {t('goals.planning.description')}
                </Dialog.Description>
              </Stack>
              <Dialog.CloseTrigger />
            </Dialog.Header>
            <Dialog.Body overflowY="auto">
              <Stack gap="4">
                <Flex gap="2" wrap="wrap">
                  <Badge colorPalette="brand">
                    {t('goals.planning.total', { count: uniqueTasks.length })}
                  </Badge>
                  <Badge colorPalette="green">
                    {t('goals.planning.completed', {
                      count: uniqueTasks.filter(
                        (task) => task.status === 'completed',
                      ).length,
                    })}
                  </Badge>
                  <Badge colorPalette="orange">
                    {t('goals.planning.unscheduled', {
                      count: unscheduledTasks.length,
                    })}
                  </Badge>
                  <Badge colorPalette="gray">
                    {t('goals.planning.remaining', {
                      duration: formatDuration(remainingMinutes),
                    })}
                  </Badge>
                </Flex>
                <Grid
                  alignItems="start"
                  gap="4"
                  templateColumns={{
                    base: '1fr',
                    lg: 'minmax(0, 1fr) minmax(20rem, 0.9fr)',
                  }}
                >
                  <Stack
                    borderColor="border.subtle"
                    borderWidth="1px"
                    gap="3"
                    p="3"
                    rounded="l2"
                  >
                    <Flex align="center" gap="2" justify="space-between">
                      <Text fontWeight="semibold">
                        {t('goals.planning.unscheduledTitle')}
                      </Text>
                      <Checkbox.Root
                        checked={
                          allTasksSelected
                            ? true
                            : someTasksSelected
                              ? 'indeterminate'
                              : false
                        }
                        onCheckedChange={({ checked }) =>
                          toggleAllTasks(checked === true)
                        }
                        size="sm"
                      >
                        <Checkbox.HiddenInput />
                        <Checkbox.Control />
                        <Checkbox.Label>
                          {allTasksSelected
                            ? t('goals.planning.deselectAll')
                            : t('goals.planning.selectAll')}
                        </Checkbox.Label>
                      </Checkbox.Root>
                    </Flex>
                    {recurringTaskCount ? (
                      <Text color="fg.muted" fontSize="xs">
                        {t('goals.planning.recurringTasksExcluded', {
                          count: recurringTaskCount,
                        })}
                      </Text>
                    ) : null}
                    <Stack gap="2">
                      {unscheduledTasks.map((task) => (
                        <Flex
                          _hover={{ bg: 'bg.subtle', borderColor: 'border' }}
                          align="start"
                          bg={
                            selectedTaskId === task.id
                              ? 'brand.subtle'
                              : 'transparent'
                          }
                          borderColor={
                            selectedTaskId === task.id
                              ? 'brand.border'
                              : 'transparent'
                          }
                          borderWidth="1px"
                          gap="3"
                          key={task.id}
                          p="3"
                          rounded="l2"
                          transition="background-color 0.2s ease, border-color 0.2s ease"
                        >
                          <Checkbox.Root
                            aria-label={t('goals.planning.toggleTask', {
                              task: task.title,
                            })}
                            checked={selectedTaskIds.includes(task.id)}
                            flexShrink="0"
                            mt="0.5"
                            onCheckedChange={({ checked }) =>
                              toggleTaskSelection(task.id, checked === true)
                            }
                          >
                            <Checkbox.HiddenInput />
                            <Checkbox.Control />
                          </Checkbox.Root>
                          <Button
                            _hover={{ bg: 'transparent' }}
                            alignItems="start"
                            aria-pressed={selectedTaskId === task.id}
                            flex="1"
                            h="auto"
                            justifyContent="start"
                            minW="0"
                            onClick={() => selectTask(task)}
                            p="0"
                            textAlign="start"
                            variant="ghost"
                            whiteSpace="normal"
                          >
                            <Stack flex="1" gap="1.5" minW="0">
                              <Text fontWeight="semibold">
                                <PrivateText>{task.title}</PrivateText>
                              </Text>
                              <HStack
                                color="fg.muted"
                                fontSize="xs"
                                gap="2"
                                wrap="wrap"
                              >
                                <HStack gap="1">
                                  <Clock3 aria-hidden="true" size={13} />
                                  <Text>
                                    {formatDuration(
                                      task.estimatedMinutes ?? 60,
                                    )}
                                  </Text>
                                </HStack>
                                <Text>
                                  {t(`tasks.priority.${task.priority}`)}
                                </Text>
                                {task.dueDate ? (
                                  <Text>{task.dueDate}</Text>
                                ) : null}
                              </HStack>
                            </Stack>
                          </Button>
                        </Flex>
                      ))}
                    </Stack>
                    {!unscheduledTasks.length ? (
                      <Text color="fg.muted" fontSize="sm">
                        {t('goals.planning.empty')}
                      </Text>
                    ) : null}
                  </Stack>
                  <Stack gap="3">
                    <Box
                      borderColor="border.subtle"
                      borderWidth="1px"
                      p="3"
                      rounded="l2"
                    >
                      <HStack gap="2" mb="3">
                        <CalendarClock
                          aria-hidden="true"
                          color="brand.fg"
                          size={18}
                        />
                        <Text fontWeight="semibold">
                          {selectedTasks.length
                            ? t('goals.planning.scheduleSelected', {
                                count: selectedTasks.length,
                              })
                            : t('goals.planning.schedule')}
                        </Text>
                      </HStack>
                      {selectedTask || selectedTasks.length ? (
                        <Stack gap="3">
                          {selectedTask ? (
                            <Text fontSize="sm" fontWeight="medium">
                              <PrivateText>{selectedTask.title}</PrivateText>
                            </Text>
                          ) : (
                            <Text color="fg.muted" fontSize="sm">
                              {t('goals.planning.selectedTasksHint', {
                                count: selectedTasks.length,
                              })}
                            </Text>
                          )}
                          <Field.Root>
                            <Field.Label>{t('goals.planning.day')}</Field.Label>
                            <NativeSelect.Root>
                              <NativeSelect.Field
                                onChange={(event) =>
                                  setDate(event.target.value)
                                }
                                value={date}
                              >
                                {weekDates.map((weekDate) => (
                                  <option key={weekDate} value={weekDate}>
                                    {formatDay(weekDate, i18n.language)}
                                  </option>
                                ))}
                              </NativeSelect.Field>
                              <NativeSelect.Indicator />
                            </NativeSelect.Root>
                          </Field.Root>
                          <Stack gap="2">
                            <Text color="fg.muted" fontSize="sm">
                              {t('goals.planning.availability')}
                            </Text>
                            <SimpleGrid columns={{ base: 2, sm: 3 }} gap="2">
                              {weekDates.map((weekDate) => {
                                const suggestedStart = getSuggestedStartTime(
                                  plannerBlocks,
                                  weekDate,
                                  durationMinutes,
                                )
                                return (
                                  <Button
                                    disabled={!suggestedStart}
                                    key={weekDate}
                                    onClick={() => {
                                      setDate(weekDate)
                                      if (suggestedStart)
                                        setStartTime(suggestedStart)
                                    }}
                                    size="xs"
                                    variant={
                                      date === weekDate ? 'subtle' : 'outline'
                                    }
                                  >
                                    <Stack align="start" as="span" gap="0">
                                      <Text>
                                        {formatDay(weekDate, i18n.language)}
                                      </Text>
                                      <Text color="fg.muted" fontSize="2xs">
                                        {suggestedStart ??
                                          t('goals.planning.noAvailability')}
                                      </Text>
                                    </Stack>
                                  </Button>
                                )
                              })}
                            </SimpleGrid>
                          </Stack>
                          <Grid columns={2} gap="2">
                            <Field.Root>
                              <Field.Label>
                                {t('goals.planning.start')}
                              </Field.Label>
                              <Input
                                onChange={(event) =>
                                  setStartTime(event.target.value)
                                }
                                step="900"
                                type="time"
                                value={startTime}
                              />
                            </Field.Root>
                            <Field.Root>
                              <Field.Label>
                                {t('goals.planning.duration')}
                              </Field.Label>
                              <Input
                                min="15"
                                onChange={(event) =>
                                  setDurationMinutes(
                                    Math.max(
                                      15,
                                      Number(event.target.value) || 15,
                                    ),
                                  )
                                }
                                step="15"
                                type="number"
                                value={durationMinutes}
                              />
                            </Field.Root>
                          </Grid>
                          <Text color="fg.muted" fontSize="sm">
                            {t('goals.planning.endsAt', { time: endTime })}
                          </Text>
                          {conflicts.length ? (
                            <Stack
                              bg="warning.subtle"
                              gap="2"
                              p="2"
                              rounded="l1"
                            >
                              <HStack color="warning.fg" gap="2">
                                <TriangleAlert aria-hidden="true" size={16} />
                                <Text fontSize="sm">
                                  {t('goals.planning.conflict')}
                                </Text>
                              </HStack>
                              <Checkbox.Root
                                checked={allowOverlap}
                                onCheckedChange={({ checked }) =>
                                  setAllowOverlap(checked === true)
                                }
                              >
                                <Checkbox.HiddenInput />
                                <Checkbox.Control />
                                <Checkbox.Label fontSize="sm">
                                  {t('goals.planning.allowOverlap')}
                                </Checkbox.Label>
                              </Checkbox.Root>
                            </Stack>
                          ) : null}
                          <Button
                            colorPalette="brand"
                            disabled={Boolean(
                              conflicts.length && !allowOverlap,
                            )}
                            onClick={stageSelectedTasks}
                            size="sm"
                          >
                            <Plus aria-hidden="true" size={16} />
                            {selectedTasks.length
                              ? t('goals.planning.addSelectedToPlan', {
                                  count: selectedTasks.length,
                                })
                              : t('goals.planning.addToPlan')}
                          </Button>
                        </Stack>
                      ) : (
                        <Text color="fg.muted" fontSize="sm">
                          {t('goals.planning.selectTask')}
                        </Text>
                      )}
                    </Box>
                    <Box bg="bg.subtle" p="3" rounded="l2">
                      <Flex align="center" justify="space-between" mb="2">
                        <Text fontWeight="semibold">
                          {t('goals.planning.staged')}
                        </Text>
                        <Text color="fg.muted" fontSize="xs">
                          {formatDuration(plannedMinutes)}
                        </Text>
                      </Flex>
                      <Stack gap="2">
                        {uniqueEntries.map((entry) => {
                          const task = uniqueTasks.find(
                            (item) => item.id === entry.taskId,
                          )
                          return task ? (
                            <Flex
                              align="center"
                              gap="2"
                              justify="space-between"
                              key={entry.taskId}
                            >
                              <Text fontSize="sm" lineClamp={1}>
                                <PrivateText>{task.title}</PrivateText>
                              </Text>
                              <Text
                                color="fg.muted"
                                flexShrink="0"
                                fontSize="xs"
                              >
                                {formatDay(entry.date, i18n.language)} ·{' '}
                                {entry.startTime}
                              </Text>
                            </Flex>
                          ) : null
                        })}
                        {!uniqueEntries.length ? (
                          <Text color="fg.muted" fontSize="sm">
                            {t('goals.planning.noneStaged')}
                          </Text>
                        ) : null}
                      </Stack>
                    </Box>
                  </Stack>
                </Grid>
              </Stack>
            </Dialog.Body>
            <Dialog.Footer>
              <HStack justify="flex-end">
                <Button onClick={() => onOpenChange(false)} variant="ghost">
                  {t('common.cancel')}
                </Button>
                <Button
                  colorPalette="brand"
                  disabled={!uniqueEntries.length}
                  loading={isSaving}
                  onClick={() => void confirm()}
                >
                  {t('goals.planning.confirm', {
                    count: uniqueEntries.length,
                  })}
                </Button>
              </HStack>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}
