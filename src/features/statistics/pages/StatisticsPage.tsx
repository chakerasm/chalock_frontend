import {
  Box,
  Button,
  Container,
  Flex,
  HStack,
  Progress,
  SimpleGrid,
  Stack,
  Text,
} from '@chakra-ui/react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { CheckCheck, Clock3, ListTodo } from 'lucide-react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { APP_ROUTES } from '@/lib/routes'
import { ErrorState } from '@/components/shared/ErrorState/ErrorState'
import { LoadingState } from '@/components/shared/LoadingState/LoadingState'
import { PageHeader } from '@/components/shared/PageHeader/PageHeader'
import { DailyBarChart } from '@/features/statistics/components/DailyBarChart'
import { HabitConsistencyHeatmap } from '@/features/statistics/components/HabitConsistencyHeatmap'
import { StatisticsMetricCard } from '@/features/statistics/components/StatisticsMetricCard'
import { useStatistics } from '@/features/statistics/hooks/use-statistics'
import type { StatisticsPreset } from '@/features/statistics/types/statistics.types'

const presets: StatisticsPreset[] = [
  'last-7-days',
  'last-30-days',
  'this-month',
]

export function StatisticsPage() {
  const { i18n, t } = useTranslation()
  const { range } = useSearch({ from: APP_ROUTES.statistics })
  const navigate = useNavigate({ from: APP_ROUTES.statistics })
  const statistics = useStatistics(range)
  const formatDate = (date: string) => formatStatisticDate(date, i18n.language)
  const formatShortDate = (date: string) =>
    formatStatisticDate(date, i18n.language, { day: 'numeric', month: 'short' })
  const formatPercent = (value: number) =>
    new Intl.NumberFormat(i18n.language, {
      maximumFractionDigits: 0,
      style: 'percent',
    }).format(value)
  const formatDuration = (totalSeconds: number) => {
    const seconds = Math.max(0, Math.floor(totalSeconds))
    const hours = Math.floor(seconds / 3_600)
    const minutes = Math.floor((seconds % 3_600) / 60)
    if (hours > 0)
      return t('statistics.durationHoursMinutes', { hours, minutes })
    if (minutes > 0) return t('statistics.durationMinutes', { minutes })
    return t('statistics.durationSeconds', { seconds })
  }

  if (statistics.isError) {
    return (
      <Container maxW="6xl" py={{ base: '8', md: '12' }}>
        <ErrorState onRetry={() => void statistics.refetch()} />
      </Container>
    )
  }
  if (statistics.isPending || !statistics.data) {
    return (
      <Container maxW="6xl" py={{ base: '8', md: '12' }}>
        <LoadingState />
      </Container>
    )
  }

  if (statistics.isError) {
    return (
      <Container maxW="6xl" py={{ base: '8', md: '12' }}>
        <ErrorState onRetry={() => void statistics.refetch()} />
      </Container>
    )
  }

  const data = statistics.data
  const focusDays = data.focus.daily.filter((day) => day.focusSeconds > 0)
  const taskDays = data.tasks.daily.filter((day) => day.completedTasks > 0)
  const consistencyDays = data.habits.consistency.filter(
    (day) => day.scheduled > 0,
  )

  return (
    <Container maxW="6xl" py={{ base: '6', md: '10' }}>
      <Stack gap={{ base: '6', md: '8' }}>
        <PageHeader
          actions={
            <HStack
              gap="1"
              overflowX="auto"
              pb="1"
              role="group"
              aria-label={t('statistics.rangeLabel')}
            >
              {presets.map((preset) => (
                <Button
                  colorPalette={range === preset ? 'brand' : undefined}
                  key={preset}
                  onClick={() =>
                    void navigate({
                      search: (previous) => ({ ...previous, range: preset }),
                      to: APP_ROUTES.statistics,
                    })
                  }
                  size="sm"
                  variant={range === preset ? 'subtle' : 'ghost'}
                >
                  {t(`statistics.ranges.${preset}`)}
                </Button>
              ))}
            </HStack>
          }
          description={t('statistics.description')}
          eyebrow={t('statistics.eyebrow')}
          title={t('statistics.title')}
        />

        <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap="4">
          <StatisticsMetricCard
            icon={<ListTodo aria-hidden="true" size={20} />}
            label={t('statistics.summary.tasksCompleted')}
            value={String(data.summary.tasksCompleted)}
          />
          <StatisticsMetricCard
            icon={<Clock3 aria-hidden="true" size={20} />}
            label={t('statistics.summary.totalFocusTime')}
            value={formatDuration(data.summary.totalFocusSeconds)}
          />
          <StatisticsMetricCard
            icon={<Clock3 aria-hidden="true" size={20} />}
            label={t('statistics.summary.focusSessions')}
            value={String(data.summary.focusSessions)}
          />
          <StatisticsMetricCard
            icon={<CheckCheck aria-hidden="true" size={20} />}
            label={t('statistics.summary.habitCompletionRate')}
            value={
              data.summary.habitCompletionRate === null
                ? t('statistics.notEnoughData')
                : formatPercent(data.summary.habitCompletionRate)
            }
          />
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, lg: 2 }} gap="5">
          <SectionCard
            description={t('statistics.focus.description')}
            title={t('statistics.focus.title')}
          >
            {data.focus.sessionCount === 0 ? (
              <DataMessage>{t('statistics.focus.empty')}</DataMessage>
            ) : (
              <Stack gap="5">
                <SimpleGrid columns={2} gap="4">
                  <InlineMetric
                    label={t('statistics.focus.averageSession')}
                    value={formatDuration(
                      data.focus.averageSessionSeconds ?? 0,
                    )}
                  />
                  <InlineMetric
                    label={t('statistics.focus.totalTime')}
                    value={formatDuration(data.focus.totalSeconds)}
                  />
                </SimpleGrid>
                {focusDays.length >= 2 ? (
                  <Stack gap="2">
                    <Text fontSize="sm" fontWeight="medium">
                      {t('statistics.focus.durationPerDay')}
                    </Text>
                    <DailyBarChart
                      ariaLabel={t('statistics.focus.durationPerDay')}
                      data={data.focus.daily.map((day) => ({
                        date: day.date,
                        value: day.focusSeconds,
                      }))}
                      formatDate={formatShortDate}
                      formatValue={formatDuration}
                    />
                  </Stack>
                ) : (
                  <DataMessage>
                    {t('statistics.focus.trendInsufficient')}
                  </DataMessage>
                )}
                {data.focus.mostProductiveDate ? (
                  <Text color="fg.muted" fontSize="sm">
                    {t('statistics.focus.mostProductiveDay', {
                      date: formatDate(data.focus.mostProductiveDate),
                    })}
                  </Text>
                ) : null}
              </Stack>
            )}
          </SectionCard>

          <SectionCard
            description={t('statistics.tasks.description')}
            title={t('statistics.tasks.title')}
          >
            {data.tasks.completedCount === 0 ? (
              <DataMessage>{t('statistics.tasks.empty')}</DataMessage>
            ) : (
              <Stack gap="5">
                <InlineMetric
                  label={t('statistics.tasks.completionCount')}
                  value={String(data.tasks.completedCount)}
                />
                {taskDays.length >= 2 ? (
                  <Stack gap="2">
                    <Text fontSize="sm" fontWeight="medium">
                      {t('statistics.tasks.completedPerDay')}
                    </Text>
                    <DailyBarChart
                      ariaLabel={t('statistics.tasks.completedPerDay')}
                      data={data.tasks.daily.map((day) => ({
                        date: day.date,
                        value: day.completedTasks,
                      }))}
                      formatDate={formatShortDate}
                      formatValue={(value) =>
                        t('statistics.tasks.completedCountValue', {
                          count: value,
                        })
                      }
                    />
                  </Stack>
                ) : (
                  <DataMessage>
                    {t('statistics.tasks.trendInsufficient')}
                  </DataMessage>
                )}
                <Stack gap="2">
                  <Text fontSize="sm" fontWeight="medium">
                    {t('statistics.tasks.priorityBreakdown')}
                  </Text>
                  <HStack color="fg.muted" fontSize="sm" gap="4" wrap="wrap">
                    {(['high', 'medium', 'low'] as const).map((priority) => (
                      <Text key={priority}>
                        {t(`tasks.priority.${priority}`)}:{' '}
                        {data.tasks.priorityCounts[priority]}
                      </Text>
                    ))}
                  </HStack>
                </Stack>
              </Stack>
            )}
          </SectionCard>

          <SectionCard
            description={t('statistics.habits.description')}
            title={t('statistics.habits.title')}
          >
            {data.habits.completionRate === null ? (
              <DataMessage>{t('statistics.habits.empty')}</DataMessage>
            ) : (
              <Stack gap="5">
                <InlineMetric
                  label={t('statistics.habits.completionRate')}
                  value={formatPercent(data.habits.completionRate)}
                />
                {consistencyDays.length >= 2 ? (
                  <Stack gap="2">
                    <Text fontSize="sm" fontWeight="medium">
                      {t('statistics.habits.consistency')}
                    </Text>
                    <HabitConsistencyHeatmap
                      ariaLabel={t('statistics.habits.consistency')}
                      data={data.habits.consistency}
                      formatDate={formatShortDate}
                      formatRate={formatPercent}
                    />
                  </Stack>
                ) : (
                  <DataMessage>
                    {t('statistics.habits.consistencyInsufficient')}
                  </DataMessage>
                )}
                <Stack gap="2">
                  <Text fontSize="sm" fontWeight="medium">
                    {t('statistics.habits.currentStreaks')}
                  </Text>
                  {data.habits.streaks.length ? (
                    data.habits.streaks.slice(0, 4).map((streak) => (
                      <Flex key={streak.habitId} justify="space-between">
                        <Text fontSize="sm">{streak.name}</Text>
                        <Text color="fg.muted" fontSize="sm">
                          {t(
                            streak.unit === 'weeks'
                              ? 'statistics.habits.streakWeeks'
                              : 'statistics.habits.streakDays',
                            { count: streak.count },
                          )}
                        </Text>
                      </Flex>
                    ))
                  ) : (
                    <DataMessage>
                      {t('statistics.habits.streaksEmpty')}
                    </DataMessage>
                  )}
                </Stack>
              </Stack>
            )}
          </SectionCard>

          <SectionCard
            description={t('statistics.goals.description')}
            title={t('statistics.goals.title')}
          >
            {data.goals.activeCount === 0 ? (
              <DataMessage>{t('statistics.goals.empty')}</DataMessage>
            ) : (
              <Stack gap="4">
                <Text color="fg.muted" fontSize="sm">
                  {t('statistics.goals.activeCount', {
                    count: data.goals.activeCount,
                  })}
                </Text>
                {data.goals.goals.slice(0, 4).map((goal) => (
                  <Stack gap="2" key={goal.id}>
                    <Flex gap="4" justify="space-between">
                      <Text fontSize="sm" fontWeight="medium" lineClamp={1}>
                        {goal.title}
                      </Text>
                      <Text fontSize="sm" fontVariantNumeric="tabular-nums">
                        {formatPercent(goal.progress / 100)}
                      </Text>
                    </Flex>
                    <Progress.Root max={100} size="sm" value={goal.progress}>
                      <Progress.Track>
                        <Progress.Range />
                      </Progress.Track>
                    </Progress.Root>
                  </Stack>
                ))}
              </Stack>
            )}
          </SectionCard>
        </SimpleGrid>
      </Stack>
    </Container>
  )
}

