import {
  Box,
  Button,
  Container,
  Flex,
  HStack,
  Stack,
  Text,
} from '@chakra-ui/react'
import { Bell, Check, Plus, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog/ConfirmDialog'
import { ErrorState } from '@/components/shared/ErrorState/ErrorState'
import { PageHeader } from '@/components/shared/PageHeader/PageHeader'
import { toast } from '@/components/ui/Toaster/Toaster'
import { useGoals } from '@/features/goals/hooks/use-goals'
import { useHabits } from '@/features/habits/hooks/use-habits'
import { useTimeBlocks } from '@/features/planner/hooks/use-planner'
import { getLocalDate } from '@/features/planner/services/planner-calculations'
import { ReminderFormDialog } from '@/features/reminders/components/ReminderFormDialog'
import { RemindersPageSkeleton } from '@/features/reminders/components/RemindersPageSkeleton'
import {
  useAcknowledgeReminder,
  useCreateReminder,
  useDeleteReminder,
  useReminders,
  useSnoozeReminder,
  useUpdateReminder,
} from '@/features/reminders/hooks/use-reminders'
import {
  formatReminderWhen,
  resolveReminder,
} from '@/features/reminders/services/reminder-calculations'
import type {
  CreateReminderInput,
  Reminder,
  ReminderEntityReference,
  ResolvedReminder,
} from '@/features/reminders/types/reminders.types'
import { useSubscriptions } from '@/features/subscriptions/hooks/use-subscriptions'
import { useNotificationPreferences } from '@/features/settings/hooks/use-notification-preferences'
import { useSettings } from '@/features/settings/hooks/use-settings'
import {
  getTimeInTimezone,
  isWithinQuietHours,
} from '@/features/settings/services/notification-preferences-calculations'
import { useTasks } from '@/features/tasks/hooks/use-tasks'

type ReminderView = 'upcoming' | 'recurring' | 'completed'

function taskReferenceAt(date?: string, time?: string) {
  return date ? new Date(`${date}T${time ?? '09:00'}`).toISOString() : undefined
}

export function RemindersPage() {
  const { i18n, t } = useTranslation()
  const remindersQuery = useReminders()
  const tasksQuery = useTasks()
  const subscriptionsQuery = useSubscriptions()
  const habitsQuery = useHabits({ state: 'active' })
  const goalsQuery = useGoals({ status: 'active' })
  const blocksQuery = useTimeBlocks(getLocalDate())
  const notificationPreferencesQuery = useNotificationPreferences()
  const settingsQuery = useSettings()
  const createMutation = useCreateReminder()
  const updateMutation = useUpdateReminder()
  const deleteMutation = useDeleteReminder()
  const snoozeMutation = useSnoozeReminder()
  const acknowledgeMutation = useAcknowledgeReminder()
  const [view, setView] = useState<ReminderView>('upcoming')
  const [now, setNow] = useState(() => new Date())
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Reminder>()
  const [deleting, setDeleting] = useState<Reminder>()
  const notified = useRef(new Set<string>())

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 60_000)
    return () => window.clearInterval(interval)
  }, [])

  const references = useMemo<ReminderEntityReference[]>(
    () => [
      ...(tasksQuery.data ?? []).map((task) => ({
        id: task.id,
        label: task.title,
        referenceAt: taskReferenceAt(task.dueDate, task.dueTime),
        type: 'task' as const,
      })),
      ...(subscriptionsQuery.data ?? []).map((subscription) => ({
        id: subscription.id,
        label: subscription.name,
        referenceAt: new Date(
          `${subscription.nextBillingDate}T09:00`,
        ).toISOString(),
        type: 'subscription' as const,
      })),
      ...(habitsQuery.data ?? []).map((habit) => ({
        id: habit.id,
        label: habit.name,
        type: 'habit' as const,
      })),
      ...(goalsQuery.data ?? []).map((goal) => ({
        id: goal.id,
        label: goal.title,
        referenceAt: goal.targetDate
          ? new Date(`${goal.targetDate}T09:00`).toISOString()
          : undefined,
        type: 'goal' as const,
      })),
      ...(blocksQuery.data ?? []).map((block) => ({
        id: block.id,
        label: block.title,
        referenceAt: new Date(`${block.date}T${block.startTime}`).toISOString(),
        type: 'time_block' as const,
      })),
    ],
    [
      blocksQuery.data,
      goalsQuery.data,
      habitsQuery.data,
      subscriptionsQuery.data,
      tasksQuery.data,
    ],
  )
  const reminders = useMemo(
    () =>
      (remindersQuery.data ?? [])
        .map((reminder) => resolveReminder(reminder, references, now))
        .filter((reminder) => reminder.nextTriggerAt),
    [now, references, remindersQuery.data],
  )

  useEffect(() => {
    const preferences = notificationPreferencesQuery.data
    const timezone = settingsQuery.data?.settings.timezone
    if (
      !preferences?.browserEnabled ||
      !preferences.categories.reminders ||
      (timezone &&
        isWithinQuietHours(
          preferences.quietHours,
          getTimeInTimezone(now, timezone),
        )) ||
      typeof Notification === 'undefined' ||
      Notification.permission !== 'granted'
    )
      return
    reminders
      .filter((reminder) => reminder.resolvedStatus === 'triggered')
      .forEach((reminder) => {
        if (notified.current.has(reminder.id)) return
        notified.current.add(reminder.id)
        new Notification(reminder.title, { body: reminder.note })
      })
  }, [
    notificationPreferencesQuery.data,
    now,
    reminders,
    settingsQuery.data?.settings.timezone,
  ])

  const visible = reminders
    .filter((reminder) => {
      if (view === 'recurring')
        return Boolean(reminder.recurrence) && reminder.status !== 'cancelled'
      if (view === 'completed')
        return (
          reminder.status === 'completed' || reminder.status === 'dismissed'
        )
      return (
        reminder.status === 'scheduled' ||
        reminder.resolvedStatus === 'triggered'
      )
    })
    .sort(
      (left, right) =>
        Date.parse(left.nextTriggerAt ?? '') -
        Date.parse(right.nextTriggerAt ?? ''),
    )
  const loading =
    remindersQuery.isPending ||
    tasksQuery.isPending ||
    subscriptionsQuery.isPending ||
    habitsQuery.isPending ||
    goalsQuery.isPending ||
    blocksQuery.isPending
  const isSubmitting =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending ||
    snoozeMutation.isPending ||
    acknowledgeMutation.isPending

  function saveReminder(input: CreateReminderInput) {
    const action = editing
      ? updateMutation.mutate(
          { ...input, reminderId: editing.id },
          {
            onSuccess: () => closeForm(false),
            onError: () => toast.error({ title: t('reminders.saveError') }),
          },
        )
      : createMutation.mutate(input, {
          onSuccess: () => closeForm(false),
          onError: () => toast.error({ title: t('reminders.saveError') }),
        })
    return action
  }
  function closeForm(open: boolean) {
    setFormOpen(open)
    if (!open) setEditing(undefined)
  }
  async function deleteSelected() {
    if (deleting)
      await deleteMutation.mutateAsync(deleting.id, {
        onSuccess: () => setDeleting(undefined),
      })
  }

  if (loading) return <RemindersPageSkeleton />
  if (
    remindersQuery.isError ||
    tasksQuery.isError ||
    subscriptionsQuery.isError ||
    habitsQuery.isError ||
    goalsQuery.isError ||
    blocksQuery.isError
  )
    return (
      <Container maxW="6xl" py={{ base: '8', md: '12' }}>
        <ErrorState
          onRetry={() =>
            void Promise.all([
              remindersQuery.refetch(),
              tasksQuery.refetch(),
              subscriptionsQuery.refetch(),
              habitsQuery.refetch(),
              goalsQuery.refetch(),
              blocksQuery.refetch(),
            ])
          }
          title={t('reminders.loadError')}
        />
      </Container>
    )

  return (
    <Container maxW="6xl" py={{ base: '6', md: '10' }}>
      <Stack gap={{ base: '5', md: '7' }}>
        <PageHeader
          actions={
            <Button
              colorPalette="brand"
              onClick={() => {
                setEditing(undefined)
                setFormOpen(true)
              }}
            >
              <Plus aria-hidden="true" size={18} />
              {t('reminders.createReminder')}
            </Button>
          }
          description={t('reminders.description')}
          eyebrow={t('reminders.eyebrow')}
          title={t('reminders.title')}
        />
        <HStack gap="1" overflowX="auto">
          {(['upcoming', 'recurring', 'completed'] as ReminderView[]).map(
            (item) => (
              <Button
                colorPalette={view === item ? 'brand' : undefined}
                key={item}
                onClick={() => setView(item)}
                size="sm"
                variant={view === item ? 'subtle' : 'ghost'}
              >
                {t(`reminders.views.${item}`)}
              </Button>
            ),
          )}
        </HStack>
        {visible.length ? (
          <Stack bg="bg.panel" borderWidth="1px" rounded="l2">
            {visible.map((reminder) => (
              <ReminderRow
                key={reminder.id}
                locale={i18n.language}
                onComplete={() =>
                  acknowledgeMutation.mutate({
                    reminderId: reminder.id,
                    status: 'completed',
                  })
                }
                onDelete={() => setDeleting(reminder)}
                onDismiss={() =>
                  acknowledgeMutation.mutate({
                    reminderId: reminder.id,
                    status: 'dismissed',
                  })
                }
                onEdit={() => {
                  setEditing(reminder)
                  setFormOpen(true)
                }}
                onSnooze={(minutes) =>
                  snoozeMutation.mutate({ minutes, reminderId: reminder.id })
                }
                reminder={reminder}
                t={t}
              />
            ))}
          </Stack>
        ) : (
          <Box
            bg="bg.panel"
            borderWidth="1px"
            p="10"
            rounded="l2"
            textAlign="center"
          >
            <Stack align="center">
              <Bell aria-hidden="true" size={28} />
              <Text fontWeight="semibold">
                {t(`reminders.empty.${view}.title`)}
              </Text>
              <Text color="fg.muted">
                {t(`reminders.empty.${view}.description`)}
              </Text>
              <Button colorPalette="brand" onClick={() => setFormOpen(true)}>
                <Plus aria-hidden="true" size={17} />
                {t('reminders.createReminder')}
              </Button>
            </Stack>
          </Box>
        )}
      </Stack>
      <ReminderFormDialog
        isSubmitting={isSubmitting}
        onOpenChange={closeForm}
        onSubmit={saveReminder}
        open={formOpen}
        references={references}
        reminder={editing}
      />
      <ConfirmDialog
        confirmLabel={t('reminders.deleteReminder')}
        description={t('reminders.deleteDescription', {
          title: deleting?.title ?? '',
        })}
        isConfirming={deleteMutation.isPending}
        isDestructive
        onConfirm={deleteSelected}
        onOpenChange={(open) => {
          if (!open) setDeleting(undefined)
        }}
        open={Boolean(deleting)}
        title={t('reminders.deleteReminder')}
      />
    </Container>
  )
}

