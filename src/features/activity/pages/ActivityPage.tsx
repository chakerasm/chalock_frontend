import {
  Box,
  Button,
  Container,
  Flex,
  HStack,
  Icon,
  Stack,
  Text,
} from '@chakra-ui/react'
import { Link } from '@tanstack/react-router'
import type { LucideIcon } from 'lucide-react'
import {
  CalendarCheck,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Goal,
  NotebookPen,
  Repeat,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ErrorState } from '@/components/shared/ErrorState/ErrorState'
import { PageHeader } from '@/components/shared/PageHeader/PageHeader'
import { ActivityTimelineSkeleton } from '@/features/activity/components/ActivityTimelineSkeleton'
import { useActivity } from '@/features/activity/hooks/use-activity'
import {
  getLocalActivityDate,
  groupActivitiesByDate,
} from '@/features/activity/services/activity.service'
import type {
  Activity,
  ActivityCategory,
  ActivityType,
} from '@/features/activity/types/activity.types'
import { formatCurrency } from '@/lib/formatters/currency'

const pageSize = 25

const activityIcons: Record<ActivityType, LucideIcon> = {
  task_completed: CheckCircle2,
  focus_session_completed: Clock3,
  habit_completed: CheckCircle2,
  goal_completed: Goal,
  note_created: NotebookPen,
  subscription_added: Repeat,
  subscription_cancelled: Repeat,
  expense_recorded: CircleDollarSign,
  planner_block_completed: CalendarCheck,
}

export function ActivityPage() {
  const { i18n, t } = useTranslation()
  const activityQuery = useActivity()
  const [filter, setFilter] = useState<ActivityCategory | 'all'>('all')
  const [visibleCount, setVisibleCount] = useState(pageSize)

  const filteredActivities = useMemo(
    () =>
      (activityQuery.data ?? []).filter(
        (activity) => filter === 'all' || activity.category === filter,
      ),
    [activityQuery.data, filter],
  )
  const activityGroups = useMemo(
    () => groupActivitiesByDate(filteredActivities.slice(0, visibleCount)),
    [filteredActivities, visibleCount],
  )

  function selectFilter(value: ActivityCategory | 'all') {
    setFilter(value)
    setVisibleCount(pageSize)
  }

  if (activityQuery.isPending) return <ActivityTimelineSkeleton />
  if (activityQuery.isError || !activityQuery.data) {
    return (
      <Container maxW="4xl" py={{ base: '6', md: '10' }}>
        <ErrorState
          description={t('activity.loadError')}
          onRetry={() => void activityQuery.refetch()}
        />
      </Container>
    )
  }

  return (
    <Container maxW="4xl" py={{ base: '6', md: '10' }}>
      <Stack gap={{ base: '6', md: '8' }}>
        <PageHeader
          description={t('activity.description')}
          eyebrow={t('activity.eyebrow')}
          title={t('activity.title')}
        />
        <HStack gap="2" overflowX="auto" pb="1" role="group">
          {(['all', 'productivity', 'finance', 'personal'] as const).map(
            (item) => (
              <Button
                colorPalette={filter === item ? 'brand' : undefined}
                key={item}
                onClick={() => selectFilter(item)}
                size="sm"
                variant={filter === item ? 'subtle' : 'outline'}
              >
                {t(`activity.${item}`)}
              </Button>
            ),
          )}
        </HStack>

        {activityGroups.length ? (
          <Stack gap="7">
            {activityGroups.map((group) => (
              <Stack gap="3" key={group.date}>
                <Text color="fg.muted" fontSize="sm" fontWeight="semibold">
                  {formatGroupDate(group.date, i18n.language, t)}
                </Text>
                <Stack gap="2">
                  {group.items.map((activity) => (
                    <ActivityItem
                      activity={activity}
                      locale={i18n.language}
                      key={activity.id}
                    />
                  ))}
                </Stack>
              </Stack>
            ))}
          </Stack>
        ) : (
          <Box
            bg="bg.panel"
            borderWidth="1px"
            p={{ base: '5', md: '6' }}
            rounded="l2"
          >
            <Text color="fg.muted">
              {filter === 'all'
                ? t('activity.empty')
                : t('activity.emptyFiltered', {
                    filter: t(`activity.${filter}`),
                  })}
            </Text>
          </Box>
        )}

        {visibleCount < filteredActivities.length ? (
          <Button
            alignSelf="center"
            onClick={() => setVisibleCount((count) => count + pageSize)}
            variant="outline"
          >
            {t('activity.loadMore')}
          </Button>
        ) : null}
      </Stack>
    </Container>
  )
}

