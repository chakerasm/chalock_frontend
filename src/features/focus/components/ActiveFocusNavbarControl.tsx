import { Box, HStack, IconButton, Stack, Text } from '@chakra-ui/react'
import { Check, Pause, Play, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from '@/components/ui/Toaster/Toaster'
import { useFocusTimer } from '@/features/focus/hooks/use-focus-timer'
import { formatFocusTimerDuration } from '@/features/focus/services/focus-timer.service'
import { useTasks } from '@/features/tasks/hooks/use-tasks'

export function ActiveFocusNavbarControl() {
  const { t } = useTranslation()
  const timer = useFocusTimer()
  const tasksQuery = useTasks()
  const activeTimer = timer.activeTimer

  if (!activeTimer) return null

  const taskTitle = tasksQuery.data?.find(
    (task) => task.id === activeTimer.taskId,
  )?.title
  const isActive = activeTimer.status === 'active'
  const displayedSeconds =
    activeTimer.type === 'timer'
      ? (timer.remainingSeconds ?? 0)
      : timer.elapsedSeconds
  const durationLabel =
    activeTimer.type === 'timer' ? t('focus.remaining') : t('focus.elapsed')

  async function handleSave() {
    const session = await timer.save()
    if (session) toast.success({ title: t('focus.sessionSaved') })
  }

  return (
    <HStack
      aria-label={t('focus.title')}
      bg="brand.subtle"
      borderColor="brand.border"
      borderWidth="1px"
      gap="2"
      minW="0"
      p="1"
      rounded="l2"
    >
      <Stack
        display={{ base: 'none', lg: 'flex' }}
        flex="1"
        gap="0"
        minW="0"
        px="1"
      >
        <Text color="brand.fg" fontSize="2xs" fontWeight="semibold">
          {isActive ? t('focus.active') : t('focus.paused')}
        </Text>
        <Text fontSize="xs" fontWeight="medium" lineClamp={1}>
          {taskTitle ??
            t(
              activeTimer.type === 'timer'
                ? 'focus.timerTitle'
                : 'focus.stopwatchTitle',
            )}
        </Text>
      </Stack>
      <Box
        fontSize="xs"
        fontVariantNumeric="tabular-nums"
        fontWeight="bold"
        px="1"
        whiteSpace="nowrap"
      >
        <Text as="span" display={{ base: 'none', xl: 'inline' }}>
          {durationLabel}{' '}
        </Text>
        {formatFocusTimerDuration(displayedSeconds)}
      </Box>
      <HStack gap="1">
        <IconButton
          aria-label={isActive ? t('focus.pause') : t('focus.resume')}
          colorPalette="brand"
          disabled={timer.isPending}
          onClick={isActive ? timer.pause : timer.resume}
          size="xs"
          title={isActive ? t('focus.pause') : t('focus.resume')}
          variant="subtle"
        >
          {isActive ? (
            <Pause aria-hidden="true" size={14} />
          ) : (
            <Play aria-hidden="true" size={14} />
          )}
        </IconButton>
        <IconButton
          aria-label={t('focus.finishAndSave')}
          disabled={timer.isPending}
          onClick={handleSave}
          size="xs"
          title={t('focus.finishAndSave')}
          variant="ghost"
        >
          <Check aria-hidden="true" size={14} />
        </IconButton>
        <IconButton
          aria-label={t('focus.cancel')}
          disabled={timer.isPending}
          onClick={timer.cancel}
          size="xs"
          title={t('focus.cancel')}
          variant="ghost"
        >
          <X aria-hidden="true" size={14} />
        </IconButton>
      </HStack>
    </HStack>
  )
}
