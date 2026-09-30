import { Stack } from '@chakra-ui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useRef } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { FormDialog } from '@/components/shared/FormDialog/FormDialog'
import { FieldInput } from '@/components/ui/FieldInput/FieldInput'
import { FieldInputNumber } from '@/components/ui/FieldInputNumber/FieldInputNumber'
import { FieldSelect } from '@/components/ui/FieldSelect/FieldSelect'
import { FieldSwitch } from '@/components/ui/FieldSwitch/FieldSwitch'
import { recurringTransactionInputSchema } from '@/features/finance/schemas/finance.schemas'
import { useDefaultCurrency } from '@/features/settings/hooks/use-settings'
import type {
  Account,
  CreateRecurringTransactionInput,
  FinanceCategory,
  RecurringTransaction,
} from '@/features/finance/types/finance.types'

type Props = {
  accounts: Account[]
  categories: FinanceCategory[]
  isSubmitting: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (input: CreateRecurringTransactionInput) => void
  open: boolean
  recurringTransaction?: RecurringTransaction
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

function createDefaultValues(
  accounts: Account[],
  recurringTransaction?: RecurringTransaction,
  defaultCurrency = 'MAD',
): CreateRecurringTransactionInput {
  const account = accounts.find((item) => !item.isArchived)

  return {
    accountId: recurringTransaction?.accountId ?? account?.id ?? '',
    amount: recurringTransaction?.amount ?? 0,
    categoryId: recurringTransaction?.categoryId ?? '',
    currency:
      recurringTransaction?.currency ?? account?.currency ?? defaultCurrency,
    customInterval: recurringTransaction?.customInterval ?? {
      unit: 'month',
      value: 1,
    },
    endDate: recurringTransaction?.endDate ?? '',
    frequency: recurringTransaction?.frequency ?? 'monthly',
    isActive: recurringTransaction?.isActive ?? true,
    nextOccurrenceDate: recurringTransaction?.nextOccurrenceDate ?? today(),
    title: recurringTransaction?.title ?? '',
    type: recurringTransaction?.type ?? 'expense',
  }
}

export function RecurringTransactionFormDialog({
  accounts,
  categories,
  isSubmitting,
  onOpenChange,
  onSubmit,
  open,
  recurringTransaction,
}: Props) {
  const { t } = useTranslation()
  const defaultCurrency = useDefaultCurrency()
  const availableAccounts = accounts.filter((account) => !account.isArchived)
  const form = useForm<CreateRecurringTransactionInput>({
    defaultValues: createDefaultValues(
      accounts,
      recurringTransaction,
      defaultCurrency,
    ),
    resolver: zodResolver(recurringTransactionInputSchema),
  })
  const type = useWatch({ control: form.control, name: 'type' })
  const frequency = useWatch({ control: form.control, name: 'frequency' })
  const accountId = useWatch({ control: form.control, name: 'accountId' })
  const previousType = useRef(type)
  const previousAccountId = useRef(accountId)

  useEffect(() => {
    if (!open) return

    const values = createDefaultValues(
      accounts,
      recurringTransaction,
      defaultCurrency,
    )
    previousType.current = values.type
    previousAccountId.current = values.accountId
    form.reset(values)
  }, [accounts, defaultCurrency, form, open, recurringTransaction])

  useEffect(() => {
    if (previousType.current === type) return

    form.setValue('categoryId', '')
    previousType.current = type
  }, [form, type])

  useEffect(() => {
    if (previousAccountId.current === accountId) return

    const account = availableAccounts.find((item) => item.id === accountId)
    if (account) form.setValue('currency', account.currency)
    previousAccountId.current = accountId
  }, [accountId, availableAccounts, form])

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen)
      form.reset(
        createDefaultValues(accounts, recurringTransaction, defaultCurrency),
      )
    onOpenChange(nextOpen)
  }

  const categoriesForType = categories.filter(
    (category) => category.type === type,
  )

  return (
    <FormDialog
      isSubmitting={isSubmitting}
      onOpenChange={handleOpenChange}
      onSubmit={form.handleSubmit(onSubmit)}
      open={open}
      title={t(
        recurringTransaction ? 'finance.editRecurring' : 'finance.addRecurring',
      )}
    >
      <Stack gap="4">
        <Stack direction={{ base: 'column', sm: 'row' }} gap="4">
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
          <FieldInputNumber
            control={form.control}
            label={t('finance.amount')}
            min={0.01}
            name="amount"
            required
            step={0.01}
          />
        </Stack>
        <FieldInput
          control={form.control}
          label={t('finance.titleLabel')}
          name="title"
          required
        />
        <Stack direction={{ base: 'column', sm: 'row' }} gap="4">
          <FieldSelect
            control={form.control}
            label={t('finance.account')}
            name="accountId"
            options={availableAccounts.map((account) => ({
              label: `${account.name} (${account.currency})`,
              value: account.id,
            }))}
            required
          />
          <FieldInput
            control={form.control}
            label={t('finance.nextOccurrence')}
            name="nextOccurrenceDate"
            required
            type="date"
          />
        </Stack>
        <Stack direction={{ base: 'column', sm: 'row' }} gap="4">
          <FieldSelect
            control={form.control}
            label={t('finance.frequency')}
            name="frequency"
            options={[
              'weekly',
              'monthly',
              'quarterly',
              'semiannual',
              'annual',
              'custom',
            ].map((item) => ({
              label: t(`finance.frequencies.${item}`),
              value: item,
            }))}
            required
          />
          <FieldSelect
            control={form.control}
            label={t('finance.category')}
            name="categoryId"
            options={[
              { label: t('finance.uncategorized'), value: '' },
              ...categoriesForType.map((category) => ({
                label: category.name,
                value: category.id,
              })),
            ]}
          />
        </Stack>
        {frequency === 'custom' ? (
          <Stack direction={{ base: 'column', sm: 'row' }} gap="4">
            <FieldInputNumber
              control={form.control}
              label={t('finance.every')}
              max={365}
              min={1}
              name="customInterval.value"
              required
            />
            <FieldSelect
              control={form.control}
              label={t('finance.intervalUnit')}
              name="customInterval.unit"
              options={['day', 'week', 'month', 'year'].map((unit) => ({
                label: t(`finance.intervalUnits.${unit}`),
                value: unit,
              }))}
              required
            />
          </Stack>
        ) : null}
        <FieldInput
          control={form.control}
          label={t('finance.endDate')}
          name="endDate"
          type="date"
        />
        <FieldSwitch
          control={form.control}
          label={t('finance.recurringActive')}
          name="isActive"
        />
      </Stack>
    </FormDialog>
  )
}
