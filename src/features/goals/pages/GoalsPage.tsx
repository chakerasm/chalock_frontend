import {
  Box,
  Button,
  Container,
  Flex,
  Grid,
  HStack,
  Progress,
  SimpleGrid,
  Stack,
  Text,
} from '@chakra-ui/react'
import { Link as RouterLink, useSearch } from '@tanstack/react-router'
import {
  Activity,
  CalendarDays,
  ChevronRight,
  Clock3,
  ListTodo,
  Plus,
  Target,
  Trophy,
  Zap,
} from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { APP_ROUTES } from '@/lib/routes'
import { EmptyState } from '@/components/shared/EmptyState/EmptyState'
import { GoalsListSkeleton } from '@/features/goals/components/GoalsListSkeleton'
import { ErrorState } from '@/components/shared/ErrorState/ErrorState'
import { PageHeader } from '@/components/shared/PageHeader/PageHeader'
import { toast } from '@/components/ui/Toaster/Toaster'
import { GoalFormDialog } from '@/features/goals/components/GoalFormDialog'
import { useCreateGoal, useGoals } from '@/features/goals/hooks/use-goals'
import { GoalDetailPage } from '@/features/goals/pages/GoalDetailPage'
import { useTasks } from '@/features/tasks/hooks/use-tasks'
import type {
  CreateGoalInput,
  GoalStatus,
} from '@/features/goals/types/goals.types'

const statuses: Array<GoalStatus | 'all'> = [
  'active',
  'paused',
  'completed',
  'archived',
  'all',
]

function formatTargetDate(date: string, locale: string) {
  const [year, month, day] = date.split('-').map(Number)
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
  }).format(new Date(year, month - 1, day, 12))
}

function getDaysUntil(date?: string) {
  if (!date) return null
  return Math.ceil(
    (new Date(`${date}T12:00:00`).getTime() - Date.now()) / 86_400_000,
  )
}

function SummaryCard({
  accent,
  icon: Icon,
  label,
  value,
  detail,
}: {
  accent: 'brand' | 'success' | 'warning' | 'purple'
  detail: string
  icon: typeof Target
  label: string
  value: number
}) {
  const colors = {
    brand: { bg: 'brand.subtle', color: 'brand.fg' },
    success: { bg: 'success.subtle', color: 'success.fg' },
    warning: { bg: 'warning.subtle', color: 'warning.fg' },
    purple: { bg: 'brand.muted', color: 'brand.fg' },
  } as const
  return (
    <Flex
      bg="bg.panel"
      borderColor="border.subtle"
      borderWidth="1px"
      gap="3"
      p="4"
      rounded="l2"
      shadow="xs"
    >
      <Flex
        align="center"
        bg={colors[accent].bg}
        color={colors[accent].color}
        h="11"
        justify="center"
        rounded="full"
        w="11"
      >
        <Icon aria-hidden="true" size={21} />
      </Flex>
      <Stack gap="0">
        <Text color="fg.muted" fontSize="xs">
          {label}
        </Text>
        <Text fontSize="xl" fontWeight="bold" lineHeight="1.15">
          {value}
        </Text>
        <Text color="fg.muted" fontSize="xs">
          {detail}
        </Text>
      </Stack>
    </Flex>
  )
}

export function GoalsPage() {
  const { goalId } = useSearch({ from: APP_ROUTES.goals })
  if (goalId) return <GoalDetailPage goalId={goalId} key={goalId} />
  return <GoalsListPage />
}

