import { Stack } from '@chakra-ui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { FormDialog } from '@/components/shared/FormDialog/FormDialog'
import { FieldInput } from '@/components/ui/FieldInput/FieldInput'
import { FieldSelect } from '@/components/ui/FieldSelect/FieldSelect'
import { categoryInputSchema } from '@/features/finance/schemas/finance.schemas'
import type {
  CreateCategoryInput,
  FinanceCategory,
} from '@/features/finance/types/finance.types'

type Props = {
  category?: FinanceCategory
  isSubmitting: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (input: CreateCategoryInput) => void
  open: boolean
}

function createDefaultValues(category?: FinanceCategory): CreateCategoryInput {
  return {
    icon: category?.icon,
    name: category?.name ?? '',
    type: category?.type ?? 'expense',
  }
}

export function CategoryFormDialog({
  category,
  isSubmitting,
  onOpenChange,
  onSubmit,
  open,
}: Props) {
  const { t } = useTranslation()
  const form = useForm<CreateCategoryInput>({
    defaultValues: createDefaultValues(category),
    resolver: zodResolver(categoryInputSchema),
  })

  useEffect(() => {
    if (open) form.reset(createDefaultValues(category))
  }, [category, form, open])

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) form.reset(createDefaultValues(category))
    onOpenChange(nextOpen)
  }

  return (
    <FormDialog
      isSubmitting={isSubmitting}
      onOpenChange={handleOpenChange}
      onSubmit={form.handleSubmit(onSubmit)}
      open={open}
      title={t(category ? 'finance.editCategory' : 'finance.addCategory')}
    >
      <Stack gap="4">
        <FieldInput
          control={form.control}
          label={t('finance.categoryName')}
          name="name"
          required
        />
        <FieldSelect
          control={form.control}
          label={t('finance.transactionType')}
          name="type"
          options={[
            { label: t('finance.types.expense'), value: 'expense' },
            { label: t('finance.types.income'), value: 'income' },
          ]}
          required
        />
      </Stack>
    </FormDialog>
  )
}
