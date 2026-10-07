import { Box, Button, Flex, HStack, Stack, Text } from '@chakra-ui/react'
import { ChevronRight, Clock3, FileText, Timer, Waves } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { GoalRecentActivity } from '@/features/goals/components/GoalRecentActivityDrawer'
import { formatGoalFocusTime } from '@/features/goals/utils/goals.utils'

type Props = { activities: GoalRecentActivity[]; onViewAll: () => void }

export const GoalDetailsRecentActivity = ({ activities, onViewAll }: Props) => {
  const { i18n, t } = useTranslation()
  return (
    <Box
      bg="bg.panel"
      borderColor="border.subtle"
      borderWidth="1px"
      p="4"
      rounded="l2"
    >
      <Flex align="center" justify="space-between" mb="3">
        <HStack gap="2">
          <Waves aria-hidden="true" color="brand.fg" size={18} />
          <Text fontWeight="semibold">{t('goals.recentActivity')}</Text>
        </HStack>
        {activities.length ? (
          <Button onClick={onViewAll} size="xs" variant="ghost">
            {t('goals.viewAll')} <ChevronRight aria-hidden="true" size={14} />
          </Button>
        ) : null}
      </Flex>
      {activities.length ? (
        <Stack gap="2">
          {activities.slice(0, 4).map((activity) => {
            const Icon = activity.type === 'focus' ? Clock3 : Timer
            return (
              <Flex
                align="center"
                borderTopWidth="1px"
                gap="2"
                key={activity.id}
                pt="2"
              >
                <Icon aria-hidden="true" color="brand.fg" size={16} />
                <Box flex="1" minW="0">
                  <Text fontSize="sm" fontWeight="medium" lineClamp={1}>
                    {t(
                      activity.type === 'focus'
                        ? 'goals.focusSession'
                        : 'goals.pomodoroSession',
                    )}
                  </Text>
                  <Text color="fg.muted" fontSize="xs">
                    {formatGoalFocusTime(activity.durationSeconds, t)}
                  </Text>
                </Box>
                <Text color="fg.muted" fontSize="xs">
                  {new Intl.DateTimeFormat(i18n.language, {
                    month: 'short',
                    day: 'numeric',
                  }).format(new Date(activity.endedAt))}
                </Text>
              </Flex>
            )
          })}
        </Stack>
      ) : (
        <Flex
          align="center"
          color="fg.muted"
          direction="column"
          gap="2"
          minH="20"
          justify="center"
          textAlign="center"
        >
          <FileText aria-hidden="true" size={25} />
          <Text fontSize="sm">{t('goals.focusEmpty')}</Text>
        </Flex>
      )}
    </Box>
  )
}
