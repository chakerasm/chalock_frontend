import { Stack } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { EmptyState } from '@/components/shared/EmptyState/EmptyState'
import { TaskListItem } from '@/features/tasks/components/TaskListItem'
import type { Task } from '@/features/tasks/types/tasks.types'
import type { ActiveFocusSession } from '@/features/today/types/today.types'

type TaskListProps = {
  activeFocusSession: ActiveFocusSession | null
  focusAvailable: boolean
  isMutating: boolean
  onDelete: (task: Task) => void
  onEdit: (task: Task) => void
  onStartFocus: (task: Task) => void
  onToggleCompletion: (task: Task) => void
  tasks: Task[]
}

export function TaskList({
  activeFocusSession,
  focusAvailable,
  isMutating,
  onDelete,
  onEdit,
  onStartFocus,
  onToggleCompletion,
  tasks,
}: TaskListProps) {
  const { t } = useTranslation()

  if (tasks.length === 0) {
    return (
      <EmptyState
        illustrationSrc="/icons/tasks.png"
        description={t('tasks.emptyDescription')}
        title={t('tasks.emptyTitle')}
      />
    )
  }

  return (
    <Stack gap="1">
      {tasks.map((task) => (
        <TaskListItem
          activeFocusSession={activeFocusSession}
          focusAvailable={focusAvailable}
          isMutating={isMutating}
          key={task.id}
          onDelete={() => onDelete(task)}
          onEdit={() => onEdit(task)}
          onStartFocus={() => onStartFocus(task)}
          onToggleCompletion={() => onToggleCompletion(task)}
          task={task}
        />
      ))}
    </Stack>
  )
}
