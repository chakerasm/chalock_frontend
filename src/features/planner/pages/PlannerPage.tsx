import {
  Box,
  Button,
  Container,
  Flex,
  Grid,
  HStack,
  SimpleGrid,
  Stack,
  Text,
} from '@chakra-ui/react'
import { Bell, CalendarDays, CheckSquare, ChevronLeft, Circle, ChevronRight, Clock3, Grid3X3, Plus, Sun, Timer } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog/ConfirmDialog'
import { ErrorState } from '@/components/shared/ErrorState/ErrorState'
import { PageHeader } from '@/components/shared/PageHeader/PageHeader'
import { toast } from '@/components/ui/Toaster/Toaster'
import { useFocusTimer } from '@/features/focus/hooks/use-focus-timer'
import { useGoals } from '@/features/goals/hooks/use-goals'
import { TimeBlockFormDialog } from '@/features/planner/components/TimeBlockFormDialog'
import { PlannerPageSkeleton } from '@/features/planner/components/PlannerPageSkeleton'
import { PlannerTimeline } from '@/features/planner/components/PlannerTimeline'
import {
  useCreateTimeBlock,
  useDeleteTimeBlock,
  useTimeBlocks,
  useUpdateTimeBlock,
} from '@/features/planner/hooks/use-planner'
import {
  formatDuration,
  getFocusTimerInputForTimeBlock,
  getLocalDate,
  getTimeBlockDurationMinutes,
} from '@/features/planner/services/planner-calculations'
import type {
  CreateTimeBlockInput,
  TimeBlock,
} from '@/features/planner/types/planner.types'
import { useTasks } from '@/features/tasks/hooks/use-tasks'
import { useSettings } from '@/features/settings/hooks/use-settings'
import { useReminders } from '@/features/reminders/hooks/use-reminders'

type PlannerPageProps = {
  onSelectedDateChange: (date: string) => void
  selectedDate: string
}

function shiftDate(date: string, amount: number) {
  const next = new Date(`${date}T12:00:00`)
  next.setDate(next.getDate() + amount)
  return getLocalDate(next)
}

function formatPlannerDate(date: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    weekday: 'long',
  }).format(new Date(`${date}T12:00:00`))
}

