import { Stack } from '@chakra-ui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { FormDialog } from '@/components/shared/FormDialog/FormDialog'
import { FieldInput } from '@/components/ui/FieldInput/FieldInput'
import { FieldInputNumber } from '@/components/ui/FieldInputNumber/FieldInputNumber'
import { FieldSelect } from '@/components/ui/FieldSelect/FieldSelect'
import { savingsGoalInputSchema } from '@/features/finance/schemas/finance.schemas'
import type {
  CreateSavingsGoalInput,
  SavingsGoal,
} from '@/features/finance/types/finance.types'

type Props = {
  isSubmitting: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (input: CreateSavingsGoalInput) => void
  open: boolean
  savingsGoal?: SavingsGoal
}

function createDefaultValues(
  savingsGoal?: SavingsGoal,
): CreateSavingsGoalInput {
  return {
    currency: savingsGoal?.currency ?? 'MAD',
    currentAmount: savingsGoal?.currentAmount ?? 0,
    name: savingsGoal?.name ?? '',
    status: savingsGoal?.status ?? 'active',
    targetAmount: savingsGoal?.targetAmount ?? 0,
    targetDate: savingsGoal?.targetDate ?? '',
  }
}

export function SavingsGoalFormDialog({
  isSubmitting,
  onOpenChange,
  onSubmit,
  open,
  savingsGoal,
}: Props) {
  const { t } = useTranslation()
  const form = useForm<CreateSavingsGoalInput>({
    defaultValues: createDefaultValues(savingsGoal),
    resolver: zodResolver(savingsGoalInputSchema),
  })

  useEffect(() => {
    if (open) form.reset(createDefaultValues(savingsGoal))
  }, [form, open, savingsGoal])

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) form.reset(createDefaultValues(savingsGoal))
    onOpenChange(nextOpen)
  }

  return (
    <FormDialog
      isSubmitting={isSubmitting}
      onOpenChange={handleOpenChange}
      onSubmit={form.handleSubmit(onSubmit)}
      open={open}
      title={t(
        savingsGoal ? 'finance.editSavingsGoal' : 'finance.addSavingsGoal',
      )}
    >
      <Stack gap="4">
        <FieldInput
          control={form.control}
          label={t('finance.goalName')}
          name="name"
          required
        />
        <Stack direction={{ base: 'column', sm: 'row' }} gap="4">
          <FieldInputNumber
            control={form.control}
            label={t('finance.targetAmount')}
            min={0.01}
            name="targetAmount"
            required
            step={0.01}
          />
          <FieldInputNumber
            control={form.control}
            label={t('finance.currentAmount')}
            min={0}
            name="currentAmount"
            required
            step={0.01}
          />
        </Stack>
        <Stack direction={{ base: 'column', sm: 'row' }} gap="4">
          <FieldInput
            control={form.control}
            label={t('finance.currency')}
            name="currency"
            required
          />
          <FieldInput
            control={form.control}
            label={t('finance.targetDate')}
            name="targetDate"
            type="date"
          />
        </Stack>
        <FieldSelect
          control={form.control}
          label={t('finance.status')}
          name="status"
          options={['active', 'paused', 'archived'].map((status) => ({
            label: t(`finance.goalStatuses.${status}`),
            value: status,
          }))}
        />
      </Stack>
    </FormDialog>
  )
}