function ActivityItem({
  activity,
  locale,
}: {
  activity: Activity
  locale: string
}) {
  const { t } = useTranslation()
  const IconType = activityIcons[activity.type]
  const details = [
    formatTime(activity.occurredAt, locale),
    activity.amount !== undefined && activity.currency
      ? formatMoney(activity.amount, activity.currency, locale)
      : undefined,
  ].filter(Boolean)
  const item = (
    <Flex align="center" gap="3" minW="0" py="1" textAlign="start" w="full">
      <Flex
        align="center"
        bg="bg.subtle"
        color="fg.muted"
        flexShrink="0"
        h="9"
        justify="center"
        rounded="full"
        w="9"
      >
        <Icon as={IconType} aria-hidden="true" boxSize="4" />
      </Flex>
      <Stack flex="1" gap="0" minW="0">
        <Text fontSize="sm" fontWeight="medium" lineClamp="1">
          {formatActivityTitle(activity, t)}
        </Text>
        {activity.description ? (
          <Text color="fg.muted" fontSize="xs" lineClamp="1">
            {activity.description}
          </Text>
        ) : null}
      </Stack>
      {details.length ? (
        <Text color="fg.muted" flexShrink="0" fontSize="xs">
          {details.join(' · ')}
        </Text>
      ) : null}
    </Flex>
  )

  return activity.href ? (
    <Box
      _hover={{ bg: 'bg.subtle' }}
      borderRadius="l1"
      px="3"
      transition="backgrounds"
    >
      <Link aria-label={formatActivityTitle(activity, t)} to={activity.href}>
        {item}
      </Link>
    </Box>
  ) : (
    <Box borderRadius="l1" px="3">
      {item}
    </Box>
  )
}

function formatActivityTitle(
  activity: Activity,
  t: (key: string, options?: Record<string, unknown>) => string,
) {
  switch (activity.type) {
    case 'task_completed':
      return t('activity.completedTask', { title: activity.title })
    case 'focus_session_completed':
      return t('activity.focused', {
        duration: formatDuration(activity.durationSeconds ?? 0),
      })
    case 'habit_completed':
      return t('activity.completedHabit', { title: activity.title })
    case 'goal_completed':
      return t('activity.completedGoal', { title: activity.title })
    case 'note_created':
      return t('activity.createdNote', { title: activity.title })
    case 'subscription_added':
      return t('activity.addedSubscription', { title: activity.title })
    case 'subscription_cancelled':
      return t('activity.cancelledSubscription', { title: activity.title })
    case 'expense_recorded':
      return t('activity.recordedExpense', { title: activity.title })
    case 'planner_block_completed':
      return t('activity.completedPlannerBlock', { title: activity.title })
  }
}

function formatGroupDate(
  date: string,
  locale: string,
  t: (key: string) => string,
) {
  const today = getLocalActivityDate(new Date())
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  if (date === today) return t('activity.today')
  if (date === getLocalActivityDate(yesterday)) return t('activity.yesterday')
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    weekday: 'long',
  }).format(new Date(`${date}T12:00:00`))
}

function formatTime(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

function formatDuration(totalSeconds: number) {
  const minutes = Math.max(1, Math.round(totalSeconds / 60))
  const hours = Math.floor(minutes / 60)
  return hours ? `${hours}h ${minutes % 60}m` : `${minutes}m`
}

function formatMoney(value: number, currency: string, locale: string) {
  return formatCurrency(value, currency, locale)
}
