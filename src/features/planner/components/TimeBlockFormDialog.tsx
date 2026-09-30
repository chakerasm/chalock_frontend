import { Box, Button, HStack, SimpleGrid, Stack, Text } from '@chakra-ui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { FormDialog } from '@/components/shared/FormDialog/FormDialog'
import { FieldInput } from '@/components/ui/FieldInput/FieldInput'
import { FieldSelect } from '@/components/ui/FieldSelect/FieldSelect'
import { FieldTextarea } from '@/components/ui/FieldTextarea/FieldTextarea'
import { timeBlockFormSchema } from '@/features/planner/schemas/planner.schemas'
import { findTimeBlockOverlaps } from '@/features/planner/services/planner-calculations'
import type {
  CreateTimeBlockInput,
  TimeBlock,
  TimeBlockCategory,
} from '@/features/planner/types/planner.types'
import type { Goal } from '@/features/goals/types/goals.types'
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
}

type TimeBlockFormDialogProps = {
  blocks: TimeBlock[]
  defaultDate: string
  defaultStartTime?: string
  goals: Goal[]
  isSubmitting: boolean
  onCancelBlock?: () => void
  onDelete?: () => void
  onMarkComplete?: () => void
  onOpenChange: (open: boolean) => void
  onSubmit: (input: CreateTimeBlockInput) => void
  open: boolean
  tasks: Task[]
  timeBlock?: TimeBlock
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

function defaults(
  date: string,
  defaultStartTime?: string,
  timeBlock?: TimeBlock,
): TimeBlockFormValues {
  const startTime = timeBlock?.startTime ?? defaultStartTime ?? '09:00'
  const [hours, minutes] = startTime.split(':').map(Number)
  const endTime =
    timeBlock?.endTime ??
    `${String(Math.min(hours + 1, 23)).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
  return {
    category: timeBlock?.category ?? '',
    date: timeBlock?.date ?? date,
    description: timeBlock?.description ?? '',
    endTime,
    goalId: timeBlock?.goalId ?? '',
    startTime,
    taskId: timeBlock?.taskId ?? '',
    title: timeBlock?.title ?? '',
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
  tasks,
  timeBlock,
}: TimeBlockFormDialogProps) {
  const { t } = useTranslation()
  const form = useForm<TimeBlockFormValues>({
    defaultValues: defaults(defaultDate, defaultStartTime, timeBlock),
    resolver: zodResolver(timeBlockFormSchema),
  })
  const values = form.watch()
  const overlaps =
    values.date &&
    values.startTime &&
    values.endTime &&
    values.endTime > values.startTime
      ? findTimeBlockOverlaps(blocks, values, timeBlock?.id)
      : []

  useEffect(() => {
    if (open) form.reset(defaults(defaultDate, defaultStartTime, timeBlock))
  }, [defaultDate, defaultStartTime, form, open, timeBlock])

  function handleSubmit(values: TimeBlockFormValues) {
    onSubmit({
      category: values.category || undefined,
      date: values.date,
      description: values.description.trim() || undefined,
      endTime: values.endTime,
      goalId: values.goalId || undefined,
      startTime: values.startTime,
      taskId: values.taskId || undefined,
      title: values.title.trim(),
    })
  }

  return (
    <FormDialog
      description={t('planner.formDescription')}
      footer={
        timeBlock ? (
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
              onClick={onCancelBlock}
              size="sm"
              type="button"
              variant="outline"
            >
              {t('planner.cancelBlock')}
            </Button>
            <Button
              disabled={isSubmitting}
              onClick={onDelete}
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
            type="time"
          />
          <FieldInput
            control={form.control}
            label={t('planner.endTime')}
            name="endTime"
            required
            type="time"
          />
        </SimpleGrid>
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
