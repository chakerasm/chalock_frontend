import { Box, Button, HStack, SimpleGrid, Stack, Text } from '@chakra-ui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
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
import type {
  RecurrenceRule,
  RecurringEditScope,
} from '@/lib/recurrence/recurrence.types'

type TaskFormValues = {
  description: string
  dueDate: string
  dueTime: string
  estimatedMinutes?: number
  goalId: string
  priority: 'low' | 'medium' | 'high'
  recurrence?: RecurrenceRule
  title: string
}

type TaskFormDialogProps = {
  isSubmitting: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (input: TaskFormSubmitInput, scope?: RecurringEditScope) => void
  open: boolean
  task?: Task
  goals: Goal[]
  defaultGoalId?: string
  hideGoalField?: boolean
}

function createDefaultValues(
  task?: Task,
  defaultGoalId?: string,
): TaskFormValues {
  return {
    description: task?.description ?? '',
    dueDate: task?.dueDate ?? '',
    dueTime: task?.dueTime ?? '',
    estimatedMinutes: task?.estimatedMinutes,
    goalId: task?.goalId ?? defaultGoalId ?? '',
    priority: task?.priority ?? 'medium',
    recurrence: task?.recurrence,
    title: task?.title ?? '',
  }
}

function toOptionalValue(value: string) {
  const trimmedValue = value.trim()
  return trimmedValue || undefined
}

