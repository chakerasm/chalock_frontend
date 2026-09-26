import { Box, Flex, Stack, Text } from '@chakra-ui/react'
import { History } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { EmptyState } from '@/components/shared/EmptyState/EmptyState'
import { formatFocusTimerDuration } from '@/features/focus/services/focus-timer.service'
import type { FocusSession } from '@/features/focus/types/focus.types'
import type { Task } from '@/features/tasks/types/tasks.types'
import type { ActiveGoal } from '@/features/today/types/today.types'

type SavedFocusSessionsProps = {
  goals: ActiveGoal[]
  sessions: FocusSession[]
  tasks: Task[]
}

export function SavedFocusSessions({
  goals,
  sessions,
  tasks,
}: SavedFocusSessionsProps) {
  const { t } = useTranslation()

  return (
    <Box
      bg="bg.panel"
      borderWidth="1px"
      p={{ base: '4', md: '5' }}
      rounded="l2"
    >
      <Flex align="center" gap="2" mb="4">
        <History aria-hidden="true" size={20} />
        <Stack gap="0">
          <Text fontSize="lg" fontWeight="semibold">
            {t('focus.savedSessionsTitle')}
          </Text>
          <Text color="fg.muted" fontSize="sm">
            {t('focus.savedSessionsDescription')}
          </Text>
        </Stack>
      </Flex>
      {sessions.length === 0 ? (
        <EmptyState
          description={t('focus.savedSessionsEmptyDescription')}
          title={t('focus.savedSessionsEmptyTitle')}
        />
      ) : (
        <Stack gap="3">
          {sessions.slice(0, 5).map((session) => {
            const task = tasks.find((item) => item.id === session.taskId)
            const goal = goals.find((item) => item.id === session.goalId)
            return (
              <Flex
                align={{ base: 'start', sm: 'center' }}
                gap="3"
                justify="space-between"
                key={session.id}
              >
                <Stack gap="0">
                  <Text fontWeight="medium">
                    {session.type === 'timer'
                      ? t('focus.timerTitle')
                      : t('focus.stopwatchTitle')}
                  </Text>
                  {task || goal ? (
                    <Text color="fg.muted" fontSize="sm">
                      {task?.title ?? goal?.name}
                    </Text>
                  ) : null}
                </Stack>
                <Text fontVariantNumeric="tabular-nums" fontWeight="semibold">
                  {formatFocusTimerDuration(session.durationSeconds)}
                </Text>
              </Flex>
            )
          })}
        </Stack>
      )}
    </Box>
  )
}
