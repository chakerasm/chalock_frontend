import {
  Button,
  CloseButton,
  Dialog,
  Field,
  Input,
  NativeSelect,
  Portal,
  Stack,
  Switch,
  Text,
  Textarea,
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { subscriptionInputSchema } from '@/features/subscriptions/schemas/subscriptions.schemas'
import { useDefaultCurrency } from '@/features/settings/hooks/use-settings'
import type {
  CreateSubscriptionInput,
  Subscription,
} from '@/features/subscriptions/types/subscriptions.types'

type Props = {
  isSubmitting: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (input: CreateSubscriptionInput) => void
  open: boolean
  subscription?: Subscription
}

export function SubscriptionFormDialog({
  isSubmitting,
  onOpenChange,
  onSubmit,
  open,
  subscription,
}: Props) {
  const { t } = useTranslation()
  const defaultCurrency = useDefaultCurrency()
  const [form, setForm] = useState<CreateSubscriptionInput>({
    amount: 0,
    autoRenew: true,
    billingCycle: 'monthly',
    currency: defaultCurrency,
    name: '',
    nextBillingDate: '',
    status: 'active',
  })
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setForm(
        subscription
          ? { ...subscription }
          : {
              amount: 0,
              autoRenew: true,
              billingCycle: 'monthly',
              currency: defaultCurrency,
              name: '',
              nextBillingDate: '',
              status: 'active',
            },
      )
      setError('')
    }
  }, [defaultCurrency, open, subscription])

  function update<K extends keyof CreateSubscriptionInput>(
    key: K,
    value: CreateSubscriptionInput[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const result = subscriptionInputSchema.safeParse(form)
    if (!result.success) {
      setError(t('subscriptions.formError'))
      return
    }
    setError('')
    onSubmit(result.data)
  }

  return (
    <Dialog.Root
      onOpenChange={(details) => onOpenChange(details.open)}
      open={open}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner p="4">
          <Dialog.Content>
            <form onSubmit={submit}>
              <Dialog.Header>
                <Dialog.Title>
                  {subscription
                    ? t('subscriptions.editTitle')
                    : t('subscriptions.createTitle')}
                </Dialog.Title>
                <Dialog.CloseTrigger asChild>
                  <CloseButton aria-label={t('common.close')} size="sm" />
                </Dialog.CloseTrigger>
              </Dialog.Header>
              <Dialog.Body>
                <Stack gap="4">
                  <Field.Root required>
                    <Field.Label>{t('subscriptions.name')}</Field.Label>
                    <Input
                      autoFocus
                      onChange={(event) => update('name', event.target.value)}
                      value={form.name}
                    />
                  </Field.Root>
                  <Stack direction={{ base: 'column', sm: 'row' }} gap="4">
                    <Field.Root required>
                      <Field.Label>{t('subscriptions.amount')}</Field.Label>
                      <Input
                        min="0"
                        onChange={(event) =>
                          update('amount', Number(event.target.value))
                        }
                        type="number"
                        value={form.amount}
                      />
                    </Field.Root>
                    <Field.Root required>
                      <Field.Label>{t('subscriptions.currency')}</Field.Label>
                      <Input
                        maxLength={3}
                        onChange={(event) =>
                          update('currency', event.target.value.toUpperCase())
                        }
                        value={form.currency}
                      />
                    </Field.Root>
                  </Stack>
                  <Stack direction={{ base: 'column', sm: 'row' }} gap="4">
                    <Field.Root required>
                      <Field.Label>
                        {t('subscriptions.billingCycle')}
                      </Field.Label>
                      <NativeSelect.Root>
                        <NativeSelect.Field
                          onChange={(event) =>
                            update(
                              'billingCycle',
                              event.target
                                .value as CreateSubscriptionInput['billingCycle'],
                            )
                          }
                          value={form.billingCycle}
                        >
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                          <option value="quarterly">Every 3 months</option>
                          <option value="semiannual">Every 6 months</option>
                          <option value="annual">Yearly</option>
                          <option value="custom">Custom</option>
                        </NativeSelect.Field>
                      </NativeSelect.Root>
                    </Field.Root>
                    <Field.Root required>
                      <Field.Label>
                        {t('subscriptions.nextBillingDate')}
                      </Field.Label>
                      <Input
                        onChange={(event) =>
                          update('nextBillingDate', event.target.value)
                        }
                        type="date"
                        value={form.nextBillingDate}
                      />
                    </Field.Root>
                  </Stack>
                  {form.billingCycle === 'custom' ? (
                    <Stack direction="row" gap="4">
                      <Field.Root required>
                        <Field.Label>
                          {t('subscriptions.intervalValue')}
                        </Field.Label>
                        <Input
                          min="1"
                          onChange={(event) =>
                            update('customBillingInterval', {
                              unit: form.customBillingInterval?.unit ?? 'month',
                              value: Number(event.target.value),
                            })
                          }
                          type="number"
                          value={form.customBillingInterval?.value ?? 1}
                        />
                      </Field.Root>
                      <Field.Root required>
                        <Field.Label>
                          {t('subscriptions.intervalUnit')}
                        </Field.Label>
                        <NativeSelect.Root>
                          <NativeSelect.Field
                            onChange={(event) =>
                              update('customBillingInterval', {
                                unit: event.target.value as NonNullable<
                                  CreateSubscriptionInput['customBillingInterval']
                                >['unit'],
                                value: form.customBillingInterval?.value ?? 1,
                              })
                            }
                            value={form.customBillingInterval?.unit ?? 'month'}
                          >
                            <option value="day">days</option>
                            <option value="week">weeks</option>
                            <option value="month">months</option>
                            <option value="year">years</option>
                          </NativeSelect.Field>
                        </NativeSelect.Root>
                      </Field.Root>
                    </Stack>
                  ) : null}
                  <Field.Root>
                    <Field.Label>{t('subscriptions.description')}</Field.Label>
                    <Textarea
                      onChange={(event) =>
                        update('description', event.target.value)
                      }
                      value={form.description ?? ''}
                    />
                  </Field.Root>
                  <Field.Root>
                    <Field.Label>{t('subscriptions.status')}</Field.Label>
                    <NativeSelect.Root>
                      <NativeSelect.Field
                        onChange={(event) =>
                          update(
                            'status',
                            event.target
                              .value as CreateSubscriptionInput['status'],
                          )
                        }
                        value={form.status}
                      >
                        <option value="active">Active</option>
                        <option value="trial">Trial</option>
                        <option value="paused">Paused</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="expired">Expired</option>
                      </NativeSelect.Field>
                    </NativeSelect.Root>
                  </Field.Root>
                  {form.status === 'trial' ? (
                    <Field.Root required>
                      <Field.Label>
                        {t('subscriptions.trialEndDate')}
                      </Field.Label>
                      <Input
                        onChange={(event) =>
                          update('trialEndDate', event.target.value)
                        }
                        type="date"
                        value={form.trialEndDate ?? ''}
                      />
                    </Field.Root>
                  ) : null}
                  <Switch.Root
                    checked={form.autoRenew}
                    onCheckedChange={(details) =>
                      update('autoRenew', details.checked)
                    }
                  >
                    <Switch.HiddenInput />
                    <Switch.Control />
                    <Switch.Label>{t('subscriptions.autoRenew')}</Switch.Label>
                  </Switch.Root>
                  {error ? (
                    <Text color="danger.fg" fontSize="sm" role="alert">
                      {error}
                    </Text>
                  ) : null}
                </Stack>
              </Dialog.Body>
              <Dialog.Footer>
                <Button onClick={() => onOpenChange(false)} variant="ghost">
                  {t('form.cancel')}
                </Button>
                <Button
                  colorPalette="brand"
                  loading={isSubmitting}
                  type="submit"
                >
                  {t('form.save')}
                </Button>
              </Dialog.Footer>
            </form>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}
