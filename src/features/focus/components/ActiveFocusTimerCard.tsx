import {
  Badge,
  Box,
  Button,
  Flex,
  HStack,
  Progress,
  Stack,
  Text,
} from '@chakra-ui/react'
import { Check, Pause, Play, Save, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { formatFocusTimerDuration } from '@/features/focus/services/focus-timer.service'
import type { ActiveFocusTimer } from '@/features/focus/types/focus.types'

type ActiveFocusTimerCardProps = {
  elapsedSeconds: number
  onCancel: () => void
  onPause: () => void
  onResume: () => void
  onSave: () => void
  remainingSeconds?: number
  timer: ActiveFocusTimer
}

export function ActiveFocusTimerCard({
  elapsedSeconds,
  onCancel,
  onPause,
  onResume,
  onSave,
  remainingSeconds,
  timer,
}: ActiveFocusTimerCardProps) {
  const { t } = useTranslation()
  const isCountdown = timer.type === 'timer'
  const isActive = timer.status === 'active'
  const isCompleted = timer.status === 'completed'
  const displayedSeconds = isCountdown
    ? (remainingSeconds ?? 0)
    : elapsedSeconds
  const progress = timer.plannedDurationSeconds
    ? Math.min(100, (elapsedSeconds / timer.plannedDurationSeconds) * 100)
    : 0

  return (
    <Box
      bg={isCompleted ? 'success.subtle' : 'bg.elevated'}
      borderColor={isCompleted ? 'success.fg' : 'border.subtle'}
      borderWidth="1px"
      p={{ base: '5', md: '7' }}
      rounded="l3"
      shadow="sm"
    >
      <Stack gap="6">
        <Flex align="start" gap="4" justify="space-between">
          <Stack gap="1">
            <HStack gap="2">
              <Text fontSize="lg" fontWeight="semibold">
                {isCountdown
                  ? t('focus.timerTitle')
                  : t('focus.stopwatchTitle')}
              </Text>
              <Badge
                bg={isCompleted ? 'success.solid' : 'brand.solid'}
                color={isCompleted ? 'fg.inverted' : 'brand.contrast'}
              >
                {isCompleted
                  ? t('focus.completed')
                  : isActive
                    ? t('focus.active')
                    : t('focus.paused')}
              </Badge>
            </HStack>
            {isCompleted ? (
              <Text color="success.fg" role="status">
                <Check aria-hidden="true" size={16} />{' '}
                {t('focus.timerFinished')}
              </Text>
            ) : null}
          </Stack>
          <Text color="fg.muted" fontSize="sm">
            {isCountdown
              ? t('focus.originalDuration', {
                  duration: formatFocusTimerDuration(
                    timer.plannedDurationSeconds ?? 0,
                  ),
                })
              : t('focus.elapsed')}
          </Text>
        </Flex>
        <Stack align="center" gap="2" py={{ base: '3', md: '5' }}>
          <Text
            fontSize={{ base: '5xl', md: '7xl' }}
            fontVariantNumeric="tabular-nums"
            fontWeight="bold"
            letterSpacing="tight"
          >
            {formatFocusTimerDuration(displayedSeconds)}
          </Text>
          <Text color="fg.muted" fontSize="sm">
            {isCountdown ? t('focus.remaining') : t('focus.elapsed')}
          </Text>
        </Stack>
        {isCountdown ? (
          <Progress.Root size="sm" value={progress}>
            <Progress.Track>
              <Progress.Range />
            </Progress.Track>
          </Progress.Root>
        ) : null}
        <HStack gap="2" justify="center" wrap="wrap">
          {!isCompleted ? (
            <Button
              colorPalette="brand"
              onClick={isActive ? onPause : onResume}
            >
              {isActive ? (
                <Pause aria-hidden="true" size={17} />
              ) : (
                <Play aria-hidden="true" size={17} />
              )}
              {isActive ? t('focus.pause') : t('focus.resume')}
            </Button>
          ) : null}
          <Button
            colorPalette="brand"
            onClick={onSave}
            variant={isCompleted ? 'solid' : 'outline'}
          >
            <Save aria-hidden="true" size={17} />
            {isCompleted ? t('focus.saveSession') : t('focus.finishAndSave')}
          </Button>
          {!isCompleted ? (
            <Button onClick={onCancel} variant="ghost">
              <X aria-hidden="true" size={17} />
              {t('focus.cancel')}
            </Button>
          ) : null}
        </HStack>
      </Stack>
    </Box>
  )
}
