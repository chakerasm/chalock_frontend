import { Stack } from '@chakra-ui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { FormDialog } from '@/components/shared/FormDialog/FormDialog'
import { FieldInput } from '@/components/ui/FieldInput/FieldInput'
import { FieldInputNumber } from '@/components/ui/FieldInputNumber/FieldInputNumber'
import { FieldSelect } from '@/components/ui/FieldSelect/FieldSelect'
import { accountInputSchema } from '@/features/finance/schemas/finance.schemas'
import { useDefaultCurrency } from '@/features/settings/hooks/use-settings'
import type {
  Account,
  CreateAccountInput,
} from '@/features/finance/types/finance.types'

type Props = {
  account?: Account
  isSubmitting: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (input: CreateAccountInput) => void
  open: boolean
}

function createDefaultValues(
  account?: Account,
  defaultCurrency = 'MAD',
): CreateAccountInput {
  return {
    currency: account?.currency ?? defaultCurrency,
    name: account?.name ?? '',
    openingBalance: account?.openingBalance ?? 0,
    type: account?.type ?? 'checking',
  }
}

export function AccountFormDialog({
  account,
  isSubmitting,
  onOpenChange,
  onSubmit,
  open,
}: Props) {
  const { t } = useTranslation()
  const defaultCurrency = useDefaultCurrency(open)
  const form = useForm<CreateAccountInput>({
    defaultValues: createDefaultValues(account, defaultCurrency),
    resolver: zodResolver(accountInputSchema),
  })

  useEffect(() => {
    if (open) form.reset(createDefaultValues(account, defaultCurrency))
  }, [account, defaultCurrency, form, open])

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) form.reset(createDefaultValues(account, defaultCurrency))
    onOpenChange(nextOpen)
  }

  return (
    <FormDialog
      isSubmitting={isSubmitting}
      onOpenChange={handleOpenChange}
      onSubmit={form.handleSubmit(onSubmit)}
      open={open}
      title={t(account ? 'finance.editAccount' : 'finance.addAccount')}
    >
      <Stack gap="4">
        <FieldInput
          control={form.control}
          label={t('finance.accountName')}
          name="name"
          required
        />
        <Stack direction={{ base: 'column', sm: 'row' }} gap="4">
          <FieldSelect
            control={form.control}
            label={t('finance.accountType')}
            name="type"
            options={[
              'checking',
              'savings',
              'cash',
              'credit_card',
              'wallet',
              'other',
            ].map((type) => ({
              label: t(`finance.accountTypes.${type}`),
              value: type,
            }))}
            required
          />
          <FieldInput
            control={form.control}
            label={t('finance.currency')}
            name="currency"
            required
          />
        </Stack>
        <FieldInputNumber
          control={form.control}
          label={t('finance.openingBalance')}
          name="openingBalance"
          required
          step={0.01}
        />
      </Stack>
    </FormDialog>
  )
}
