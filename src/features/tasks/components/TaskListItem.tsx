import {
  Badge,
  Box,
  Button,
  Checkbox,
  Flex,
  HStack,
  IconButton,
  Progress,
  Stack,
  Text,
} from '@chakra-ui/react'
import {
  CalendarDays,
  Clock3,
  Pause,
  Pencil,
  Play,
  Repeat2,
  Square,
  Timer,
  Trash2,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PrivateText } from '@/components/ui/PrivateText/PrivateText'
import { isTaskOverdue } from '@/features/tasks/services/task-view.service'
import type {
  Task,
  TaskPriority,
  TaskStatus,
} from '@/features/tasks/types/tasks.types'
import {
  useStopFocusSession,
  useUpdateFocusSession,
} from '@/features/today/hooks/use-today-dashboard'
import type { ActiveFocusSession } from '@/features/today/types/today.types'

type TaskListItemProps = {
  activeFocusSession: ActiveFocusSession | null
  focusAvailable: boolean
  isMutating: boolean
  onDelete: () => void
  onEdit: () => void
  onStartFocus: () => void
  onToggleCompletion: () => void
  onSecondaryAction?: () => void
  secondaryActionIcon?: ReactNode
  secondaryActionLabel?: string
  task: Task
}

function getElapsedSeconds(session: ActiveFocusSession, now: number) {
  if (session.status !== 'active' || !session.startedAt)
    return session.elapsedSeconds
  return (
    session.elapsedSeconds +
    Math.max(0, Math.floor((now - Date.parse(session.startedAt)) / 1_000))
  )
}

function formatFocusDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
  return `${String(minutes).padStart(2, '0')}:${String(totalSeconds % 60).padStart(2, '0')}`
}

const priorityStyles: Record<TaskPriority, { bg: string; color: string }> = {
  high: { bg: 'danger.subtle', color: 'danger.fg' },
  low: { bg: 'bg.subtle', color: 'fg.muted' },
  medium: { bg: 'warning.subtle', color: 'warning.fg' },
}

const statusStyles: Record<TaskStatus, { bg: string; color: string }> = {
  cancelled: { bg: 'bg.muted', color: 'fg.subtle' },
  completed: { bg: 'success.subtle', color: 'success.fg' },
  in_progress: { bg: 'brand.subtle', color: 'brand.fg' },
  todo: { bg: 'bg.subtle', color: 'fg.muted' },
}

function formatDueDate(dueDate: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
  }).format(new Date(`${dueDate}T12:00:00`))
}

