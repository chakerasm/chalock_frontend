import { SimpleGrid, Stack } from '@chakra-ui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { FormDialog } from '@/components/shared/FormDialog/FormDialog'
import { FieldInput } from '@/components/ui/FieldInput/FieldInput'
import { FieldInputNumber } from '@/components/ui/FieldInputNumber/FieldInputNumber'
import { FieldSelect } from '@/components/ui/FieldSelect/FieldSelect'
import { FieldTextarea } from '@/components/ui/FieldTextarea/FieldTextarea'
import type { Goal } from '@/features/goals/types/goals.types'
import { taskFormSchema } from '@/features/tasks/schemas/tasks.schemas'
import type {
  Task,
  TaskFormSubmitInput,
} from '@/features/tasks/types/tasks.types'

type TaskFormValues = {
  description: string
  dueDate: string
  dueTime: string
  estimatedMinutes?: number
  goalId: string
  priority: 'low' | 'medium' | 'high'
  title: string
}

type TaskFormDialogProps = {
  isSubmitting: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (input: TaskFormSubmitInput) => void
  open: boolean
  task?: Task
  goals: Goal[]
  defaultGoalId?: string
  hideGoalField?: boolean
}

function createDefaultValues(task?: Task, defaultGoalId?: string): TaskFormValues {
  return {
    description: task?.description ?? '',
    dueDate: task?.dueDate ?? '',
    dueTime: task?.dueTime ?? '',
    estimatedMinutes: task?.estimatedMinutes,
    goalId: task?.goalId ?? defaultGoalId ?? '',
    priority: task?.priority ?? 'medium',
    title: task?.title ?? '',
  }
}

function toOptionalValue(value: string) {
  const trimmedValue = value.trim()
  return trimmedValue || undefined
}

export function TaskFormDialog({
  isSubmitting,
  onOpenChange,
  onSubmit,
  open,
  task,
  goals,
  defaultGoalId,
  hideGoalField = false,
}: TaskFormDialogProps) {
  const { t } = useTranslation()
  const form = useForm<TaskFormValues>({
    defaultValues: createDefaultValues(task, defaultGoalId),
    resolver: zodResolver(taskFormSchema),
  })
  const isEditing = Boolean(task)

  useEffect(() => {
    if (open) form.reset(createDefaultValues(task, defaultGoalId))
  }, [defaultGoalId, form, open, task])

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) form.reset(createDefaultValues(task, defaultGoalId))
    onOpenChange(nextOpen)
  }

  function handleSubmit(values: TaskFormValues) {
    onSubmit({
      description: toOptionalValue(values.description),
      dueDate: values.dueDate || undefined,
      dueTime: values.dueTime || undefined,
      estimatedMinutes: values.estimatedMinutes,
      goalId: values.goalId || (task?.goalId ? null : undefined),
      priority: values.priority,
      title: values.title.trim(),
    })
  }

  return (
    <FormDialog
      description={t('tasks.formDescription')}
      isSubmitting={isSubmitting}
      onOpenChange={handleOpenChange}
      onSubmit={form.handleSubmit(handleSubmit)}
      open={open}
      submitLabel={isEditing ? t('tasks.saveChanges') : t('tasks.createTask')}
      title={isEditing ? t('tasks.editTask') : t('tasks.createTask')}
    >
      <Stack gap="4">
        <FieldInput
          control={form.control}
          maxLength={120}
          label={t('tasks.titleLabel')}
          name="title"
          placeholder={t('tasks.titlePlaceholder')}
          required
        />
        <FieldTextarea
          control={form.control}
          label={t('tasks.descriptionLabel')}
          name="description"
          placeholder={t('tasks.descriptionPlaceholder')}
          rows={3}
        />
        <SimpleGrid columns={{ base: 1, sm: 2 }} gap="4">
          {!hideGoalField ? (
            <FieldSelect
              control={form.control}
              label={t('tasks.goalLabel')}
              name="goalId"
              options={[
                { label: t('tasks.noGoal'), value: '' },
                ...goals
                  .filter((goal) => goal.status === 'active')
                  .map((goal) => ({ label: goal.title, value: goal.id })),
              ]}
            />
          ) : null}
          <FieldInput
            control={form.control}
            label={t('tasks.dueDateLabel')}
            name="dueDate"
            type="date"
          />
          <FieldInput
            control={form.control}
            label={t('tasks.dueTimeLabel')}
            name="dueTime"
            type="time"
          />
          <FieldSelect
            control={form.control}
            label={t('tasks.priorityLabel')}
            name="priority"
            options={[
              { label: t('tasks.priority.low'), value: 'low' },
              { label: t('tasks.priority.medium'), value: 'medium' },
              { label: t('tasks.priority.high'), value: 'high' },
            ]}
          />
          <FieldInputNumber
            control={form.control}
            label={t('tasks.estimatedDurationLabel')}
            max={1_440}
            min={1}
            name="estimatedMinutes"
          />
        </SimpleGrid>
      </Stack>
    </FormDialog>
  )
}
