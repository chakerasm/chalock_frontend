import { Badge, Box, Flex, Stack, Text } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { formatFocusTimerDuration } from '@/features/focus/services/focus-timer.service'
import type { PomodoroHistoryItem } from '@/features/focus/types/focus.types'
import type { Task } from '@/features/tasks/types/tasks.types'
import type { ActiveGoal } from '@/features/today/types/today.types'

type PomodoroHistoryProps = {
  goals: ActiveGoal[]
  history: PomodoroHistoryItem[]
  tasks: Task[]
}

const completionColors = {
  cancelled: 'gray',
  completed: 'green',
  skipped: 'orange',
} as const

export function PomodoroHistory({
  goals,
  history,
  tasks,
}: PomodoroHistoryProps) {
  const { i18n, t } = useTranslation()

  return (
    <Box
      borderTopWidth="1px"
      maxW="xl"
      mt={{ base: '8', md: '12' }}
      mx="auto"
      pt="5"
      w="full"
    >
      <Stack gap="1" mb="4">
        <Text fontWeight="semibold">{t('pomodoro.historyTitle')}</Text>
        <Text color="fg.muted" fontSize="sm">
          {t('pomodoro.historyDescription')}
        </Text>
      </Stack>
      {history.length === 0 ? (
        <Text color="fg.muted" fontSize="sm">
          {t('pomodoro.historyEmpty')}
        </Text>
      ) : (
        <Stack gap="3">
          {history.slice(0, 5).map((item) => {
            const task = tasks.find((candidate) => candidate.id === item.taskId)
            const goal = goals.find((candidate) => candidate.id === item.goalId)
            return (
              <Flex
                align="center"
                gap="3"
                justify="space-between"
                key={item.id}
              >
                <Stack gap="0">
                  <Text fontSize="sm" fontWeight="medium">
                    {new Intl.DateTimeFormat(i18n.language, {
                      day: 'numeric',
                      month: 'short',
                    }).format(new Date(item.endedAt))}
                  </Text>
                  <Text color="fg.muted" fontSize="sm">
                    {task?.title ??
                      goal?.name ??
                      item.intention ??
                      t('pomodoro.unlinked')}
                  </Text>
                </Stack>
                <Stack align="end" gap="1">
                  <Text
                    fontSize="sm"
                    fontVariantNumeric="tabular-nums"
                    fontWeight="semibold"
                  >
                    {formatFocusTimerDuration(item.durationSeconds)}
                  </Text>
                  <Badge
                    colorPalette={completionColors[item.completionState]}
                    size="sm"
                  >
                    {t(`pomodoro.historyState.${item.completionState}`)}
                  </Badge>
                </Stack>
              </Flex>
            )
          })}
        </Stack>
      )}
    </Box>
  )
}
