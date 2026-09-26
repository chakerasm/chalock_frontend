import {
  Box,
  Button,
  Container,
  Field,
  Flex,
  HStack,
  Input,
  NativeSelect,
  Stack,
  Text,
} from '@chakra-ui/react'
import { ListFilter, Plus } from 'lucide-react'
import type { FormEvent } from 'react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog/ConfirmDialog'
import { ErrorState } from '@/components/shared/ErrorState/ErrorState'
import { FilterPopover } from '@/components/shared/FilterPopover/FilterPopover'
import { PageHeader } from '@/components/shared/PageHeader/PageHeader'
import { toast } from '@/components/ui/Toaster/Toaster'
import { TaskFormDialog } from '@/features/tasks/components/TaskFormDialog'
import { TaskList } from '@/features/tasks/components/TaskList'
import {
  useCreateTask,
  useDeleteTask,
  useTasks,
  useUpdateTask,
} from '@/features/tasks/hooks/use-tasks'
import {
  applyTaskFilters,
  getTasksForView,
  groupTasksByDueDate,
} from '@/features/tasks/services/task-view.service'
import type {
  CreateTaskInput,
  Task,
  TaskPriority,
  TaskStatus,
  TaskView,
} from '@/features/tasks/types/tasks.types'
import {
  useStartFocusSession,
  useTodayDashboard,
} from '@/features/today/hooks/use-today-dashboard'

const views: TaskView[] = ['today', 'upcoming', 'all', 'completed']

function formatGroupDate(date: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    weekday: 'long',
  }).format(new Date(`${date}T12:00:00`))
}

