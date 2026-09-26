import { Stack } from '@chakra-ui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { FormDialog } from '@/components/shared/FormDialog/FormDialog'
import { FieldInput } from '@/components/ui/FieldInput/FieldInput'
import { createTodayTaskInputSchema } from '@/features/today/schemas/today.schemas'
import type { CreateTodayTaskInput } from '@/features/today/types/today.types'

type AddTaskDialogProps = {
  isSubmitting: boolean
  onCreateTask: (input: CreateTodayTaskInput) => void
  onOpenChange: (open: boolean) => void
  open: boolean
}

export function AddTaskDialog({
  isSubmitting,
  onCreateTask,
  onOpenChange,
  open,
}: AddTaskDialogProps) {
  const { t } = useTranslation()
  const form = useForm<CreateTodayTaskInput>({
    defaultValues: { title: '' },
    resolver: zodResolver(createTodayTaskInputSchema),
  })

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) form.reset()
    onOpenChange(nextOpen)
  }

  return (
    <FormDialog
      description={t('today.addTaskDescription')}
      isSubmitting={isSubmitting}
      onOpenChange={handleOpenChange}
      onSubmit={form.handleSubmit(onCreateTask)}
      open={open}
      submitLabel={t('today.addTask')}
      title={t('today.addTask')}
    >
      <Stack gap="4">
        <FieldInput
          control={form.control}
          label={t('today.taskTitle')}
          name="title"
          placeholder={t('today.taskTitlePlaceholder')}
          required
        />
      </Stack>
    </FormDialog>
  )
}
