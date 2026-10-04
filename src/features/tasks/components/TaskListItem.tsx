import {
  Badge,
  Box,
  Button,
  Checkbox,
  Flex,
  HStack,
  IconButton,
  Stack,
  Text,
} from '@chakra-ui/react'
import { CalendarDays, Clock3, Pencil, Play, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { isTaskOverdue } from '@/features/tasks/services/task-view.service'
import type {
  Task,
  TaskPriority,
  TaskStatus,
} from '@/features/tasks/types/tasks.types'

type TaskListItemProps = {
  focusAvailable: boolean
  isMutating: boolean
  onDelete: () => void
  onEdit: () => void
  onStartFocus: () => void
  onToggleCompletion: () => void
  task: Task
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
  focusAvailable,
  isMutating,
  onDelete,
  onEdit,
  onStartFocus,
  onToggleCompletion,
  task,
}: TaskListItemProps) {
  const { i18n, t } = useTranslation()
  const isCompleted = task.status === 'completed'
  const isOverdue = isTaskOverdue(task)

  return (
    <Flex
      align={{ base: 'flex-start', sm: 'center' }}
      bg={isOverdue ? 'danger.subtle' : 'bg.panel'}
      borderColor={isOverdue ? 'danger.fg' : 'border.subtle'}
      borderLeftWidth={isOverdue ? '2px' : '1px'}
      borderWidth="1px"
      gap="3"
      justify="space-between"
      p={{ base: '3', md: '3' }}
      rounded="l2"
      shadow="xs"
      _hover={{ bg: 'bg.hover', borderColor: 'brand.border' }}
    >
      <Checkbox.Root
        checked={isCompleted}
        disabled={isMutating}
        flex="1"
        minW="0"
        onCheckedChange={onToggleCompletion}
      >
        <Checkbox.HiddenInput />
        <Checkbox.Control mt={{ base: '1', sm: '0' }} />
        <Checkbox.Label w="full">
          <Stack gap="1">
            <Text
              fontWeight="medium"
              textDecoration={isCompleted ? 'line-through' : undefined}
            >
              {task.title}
            </Text>
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
              <Badge
                bg={priorityStyles[task.priority].bg}
                color={priorityStyles[task.priority].color}
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
      <Box flexShrink="0">
        <HStack gap="1">
          {focusAvailable && !isCompleted && task.status !== 'cancelled' ? (
            <Button onClick={onStartFocus} size="xs" variant="ghost">
              <Play aria-hidden="true" size={14} />
              {t('tasks.startFocus')}
            </Button>
          ) : null}
          <IconButton
            aria-label={t('tasks.editTask')}
            onClick={onEdit}
            size="xs"
            variant="ghost"
          >
            <Pencil aria-hidden="true" size={15} />
          </IconButton>
          <IconButton
            aria-label={t('tasks.deleteTask')}
            onClick={onDelete}
            size="xs"
            variant="ghost"
          >
            <Trash2 aria-hidden="true" size={15} />
          </IconButton>
        </HStack>
      </Box>
    </Flex>
  )
}
