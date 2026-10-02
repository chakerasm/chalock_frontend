import {
  Button,
  Dialog,
  HStack,
  Portal,
  SimpleGrid,
  Stack,
  Text,
} from '@chakra-ui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from '@tanstack/react-router'
import {
  ArrowLeft,
  Bell,
  CreditCard,
  FileText,
  ListTodo,
  Plus,
  Timer,
  X,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { FieldInput } from '@/components/ui/FieldInput/FieldInput'
import { FieldInputNumber } from '@/components/ui/FieldInputNumber/FieldInputNumber'
import { FieldSelect } from '@/components/ui/FieldSelect/FieldSelect'
import {
  useCreateTransaction,
  useFinanceSnapshot,
} from '@/features/finance/hooks/use-finance'
import { useCreateNote } from '@/features/notes/hooks/use-notes'
import { useCreateTimeBlock } from '@/features/planner/hooks/use-planner'
import { getLocalDate } from '@/features/planner/services/planner-calculations'
import { getQuickAddTimeRange } from '@/features/quick-add/services/quick-add-defaults'
import type { QuickAddType } from '@/features/quick-add/types/quick-add.types'
import { useCreateReminder } from '@/features/reminders/hooks/use-reminders'
import {
  useDefaultCurrency,
  useSettings,
} from '@/features/settings/hooks/use-settings'
import { useCreateSubscription } from '@/features/subscriptions/hooks/use-subscriptions'
import { useCreateTask } from '@/features/tasks/hooks/use-tasks'
import { APP_ROUTES } from '@/lib/routes'

const titleSchema = z.object({ title: z.string().trim().min(1).max(120) })
const noteSchema = z.object({ content: z.string().trim().min(1).max(20_000) })
const reminderSchema = titleSchema.extend({
  date: z.string().date(),
  time: z.string().regex(/^([01]\\d|2[0-3]):[0-5]\\d$/),
})
const expenseSchema = titleSchema.extend({
  accountId: z.string().min(1),
  amount: z.number().finite().positive(),
})
const subscriptionSchema = titleSchema.extend({
  amount: z.number().min(0),
  nextBillingDate: z.string().date(),
})
const timeBlockSchema = titleSchema
  .extend({
    date: z.string().date(),
    endTime: z.string().regex(/^([01]\\d|2[0-3]):[0-5]\\d$/),
    startTime: z.string().regex(/^([01]\\d|2[0-3]):[0-5]\\d$/),
  })
  .refine((value) => value.endTime > value.startTime, {
    message: 'End time must be after start time.',
    path: ['endTime'],
  })

type MenuItem = {
  icon: typeof ListTodo
  route: (typeof APP_ROUTES)[keyof typeof APP_ROUTES]
  type: QuickAddType
}

const menuItems: MenuItem[] = [
  { icon: ListTodo, route: APP_ROUTES.tasks, type: 'task' },
  { icon: FileText, route: APP_ROUTES.notes, type: 'note' },
  { icon: Bell, route: APP_ROUTES.reminders, type: 'reminder' },
  { icon: CreditCard, route: APP_ROUTES.finance, type: 'expense' },
  { icon: CreditCard, route: APP_ROUTES.subscriptions, type: 'subscription' },
  { icon: Timer, route: APP_ROUTES.planner, type: 'timeBlock' },
]

type QuickAddFormProps = {
  onCreated: () => void
  onNavigate: () => void
}

function typeLabel(
  type: QuickAddType,
  t: ReturnType<typeof useTranslation>['t'],
) {
  return t(`quickAdd.${type}`)
}

export function QuickAddDialog() {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedType, setSelectedType] = useState<QuickAddType>()
  const [activeIndex, setActiveIndex] = useState(0)
  const firstMenuItemRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (
        (event.ctrlKey || event.metaKey) &&
        event.shiftKey &&
        event.key.toLowerCase() === 'a'
      ) {
        event.preventDefault()
        setIsOpen(true)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    if (isOpen && !selectedType)
      window.setTimeout(() => firstMenuItemRef.current?.focus(), 0)
  }, [isOpen, selectedType])

  function close() {
    setIsOpen(false)
    setSelectedType(undefined)
    setActiveIndex(0)
  }

  function selectMenuItem(item: MenuItem) {
    setSelectedType(item.type)
  }

  function handleMenuKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      const direction = event.key === 'ArrowDown' ? 1 : -1
      setActiveIndex(
        (current) =>
          (current + direction + menuItems.length) % menuItems.length,
      )
    }
    if (event.key === 'Enter') {
      event.preventDefault()
      const item = menuItems[activeIndex]
      if (item) selectMenuItem(item)
    }
  }

  const selectedItem = menuItems.find((item) => item.type === selectedType)

  return (
    <>
      <Button
        aria-label={t('quickAdd.open')}
        colorPalette="brand"
        onClick={() => setIsOpen(true)}
        size="sm"
      >
        <Plus aria-hidden="true" size={16} />
        <Text display={{ base: 'none', sm: 'inline' }}>
          {t('quickAdd.title')}
        </Text>
      </Button>
      <Dialog.Root
        onOpenChange={(details) => !details.open && close()}
        open={isOpen}
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner alignItems={{ base: 'start', md: 'center' }} p="4">
            <Dialog.Content maxH="calc(100dvh - 2rem)" overflowY="auto">
              <Dialog.Header>
                <HStack gap="2">
                  {selectedType ? (
                    <Button
                      aria-label={t('quickAdd.title')}
                      onClick={() => setSelectedType(undefined)}
                      size="xs"
                      variant="ghost"
                    >
                      <ArrowLeft aria-hidden="true" size={17} />
                    </Button>
                  ) : null}
                  <Dialog.Title>
                    {selectedType
                      ? typeLabel(selectedType, t)
                      : t('quickAdd.title')}
                  </Dialog.Title>
                </HStack>
                <Dialog.CloseTrigger asChild>
                  <Button
                    aria-label={t('common.close')}
                    size="xs"
                    variant="ghost"
                  >
                    <X aria-hidden="true" size={17} />
                  </Button>
                </Dialog.CloseTrigger>
              </Dialog.Header>
              <Dialog.Body>
                {selectedType && selectedItem ? (
                  <QuickAddForm
                    onCreated={close}
                    onNavigate={close}
                    route={selectedItem.route}
                    type={selectedType}
                  />
                ) : (
                  <Stack gap="2">
                    <Text color="fg.muted" fontSize="sm">
                      {t('quickAdd.menuDescription')}
                    </Text>
                    <Stack gap="1" role="listbox">
                      {menuItems.map((item, index) => {
                        const Icon = item.icon
                        return (
                          <Button
                            alignItems="center"
                            aria-selected={activeIndex === index}
                            justifyContent="start"
                            key={item.type}
                            onClick={() => selectMenuItem(item)}
                            onKeyDown={handleMenuKeyDown}
                            onMouseMove={() => setActiveIndex(index)}
                            ref={index === 0 ? firstMenuItemRef : undefined}
                            role="option"
                            variant={activeIndex === index ? 'subtle' : 'ghost'}
                            w="full"
                          >
                            <Icon aria-hidden="true" size={18} />
                            {typeLabel(item.type, t)}
                          </Button>
                        )
                      })}
                    </Stack>
                  </Stack>
                )}
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  )
}