function SectionCard({
  children,
  description,
  title,
}: {
  children: ReactNode
  description: string
  title: string
}) {
  return (
    <Box
      bg="bg.panel"
      borderWidth="1px"
      p={{ base: '4', md: '5' }}
      rounded="l2"
    >
      <Stack gap="5">
        <Stack gap="1">
          <Text fontSize="lg" fontWeight="semibold">
            {title}
          </Text>
          <Text color="fg.muted" fontSize="sm">
            {description}
          </Text>
        </Stack>
        {children}
      </Stack>
    </Box>
  )
}

function InlineMetric({ label, value }: { label: string; value: string }) {
  return (
    <Stack bg="bg.subtle" gap="1" p="3" rounded="l1">
      <Text color="fg.muted" fontSize="xs">
        {label}
      </Text>
      <Text fontVariantNumeric="tabular-nums" fontWeight="semibold">
        {value}
      </Text>
    </Stack>
  )
}

function DataMessage({ children }: { children: ReactNode }) {
  return (
    <Text color="fg.muted" fontSize="sm">
      {children}
    </Text>
  )
}

function formatStatisticDate(
  value: string,
  locale: string,
  options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' },
) {
  const [year, month, day] = value.split('-').map(Number)
  return new Intl.DateTimeFormat(locale, options).format(
    new Date(year, month - 1, day, 12),
  )
}
