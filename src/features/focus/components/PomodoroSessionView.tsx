import { Box, Button, HStack, Progress, Stack, Text } from '@chakra-ui/react'
import { Pause, Play, SkipForward, Square } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { formatFocusTimerDuration } from '@/features/focus/services/focus-timer.service'
import type { PomodoroCycle } from '@/features/focus/types/focus.types'

type PomodoroSessionViewProps = {
  cycle: PomodoroCycle
  onPause: () => void
  onResume: () => void
  onSkip: () => void
  onStop: () => void
  progress: number
  remainingSeconds: number
  sessionNumber: number
}

export function PomodoroSessionView({
  cycle,
  onPause,
  onResume,
  onSkip,
  onStop,
  progress,
  remainingSeconds,
  sessionNumber,
}: PomodoroSessionViewProps) {
  const { t } = useTranslation()
  const isActive = cycle.status === 'active'
  const phaseLabel = t(`pomodoro.phases.${cycle.phase}`)

  return (
    <Stack
      align="center"
      gap={{ base: '6', md: '8' }}
      maxW="xl"
      mx="auto"
      textAlign="center"
      w="full"
    >
      <Stack align="center" gap="2">
        <Text
          color="brand.fg"
          fontSize="sm"
          fontWeight="bold"
          letterSpacing="widest"
          textTransform="uppercase"
        >
          {phaseLabel}
        </Text>
        <Text
          fontSize={{ base: '6xl', md: '8xl' }}
          fontVariantNumeric="tabular-nums"
          fontWeight="bold"
          letterSpacing="tight"
          lineHeight="1"
        >
          {formatFocusTimerDuration(remainingSeconds)}
        </Text>
        <Text color="fg.muted" fontSize="sm">
          {t('pomodoro.sessionOf', {
            current: sessionNumber,
            total: cycle.focusSessionsUntilLongBreak,
          })}
        </Text>
      </Stack>
      <Progress.Root size="sm" value={progress} w="full">
        <Progress.Track>
          <Progress.Range />
        </Progress.Track>
      </Progress.Root>
      {cycle.intention ? (
        <Box bg="bg.subtle" px="4" py="3" rounded="l2" w="full">
          <Text color="fg.muted" fontSize="sm">
            {cycle.intention}
          </Text>
        </Box>
      ) : null}
      <HStack gap="2" justify="center" wrap="wrap">
        <Button
          colorPalette="brand"
          onClick={isActive ? onPause : onResume}
          size="lg"
        >
          {isActive ? (
            <Pause aria-hidden="true" size={18} />
          ) : (
            <Play aria-hidden="true" size={18} />
          )}
          {isActive ? t('pomodoro.pause') : t('pomodoro.resume')}
        </Button>
        <Button onClick={onSkip} size="lg" variant="outline">
          <SkipForward aria-hidden="true" size={18} />
          {t('pomodoro.skipPhase')}
        </Button>
        <Button onClick={onStop} size="lg" variant="ghost">
          <Square aria-hidden="true" size={17} />
          {t('pomodoro.stopSession')}
        </Button>
      </HStack>
    </Stack>
  )
}