function QuickAddForm({
  onCreated,
  onNavigate,
  route,
  type,
}: QuickAddFormProps & { route: MenuItem['route']; type: QuickAddType }) {
  const { t } = useTranslation()
  const moreOptions = (
    <Button asChild onClick={onNavigate} size="sm" variant="ghost">
      <Link to={route}>{t('quickAdd.moreOptions')}</Link>
    </Button>
  )
  switch (type) {
    case 'task':
      return <TaskQuickAdd moreOptions={moreOptions} onCreated={onCreated} />
    case 'note':
      return <NoteQuickAdd moreOptions={moreOptions} onCreated={onCreated} />
    case 'reminder':
      return (
        <ReminderQuickAdd moreOptions={moreOptions} onCreated={onCreated} />
      )
    case 'expense':
      return <ExpenseQuickAdd moreOptions={moreOptions} onCreated={onCreated} />
    case 'subscription':
      return (
        <SubscriptionQuickAdd moreOptions={moreOptions} onCreated={onCreated} />
      )
    case 'timeBlock':
      return (
        <TimeBlockQuickAdd moreOptions={moreOptions} onCreated={onCreated} />
      )
  }
}

function TaskQuickAdd({
  moreOptions,
  onCreated,
}: Pick<QuickAddFormProps, 'onCreated'> & { moreOptions: React.ReactNode }) {
  const { t } = useTranslation()
  const mutation = useCreateTask()
  const form = useForm<z.infer<typeof titleSchema>>({
    defaultValues: { title: '' },
    resolver: zodResolver(titleSchema),
  })
  const [error, setError] = useState<string>()
  return (
    <Stack
      as="form"
      gap="4"
      onSubmit={form.handleSubmit(async (values) => {
        try {
          setError(undefined)
          await mutation.mutateAsync(values)
          onCreated()
        } catch {
          setError(t('quickAdd.submitError'))
        }
      })}
    >
      <FieldInput
        control={form.control}
        label={t('quickAdd.titleLabel')}
        name="title"
        placeholder={t('quickAdd.titlePlaceholder')}
        required
      />
      {error ? (
        <Text color="danger.fg" fontSize="sm">
          {error}
        </Text>
      ) : null}
      <HStack justify="space-between">
        {moreOptions}
        <Button colorPalette="brand" loading={mutation.isPending} type="submit">
          {t('quickAdd.addTask')}
        </Button>
      </HStack>
    </Stack>
  )
}