function GoalsListPage() {
  const { i18n, t } = useTranslation()
  const [status, setStatus] = useState<GoalStatus | 'all'>('active')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const goalsQuery = useGoals()
  const tasksQuery = useTasks()
  const createMutation = useCreateGoal()

  if (goalsQuery.isPending) return <GoalsListSkeleton />
  if (goalsQuery.isError) {
    return (
      <Container maxW="6xl" py={{ base: '8', md: '12' }}>
        <ErrorState onRetry={() => void goalsQuery.refetch()} />
      </Container>
    )
  }

  const allGoals = goalsQuery.data ?? []
  const goals =
    status === 'all'
      ? allGoals
      : allGoals.filter((goal) => goal.status === status)
  const tasks = tasksQuery.data ?? []
  const activeGoals = allGoals.filter((goal) => goal.status === 'active')
  const onTrackGoals = activeGoals.filter((goal) => goal.progress >= 50)
  const dueSoonGoals = activeGoals.filter((goal) => {
    const days = getDaysUntil(goal.targetDate)
    return days !== null && days >= 0 && days <= 14
  })
  const completedThisMonth = allGoals.filter((goal) => {
    if (goal.status !== 'completed' || !goal.completedAt) return false
    const completed = new Date(goal.completedAt)
    const now = new Date()
    return (
      completed.getMonth() === now.getMonth() &&
      completed.getFullYear() === now.getFullYear()
    )
  })
  const upcomingGoals = [...activeGoals]
    .filter((goal) => goal.targetDate)
    .sort((first, second) =>
      (first.targetDate ?? '').localeCompare(second.targetDate ?? ''),
    )
    .slice(0, 4)
  const recentlyUpdated = [...allGoals]
    .sort((first, second) => second.updatedAt.localeCompare(first.updatedAt))
    .slice(0, 4)

  function handleCreate(input: CreateGoalInput) {
    createMutation.mutate(input, {
      onError: () => toast.error({ title: t('goals.createError') }),
      onSuccess: () => {
        setIsFormOpen(false)
        toast.success({ title: t('goals.created') })
      },
    })
  }

  return (
    <Container maxW="5xl" py={{ base: '6', md: '10' }}>
      <Stack gap={{ base: '5', md: '7' }}>
        <PageHeader
          actions={
            <Button colorPalette="brand" onClick={() => setIsFormOpen(true)}>
              <Plus aria-hidden="true" size={18} />
              {t('goals.createTitle')}
            </Button>
          }
          description={t('goals.description')}
          eyebrow={t('goals.eyebrow')}
          title={t('goals.title')}
        />
        <SimpleGrid columns={{ base: 1, sm: 2, xl: 4 }} gap="3">
          <SummaryCard
            accent="brand"
            detail={t('goals.activeGoalsDetail')}
            icon={Target}
            label={t('goals.activeGoals')}
            value={activeGoals.length}
          />
          <SummaryCard
            accent="success"
            detail={t('goals.onTrackDetail', {
              count: activeGoals.length
                ? Math.round((onTrackGoals.length / activeGoals.length) * 100)
                : 0,
            })}
            icon={Activity}
            label={t('goals.onTrack')}
            value={onTrackGoals.length}
          />
          <SummaryCard
            accent="warning"
            detail={t('goals.dueSoonDetail')}
            icon={Clock3}
            label={t('goals.dueSoon')}
            value={dueSoonGoals.length}
          />
          <SummaryCard
            accent="purple"
            detail={t('goals.completedThisMonthDetail')}
            icon={Trophy}
            label={t('goals.completedThisMonth')}
            value={completedThisMonth.length}
          />
        </SimpleGrid>
        <Grid
          alignItems="start"
          gap="3"
          templateColumns={{ base: '1fr', xl: 'minmax(0, 1fr) 20rem' }}
        >
          <Stack gap="3" minW="0">
            <HStack
              gap="1"
              overflowX="auto"
              pb="1"
              role="group"
              aria-label={t('goals.statusFilter')}
            >
              {statuses.map((item) => (
                <Button
                  colorPalette={status === item ? 'brand' : undefined}
                  key={item}
                  onClick={() => setStatus(item)}
                  size="sm"
                  variant={status === item ? 'subtle' : 'ghost'}
                >
                  {t(
                    item === 'all'
                      ? 'goals.allStatuses'
                      : `goals.status.${item}`,
                  )}
                </Button>
              ))}
            </HStack>
            {goals.length === 0 ? (
              <EmptyState
                description={t('goals.emptyDescription')}
                title={t('goals.emptyTitle')}
              />
            ) : (
              <Stack gap="3">
                {goals.map((goal) => {
                  const progress = goal.progress
                  const linkedTaskCount = tasks.filter(
                    (task) => task.goalId === goal.id,
                  ).length
                  const nextTask = tasks.find(
                    (task) =>
                      task.goalId === goal.id &&
                      (task.status === 'todo' || task.status === 'in_progress'),
                  )
                  return (
                    <RouterLink
                      key={goal.id}
                      search={{ goalId: goal.id }}
                      style={{ color: 'inherit', textDecoration: 'none' }}
                      to={APP_ROUTES.goals}
                    >
                      <Box
                        bg={
                          goal.status === 'active' ? 'bg.elevated' : 'bg.panel'
                        }
                        borderColor={
                          goal.status === 'active'
                            ? 'brand.border'
                            : 'border.subtle'
                        }
                        borderWidth="1px"
                        p={{ base: '3', md: '4' }}
                        rounded="l2"
                        shadow={goal.status === 'active' ? 'sm' : 'xs'}
                        _hover={{ bg: 'bg.hover', borderColor: 'brand.border' }}
                      >
                        <Grid
                          alignItems="center"
                          gap="4"
                          templateColumns={{
                            base: '1fr',
                            md: nextTask
                              ? '4rem minmax(0, 1fr) minmax(12rem, 16rem)'
                              : '4rem minmax(0, 1fr) auto',
                          }}
                        >
                          <Flex
                            align="center"
                            bg="brand.subtle"
                            color="brand.fg"
                            display={{ base: 'none', md: 'flex' }}
                            h="14"
                            justify="center"
                            rounded="l2"
                            w="14"
                          >
                            <Target aria-hidden="true" size={27} />
                          </Flex>
                          <Stack gap="2" minW="0">
                            <Flex align="start" justify="space-between" gap="3">
                              <Box minW="0">
                                <Text fontWeight="semibold" lineClamp={1}>
                                  {goal.title}
                                </Text>
                                {goal.description ? (
                                  <Text
                                    color="fg.muted"
                                    fontSize="sm"
                                    lineClamp={1}
                                    mt="1"
                                  >
                                    {goal.description}
                                  </Text>
                                ) : null}
                              </Box>
                              <Text
                                display={{ base: 'block', md: 'none' }}
                                fontWeight="bold"
                              >
                                {progress}%
                              </Text>
                            </Flex>
                            <Flex align="center" gap="3">
                              <Progress.Root
                                colorPalette="brand"
                                flex="1"
                                max={100}
                                size="sm"
                                value={progress}
                              >
                                <Progress.Track>
                                  <Progress.Range />
                                </Progress.Track>
                              </Progress.Root>
                              <Text
                                display={{ base: 'none', md: 'block' }}
                                fontSize="sm"
                                fontWeight="bold"
                              >
                                {progress}%
                              </Text>
                            </Flex>
                            <HStack
                              color="fg.muted"
                              fontSize="xs"
                              gap="3"
                              wrap="wrap"
                            >
                              <HStack gap="1">
                                <ListTodo aria-hidden="true" size={14} />
                                <Text>
                                  {t('goals.taskCount', {
                                    count: linkedTaskCount,
                                  })}
                                </Text>
                              </HStack>
                              {goal.targetDate ? (
                                <HStack gap="1">
                                  <CalendarDays aria-hidden="true" size={14} />
                                  <Text>
                                    {t('goals.targetPrefix')}{' '}
                                    {formatTargetDate(
                                      goal.targetDate,
                                      i18n.language,
                                    )}
                                  </Text>
                                </HStack>
                              ) : null}
                            </HStack>
                          </Stack>
                          <Stack align={{ base: 'stretch', md: 'end' }} gap="2">
                            <Text
                              alignSelf={{ base: 'flex-start', md: 'flex-end' }}
                              bg={
                                goal.status === 'active'
                                  ? 'success.subtle'
                                  : 'bg.subtle'
                              }
                              color={
                                goal.status === 'active'
                                  ? 'success.fg'
                                  : 'fg.muted'
                              }
                              fontSize="xs"
                              fontWeight="semibold"
                              px="3"
                              py="1"
                              rounded="full"
                            >
                              {t(`goals.status.${goal.status}`)}
                            </Text>
                            {nextTask ? (
                              <Flex
                                align="center"
                                bg="brand.subtle"
                                borderColor="brand.border"
                                borderWidth="1px"
                                gap="2"
                                justify="space-between"
                                p="2"
                                rounded="l1"
                              >
                                <Zap
                                  aria-hidden="true"
                                  color="brand.fg"
                                  size={16}
                                />
                                <Box flex="1" minW="0">
                                  <Text color="brand.fg" fontSize="xs">
                                    {t('goals.nextStep')}
                                  </Text>
                                  <Text fontSize="xs" lineClamp={1}>
                                    {nextTask.title}
                                  </Text>
                                </Box>
                                <ChevronRight
                                  aria-hidden="true"
                                  color="brand.fg"
                                  size={16}
                                />
                              </Flex>
                            ) : null}
                          </Stack>
                        </Grid>
                      </Box>
                    </RouterLink>
                  )
                })}
              </Stack>
            )}
          </Stack>
          <Stack gap="3">
            <Box
              bg="bg.panel"
              borderColor="border.subtle"
              borderWidth="1px"
              p="4"
              rounded="l2"
              shadow="xs"
            >
              <Flex align="center" justify="space-between" mb="3">
                <HStack gap="2">
                  <CalendarDays aria-hidden="true" color="brand.fg" size={18} />
                  <Text fontWeight="semibold">
                    {t('goals.upcomingDeadlines')}
                  </Text>
                </HStack>
                <Button size="xs" variant="ghost">
                  {t('goals.viewAll')}
                </Button>
              </Flex>
              <Stack gap="2">
                {upcomingGoals.map((goal) => (
                  <RouterLink
                    key={goal.id}
                    search={{ goalId: goal.id }}
                    style={{ color: 'inherit', textDecoration: 'none' }}
                    to={APP_ROUTES.goals}
                  >
                    <Flex
                      _hover={{ bg: 'bg.subtle' }}
                      align="center"
                      borderTopWidth="1px"
                      gap="2"
                      pt="2"
                    >
                      <Flex
                        align="center"
                        bg="brand.subtle"
                        color="brand.fg"
                        h="8"
                        justify="center"
                        rounded="l1"
                        w="8"
                      >
                        <Target aria-hidden="true" size={15} />
                      </Flex>
                      <Box flex="1" minW="0">
                        <Text fontSize="sm" fontWeight="medium" lineClamp={1}>
                          {goal.title}
                        </Text>
                        <Text color="fg.muted" fontSize="xs">
                          {goal.targetDate
                            ? formatTargetDate(goal.targetDate, i18n.language)
                            : t('goals.noTargetDate')}
                        </Text>
                      </Box>
                      <Text color="fg.muted" fontSize="xs">
                        {goal.targetDate
                          ? t('goals.daysLeft', {
                              count: Math.max(
                                0,
                                getDaysUntil(goal.targetDate) ?? 0,
                              ),
                            })
                          : null}
                      </Text>
                    </Flex>
                  </RouterLink>
                ))}
                {!upcomingGoals.length ? (
                  <Text color="fg.muted" fontSize="sm">
                    {t('goals.noUpcomingDeadlines')}
                  </Text>
                ) : null}
              </Stack>
            </Box>
            <Box
              bg="bg.panel"
              borderColor="border.subtle"
              borderWidth="1px"
              p="4"
              rounded="l2"
              shadow="xs"
            >
              <Flex align="center" justify="space-between" mb="3">
                <HStack gap="2">
                  <Activity aria-hidden="true" color="brand.fg" size={18} />
                  <Text fontWeight="semibold">{t('goals.goalMomentum')}</Text>
                </HStack>
                <Text color="fg.muted" fontSize="xs">
                  {t('goals.lastThirtyDays')}
                </Text>
              </Flex>
              <Stack gap="3">
                <Flex align="end" gap="1" h="16">
                  {[28, 42, 35, 55, 54, 66, 59, 72, 64, 82, 100].map(
                    (height, index) => (
                      <Box
                        bg={index === 10 ? 'brand.solid' : 'brand.muted'}
                        flex="1"
                        h={`${height}%`}
                        key={height}
                        rounded="full"
                      />
                    ),
                  )}
                </Flex>
                <HStack color="fg.muted" fontSize="xs" justify="space-between">
                  <Text>{t('goals.momentumStart')}</Text>
                  <Text>{t('goals.momentumEnd')}</Text>
                </HStack>
              </Stack>
            </Box>
            <Box
              bg="bg.panel"
              borderColor="border.subtle"
              borderWidth="1px"
              p="4"
              rounded="l2"
              shadow="xs"
            >
              <Flex align="center" justify="space-between" mb="3">
                <HStack gap="2">
                  <ListTodo aria-hidden="true" color="brand.fg" size={18} />
                  <Text fontWeight="semibold">
                    {t('goals.recentlyUpdated')}
                  </Text>
                </HStack>
                <Button size="xs" variant="ghost">
                  {t('goals.viewAll')}
                </Button>
              </Flex>
              <Stack gap="2">
                {recentlyUpdated.map((goal) => (
                  <RouterLink
                    key={goal.id}
                    search={{ goalId: goal.id }}
                    style={{ color: 'inherit', textDecoration: 'none' }}
                    to={APP_ROUTES.goals}
                  >
                    <Flex
                      _hover={{ bg: 'bg.subtle' }}
                      align="center"
                      borderTopWidth="1px"
                      gap="2"
                      pt="2"
                    >
                      <Text
                        flex="1"
                        fontSize="sm"
                        fontWeight="medium"
                        lineClamp={1}
                      >
                        {goal.title}
                      </Text>
                      <Text color="brand.fg" fontSize="xs" fontWeight="bold">
                        {goal.progress}%
                      </Text>
                    </Flex>
                  </RouterLink>
                ))}
              </Stack>
            </Box>
          </Stack>
        </Grid>
      </Stack>
      <GoalFormDialog
        isSubmitting={createMutation.isPending}
        onOpenChange={setIsFormOpen}
        onSubmit={handleCreate}
        open={isFormOpen}
      />
    </Container>
  )
}
