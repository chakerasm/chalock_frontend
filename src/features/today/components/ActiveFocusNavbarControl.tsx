import { Box, Button, HStack, IconButton, Stack, Text } from '@chakra-ui/react'
import { Link as RouterLink } from '@tanstack/react-router'
import { Pause, Play, Square, Timer } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  useTodayDashboard,
  useStopFocusSession,
  useUpdateFocusSession,
} from '@/features/today/hooks/use-today-dashboard'
import { APP_ROUTES } from '@/lib/routes'

function getElapsedSeconds(
  elapsedSeconds: number,
  startedAt: string | undefined,
  status: 'active' | 'paused',
  now: number,
) {
  if (status !== 'active' || !startedAt) return elapsedSeconds
  return (
    elapsedSeconds +
    Math.max(0, Math.floor((now - Date.parse(startedAt)) / 1_000))
  )
}

function formatDuration(totalSeconds: number) {
  return [
    Math.floor(totalSeconds / 3_600),
    Math.floor((totalSeconds % 3_600) / 60),
    totalSeconds % 60,
  ]
    .map((value) => String(value).padStart(2, '0'))
    .join(':')
}

export function ActiveFocusNavbarControl() {
  const { t } = useTranslation()
  const dashboardQuery = useTodayDashboard()
  const updateFocus = useUpdateFocusSession()
  const stopFocus = useStopFocusSession()
  const [now, setNow] = useState(Date.now())
  const session = dashboardQuery.data?.activeFocusSession

  useEffect(() => {
    if (session?.status !== 'active') return undefined
    const intervalId = window.setInterval(() => setNow(Date.now()), 1_000)
    return () => window.clearInterval(intervalId)
  }, [session?.status])

  if (!session) return null

  const isRunning = session.status === 'active'
  const elapsedSeconds = getElapsedSeconds(
    session.elapsedSeconds,
    session.startedAt,
    session.status,
    now,
  )

  return (
    <HStack
      aria-label={t('today.focusInProgress')}
      bg="brand.subtle"
      borderColor="brand.border"
      borderWidth="1px"
      gap="2"
      minW="0"
      p="1"
      rounded="l2"
    >
      <Timer aria-hidden="true" color="brand.fg" size={16} />
      <Stack display={{ base: 'none', lg: 'flex' }} flex="1" gap="0" minW="0">
        <Text color="brand.fg" fontSize="2xs" fontWeight="semibold">
          {isRunning ? t('today.focusRunning') : t('today.focusPaused')}
        </Text>
        <Text fontSize="xs" fontWeight="medium" lineClamp={1}>
          {session.taskTitle ?? t('today.focusWithoutTask')}
        </Text>
      </Stack>
      <Box
        fontSize="xs"
        fontVariantNumeric="tabular-nums"
        fontWeight="bold"
        px="1"
      >
        {formatDuration(elapsedSeconds)}
      </Box>
      <IconButton
        aria-label={isRunning ? t('today.pauseFocus') : t('today.resumeFocus')}
        colorPalette="brand"
        disabled={updateFocus.isPending || stopFocus.isPending}
        onClick={() =>
          updateFocus.mutate({
            elapsedSeconds,
            sessionId: session.id,
            status: isRunning ? 'paused' : 'active',
          })
        }
        size="xs"
        title={isRunning ? t('today.pauseFocus') : t('today.resumeFocus')}
        variant="subtle"
      >
        {isRunning ? (
          <Pause aria-hidden="true" size={14} />
        ) : (
          <Play aria-hidden="true" size={14} />
        )}
      </IconButton>
      <IconButton
        aria-label={t('today.stopFocus')}
        colorPalette="red"
        disabled={updateFocus.isPending || stopFocus.isPending}
        onClick={() =>
          stopFocus.mutate({
            elapsedSeconds,
            sessionId: session.id,
          })
        }
        size="xs"
        title={t('today.stopFocus')}
        variant="subtle"
      >
        <Square aria-hidden="true" fill="currentColor" size={12} />
      </IconButton>
      <Button
        asChild
        display={{ base: 'none', xl: 'inline-flex' }}
        size="xs"
        variant="ghost"
      >
        <RouterLink to={APP_ROUTES.home}>{t('today.openSession')}</RouterLink>
      </Button>
    </HStack>
  )
}