function ReminderRow({
  locale,
  onComplete,
  onDelete,
  onDismiss,
  onEdit,
  onSnooze,
  reminder,
  t,
}: {
  locale: string
  onComplete: () => void
  onDelete: () => void
  onDismiss: () => void
  onEdit: () => void
  onSnooze: (minutes: number) => void
  reminder: ResolvedReminder
  t: (key: string, options?: Record<string, unknown>) => string
}) {
  const reference = reminder.entityType
    ? t(`reminders.entityTypes.${reminder.entityType}`)
    : undefined
  return (
    <Flex
      align={{ base: 'start', sm: 'center' }}
      direction={{ base: 'column', sm: 'row' }}
      gap="3"
      justify="space-between"
      p="4"
    >
      <Stack gap="1">
        <Text fontWeight="semibold">{reminder.title}</Text>
        <Text
          color={
            reminder.resolvedStatus === 'triggered' ? 'warning.fg' : 'fg.muted'
          }
          fontSize="sm"
        >
          {reminder.nextTriggerAt
            ? formatReminderWhen(reminder.nextTriggerAt, locale)
            : t('reminders.unscheduled')}
          {reminder.recurrence
            ? ` · ${t(`reminders.frequencies.${reminder.recurrence.frequency}`)}`
            : ''}
          {reference ? ` · ${reference}` : ''}
        </Text>
        {reminder.note ? (
          <Text color="fg.muted" fontSize="sm">
            {reminder.note}
          </Text>
        ) : null}
      </Stack>
      <HStack gap="1" wrap="wrap">
        {reminder.resolvedStatus === 'triggered' ? (
          <>
            <Button onClick={() => onSnooze(10)} size="xs" variant="outline">
              {t('reminders.snoozeTen')}
            </Button>
            <Button
              aria-label={t('reminders.completeReminder')}
              onClick={onComplete}
              size="xs"
              variant="ghost"
            >
              <Check aria-hidden="true" size={16} />
            </Button>
            <Button
              aria-label={t('reminders.dismissReminder')}
              onClick={onDismiss}
              size="xs"
              variant="ghost"
            >
              <X aria-hidden="true" size={16} />
            </Button>
          </>
        ) : null}
        <Button onClick={onEdit} size="xs" variant="ghost">
          {t('reminders.edit')}
        </Button>
        <Button onClick={onDelete} size="xs" variant="ghost">
          {t('reminders.delete')}
        </Button>
      </HStack>
    </Flex>
  )
}