export function TaskListItem({
  activeFocusSession,
  focusAvailable,
  isMutating,
  onDelete,
  onEdit,
  onStartFocus,
  onToggleCompletion,
  onSecondaryAction,
  secondaryActionIcon,
  secondaryActionLabel,
  task,
}: TaskListItemProps) {
  const { i18n, t } = useTranslation()
  const updateFocus = useUpdateFocusSession()
  const stopFocus = useStopFocusSession()
  const [now, setNow] = useState(Date.now())
  const isCompleted = task.status === 'completed'
  const isOverdue = isTaskOverdue(task)
  const isFocused = Boolean(
    activeFocusSession &&
      (activeFocusSession.taskId === task.id ||
        (!activeFocusSession.taskId &&
          activeFocusSession.taskTitle === task.title)),
  )

  useEffect(() => {
    if (!isFocused || activeFocusSession?.status !== 'active') return undefined
    const intervalId = window.setInterval(() => setNow(Date.now()), 1_000)
    return () => window.clearInterval(intervalId)
  }, [activeFocusSession?.status, isFocused])

  const elapsedSeconds =
    isFocused && activeFocusSession
      ? getElapsedSeconds(activeFocusSession, now)
      : 0
  const targetSeconds = Math.max(1, (task.estimatedMinutes ?? 60) * 60)
  const isRunning = activeFocusSession?.status === 'active'

  return (
    <Flex
      align={{ base: 'flex-start', lg: 'center' }}
      bg={
        isFocused ? 'brand.subtle' : isOverdue ? 'danger.subtle' : 'bg.elevated'
      }
      borderColor={
        isFocused ? 'brand.border' : isOverdue ? 'danger.fg' : 'border.subtle'
      }
      borderLeftWidth={isFocused || isOverdue ? '2px' : '1px'}
      borderWidth="1px"
      direction={{ base: 'column', lg: 'row' }}
      gap="4"
      justify="space-between"
      p={{ base: '4', md: '5' }}
      rounded="l3"
      shadow={isFocused ? 'md' : 'sm'}
      _hover={{
        bg: isFocused ? 'brand.subtle' : 'bg.hover',
        borderColor: 'brand.border',
      }}
    >
      <Checkbox.Root
        checked={isCompleted}
        disabled={isMutating}
        flex="1"
        minW="0"
        onCheckedChange={onToggleCompletion}
      >
        <Checkbox.HiddenInput />
        <Checkbox.Control mt="1" />
        <Checkbox.Label w="full">
          <Stack gap="2">
            <Text
              fontSize={{ base: 'md', md: 'lg' }}
              fontWeight="semibold"
              textDecoration={isCompleted ? 'line-through' : undefined}
            >
              <PrivateText>{task.title}</PrivateText>
            </Text>
            {task.description ? (
              <Text color="fg.muted" fontSize="sm" lineClamp={1}>
                {task.description}
              </Text>
            ) : null}
            <HStack color="fg.muted" fontSize="xs" gap="2" wrap="wrap">
              {task.dueDate ? (
                <HStack color={isOverdue ? 'danger.fg' : undefined} gap="1">
                  <CalendarDays aria-hidden="true" size={13} />
                  {isOverdue
                    ? t('tasks.overdueDate', {
                        date: formatDueDate(task.dueDate, i18n.language),
                      })
                    : formatDueDate(task.dueDate, i18n.language)}
                </HStack>
              ) : null}
              {task.dueTime ? <Text>{task.dueTime}</Text> : null}
              {task.estimatedMinutes ? (
                <HStack gap="1">
                  <Clock3 aria-hidden="true" size={13} />
                  {t('tasks.duration', { minutes: task.estimatedMinutes })}
                </HStack>
              ) : null}
              {task.seriesId ? (
                <HStack gap="1">
                  <Repeat2 aria-label={t('tasks.recurring')} size={13} />
                  <Text>{t('tasks.recurring')}</Text>
                </HStack>
              ) : null}
              <Badge
                bg={priorityStyles[task.priority].bg}
                color={priorityStyles[task.priority].color}
                px="2"
                py="1"
                rounded="full"
                size="sm"
              >
                {t(`tasks.priority.${task.priority}`)}
              </Badge>
              {task.status !== 'todo' ? (
                <Badge
                  bg={statusStyles[task.status].bg}
                  color={statusStyles[task.status].color}
                  size="sm"
                >
                  {t(`tasks.status.${task.status}`)}
                </Badge>
              ) : null}
            </HStack>
          </Stack>
        </Checkbox.Label>
      </Checkbox.Root>
      <Box
        borderLeftWidth={{ base: '0', lg: '1px' }}
        flexShrink="0"
        pl={{ base: '0', lg: '4' }}
        w={{ base: 'full', lg: isFocused ? '26rem' : 'auto' }}
      >
        {isFocused && activeFocusSession ? (
          <Stack
            bg="bg.panel"
            borderColor="brand.border"
            borderWidth="1px"
            gap="3"
            p="3"
            rounded="l2"
          >
            <HStack color="brand.fg" justify="space-between">
              <HStack fontWeight="semibold" gap="2">
                <Timer aria-hidden="true" size={16} />
                <Text fontSize="sm">
                  {isRunning ? t('today.focusRunning') : t('today.focusPaused')}
                </Text>
              </HStack>
              <Text
                fontVariantNumeric="tabular-nums"
                fontWeight="semibold"
                fontSize="sm"
              >
                {formatFocusDuration(elapsedSeconds)} /{' '}
                {formatFocusDuration(targetSeconds)}
              </Text>
            </HStack>
            <Progress.Root
              colorPalette="brand"
              size="sm"
              value={Math.min(100, (elapsedSeconds / targetSeconds) * 100)}
            >
              <Progress.Track>
                <Progress.Range />
              </Progress.Track>
            </Progress.Root>
            <HStack gap="2">
              <Button
                colorPalette="brand"
                disabled={updateFocus.isPending || stopFocus.isPending}
                flex="1"
                onClick={() =>
                  updateFocus.mutate({
                    elapsedSeconds,
                    sessionId: activeFocusSession.id,
                    status: isRunning ? 'paused' : 'active',
                  })
                }
                size="sm"
                variant="outline"
              >
                {isRunning ? (
                  <Pause aria-hidden="true" size={15} />
                ) : (
                  <Play aria-hidden="true" fill="currentColor" size={15} />
                )}
                {isRunning ? t('today.pauseFocus') : t('today.resumeFocus')}
              </Button>
              <Button
                colorPalette="red"
                disabled={updateFocus.isPending || stopFocus.isPending}
                flex="1"
                onClick={() =>
                  stopFocus.mutate({
                    elapsedSeconds,
                    sessionId: activeFocusSession.id,
                  })
                }
                size="sm"
                variant="outline"
              >
                <Square aria-hidden="true" fill="currentColor" size={13} />
                {t('today.stopFocus')}
              </Button>
            </HStack>
          </Stack>
        ) : (
          <HStack gap="2" justify={{ base: 'space-between', lg: 'start' }}>
            {focusAvailable && !isCompleted && task.status !== 'cancelled' ? (
              <Button
                colorPalette="brand"
                onClick={onStartFocus}
                size="sm"
                variant="outline"
              >
                <Play aria-hidden="true" fill="currentColor" size={16} />
                {t('tasks.startFocus')}
              </Button>
            ) : null}
            <IconButton
              aria-label={t('tasks.editTask')}
              onClick={onEdit}
              size="sm"
              variant="outline"
            >
              <Pencil aria-hidden="true" size={15} />
            </IconButton>
            {onSecondaryAction ? (
              <IconButton
                aria-label={secondaryActionLabel ?? t('tasks.deleteTask')}
                onClick={onSecondaryAction}
                size="sm"
                variant="outline"
              >
                {secondaryActionIcon ?? <Trash2 aria-hidden="true" size={15} />}
              </IconButton>
            ) : (
              <IconButton
                aria-label={t('tasks.deleteTask')}
                onClick={onDelete}
                size="sm"
                variant="outline"
              >
                <Trash2 aria-hidden="true" size={15} />
              </IconButton>
            )}
          </HStack>
        )}
      </Box>
    </Flex>
  )
}
