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
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from '@tanstack/react-router'
import { ChevronLeft, ChevronRight, Goal, Plus, Save } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { formatCurrency } from '@/lib/formatters/currency'
import { PrivateAmount } from '@/components/ui/PrivateAmount/PrivateAmount'
import { ErrorState } from '@/components/shared/ErrorState/ErrorState'
import { PageHeader } from '@/components/shared/PageHeader/PageHeader'
import { FieldTextarea } from '@/components/ui/FieldTextarea/FieldTextarea'
import { toast } from '@/components/ui/Toaster/Toaster'
import { useUpdateTask } from '@/features/tasks/hooks/use-tasks'
import { WeeklyReviewSkeleton } from '@/features/weekly-review/components/WeeklyReviewSkeleton'
import {
  useWeeklyReflection,
  useSaveWeeklyReflection,
} from '@/features/weekly-review/hooks/use-weekly-reflections'
import { useWeeklyReview } from '@/features/weekly-review/hooks/use-weekly-review'
import { weeklyReflectionSchema } from '@/features/weekly-review/schemas/weekly-review.schemas'
import { getWeeklyReviewRange } from '@/features/weekly-review/services/weekly-review-calculations'
import type { WeeklyReflection } from '@/features/weekly-review/types/weekly-review.types'
import { APP_ROUTES } from '@/lib/routes'

type ReflectionValues = Omit<WeeklyReflection, 'updatedAt'>

function formatDateRange(from: string, to: string, locale: string) {
  const date = (value: string) => new Date(`${value}T12:00:00`)
  const formatter = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
  })
  return `${formatter.format(date(from))} – ${formatter.format(date(to))}`
}

function formatDuration(totalSeconds: number) {
  const minutes = Math.round(totalSeconds / 60)
  const hours = Math.floor(minutes / 60)
  return hours ? `${hours}h ${minutes % 60}m` : `${minutes}m`
}

function formatMoney(value: number, currency: string, locale: string) {
  return formatCurrency(value, currency, locale)
}