export function TasksPage() {
  const { i18n, t } = useTranslation()
  const tasksQuery = useTasks()
  const focusDashboardQuery = useTodayDashboard()
  const createTaskMutation = useCreateTask()
  const updateTaskMutation = useUpdateTask()
  const deleteTaskMutation = useDeleteTask()
  const startFocusMutation = useStartFocusSession()
  const [view, setView] = useState<TaskView>('today')
  const [status, setStatus] = useState<TaskStatus | undefined>()
  const [priority, setPriority] = useState<TaskPriority | undefined>()
  const [search, setSearch] = useState('')
  const [quickTitle, setQuickTitle] = useState('')
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false)
  const [taskToEdit, setTaskToEdit] = useState<Task>()
  const [taskToDelete, setTaskToDelete] = useState<Task>()

  const tasks = tasksQuery.data ?? []
  const visibleTasks = applyTaskFilters(getTasksForView(tasks, view), {
    priority,
    search,
    status,
  })
  const taskGroups = groupTasksByDueDate(visibleTasks)
  const isMutating =
    createTaskMutation.isPending ||
    updateTaskMutation.isPending ||
    deleteTaskMutation.isPending
  const focusAvailable = !focusDashboardQuery.data?.activeFocusSession

  function openCreateTask() {
    setTaskToEdit(undefined)
    setIsTaskFormOpen(true)
  }

  function closeTaskForm(open: boolean) {
    setIsTaskFormOpen(open)
    if (!open) setTaskToEdit(undefined)
  }

  function handleQuickCapture(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const title = quickTitle.trim()
    if (!title) return

    createTaskMutation.mutate(
      { title },
      {
        onError: () => toast.error({ title: t('tasks.createError') }),
        onSuccess: () => {
          setQuickTitle('')
          toast.success({ title: t('tasks.created') })
        },
      },
    )
  }

  function handleFormSubmit(input: CreateTaskInput) {
    if (taskToEdit) {
      updateTaskMutation.mutate(
        { ...input, taskId: taskToEdit.id },
        {
          onError: () => toast.error({ title: t('tasks.updateError') }),
          onSuccess: () => closeTaskForm(false),
        },
      )
      return
    }

    createTaskMutation.mutate(input, {
      onError: () => toast.error({ title: t('tasks.createError') }),
      onSuccess: () => closeTaskForm(false),
    })
  }

  function handleToggleCompletion(task: Task) {
    updateTaskMutation.mutate(
      {
        status: task.status === 'completed' ? 'todo' : 'completed',
        taskId: task.id,
      },
      { onError: () => toast.error({ title: t('tasks.updateError') }) },
    )
  }

  async function handleDeleteTask() {
    if (!taskToDelete) return

    await deleteTaskMutation.mutateAsync(taskToDelete.id, {
      onError: () => toast.error({ title: t('tasks.deleteError') }),
      onSuccess: () => setTaskToDelete(undefined),
    })
  }

  function handleStartFocus(task: Task) {
    startFocusMutation.mutate(
      { taskTitle: task.title },
      {
        onError: () => toast.warning({ title: t('tasks.focusUnavailable') }),
        onSuccess: () =>
          toast.success({
            title: t('tasks.focusStarted', { title: task.title }),
          }),
      },
    )
  }

  if (tasksQuery.isPending) return null
  if (tasksQuery.isError) {
    return (
      <Container maxW="6xl" py={{ base: '8', md: '12' }}>
        <ErrorState onRetry={() => void tasksQuery.refetch()} />
      </Container>
    )
  }

  return (
    <Container maxW="6xl" py={{ base: '6', md: '10' }}>
      <Stack gap={{ base: '5', md: '7' }}>
        <PageHeader
          actions={
            <Button colorPalette="brand" onClick={openCreateTask}>
              <Plus aria-hidden="true" size={18} />
              {t('tasks.createTask')}
            </Button>
          }
          description={t('tasks.description')}
          eyebrow={t('tasks.eyebrow')}
          title={t('tasks.title')}
        />
        <Box
          bg="bg.panel"
          borderWidth="1px"
          p={{ base: '4', md: '5' }}
          rounded="l2"
        >
          <form onSubmit={handleQuickCapture}>
            <Flex
              align={{ base: 'stretch', sm: 'center' }}
              direction={{ base: 'column', sm: 'row' }}
              gap="2"
            >
              <Input
                aria-label={t('tasks.quickCaptureLabel')}
                onChange={(event) => setQuickTitle(event.target.value)}
                placeholder={t('tasks.quickCapturePlaceholder')}
                value={quickTitle}
              />
              <Button
                colorPalette="brand"
                disabled={!quickTitle.trim()}
                loading={createTaskMutation.isPending}
                type="submit"
              >
                <Plus aria-hidden="true" size={17} />
                {t('tasks.add')}
              </Button>
            </Flex>
          </form>
        </Box>
        <Stack gap="4">
          <Flex
            align={{ base: 'stretch', md: 'center' }}
            direction={{ base: 'column', md: 'row' }}
            gap="3"
            justify="space-between"
          >
            <HStack gap="1" overflowX="auto" pb={{ base: '1', md: '0' }}>
              {views.map((item) => (
                <Button
                  colorPalette={view === item ? 'brand' : undefined}
                  key={item}
                  onClick={() => setView(item)}
                  size="sm"
                  variant={view === item ? 'subtle' : 'ghost'}
                >
                  {t(`tasks.views.${item}`)}
                </Button>
              ))}
            </HStack>
            <HStack align="center" gap="2">
              <Box flex="1" minW={{ base: '0', md: 'xs' }}>
                <Input
                  aria-label={t('tasks.searchLabel')}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={t('tasks.searchPlaceholder')}
                  value={search}
                />
              </Box>
              <FilterPopover
                clearLabel={t('tasks.clearFilters')}
                onClear={() => {
                  setPriority(undefined)
                  setStatus(undefined)
                }}
                title={t('tasks.filtersTitle')}
                trigger={
                  <Button
                    aria-label={t('tasks.filtersTitle')}
                    size="sm"
                    variant="outline"
                  >
                    <ListFilter aria-hidden="true" size={16} />
                    <Text display={{ base: 'none', sm: 'block' }}>
                      {t('tasks.filtersTitle')}
                    </Text>
                  </Button>
                }
              >
                <Field.Root>
                  <Field.Label>{t('tasks.statusLabel')}</Field.Label>
                  <NativeSelect.Root>
                    <NativeSelect.Field
                      onChange={(event) =>
                        setStatus(
                          (event.target.value || undefined) as
                            | TaskStatus
                            | undefined,
                        )
                      }
                      value={status ?? ''}
                    >
                      <option value="">{t('tasks.anyStatus')}</option>
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
                </Field.Root>
                <Field.Root>
                  <Field.Label>{t('tasks.priorityLabel')}</Field.Label>
                  <NativeSelect.Root>
                    <NativeSelect.Field
                      onChange={(event) =>
                        setPriority(
                          (event.target.value || undefined) as
                            | TaskPriority
                            | undefined,
                        )
                      }
                      value={priority ?? ''}
                    >
                      <option value="">{t('tasks.anyPriority')}</option>
                      <option value="low">{t('tasks.priority.low')}</option>
                      <option value="medium">
                        {t('tasks.priority.medium')}
                      </option>
                      <option value="high">{t('tasks.priority.high')}</option>
                    </NativeSelect.Field>
                    <NativeSelect.Indicator />
                  </NativeSelect.Root>
                </Field.Root>
              </FilterPopover>
            </HStack>
          </Flex>
          {view === 'upcoming' && visibleTasks.length > 0 ? (
            <Stack gap="6">
              {Object.entries(taskGroups).map(([date, tasksForDate]) => (
                <Stack gap="2" key={date}>
                  <Text fontSize="sm" fontWeight="semibold">
                    {date === 'no-date'
                      ? t('tasks.noDueDate')
                      : formatGroupDate(date, i18n.language)}
                  </Text>
                  <TaskList
                    focusAvailable={focusAvailable}
                    isMutating={isMutating}
                    onDelete={setTaskToDelete}
                    onEdit={(task) => {
                      setTaskToEdit(task)
                      setIsTaskFormOpen(true)
                    }}
                    onStartFocus={handleStartFocus}
                    onToggleCompletion={handleToggleCompletion}
                    tasks={tasksForDate}
                  />
                </Stack>
              ))}
            </Stack>
          ) : (
            <TaskList
              focusAvailable={focusAvailable}
              isMutating={isMutating}
              onDelete={setTaskToDelete}
              onEdit={(task) => {
                setTaskToEdit(task)
                setIsTaskFormOpen(true)
              }}
              onStartFocus={handleStartFocus}
              onToggleCompletion={handleToggleCompletion}
              tasks={visibleTasks}
            />
          )}
        </Stack>
      </Stack>
      <TaskFormDialog
        isSubmitting={isMutating}
        onOpenChange={closeTaskForm}
        onSubmit={handleFormSubmit}
        open={isTaskFormOpen}
        task={taskToEdit}
      />
      <ConfirmDialog
        confirmLabel={t('tasks.deleteTask')}
        description={t('tasks.deleteDescription', {
          title: taskToDelete?.title ?? '',
        })}
        isConfirming={deleteTaskMutation.isPending}
        isDestructive
        onConfirm={handleDeleteTask}
        onOpenChange={(open) => {
          if (!open) setTaskToDelete(undefined)
        }}
        open={Boolean(taskToDelete)}
        title={t('tasks.deleteTitle')}
      />
    </Container>
  )
}
