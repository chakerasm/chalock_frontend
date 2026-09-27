import {
  Box,
  Button,
  Flex,
  HStack,
  IconButton,
  Stack,
  Text,
} from '@chakra-ui/react'
import { Link as RouterLink } from '@tanstack/react-router'
import { Clock3, Pause, Play, Timer } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { APP_ROUTES } from '@/lib/routes'
import type {
  ActiveFocusSession,
  FocusSummary,
} from '@/features/today/types/today.types'

type FocusCardProps = {
  activeSession: ActiveFocusSession | null
  focusSummary: FocusSummary
  isUpdating: boolean
  onOpenSession: () => void
  onStart: () => void
  onUpdateSession: (
    session: ActiveFocusSession,
    elapsedSeconds: number,
    status: 'active' | 'paused',
  ) => void
}

export function getFocusElapsedSeconds(
  session: ActiveFocusSession,
  now = Date.now(),
) {
  if (session.status !== 'active' || !session.startedAt)
    return session.elapsedSeconds
  return (
    session.elapsedSeconds +
    Math.max(0, Math.floor((now - Date.parse(session.startedAt)) / 1_000))
  )
}

export function formatFocusDuration(totalSeconds: number) {
  return [
    Math.floor(totalSeconds / 3_600),
    Math.floor((totalSeconds % 3_600) / 60),
    totalSeconds % 60,
  ]
    .map((value) => String(value).padStart(2, '0'))
    .join(':')
}

export function FocusCard({
  activeSession,
  focusSummary,
  isUpdating,
  onOpenSession,
  onStart,
  onUpdateSession,
}: FocusCardProps) {
  const { t } = useTranslation()
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    if (activeSession?.status !== 'active') return undefined
    const intervalId = window.setInterval(() => setNow(Date.now()), 1_000)
    return () => window.clearInterval(intervalId)
  }, [activeSession])

  if (activeSession) {
    const isRunning = activeSession.status === 'active'
    const elapsedSeconds = getFocusElapsedSeconds(activeSession, now)
    return (
      <Box
        bg="brand.subtle"
        borderColor="brand.border"
        borderWidth="1px"
        p={{ base: '4', md: '5' }}
        rounded="l2"
      >
        <Flex align="center" justify="space-between" mb="5">
          <HStack gap="2">
            <Timer aria-hidden="true" size={20} />
            <Text fontWeight="semibold">{t('today.focusInProgress')}</Text>
          </HStack>
          <Text color="fg.muted" fontSize="sm">
            {isRunning ? t('today.focusRunning') : t('today.focusPaused')}
          </Text>
        </Flex>
        <Stack gap="1">
          <Text
            fontSize="2xl"
            fontVariantNumeric="tabular-nums"
            fontWeight="bold"
          >
            {formatFocusDuration(elapsedSeconds)}
          </Text>
          {activeSession.taskTitle ? (
            <Text color="fg.muted" fontSize="sm">
              {activeSession.taskTitle}
            </Text>
          ) : null}
          <Text color="fg.muted" fontSize="sm">
            {t('today.focusSummary', {
              minutes:
                focusSummary.completedMinutes + Math.floor(elapsedSeconds / 60),
              sessions: focusSummary.completedSessions,
            })}
          </Text>
        </Stack>
        <HStack gap="2" mt="5">
          <IconButton
            aria-label={
              isRunning ? t('today.pauseFocus') : t('today.resumeFocus')
            }
            disabled={isUpdating}
            onClick={() =>
              onUpdateSession(
                activeSession,
                elapsedSeconds,
                isRunning ? 'paused' : 'active',
              )
            }
            size="sm"
            variant="outline"
          >
            {isRunning ? (
              <Pause aria-hidden="true" size={16} />
            ) : (
              <Play aria-hidden="true" size={16} />
            )}
          </IconButton>
          <Button onClick={onOpenSession} size="sm" variant="ghost">
            {t('today.openSession')}
          </Button>
          <Button asChild size="sm" variant="ghost">
            <RouterLink to={APP_ROUTES.focus}>{t('today.timerTools')}</RouterLink>
          </Button>
        </HStack>
      </Box>
    )
  }

  const hasFocusHistory =
    focusSummary.completedMinutes > 0 || focusSummary.completedSessions > 0
  return (
    <Box
      bg="bg.panel"
      borderWidth="1px"
      p={{ base: '4', md: '5' }}
      rounded="l2"
    >
      <Flex align="center" justify="space-between" mb="4">
        <HStack gap="2">
          <Clock3 aria-hidden="true" size={20} />
          <Text fontSize="lg" fontWeight="semibold">
            {t('today.focusTitle')}
          </Text>
        </HStack>
        <HStack gap="1">
          <Button
            colorPalette="brand"
            loading={isUpdating}
            onClick={onStart}
            size="sm"
          >
            <Play aria-hidden="true" size={15} />
            {t('today.startFocus')}
          </Button>
          <Button asChild size="sm" variant="ghost">
            <RouterLink to={APP_ROUTES.focus}>{t('today.timerTools')}</RouterLink>
          </Button>
        </HStack>
      </Flex>
      {hasFocusHistory ? (
        <HStack gap="7">
          <Stack gap="0">
            <Text fontSize="xl" fontWeight="bold">
              {t('today.focusMinutes', {
                minutes: focusSummary.completedMinutes,
              })}
            </Text>
            <Text color="fg.muted" fontSize="sm">
              {t('today.focusToday')}
            </Text>
          </Stack>
          <Stack gap="0">
            <Text fontSize="xl" fontWeight="bold">
              {focusSummary.completedSessions}
            </Text>
            <Text color="fg.muted" fontSize="sm">
              {t('today.sessionsCompleted')}
            </Text>
          </Stack>
        </HStack>
      ) : (
        <Text color="fg.muted" fontSize="sm">
          {t('today.focusEmpty')}
        </Text>
      )}
    </Box>
  )
}
