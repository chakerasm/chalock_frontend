import { Stack } from '@chakra-ui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useRef } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { FormDialog } from '@/components/shared/FormDialog/FormDialog'
import { FieldInput } from '@/components/ui/FieldInput/FieldInput'
import { FieldInputNumber } from '@/components/ui/FieldInputNumber/FieldInputNumber'
import { FieldSelect } from '@/components/ui/FieldSelect/FieldSelect'
import { FieldTextarea } from '@/components/ui/FieldTextarea/FieldTextarea'
import { transactionInputSchema } from '@/features/finance/schemas/finance.schemas'
import { useDefaultCurrency } from '@/features/settings/hooks/use-settings'
import type {
  Account,
  CreateTransactionInput,
  FinanceCategory,
  Transaction,
} from '@/features/finance/types/finance.types'

type Props = {
  accounts: Account[]
  categories: FinanceCategory[]
  isSubmitting: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (input: CreateTransactionInput) => void
  open: boolean
  transaction?: Transaction
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

function createDefaultValues(
  accounts: Account[],
  transaction?: Transaction,
  defaultCurrency = 'MAD',
): CreateTransactionInput {
  const account = accounts.find((item) => !item.isArchived)

  return {
    accountId: transaction?.accountId ?? account?.id ?? '',
    amount: transaction?.amount ?? 0,
    categoryId: transaction?.categoryId ?? '',
    currency: transaction?.currency ?? account?.currency ?? defaultCurrency,
    description: transaction?.description ?? '',
    destinationAccountId: transaction?.destinationAccountId ?? '',
    recurringTransactionId: transaction?.recurringTransactionId,
    title: transaction?.title ?? '',
    transactionDate: transaction?.transactionDate ?? today(),
    type: transaction?.type ?? 'expense',
  }
}

export function TransactionFormDialog({
  accounts,
  categories,
  isSubmitting,
  onOpenChange,
  onSubmit,
  open,
  transaction,
}: Props) {
  const { t } = useTranslation()
  const defaultCurrency = useDefaultCurrency(open)
  const availableAccounts = accounts.filter((account) => !account.isArchived)
  const form = useForm<CreateTransactionInput>({
    defaultValues: createDefaultValues(accounts, transaction, defaultCurrency),
    resolver: zodResolver(transactionInputSchema),
  })
  const type = useWatch({ control: form.control, name: 'type' })
  const accountId = useWatch({ control: form.control, name: 'accountId' })
  const currency = useWatch({ control: form.control, name: 'currency' })
  const previousType = useRef(type)
  const previousAccountId = useRef(accountId)

  useEffect(() => {
    if (!open) return

    const values = createDefaultValues(accounts, transaction, defaultCurrency)
    previousType.current = values.type
    previousAccountId.current = values.accountId
    form.reset(values)
  }, [accounts, defaultCurrency, form, open, transaction])

  useEffect(() => {
    if (previousType.current === type) return

    form.setValue('categoryId', '')
    if (type !== 'transfer') form.setValue('destinationAccountId', '')
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
      form.reset(createDefaultValues(accounts, transaction, defaultCurrency))
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
        transaction ? 'finance.editTransaction' : 'finance.addTransaction',
      )}
    >
      <Stack gap="4">
        <Stack direction={{ base: 'column', sm: 'row' }} gap="4">
          <FieldSelect
            control={form.control}
            label={t('finance.transactionType')}
            name="type"
            options={['expense', 'income', 'transfer'].map((item) => ({
              label: t(`finance.types.${item}`),
              value: item,
            }))}
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
            label={t('finance.date')}
            name="transactionDate"
            required
            type="date"
          />
        </Stack>
        {type === 'transfer' ? (
          <FieldSelect
            control={form.control}
            label={t('finance.destinationAccount')}
            name="destinationAccountId"
            options={[
              { label: t('finance.selectAccount'), value: '' },
              ...availableAccounts
                .filter(
                  (account) =>
                    account.id !== accountId && account.currency === currency,
                )
                .map((account) => ({
                  label: `${account.name} (${account.currency})`,
                  value: account.id,
                })),
            ]}
            required
          />
        ) : (
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
        )}
        <FieldTextarea
          control={form.control}
          label={t('finance.descriptionLabel')}
          name="description"
          rows={4}
        />
      </Stack>
    </FormDialog>
  )
}
