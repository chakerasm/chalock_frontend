import {
  Dialog,
  Flex,
  HStack,
  Input,
  NativeSelect,
  Portal,
  Stack,
  Text,
} from '@chakra-ui/react'
import { Search, Unlink } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TaskListItem } from '@/features/tasks/components/TaskListItem'
import type { Task, TaskStatus } from '@/features/tasks/types/tasks.types'
import type { ActiveFocusSession } from '@/features/today/types/today.types'

type Props = {
  activeFocusSession: ActiveFocusSession | null
  focusAvailable: boolean
  isMutating: boolean
  onEditTask: (task: Task) => void
  onStartFocus: (task: Task) => void
  onToggleCompletion: (task: Task) => void
  onUnlinkTask: (task: Task) => void
  onOpenChange: (open: boolean) => void
  open: boolean
  tasks: Task[]
}

export const GoalTasksDialog = ({
  activeFocusSession,
  focusAvailable,
  isMutating,
  onEditTask,
  onStartFocus,
  onToggleCompletion,
  onUnlinkTask,
  onOpenChange,
  open,
  tasks,
}: Props) => {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<'all' | TaskStatus>('all')
  const filteredTasks = useMemo(
    () =>
      tasks.filter(
        (task) =>
          (status === 'all' || task.status === status) &&
          `${task.title} ${task.description ?? ''}`
            .toLowerCase()
            .includes(query.trim().toLowerCase()),
      ),
    [query, status, tasks],
  )
  return (
    <Dialog.Root
      onOpenChange={(details) => onOpenChange(details.open)}
      open={open}
      size="xl"
    >
      <Portal>
        <Dialog.Backdrop bg="bg.overlay" />
        <Dialog.Positioner p="4">
          <Dialog.Content bg="bg.elevated" maxH="calc(100dvh - 2rem)">
            <Dialog.Header>
              <Stack gap="1">
                <Dialog.Title>{t('goals.tasksTitle')}</Dialog.Title>
                <Dialog.Description>
                  {t('goals.taskSummary', {
                    completed: tasks.filter(
                      (task) => task.status === 'completed',
                    ).length,
                    total: tasks.length,
                  })}
                </Dialog.Description>
              </Stack>
              <Dialog.CloseTrigger />
            </Dialog.Header>
            <Dialog.Body overflowY="auto">
              <Stack gap="4">
                <Flex direction={{ base: 'column', md: 'row' }} gap="2">
                  <HStack borderWidth="1px" flex="1" px="3" rounded="l1">
                    <Search aria-hidden="true" color="fg.muted" size={16} />
                    <Input
                      aria-label={t('common.search')}
                      border="0"
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder={t('common.search')}
                      value={query}
                    />
                  </HStack>
                  <NativeSelect.Root maxW={{ md: '12rem' }}>
                    <NativeSelect.Field
                      aria-label={t('tasks.statusLabel')}
                      onChange={(event) =>
                        setStatus(event.target.value as 'all' | TaskStatus)
                      }
                      value={status}
                    >
                      <option value="all">{t('goals.allStatuses')}</option>
                      <option value="todo">{t('tasks.status.todo')}</option>
                      <option value="in_progress">
                        {t('tasks.status.in_progress')}
                      </option>
                      <option value="completed">
                        {t('tasks.status.completed')}
                      </option>
                      <option value="cancelled">
                        {t('tasks.status.cancelled')}
                      </option>
                    </NativeSelect.Field>
                    <NativeSelect.Indicator />
                  </NativeSelect.Root>
                </Flex>
                <Stack gap="3">
                  {filteredTasks.map((task) => (
                    <TaskListItem
                      activeFocusSession={activeFocusSession}
                      focusAvailable={focusAvailable}
                      isMutating={isMutating}
                      key={task.id}
                      onDelete={() => onUnlinkTask(task)}
                      onEdit={() => onEditTask(task)}
                      onSecondaryAction={() => onUnlinkTask(task)}
                      onStartFocus={() => onStartFocus(task)}
                      onToggleCompletion={() => onToggleCompletion(task)}
                      secondaryActionIcon={
                        <Unlink aria-hidden="true" size={15} />
                      }
                      secondaryActionLabel={t('goals.unlinkTask', {
                        task: task.title,
                      })}
                      task={task}
                    />
                  ))}
                  {!filteredTasks.length ? (
                    <Text color="fg.muted" textAlign="center">
                      {t('globalSearch.empty', { query })}
                    </Text>
                  ) : null}
                </Stack>
              </Stack>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}