function NoteQuickAdd({
  moreOptions,
  onCreated,
}: Pick<QuickAddFormProps, 'onCreated'> & { moreOptions: React.ReactNode }) {
  const { t } = useTranslation()
  const mutation = useCreateNote()
  const form = useForm<z.infer<typeof noteSchema>>({
    defaultValues: { content: '' },
    resolver: zodResolver(noteSchema),
  })
  const [error, setError] = useState<string>()
  return (
    <Stack
      as="form"
      gap="4"
      onSubmit={form.handleSubmit(async (values) => {
        try {
          setError(undefined)
          await mutation.mutateAsync(values)
          onCreated()
        } catch {
          setError(t('quickAdd.submitError'))
        }
      })}
    >
      <FieldInput
        control={form.control}
        label={t('quickAdd.note')}
        name="content"
        placeholder={t('quickAdd.notePlaceholder')}
        required
      />
      {error ? (
        <Text color="danger.fg" fontSize="sm">
          {error}
        </Text>
      ) : null}
      <HStack justify="space-between">
        {moreOptions}
        <Button colorPalette="brand" loading={mutation.isPending} type="submit">
          {t('quickAdd.addNote')}
        </Button>
      </HStack>
    </Stack>
  )
}

function ReminderQuickAdd({
  moreOptions,
  onCreated,
}: Pick<QuickAddFormProps, 'onCreated'> & { moreOptions: React.ReactNode }) {
  const { t } = useTranslation()
  const mutation = useCreateReminder()
  const form = useForm<z.infer<typeof reminderSchema>>({
    defaultValues: { date: getLocalDate(), time: '09:00', title: '' },
    resolver: zodResolver(reminderSchema),
  })
  const [error, setError] = useState<string>()
  return (
    <Stack
      as="form"
      gap="4"
      onSubmit={form.handleSubmit(async (values) => {
        try {
          setError(undefined)
          await mutation.mutateAsync({
            title: values.title,
            triggerAt: new Date(`${values.date}T${values.time}`).toISOString(),
          })
          onCreated()
        } catch {
          setError(t('quickAdd.submitError'))
        }
      })}
    >
      <FieldInput
        control={form.control}
        label={t('quickAdd.titleLabel')}
        name="title"
        required
      />
      <SimpleGrid columns={{ base: 1, sm: 2 }} gap="4">
        <FieldInput
          control={form.control}
          label={t('quickAdd.date')}
          name="date"
          required
          type="date"
        />
        <FieldInput
          control={form.control}
          label={t('quickAdd.time')}
          name="time"
          required
          type="time"
        />
      </SimpleGrid>
      {error ? (
        <Text color="danger.fg" fontSize="sm">
          {error}
        </Text>
      ) : null}
      <HStack justify="space-between">
        {moreOptions}
        <Button colorPalette="brand" loading={mutation.isPending} type="submit">
          {t('quickAdd.addReminder')}
        </Button>
      </HStack>
    </Stack>
  )
}

function ExpenseQuickAdd({
  moreOptions,
  onCreated,
}: Pick<QuickAddFormProps, 'onCreated'> & { moreOptions: React.ReactNode }) {
  const { t } = useTranslation()
  const mutation = useCreateTransaction()
  const finance = useFinanceSnapshot({ accounts: true })
  const currency = useDefaultCurrency()
  const form = useForm<z.infer<typeof expenseSchema>>({
    defaultValues: { accountId: '', amount: undefined, title: '' },
    resolver: zodResolver(expenseSchema),
  })
  const [error, setError] = useState<string>()
  const accounts =
    finance.data?.accounts.filter((account) => !account.isArchived) ?? []
  return (
    <Stack
      as="form"
      gap="4"
      onSubmit={form.handleSubmit(async (values) => {
        try {
          setError(undefined)
          const account = accounts.find((item) => item.id === values.accountId)
          await mutation.mutateAsync({
            accountId: values.accountId,
            amount: values.amount,
            currency: account?.currency ?? currency,
            title: values.title,
            transactionDate: getLocalDate(),
            type: 'expense',
          })
          onCreated()
        } catch {
          setError(t('quickAdd.submitError'))
        }
      })}
    >
      <FieldInput
        control={form.control}
        label={t('quickAdd.titleLabel')}
        name="title"
        required
      />
      <FieldInputNumber
        control={form.control}
        label={t('quickAdd.amount')}
        min={0.01}
        name="amount"
        required
        step={0.01}
      />
      <FieldSelect
        control={form.control}
        disabled={finance.isPending || !accounts.length}
        label={t('quickAdd.expense')}
        name="accountId"
        options={[
          { label: t('quickAdd.chooseAccount'), value: '' },
          ...accounts.map((account) => ({
            label: `${account.name} (${account.currency})`,
            value: account.id,
          })),
        ]}
        required
      />
      {!finance.isPending && !accounts.length ? (
        <Text color="fg.muted" fontSize="sm">
          {t('quickAdd.expenseAccountRequired')}
        </Text>
      ) : null}
      {error ? (
        <Text color="danger.fg" fontSize="sm">
          {error}
        </Text>
      ) : null}
      <HStack justify="space-between">
        {moreOptions}
        <Button
          colorPalette="brand"
          disabled={!accounts.length}
          loading={mutation.isPending}
          type="submit"
        >
          {t('quickAdd.addExpense')}
        </Button>
      </HStack>
    </Stack>
  )
}

