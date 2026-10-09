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
import { createTimeBlockFormSchema } from '@/features/planner/schemas/planner.schemas'
import { findTimeBlockOverlaps } from '@/features/planner/services/planner-calculations'
import type {
  CreateTimeBlockInput,
  PlannerRecurrence,
  RecurringEditScope,
  TimeBlock,
  TimeBlockCategory,
} from '@/features/planner/types/planner.types'
import type { Goal } from '@/features/goals/types/goals.types'
import type { PlanningPreferences } from '@/features/settings/types/settings.types'
import type { Task } from '@/features/tasks/types/tasks.types'

type TimeBlockFormValues = {
  category: '' | TimeBlockCategory
  date: string
  description: string
  endTime: string
  goalId: string
  startTime: string
  taskId: string
  title: string
  recurrence: PlannerRecurrence
}

type TimeBlockFormDialogProps = {
  blocks: TimeBlock[]
  defaultDate: string
  defaultStartTime?: string
  goals: Goal[]
  isSubmitting: boolean
  onCancelBlock?: (scope?: RecurringEditScope) => void
  onDelete?: (scope?: RecurringEditScope) => void
  onMarkComplete?: () => void
  onOpenChange: (open: boolean) => void
  onSubmit: (input: CreateTimeBlockInput, scope?: RecurringEditScope) => void
  open: boolean
  planning: PlanningPreferences
  tasks: Task[]
  timeBlock?: TimeBlock
  timezone: string
}

const categories: TimeBlockCategory[] = [
  'focus',
  'work',
  'personal',
  'study',
  'fitness',
  'break',
  'routine',
  'other',
]

