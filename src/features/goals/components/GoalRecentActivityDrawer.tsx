import { CloseButton, Drawer, Flex, Portal, Stack, Text } from '@chakra-ui/react'
import { Clock3, Timer } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { FocusTimerSnapshot } from '@/features/focus/types/focus.types'

export type GoalRecentActivity = {
  durationSeconds: number
  endedAt: string
  id: string
  type: 'focus' | 'pomodoro'
}

export function getGoalRecentActivity(goalId: string, snapshot: FocusTimerSnapshot): GoalRecentActivity[] {
  return [
    ...snapshot.savedSessions
      .filter((session) => session.goalId === goalId && session.status === 'completed' && session.endedAt)
      .map((session) => ({ durationSeconds: session.durationSeconds, endedAt: session.endedAt as string, id: session.id, type: 'focus' as const })),
    ...snapshot.pomodoroHistory
      .filter((session) => session.goalId === goalId && session.completionState === 'completed')
      .map((session) => ({ durationSeconds: session.durationSeconds, endedAt: session.endedAt, id: session.id, type: 'pomodoro' as const })),
  ].sort((left, right) => right.endedAt.localeCompare(left.endedAt))
}

type GoalRecentActivityDrawerProps = {
  activities: GoalRecentActivity[]
  onOpenChange: (open: boolean) => void
  open: boolean
}

function formatDuration(seconds: number) {
  const minutes = Math.max(1, Math.round(seconds / 60))
  const hours = Math.floor(minutes / 60)
  return hours ? `${hours}h ${minutes % 60}m` : `${minutes}m`
}

export function GoalRecentActivityDrawer({ activities, onOpenChange, open }: GoalRecentActivityDrawerProps) {
  const { i18n, t } = useTranslation()

  return (
    <Drawer.Root onOpenChange={(details) => onOpenChange(details.open)} open={open} placement="end">
      <Portal>
        <Drawer.Backdrop backdropFilter="blur(4px)" bg="bg.overlay" />
        <Drawer.Positioner>
          <Drawer.Content bg="bg.elevated" borderColor="border.subtle" borderWidth="1px" shadow="lg">
            <Drawer.Header>
              <Drawer.Title>{t('goals.recentActivity')}</Drawer.Title>
              <Drawer.CloseTrigger asChild>
                <CloseButton aria-label={t('common.close')} size="sm" />
              </Drawer.CloseTrigger>
            </Drawer.Header>
            <Drawer.Body>
              {activities.length ? (
                <Stack gap="2">
                  {activities.map((activity) => {
                    const Icon = activity.type === 'focus' ? Clock3 : Timer
                    return (
                      <Flex align="center" bg="bg.panel" borderColor="border.subtle" borderWidth="1px" gap="3" key={activity.id} p="3" rounded="l2">
                        <Flex align="center" bg="brand.subtle" color="brand.fg" h="9" justify="center" rounded="l1" w="9">
                          <Icon aria-hidden="true" size={17} />
                        </Flex>
                        <Stack flex="1" gap="0" minW="0">
                          <Text fontSize="sm" fontWeight="medium">
                            {t(activity.type === 'focus' ? 'goals.focusSession' : 'goals.pomodoroSession')}
                          </Text>
                          <Text color="fg.muted" fontSize="xs">
                            {new Intl.DateTimeFormat(i18n.language, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(activity.endedAt))}
                          </Text>
                        </Stack>
                        <Text color="brand.fg" fontSize="sm" fontWeight="semibold">{formatDuration(activity.durationSeconds)}</Text>
                      </Flex>
                    )
                  })}
                </Stack>
              ) : (
                <Text color="fg.muted" fontSize="sm">{t('goals.focusEmpty')}</Text>
              )}
            </Drawer.Body>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  )
}