export function WeeklyReviewPage() {
  const { i18n, t } = useTranslation()
  const [weekOffset, setWeekOffset] = useState(0)
  const review = useWeeklyReview(weekOffset)
  const reflectionQuery = useWeeklyReflection(review.range.from)
  const saveReflection = useSaveWeeklyReflection()
  const updateTask = useUpdateTask()
  const reflectionForm = useForm<ReflectionValues>({
    defaultValues: { weekStart: review.range.from },
    resolver: zodResolver(weeklyReflectionSchema),
  })

  useEffect(() => {
    reflectionForm.reset({
      difficult: reflectionQuery.data?.difficult ?? '',
      focusNextWeek: reflectionQuery.data?.focusNextWeek ?? '',
      weekStart: review.range.from,
      wentWell: reflectionQuery.data?.wentWell ?? '',
    })
  }, [reflectionForm, reflectionQuery.data, review.range.from])

  if (review.isPending) return <WeeklyReviewSkeleton />
  if (review.isError || !review.data) {
    return (
      <Container maxW="6xl" py={{ base: '8', md: '12' }}>
        <ErrorState
          description={t('weeklyReview.loadError')}
          onRetry={() => void review.refetch()}
        />
      </Container>
    )
  }

  const data = review.data
  const nextWeekStart = getWeeklyReviewRange(weekOffset + 1).from

  function saveReflectionValues(values: ReflectionValues) {
    saveReflection.mutate(values, {
      onError: () =>
        toast.error({ title: t('weeklyReview.saveReflectionError') }),
      onSuccess: () =>
        toast.success({ title: t('weeklyReview.saveReflectionSuccess') }),
    })
  }

  return (
    <Container maxW="6xl" py={{ base: '6', md: '10' }}>
      <Stack gap={{ base: '6', md: '8' }}>
        <PageHeader
          actions={
            <HStack gap="1" role="group">
              <Button
                aria-label={t('weeklyReview.previousWeek')}
                onClick={() => setWeekOffset((value) => value - 1)}
                size="sm"
                variant="outline"
              >
                <ChevronLeft aria-hidden="true" size={17} />
              </Button>
              <Button
                disabled={weekOffset === 0}
                onClick={() => setWeekOffset(0)}
                size="sm"
                variant="ghost"
              >
                {t('weeklyReview.currentWeek')}
              </Button>
              <Button
                aria-label={t('weeklyReview.nextWeek')}
                disabled={weekOffset >= 0}
                onClick={() => setWeekOffset((value) => value + 1)}
                size="sm"
                variant="outline"
              >
                <ChevronRight aria-hidden="true" size={17} />
              </Button>
            </HStack>
          }
          description={formatDateRange(
            review.range.from,
            review.range.to,
            i18n.language,
          )}
          eyebrow={t('weeklyReview.reflection')}
          title={t('weeklyReview.title')}
        />
        <SimpleGrid columns={{ base: 1, lg: 2 }} gap="5">
          <ReviewCard title={t('weeklyReview.tasks')}>
            <SimpleGrid columns={3} gap="3">
              <Metric
                label={t('weeklyReview.completed')}
                value={String(data.tasks.completed)}
              />
              <Metric
                label={t('weeklyReview.unfinished')}
                value={String(data.tasks.unfinished.length)}
              />
              <Metric
                label={t('weeklyReview.cancelled')}
                value={String(data.tasks.cancelled)}
              />
            </SimpleGrid>
            {data.tasks.unfinished.length ? (
              <Stack gap="2">
                {data.tasks.unfinished.slice(0, 4).map((task) => (
                  <Flex
                    align="center"
                    gap="3"
                    justify="space-between"
                    key={task.id}
                  >
                    <Text fontSize="sm" lineClamp="1">
                      {task.title}
                    </Text>
                    <Button
                      loading={updateTask.isPending}
                      onClick={() =>
                        updateTask.mutate({
                          dueDate: nextWeekStart,
                          taskId: task.id,
                        })
                      }
                      size="xs"
                      variant="outline"
                    >
                      {t('weeklyReview.carryToNextWeek')}
                    </Button>
                  </Flex>
                ))}
              </Stack>
            ) : (
              <EmptyMessage>{t('weeklyReview.empty')}</EmptyMessage>
            )}
          </ReviewCard>
          <ReviewCard title={t('weeklyReview.focus')}>
            <SimpleGrid columns={3} gap="3">
              <Metric
                label={t('weeklyReview.totalFocus')}
                value={formatDuration(data.statistics.focus.totalSeconds)}
              />
              <Metric
                label={t('weeklyReview.focusSessions')}
                value={String(data.statistics.focus.sessionCount)}
              />
              <Metric
                label={t('weeklyReview.averageSession')}
                value={formatDuration(
                  data.statistics.focus.averageSessionSeconds ?? 0,
                )}
              />
            </SimpleGrid>
            <Stack gap="2">
              <Text color="fg.muted" fontSize="sm">
                {t('weeklyReview.focusByDay')}
              </Text>
              <HStack align="end" h="16" justify="space-between">
                {data.statistics.focus.daily.map((day) => {
                  const maximum = Math.max(
                    ...data.statistics.focus.daily.map(
                      (item) => item.focusSeconds,
                    ),
                    1,
                  )
                  return (
                    <Box
                      bg="brand.solid"
                      h={`${Math.max(8, (day.focusSeconds / maximum) * 100)}%`}
                      key={day.date}
                      rounded="sm"
                      title={`${day.date}: ${formatDuration(day.focusSeconds)}`}
                      w="full"
                    />
                  )
                })}
              </HStack>
            </Stack>
          </ReviewCard>
          <ReviewCard title={t('weeklyReview.habits')}>
            <Metric
              label={t('weeklyReview.completionRate')}
              value={
                data.statistics.habits.completionRate === null
                  ? '—'
                  : new Intl.NumberFormat(i18n.language, {
                      maximumFractionDigits: 0,
                      style: 'percent',
                    }).format(data.statistics.habits.completionRate)
              }
            />
            {data.habits.length ? (
              <Stack gap="2">
                {data.habits.slice(0, 4).map((habit) => (
                  <Flex justify="space-between" key={habit.id}>
                    <Text fontSize="sm">{habit.name}</Text>
                    <Text color="fg.muted" fontSize="sm">
                      {habit.completed}/{habit.scheduled}
                    </Text>
                  </Flex>
                ))}
              </Stack>
            ) : null}{' '}
            {data.statistics.habits.streaks.length ? (
              <Stack gap="2">
                {data.statistics.habits.streaks.slice(0, 4).map((streak) => (
                  <Flex justify="space-between" key={streak.habitId}>
                    <Text fontSize="sm">{streak.name}</Text>
                    <Text color="fg.muted" fontSize="sm">
                      {streak.count} {streak.unit}
                    </Text>
                  </Flex>
                ))}
              </Stack>
            ) : (
              <EmptyMessage>{t('weeklyReview.empty')}</EmptyMessage>
            )}
          </ReviewCard>
          <ReviewCard title={t('weeklyReview.goals')}>
            <Text color="fg.muted" fontSize="sm">
              {t('weeklyReview.completedGoals')}: {data.goals.completed}
            </Text>
            {data.goals.items.length ? (
              <Stack gap="3">
                {data.goals.items.map((goal) => (
                  <Stack gap="1" key={goal.id}>
                    <Flex justify="space-between">
                      <Text fontSize="sm">{goal.title}</Text>
                      <Text color="fg.muted" fontSize="sm">
                        {goal.progress}%
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
            ) : (
              <EmptyMessage>{t('weeklyReview.empty')}</EmptyMessage>
            )}
          </ReviewCard>
          <ReviewCard title={t('weeklyReview.planner')}>
            <SimpleGrid columns={3} gap="3">
              <Metric
                label={t('weeklyReview.plannedTime')}
                value={`${data.planner.plannedMinutes}m`}
              />
              <Metric
                label={t('weeklyReview.completed')}
                value={`${data.planner.completed}/${data.planner.total}`}
              />
              <Metric
                label={t('weeklyReview.totalFocus')}
                value={formatDuration(data.statistics.focus.totalSeconds)}
              />
            </SimpleGrid>
          </ReviewCard>
          {review.hasFinance ? (
            <ReviewCard title={t('weeklyReview.spending')}>
              {data.finance.expenses.length || data.finance.income.length ? (
                <Stack gap="3">
                  <MoneyRows
                    label={t('weeklyReview.spending')}
                    locale={i18n.language}
                    values={data.finance.expenses}
                  />
                  <MoneyRows
                    label={t('weeklyReview.income')}
                    locale={i18n.language}
                    values={data.finance.income}
                  />
                  {data.finance.largestCategories.length ? (
                    <Stack gap="1">
                      <Text color="fg.muted" fontSize="sm">
                        {t('weeklyReview.largestCategories')}
                      </Text>
                      {data.finance.largestCategories.map((category) => (
                        <Flex
                          fontSize="sm"
                          justify="space-between"
                          key={`${category.currency}:${category.name}`}
                        >
                          <Text>{category.name}</Text>
                          <Text color="fg.muted">
                            <PrivateAmount>
                              {formatMoney(
                                category.value,
                                category.currency,
                                i18n.language,
                              )}
                            </PrivateAmount>
                          </Text>
                        </Flex>
                      ))}
                    </Stack>
                  ) : null}
                  <Text color="fg.muted" fontSize="sm">
                    {t('weeklyReview.recurringPayments')}:{' '}
                    {data.finance.recurringPayments}
                  </Text>
                  {data.finance.upcomingRenewals.length ? (
                    <Stack gap="1">
                      <Text color="fg.muted" fontSize="sm">
                        {t('weeklyReview.reminders')}
                      </Text>
                      {data.finance.upcomingRenewals.map((item) => (
                        <Text fontSize="sm" key={item.name}>
                          {item.name} · {item.date}
                        </Text>
                      ))}
                    </Stack>
                  ) : (
                    <Text color="fg.muted" fontSize="sm">
                      {t('weeklyReview.noUpcomingRenewals')}
                    </Text>
                  )}
                </Stack>
              ) : (
                <EmptyMessage>{t('weeklyReview.empty')}</EmptyMessage>
              )}
            </ReviewCard>
          ) : null}
        </SimpleGrid>
        <ReviewCard title={t('weeklyReview.reflection')}>
          <Text color="fg.muted" fontSize="sm">
            {t('weeklyReview.reflectionDescription')}
          </Text>
          <Stack
            as="form"
            gap="4"
            onSubmit={reflectionForm.handleSubmit(saveReflectionValues)}
          >
            <FieldTextarea
              control={reflectionForm.control}
              label={t('weeklyReview.wentWell')}
              name="wentWell"
              rows={3}
            />
            <FieldTextarea
              control={reflectionForm.control}
              label={t('weeklyReview.difficult')}
              name="difficult"
              rows={3}
            />
            <FieldTextarea
              control={reflectionForm.control}
              label={t('weeklyReview.focusNextWeek')}
              name="focusNextWeek"
              rows={3}
            />
            <Button
              alignSelf="end"
              colorPalette="brand"
              loading={saveReflection.isPending}
              type="submit"
            >
              <Save aria-hidden="true" size={17} />
              {t('weeklyReview.saveReflection')}
            </Button>
          </Stack>
        </ReviewCard>
        <ReviewCard title={t('weeklyReview.nextWeekPlanning')}>
          <Text color="fg.muted" fontSize="sm">
            {t('weeklyReview.nextWeekPlanningDescription')}
          </Text>
          <HStack gap="2" wrap="wrap">
            <Button asChild size="sm" variant="outline">
              <Link to={APP_ROUTES.planner}>{t('weeklyReview.planTask')}</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link to={APP_ROUTES.goals}>
                <Goal aria-hidden="true" size={16} />
                {t('weeklyReview.createGoal')}
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link to={APP_ROUTES.habits}>
                <Plus aria-hidden="true" size={16} />
                {t('weeklyReview.addHabit')}
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link to={APP_ROUTES.planner}>
                <Plus aria-hidden="true" size={16} />
                {t('weeklyReview.addTimeBlock')}
              </Link>
            </Button>
          </HStack>
        </ReviewCard>
      </Stack>
    </Container>
  )
}

function ReviewCard({
  children,
  title,
}: {
  children: React.ReactNode
  title: string
}) {
  return (
    <Box
      bg="bg.panel"
      borderWidth="1px"
      p={{ base: '4', md: '5' }}
      rounded="l2"
    >
      <Stack gap="4">
        <Text fontSize="lg" fontWeight="semibold">
          {title}
        </Text>
        {children}
      </Stack>
    </Box>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
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

function EmptyMessage({ children }: { children: React.ReactNode }) {
  return (
    <Text color="fg.muted" fontSize="sm">
      {children}
    </Text>
  )
}

function MoneyRows({
  label,
  locale,
  values,
}: {
  label: string
  locale: string
  values: Array<{ currency: string; value: number }>
}) {
  if (!values.length) return null
  return (
    <Stack gap="1">
      <Text color="fg.muted" fontSize="sm">
        {label}
      </Text>
      {values.map((value) => (
        <Text fontSize="sm" key={value.currency}>
          <PrivateAmount>
            {formatMoney(value.value, value.currency, locale)}
          </PrivateAmount>
        </Text>
      ))}
    </Stack>
  )
}