function getLocalCalendarDate() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
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
  const [repeat, setRepeat] = useState<
    'never' | 'daily' | 'weekdays' | 'weekly' | 'monthly' | 'yearly' | 'custom'
  >(() => (task?.recurrence ? 'custom' : 'never'))
  const [editScope, setEditScope] = useState<RecurringEditScope>('this')
  const values = form.watch()

  useEffect(() => {
    if (open) {
      form.reset(createDefaultValues(task, defaultGoalId))
      setRepeat(task?.recurrence ? 'custom' : 'never')
      setEditScope('this')
    }
  }, [defaultGoalId, form, open, task])

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) form.reset(createDefaultValues(task, defaultGoalId))
    onOpenChange(nextOpen)
  }

  function defaultRecurrence(): RecurrenceRule {
    const startsOn = values.dueDate || getLocalCalendarDate()
    return {
      ends: 'never',
      frequency: 'weekly',
      interval: 1,
      startsOn,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      weekdays: [new Date(`${startsOn}T12:00:00`).getDay()],
    }
  }

  function setRepeatPreset(next: typeof repeat) {
    setRepeat(next)
    if (next === 'never') return
    const base = defaultRecurrence()
    const presets: Record<
      Exclude<typeof repeat, 'never' | 'custom'>,
      RecurrenceRule
    > = {
      daily: { ...base, frequency: 'daily' },
      weekdays: { ...base, frequency: 'weekly', weekdays: [1, 2, 3, 4, 5] },
      weekly: base,
      monthly: {
        ...base,
        frequency: 'monthly',
        dayOfMonth: Number((values.dueDate || base.startsOn).slice(-2)),
      },
      yearly: {
        ...base,
        frequency: 'yearly',
        dayOfMonth: Number((values.dueDate || base.startsOn).slice(-2)),
        month: Number((values.dueDate || base.startsOn).slice(5, 7)),
      },
    }
    form.setValue(
      'recurrence',
      next === 'custom' ? (values.recurrence ?? base) : presets[next],
    )
  }

  function toggleWeekday(day: number) {
    const current = values.recurrence ?? defaultRecurrence()
    if (current.frequency === 'monthly' && current.weekOfMonth) {
      form.setValue('recurrence', {
        ...current,
        weekday: current.weekday === day ? undefined : day,
        weekdays: undefined,
      })
      return
    }
    const weekdays = current.weekdays ?? []
    form.setValue('recurrence', {
      ...current,
      weekdays: weekdays.includes(day)
        ? weekdays.filter((value) => value !== day)
        : [...weekdays, day].sort(),
    })
  }

  function handleSubmit(formValues: TaskFormValues) {
    const recurrence = formValues.recurrence
      ? {
          ...formValues.recurrence,
          startsOn: formValues.dueDate || formValues.recurrence.startsOn,
          timezone:
            formValues.recurrence.timezone ||
            Intl.DateTimeFormat().resolvedOptions().timeZone ||
            'UTC',
        }
      : undefined
    onSubmit(
      {
        description: toOptionalValue(values.description),
        dueDate: formValues.dueDate || recurrence?.startsOn || undefined,
        dueTime: formValues.dueTime || undefined,
        estimatedMinutes: formValues.estimatedMinutes,
        goalId: formValues.goalId || (task?.goalId ? null : undefined),
        priority: formValues.priority,
        recurrence:
          repeat === 'never' || (task?.seriesId && editScope === 'this')
            ? undefined
            : recurrence,
        title: formValues.title.trim(),
      },
      task?.seriesId ? editScope : undefined,
    )
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
        <Stack gap="2">
          <Text fontSize="sm" fontWeight="medium">
            {t('tasks.repeat')}
          </Text>
          <HStack gap="2" wrap="wrap">
            {(
              [
                'never',
                'daily',
                'weekdays',
                'weekly',
                'monthly',
                'yearly',
                'custom',
              ] as const
            ).map((option) => (
              <Button
                colorPalette={repeat === option ? 'brand' : undefined}
                key={option}
                onClick={() => setRepeatPreset(option)}
                size="sm"
                type="button"
                variant={repeat === option ? 'subtle' : 'outline'}
              >
                {t(`tasks.repeatOptions.${option}`)}
              </Button>
            ))}
          </HStack>
        </Stack>
        {repeat === 'custom' && values.recurrence ? (
          <Stack bg="bg.subtle" gap="4" p="3" rounded="l1">
            <SimpleGrid columns={{ base: 1, sm: 2 }} gap="4">
              <FieldInputNumber
                control={form.control}
                label={t('tasks.every')}
                max={365}
                min={1}
                name="recurrence.interval"
                required
              />
              <FieldSelect
                control={form.control}
                label={t('tasks.repeatUnit')}
                name="recurrence.frequency"
                options={['daily', 'weekly', 'monthly', 'yearly'].map(
                  (frequency) => ({
                    label: t(`tasks.repeatOptions.${frequency}`),
                    value: frequency,
                  }),
                )}
                required
              />
            </SimpleGrid>
            {values.recurrence.frequency === 'weekly' ||
            values.recurrence.frequency === 'monthly' ? (
              <Stack gap="2">
                <Text fontSize="sm" fontWeight="medium">
                  {t('tasks.weekdays')}
                </Text>
                <HStack gap="1" wrap="wrap">
                  {[0, 1, 2, 3, 4, 5, 6].map((day) => {
                    const selected =
                      values.recurrence?.frequency === 'monthly' &&
                      values.recurrence.weekOfMonth
                        ? values.recurrence.weekday === day
                        : values.recurrence?.weekdays?.includes(day)
                    return (
                      <Button
                        colorPalette={selected ? 'brand' : undefined}
                        key={day}
                        onClick={() => toggleWeekday(day)}
                        size="xs"
                        type="button"
                        variant={selected ? 'subtle' : 'outline'}
                      >
                        {t(`tasks.weekday.${day}`)}
                      </Button>
                    )
                  })}
                </HStack>
              </Stack>
            ) : null}
            {values.recurrence.frequency === 'monthly' ? (
              <SimpleGrid columns={{ base: 1, sm: 2 }} gap="4">
                <FieldInputNumber
                  control={form.control}
                  label={t('tasks.dayOfMonth')}
                  max={31}
                  min={1}
                  name="recurrence.dayOfMonth"
                />
                <FieldSelect
                  control={form.control}
                  label={t('tasks.monthlyWeek')}
                  name="recurrence.weekOfMonth"
                  options={[
                    { label: t('tasks.monthlyByDate'), value: '' },
                    ...[1, 2, 3, 4, 5, -1].map((week) => ({
                      label: t(`tasks.monthlyWeeks.${week}`),
                      value: String(week),
                    })),
                  ]}
                  valueAsNumber
                />
              </SimpleGrid>
            ) : null}
            <SimpleGrid columns={{ base: 1, sm: 2 }} gap="4">
              <FieldSelect
                control={form.control}
                label={t('tasks.repeatEnds')}
                name="recurrence.ends"
                options={['never', 'on_date', 'after_occurrences'].map(
                  (end) => ({
                    label: t(`tasks.repeatEndsOptions.${end}`),
                    value: end,
                  }),
                )}
                required
              />
              {values.recurrence.ends === 'on_date' ? (
                <FieldInput
                  control={form.control}
                  label={t('tasks.endDate')}
                  name="recurrence.endsOn"
                  required
                  type="date"
                />
              ) : null}
              {values.recurrence.ends === 'after_occurrences' ? (
                <FieldInputNumber
                  control={form.control}
                  label={t('tasks.occurrences')}
                  max={10_000}
                  min={1}
                  name="recurrence.occurrenceCount"
                  required
                />
              ) : null}
            </SimpleGrid>
          </Stack>
        ) : null}
        {task?.seriesId ? (
          <Box bg="bg.subtle" p="3" rounded="l1">
            <Text fontSize="sm" fontWeight="medium">
              {t('tasks.applyChangesTo')}
            </Text>
            <HStack gap="2" mt="2" wrap="wrap">
              {(['this', 'future', 'series'] as const).map((scope) => (
                <Button
                  colorPalette={editScope === scope ? 'brand' : undefined}
                  key={scope}
                  onClick={() => setEditScope(scope)}
                  size="sm"
                  type="button"
                  variant={editScope === scope ? 'subtle' : 'outline'}
                >
                  {t(`tasks.editScopes.${scope}`)}
                </Button>
              ))}
            </HStack>
          </Box>
        ) : null}
      </Stack>
    </FormDialog>
  )
}