function SubscriptionQuickAdd({
  moreOptions,
  onCreated,
}: Pick<QuickAddFormProps, 'onCreated'> & { moreOptions: React.ReactNode }) {
  const { t } = useTranslation()
  const mutation = useCreateSubscription()
  const currency = useDefaultCurrency()
  const form = useForm<z.infer<typeof subscriptionSchema>>({
    defaultValues: {
      amount: undefined,
      nextBillingDate: getLocalDate(),
      title: '',
    },
    resolver: zodResolver(subscriptionSchema),
  })
  const [error, setError] = useState<string>()
  return (
    <Stack
      as="form"
      gap="4"
      onSubmit={form.handleSubmit(async (values) => {
        try {
          setError(undefined)
          await mutation.mutateAsync({
            amount: values.amount,
            autoRenew: true,
            billingCycle: 'monthly',
            currency,
            name: values.title,
            nextBillingDate: values.nextBillingDate,
            status: 'active',
          })
          onCreated()
        } catch {
          setError(t('quickAdd.submitError'))
        }
      })}
    >
      <FieldInput
        control={form.control}
        label={t('quickAdd.titleLabel')}
        name="title"
        required
      />
      <SimpleGrid columns={{ base: 1, sm: 2 }} gap="4">
        <FieldInputNumber
          control={form.control}
          label={t('quickAdd.amount')}
          min={0}
          name="amount"
          required
          step={0.01}
        />
        <FieldInput
          control={form.control}
          label={t('quickAdd.nextBillingDate')}
          name="nextBillingDate"
          required
          type="date"
        />
      </SimpleGrid>
      {error ? (
        <Text color="danger.fg" fontSize="sm">
          {error}
        </Text>
      ) : null}
      <HStack justify="space-between">
        {moreOptions}
        <Button colorPalette="brand" loading={mutation.isPending} type="submit">
          {t('quickAdd.addSubscription')}
        </Button>
      </HStack>
    </Stack>
  )
}

function TimeBlockQuickAdd({
  moreOptions,
  onCreated,
}: Pick<QuickAddFormProps, 'onCreated'> & { moreOptions: React.ReactNode }) {
  const { t } = useTranslation()
  const mutation = useCreateTimeBlock()
  const settings = useSettings()
  const planning = settings.data?.settings.planning ?? {
    dayEndHour: 23,
    dayStartHour: 7,
    defaultBlockMinutes: 60,
    timeIncrementMinutes: 15 as const,
  }
  const times = getQuickAddTimeRange(
    new Date(),
    planning.timeIncrementMinutes,
    planning.defaultBlockMinutes,
  )
  const form = useForm<z.infer<typeof timeBlockSchema>>({
    defaultValues: { date: getLocalDate(), ...times, title: '' },
    resolver: zodResolver(timeBlockSchema),
  })
  const [error, setError] = useState<string>()
  return (
    <Stack
      as="form"
      gap="4"
      onSubmit={form.handleSubmit(async (values) => {
        try {
          setError(undefined)
          await mutation.mutateAsync(values)
          onCreated()
        } catch {
          setError(t('quickAdd.submitError'))
        }
      })}
    >
      <FieldInput
        control={form.control}
        label={t('quickAdd.titleLabel')}
        name="title"
        required
      />
      <SimpleGrid columns={{ base: 1, sm: 3 }} gap="4">
        <FieldInput
          control={form.control}
          label={t('quickAdd.date')}
          name="date"
          required
          type="date"
        />
        <FieldInput
          control={form.control}
          label={t('quickAdd.time')}
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
      {error ? (
        <Text color="danger.fg" fontSize="sm">
          {error}
        </Text>
      ) : null}
      <HStack justify="space-between">
        {moreOptions}
        <Button colorPalette="brand" loading={mutation.isPending} type="submit">
          {t('quickAdd.addTimeBlock')}
        </Button>
      </HStack>
    </Stack>
  )
}