export function PlannerPage({
  onSelectedDateChange,
  selectedDate,
}: PlannerPageProps) {
  const { i18n, t } = useTranslation()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const blocksQuery = useTimeBlocks(selectedDate)
  const tasksQuery = useTasks()
  const goalsQuery = useGoals({ status: 'active' }, isFormOpen)
  const remindersQuery = useReminders()
  const createMutation = useCreateTimeBlock()
  const updateMutation = useUpdateTimeBlock()
  const deleteMutation = useDeleteTimeBlock()
  const focusTimer = useFocusTimer()
  const settingsQuery = useSettings()
  const planning = settingsQuery.data?.settings.planning ?? {
    dayEndHour: 23,
    dayStartHour: 7,
    defaultBlockMinutes: 60,
    timeIncrementMinutes: 15,
  }
  const timeFormat = settingsQuery.data?.settings.timeFormat ?? '24h'
  const [now, setNow] = useState(() => new Date())
  const [defaultStartTime, setDefaultStartTime] = useState<string>()
  const [blockToEdit, setBlockToEdit] = useState<TimeBlock>()
  const [blockToDelete, setBlockToDelete] = useState<TimeBlock>()

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 60_000)
    return () => window.clearInterval(interval)
  }, [])

  const blocks = blocksQuery.data ?? []
  const isMutating =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending
  const focusAvailable = !focusTimer.activeTimer && !focusTimer.activePomodoro
  const plannedMinutes = blocks
    .filter((block) => block.status !== 'cancelled')
    .reduce((total, block) => total + getTimeBlockDurationMinutes(block), 0)
  const focusMinutes = blocks
    .filter(
      (block) =>
        block.status !== 'cancelled' &&
        (block.category === 'focus' || block.category === 'study'),
    )
    .reduce((total, block) => total + getTimeBlockDurationMinutes(block), 0)

  function openCreate(startTime?: string) {
    setBlockToEdit(undefined)
    setDefaultStartTime(startTime)
    setIsFormOpen(true)
  }

  function closeForm(open: boolean) {
    setIsFormOpen(open)
    if (!open) {
      setBlockToEdit(undefined)
      setDefaultStartTime(undefined)
    }
  }

  function handleSubmit(input: CreateTimeBlockInput) {
    if (blockToEdit) {
      updateMutation.mutate(
        { ...input, timeBlockId: blockToEdit.id },
        {
          onError: () => toast.error({ title: t('planner.saveError') }),
          onSuccess: () => closeForm(false),
        },
      )
      return
    }

    createMutation.mutate(input, {
      onError: () => toast.error({ title: t('planner.saveError') }),
      onSuccess: () => closeForm(false),
    })
  }

  async function handleStartFocus(block: TimeBlock) {
    if (!focusAvailable) {
      toast.warning({ title: t('planner.focusUnavailable') })
      return
    }
    const focusInput = getFocusTimerInputForTimeBlock(block, now)
    const session = await focusTimer.start(focusInput)
    if (!session) return

    updateMutation.mutate(
      {
        focusSessionId: session.id,
        status: 'in_progress',
        timeBlockId: block.id,
      },
      { onError: () => toast.error({ title: t('planner.saveError') }) },
    )
    toast.success({
      title: t('planner.focusStarted', {
        minutes: focusInput.plannedDurationSeconds / 60,
      }),
    })
  }

  function updateStatus(status: TimeBlock['status']) {
    if (!blockToEdit) return
    updateMutation.mutate(
      { status, timeBlockId: blockToEdit.id },
      {
        onError: () => toast.error({ title: t('planner.saveError') }),
        onSuccess: () => closeForm(false),
      },
    )
  }

  async function handleDelete() {
    if (!blockToDelete) return
    await deleteMutation.mutateAsync(blockToDelete.id, {
      onError: () => toast.error({ title: t('planner.deleteError') }),
      onSuccess: () => setBlockToDelete(undefined),
    })
  }

  if (blocksQuery.isPending)
    return <PlannerPageSkeleton />

  if (blocksQuery.isError) {
    return (
      <Container maxW="6xl" py={{ base: '8', md: '12' }}>
        <ErrorState
          description={t('planner.loadErrorDescription')}
          onRetry={() =>
            void Promise.all([
              blocksQuery.refetch(),
              tasksQuery.refetch(),
              goalsQuery.refetch(),
              settingsQuery.refetch(),
            ])
          }
          title={t('planner.loadErrorTitle')}
        />
      </Container>
    )
  }

  return (
    <Container maxW="8xl" py={{ base: '6', md: '10' }}><Grid alignItems="start" gap="6" templateColumns={{ base: '1fr', xl: 'minmax(0, 1fr) 19rem' }}><Stack gap={{ base: '5', md: '7' }}>
        <PageHeader
          actions={
            <Button colorPalette="brand" onClick={() => openCreate()}>
              <Plus aria-hidden="true" size={18} />
              {t('planner.addBlock')}
            </Button>
          }
          description={t('planner.description')}
          eyebrow={t('planner.eyebrow')}
          title={t('planner.title')}
        />
        <SimpleGrid columns={{ base: 2, md: 4 }} gap="3">
          {[
            { icon: Clock3, label: 'Planned hours', value: formatDuration(plannedMinutes) },
            { icon: Timer, label: 'Focus hours', value: formatDuration(focusMinutes) },
            { icon: Sun, label: 'Free time', value: formatDuration(Math.max(0, (planning.dayEndHour - planning.dayStartHour) * 60 - plannedMinutes)) },
            { icon: Grid3X3, label: 'Time blocks', value: String(blocks.length) },
          ].map(({ icon: Icon, label, value }) => (
            <Flex key={label} align="center" bg="bg.panel" borderWidth="1px" gap="3" p="4" rounded="l2" shadow="xs">
              <Box bg="brand.subtle" color="brand.fg" p="2" rounded="full"><Icon aria-hidden="true" size={18} /></Box>
              <Box><Text color="fg.muted" fontSize="xs">{label}</Text><Text fontSize="lg" fontWeight="bold">{value}</Text></Box>
            </Flex>
          ))}
        </SimpleGrid>
        <Flex
          align={{ base: 'stretch', md: 'center' }}
          bg="bg.panel"
          borderWidth="1px"
          direction={{ base: 'column', md: 'row' }}
          gap="3"
          justify="space-between"
          p={{ base: '3', md: '4' }}
          rounded="l2"
        >
          <HStack justify={{ base: 'space-between', md: 'start' }}>
            <Button
              aria-label={t('planner.previousDay')}
              onClick={() => onSelectedDateChange(shiftDate(selectedDate, -1))}
              size="sm"
              variant="ghost"
            >
              <ChevronLeft aria-hidden="true" size={18} />
            </Button>
            <Text fontWeight="semibold" textAlign="center">
              {formatPlannerDate(selectedDate, i18n.language)}
            </Text>
            <Button
              aria-label={t('planner.nextDay')}
              onClick={() => onSelectedDateChange(shiftDate(selectedDate, 1))}
              size="sm"
              variant="ghost"
            >
              <ChevronRight aria-hidden="true" size={18} />
            </Button>
          </HStack>
          <Button
            onClick={() => onSelectedDateChange(getLocalDate())}
            size="sm"
            variant="outline"
          >
            {t('planner.today')}
          </Button>
        </Flex>
        {blocks.length ? (
          <>
            <HStack color="fg.muted" fontSize="sm" gap="4" wrap="wrap">
              <Text>
                {t('planner.plannedSummary', {
                  duration: formatDuration(plannedMinutes),
                })}
              </Text>
              <Text>
                {t('planner.focusSummary', {
                  duration: formatDuration(focusMinutes),
                })}
              </Text>
              {!focusAvailable ? <Text>{t('planner.focusActive')}</Text> : null}
            </HStack>
            <PlannerTimeline
              blocks={blocks}
              focusAvailable={focusAvailable}
              now={now}
              onAddAt={openCreate}
              onEdit={(block) => {
                setBlockToEdit(block)
                setIsFormOpen(true)
              }}
              onStartFocus={handleStartFocus}
              selectedDate={selectedDate}
              locale={i18n.language}
              planning={planning}
              timeFormat={timeFormat}
            />
          </>
        ) : (
          <Box
            bg="bg.panel"
            borderWidth="1px"
            p={{ base: '7', md: '10' }}
            rounded="l2"
            textAlign="center"
          >
            <Stack align="center" gap="3">
              <Clock3 aria-hidden="true" size={28} />
              <Text fontWeight="semibold">{t('planner.emptyTitle')}</Text>
              <Text color="fg.muted">{t('planner.emptyDescription')}</Text>
              <Button colorPalette="brand" onClick={() => openCreate()}>
                <Plus aria-hidden="true" size={17} />
                {t('planner.addBlock')}
              </Button>
            </Stack>
          </Box>
        )}
      </Stack>
      <Stack display={{ base: 'none', xl: 'flex' }} gap="4" position="sticky" top="6">
        <Box bg="bg.panel" borderWidth="1px" p="4" rounded="l2" shadow="xs">
          <HStack justify="space-between" mb="3"><Text fontWeight="semibold">Today’s tasks</Text><CheckSquare aria-hidden="true" color="brand.fg" size={17} /></HStack>
          <Stack gap="2">{(tasksQuery.data ?? []).filter((task) => task.dueDate === selectedDate && task.status !== 'completed').slice(0, 4).map((task) => <HStack key={task.id} gap="2" minW="0"><Circle aria-hidden="true" color="fg.muted" size={10} /><Text fontSize="sm" lineClamp={1}>{task.title}</Text></HStack>)}</Stack>
        </Box>
        <Box bg="bg.panel" borderWidth="1px" p="4" rounded="l2" shadow="xs">
          <HStack justify="space-between" mb="3"><Text fontWeight="semibold">Upcoming reminders</Text><Bell aria-hidden="true" color="brand.fg" size={17} /></HStack>
          <Stack gap="2">{(remindersQuery.data ?? []).filter((reminder) => reminder.status === 'scheduled').slice(0, 3).map((reminder) => <HStack key={reminder.id} gap="2" minW="0"><Bell aria-hidden="true" color="brand.fg" size={14} /><Text fontSize="sm" lineClamp={1}>{reminder.title}</Text></HStack>)}</Stack>
        </Box>
        <Box bg="brand.subtle" borderColor="brand.border" borderWidth="1px" p="4" rounded="l2"><HStack mb="1"><CalendarDays aria-hidden="true" color="brand.fg" size={17}/><Text color="brand.fg" fontWeight="semibold">Plan with intent</Text></HStack><Text color="fg.muted" fontSize="sm">Time blocking protects space for what matters most.</Text></Box>
      </Stack>
      </Grid>
      <TimeBlockFormDialog
        blocks={blocks}
        defaultDate={selectedDate}
        defaultStartTime={defaultStartTime}
        goals={goalsQuery.data ?? []}
        isSubmitting={isMutating}
        onCancelBlock={() => updateStatus('cancelled')}
        onDelete={() => {
          if (blockToEdit) setBlockToDelete(blockToEdit)
          closeForm(false)
        }}
        onMarkComplete={() => updateStatus('completed')}
        onOpenChange={closeForm}
        onSubmit={handleSubmit}
        open={isFormOpen}
        planning={planning}
        tasks={tasksQuery.data ?? []}
        timeBlock={blockToEdit}
      />
      <ConfirmDialog
        confirmLabel={t('planner.deleteBlock')}
        description={t('planner.deleteDescription', {
          title: blockToDelete?.title ?? '',
        })}
        isConfirming={deleteMutation.isPending}
        isDestructive
        onConfirm={handleDelete}
        onOpenChange={(open) => {
          if (!open) setBlockToDelete(undefined)
        }}
        open={Boolean(blockToDelete)}
        title={t('planner.deleteTitle')}
      />
    </Container>
  )
}