function addMinutes(time: string, minutesToAdd: number) {
  const [hours, minutes] = time.split(':').map(Number)
  const total = Math.min(hours * 60 + minutes + minutesToAdd, 23 * 60 + 59)
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

function defaults(
  date: string,
  planning: PlanningPreferences,
  defaultStartTime?: string,
  timeBlock?: TimeBlock,
): TimeBlockFormValues {
  const startTime =
    timeBlock?.startTime ??
    defaultStartTime ??
    `${String(planning.dayStartHour).padStart(2, '0')}:00`
  const endTime =
    timeBlock?.endTime ?? addMinutes(startTime, planning.defaultBlockMinutes)
  return {
    category: timeBlock?.category ?? '',
    date: timeBlock?.date ?? date,
    description: timeBlock?.description ?? '',
    endTime,
    goalId: timeBlock?.goalId ?? '',
    startTime,
    taskId: timeBlock?.taskId ?? '',
    title: timeBlock?.title ?? '',
    recurrence: timeBlock?.recurrence ?? {
      ends: 'never',
      frequency: 'weekly',
      interval: 1,
      startsOn: timeBlock?.date ?? date,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    },
  }
}

export function TimeBlockFormDialog({
  blocks,
  defaultDate,
  defaultStartTime,
  goals,
  isSubmitting,
  onCancelBlock,
  onDelete,
  onMarkComplete,
  onOpenChange,
  onSubmit,
  open,
  planning,
  tasks,
  timeBlock,
  timezone,
}: TimeBlockFormDialogProps) {
  const { t } = useTranslation()
  const form = useForm<TimeBlockFormValues>({
    defaultValues: {
      ...defaults(defaultDate, planning, defaultStartTime, timeBlock),
      recurrence: {
        ...defaults(defaultDate, planning, defaultStartTime, timeBlock)
          .recurrence,
        timezone,
      },
    },
    resolver: zodResolver(
      createTimeBlockFormSchema(planning.timeIncrementMinutes),
    ),
  })
  const values = form.watch()
  const [repeat, setRepeat] = useState<
    'never' | 'daily' | 'weekdays' | 'weekly' | 'custom'
  >(timeBlock?.seriesId ? 'custom' : 'never')
  const [editScope, setEditScope] = useState<RecurringEditScope>('this')
  const overlaps =
    values.date &&
    values.startTime &&
    values.endTime &&
    values.endTime > values.startTime
      ? findTimeBlockOverlaps(blocks, values, timeBlock?.id)
      : []

  useEffect(() => {
    if (open)
      form.reset({
        ...defaults(defaultDate, planning, defaultStartTime, timeBlock),
        recurrence: {
          ...defaults(defaultDate, planning, defaultStartTime, timeBlock)
            .recurrence,
          timezone,
        },
      })
    setRepeat(timeBlock?.seriesId ? 'custom' : 'never')
    setEditScope('this')
  }, [defaultDate, defaultStartTime, form, open, planning, timeBlock, timezone])

  function setRepeatPreset(next: typeof repeat) {
    setRepeat(next)
    if (next === 'daily')
      form.setValue('recurrence', {
        ...values.recurrence,
        frequency: 'daily',
        interval: 1,
        weekdays: undefined,
      })
    if (next === 'weekdays')
      form.setValue('recurrence', {
        ...values.recurrence,
        frequency: 'weekly',
        interval: 1,
        weekdays: [1, 2, 3, 4, 5],
      })
    if (next === 'weekly')
      form.setValue('recurrence', {
        ...values.recurrence,
        frequency: 'weekly',
        interval: 1,
        weekdays: undefined,
      })
  }

  function toggleWeekday(day: number) {
    if (
      values.recurrence.frequency === 'monthly' &&
      values.recurrence.weekOfMonth
    ) {
      form.setValue(
        'recurrence.weekday',
        values.recurrence.weekday === day ? undefined : day,
      )
      return
    }

    const weekdays = values.recurrence.weekdays ?? []
    form.setValue(
      'recurrence.weekdays',
      weekdays.includes(day)
        ? weekdays.filter((item) => item !== day)
        : [...weekdays, day].sort(),
    )
  }

  function isSelectedWeekday(day: number) {
    return values.recurrence.frequency === 'monthly' &&
      values.recurrence.weekOfMonth
      ? values.recurrence.weekday === day
      : values.recurrence.weekdays?.includes(day)
  }

  function handleSubmit(values: TimeBlockFormValues) {
    const recurrence = {
      ...values.recurrence,
      ...(values.recurrence.frequency === 'monthly' &&
      values.recurrence.weekOfMonth
        ? { weekdays: undefined }
        : { weekday: undefined }),
    }

    onSubmit(
      {
        category: values.category || undefined,
        date: values.date,
        description: values.description.trim() || undefined,
        endTime: values.endTime,
        goalId: values.goalId || undefined,
        startTime: values.startTime,
        taskId: values.taskId || undefined,
        title: values.title.trim(),
        recurrence:
          repeat === 'never' || (timeBlock?.seriesId && editScope === 'this')
            ? undefined
            : { ...recurrence, startsOn: values.date, timezone },
      },
      timeBlock?.seriesId ? editScope : undefined,
    )
  }

  return (
    <FormDialog
      description={t('planner.formDescription', {
        increment: planning.timeIncrementMinutes,
      })}
      footer={
        timeBlock ? (
          <Stack gap="3">
            {timeBlock.seriesId ? (
              <Stack gap="2">
                <Text fontSize="sm" fontWeight="medium">
                  {t('planner.applyChangesTo')}
                </Text>
                <HStack gap="2" wrap="wrap">
                  {(['this', 'future', 'series'] as const).map((scope) => (
                    <Button
                      colorPalette={editScope === scope ? 'brand' : undefined}
                      key={scope}
                      onClick={() => setEditScope(scope)}
                      size="sm"
                      type="button"
                      variant={editScope === scope ? 'subtle' : 'outline'}
                    >
                      {t(`planner.editScopes.${scope}`)}
                    </Button>
                  ))}
                </HStack>
              </Stack>
            ) : null}
            <HStack gap="2" wrap="wrap">
              <Button
                disabled={isSubmitting}
                onClick={onMarkComplete}
                size="sm"
                type="button"
                variant="outline"
              >
                {t('planner.markComplete')}
              </Button>
              <Button
                disabled={isSubmitting}
                onClick={() =>
                  onCancelBlock?.(timeBlock.seriesId ? 'this' : undefined)
                }
                size="sm"
                type="button"
                variant="outline"
              >
                {t(
                  timeBlock.seriesId
                    ? 'planner.skipOccurrence'
                    : 'planner.cancelBlock',
                )}
              </Button>
              <Button
                disabled={isSubmitting}
                onClick={() =>
                  onDelete?.(timeBlock.seriesId ? editScope : undefined)
                }
                size="sm"
                type="button"
                variant="outline"
              >
                {t('planner.deleteBlock')}
              </Button>
              <Button colorPalette="brand" loading={isSubmitting} type="submit">
                {t('planner.saveBlock')}
              </Button>
            </HStack>
          </Stack>
        ) : undefined
      }
      isSubmitting={isSubmitting}
      onOpenChange={onOpenChange}
      onSubmit={form.handleSubmit(handleSubmit)}
      open={open}
      submitLabel={t(timeBlock ? 'planner.saveBlock' : 'planner.addBlock')}
      title={t(timeBlock ? 'planner.editBlock' : 'planner.addBlock')}
    >
      <Stack gap="4">
        <FieldInput
          control={form.control}
          label={t('planner.titleLabel')}
          name="title"
          placeholder={t('planner.titlePlaceholder')}
          required
        />
        <SimpleGrid columns={{ base: 1, sm: 3 }} gap="4">
          <FieldInput
            control={form.control}
            label={t('planner.date')}
            name="date"
            required
            type="date"
          />
          <FieldInput
            control={form.control}
            label={t('planner.startTime')}
            name="startTime"
            required
            step={planning.timeIncrementMinutes * 60}
            type="time"
          />
          <FieldInput
            control={form.control}
            label={t('planner.endTime')}
            name="endTime"
            required
            step={planning.timeIncrementMinutes * 60}
            type="time"
          />
        </SimpleGrid>
        <Stack gap="2">
          <Text fontSize="sm" fontWeight="medium">
            {t('planner.repeat')}
          </Text>
          <HStack gap="2" wrap="wrap">
            {(['never', 'daily', 'weekdays', 'weekly', 'custom'] as const).map(
              (option) => (
                <Button
                  colorPalette={repeat === option ? 'brand' : undefined}
                  key={option}
                  onClick={() => setRepeatPreset(option)}
                  size="sm"
                  type="button"
                  variant={repeat === option ? 'subtle' : 'outline'}
                >
                  {t(`planner.repeatOptions.${option}`)}
                </Button>
              ),
            )}
          </HStack>
        </Stack>
        {repeat === 'custom' ? (
          <Stack bg="bg.subtle" gap="4" p="3" rounded="l1">
            <SimpleGrid columns={{ base: 1, sm: 2 }} gap="4">
              <FieldInputNumber
                control={form.control}
                label={t('planner.every')}
                min={1}
                max={365}
                name="recurrence.interval"
                required
              />
              <FieldSelect
                control={form.control}
                label={t('planner.repeatUnit')}
                name="recurrence.frequency"
                options={['daily', 'weekly', 'monthly', 'yearly'].map(
                  (frequency) => ({
                    label: t(`planner.repeatOptions.${frequency}`),
                    value: frequency,
                  }),
                )}
                required
              />
            </SimpleGrid>
            {values.recurrence.frequency === 'weekly' ||
            (values.recurrence.frequency === 'monthly' &&
              values.recurrence.weekOfMonth) ? (
              <Stack gap="2">
                <Text fontSize="sm" fontWeight="medium">
                  {t('planner.weekdays')}
                </Text>
                <HStack gap="1" wrap="wrap">
                  {[0, 1, 2, 3, 4, 5, 6].map((day) => (
                    <Button
                      colorPalette={
                        isSelectedWeekday(day) ? 'brand' : undefined
                      }
                      key={day}
                      onClick={() => toggleWeekday(day)}
                      size="xs"
                      type="button"
                      variant={isSelectedWeekday(day) ? 'subtle' : 'outline'}
                    >
                      {t(`planner.weekday.${day}`)}
                    </Button>
                  ))}
                </HStack>
              </Stack>
            ) : null}
            {values.recurrence.frequency === 'monthly' ? (
              <SimpleGrid columns={{ base: 1, sm: 2 }} gap="4">
                <FieldInputNumber
                  control={form.control}
                  label={t('planner.dayOfMonth')}
                  min={1}
                  max={31}
                  name="recurrence.dayOfMonth"
                />
                <FieldSelect
                  control={form.control}
                  label={t('planner.monthlyWeek')}
                  name="recurrence.weekOfMonth"
                  options={[
                    { label: t('planner.monthlyByDate'), value: '' },
                    ...[1, 2, 3, 4, 5, -1].map((week) => ({
                      label: t(`planner.monthlyWeeks.${week}`),
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
                label={t('planner.repeatEnds')}
                name="recurrence.ends"
                options={['never', 'on_date', 'after_occurrences'].map(
                  (end) => ({
                    label: t(`planner.repeatEndsOptions.${end}`),
                    value: end,
                  }),
                )}
                required
              />
              {values.recurrence.ends === 'on_date' ? (
                <FieldInput
                  control={form.control}
                  label={t('planner.endDate')}
                  name="recurrence.endsOn"
                  required
                  type="date"
                />
              ) : null}
              {values.recurrence.ends === 'after_occurrences' ? (
                <FieldInputNumber
                  control={form.control}
                  label={t('planner.occurrences')}
                  min={1}
                  max={10_000}
                  name="recurrence.occurrenceCount"
                  required
                />
              ) : null}
            </SimpleGrid>
          </Stack>
        ) : null}
        {overlaps.length ? (
          <Box bg="warning.subtle" color="warning.fg" p="3" rounded="l1">
            <Text fontSize="sm">
              {t('planner.overlapWarning', {
                title: overlaps[0].title,
                start: overlaps[0].startTime,
                end: overlaps[0].endTime,
              })}
            </Text>
          </Box>
        ) : null}
        <SimpleGrid columns={{ base: 1, sm: 2 }} gap="4">
          <FieldSelect
            control={form.control}
            label={t('planner.task')}
            name="taskId"
            options={[
              { label: t('planner.noTask'), value: '' },
              ...tasks
                .filter((task) => task.status !== 'cancelled')
                .map((task) => ({ label: task.title, value: task.id })),
            ]}
          />
          <FieldSelect
            control={form.control}
            label={t('planner.goal')}
            name="goalId"
            options={[
              { label: t('planner.noGoal'), value: '' },
              ...goals
                .filter((goal) => goal.status === 'active')
                .map((goal) => ({ label: goal.title, value: goal.id })),
            ]}
          />
          <FieldSelect
            control={form.control}
            label={t('planner.category')}
            name="category"
            options={[
              { label: t('planner.noCategory'), value: '' },
              ...categories.map((category) => ({
                label: t(`planner.categories.${category}`),
                value: category,
              })),
            ]}
          />
        </SimpleGrid>
        <FieldTextarea
          control={form.control}
          label={t('planner.descriptionLabel')}
          name="description"
          rows={3}
        />
      </Stack>
    </FormDialog>
  )
}
