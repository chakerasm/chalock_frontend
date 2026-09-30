import {
  Box,
  Button,
  Container,
  Flex,
  HStack,
  Stack,
  Text,
} from '@chakra-ui/react'
import { ChevronLeft, ChevronRight, Clock3, Plus } from 'lucide-react'
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
  const blocksQuery = useTimeBlocks(selectedDate)
  const tasksQuery = useTasks()
  const goalsQuery = useGoals({ status: 'active' })
  const createMutation = useCreateTimeBlock()
  const updateMutation = useUpdateTimeBlock()
  const deleteMutation = useDeleteTimeBlock()
  const focusTimer = useFocusTimer()
  const [now, setNow] = useState(() => new Date())
  const [isFormOpen, setIsFormOpen] = useState(false)
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

  function handleStartFocus(block: TimeBlock) {
    if (!focusAvailable) {
      toast.warning({ title: t('planner.focusUnavailable') })
      return
    }
    const focusInput = getFocusTimerInputForTimeBlock(block, now)
    const session = focusTimer.start(focusInput)
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

  if (blocksQuery.isPending || tasksQuery.isPending || goalsQuery.isPending)
    return <PlannerPageSkeleton />

  if (blocksQuery.isError || tasksQuery.isError || goalsQuery.isError) {
    return (
      <Container maxW="6xl" py={{ base: '8', md: '12' }}>
        <ErrorState
          description={t('planner.loadErrorDescription')}
          onRetry={() =>
            void Promise.all([
              blocksQuery.refetch(),
              tasksQuery.refetch(),
              goalsQuery.refetch(),
            ])
          }
          title={t('planner.loadErrorTitle')}
        />
      </Container>
    )
  }

  return (
    <Container maxW="6xl" py={{ base: '6', md: '10' }}>
      <Stack gap={{ base: '5', md: '7' }}>
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
