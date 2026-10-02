import {
  Badge,
  Box,
  Button,
  Container,
  Flex,
  Grid,
  HStack,
  Input,
  NativeSelect,
  SimpleGrid,
  Stack,
  Table,
  Text,
} from '@chakra-ui/react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import {
  CalendarClock,
  CircleDollarSign,
  ExternalLink,
  Layers3,
  Pause,
  Pencil,
  Play,
  Plus,
  Search,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { EmptyState } from '@/components/shared/EmptyState/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState/ErrorState'
import { PageHeader } from '@/components/shared/PageHeader/PageHeader'
import { toast } from '@/components/ui/Toaster/Toaster'
import { SubscriptionDetailSkeleton } from '@/features/subscriptions/components/SubscriptionDetailSkeleton'
import { SubscriptionFormDialog } from '@/features/subscriptions/components/SubscriptionFormDialog'
import { SubscriptionsListSkeleton } from '@/features/subscriptions/components/SubscriptionsListSkeleton'
import {
  useCancelSubscription,
  useCreateSubscription,
  useSubscription,
  useSubscriptions,
  useUpdateSubscription,
} from '@/features/subscriptions/hooks/use-subscriptions'
import {
  getAnnualCost,
  getRecurringCostSummary,
  getRenewalUrgency,
  getUpcomingRenewals,
} from '@/features/subscriptions/services/subscription-calculations'
import type {
  CreateSubscriptionInput,
  Subscription,
  SubscriptionCategory,
  SubscriptionStatus,
} from '@/features/subscriptions/types/subscriptions.types'
import { APP_ROUTES } from '@/lib/routes'

function formatDate(value: string, locale: string) {
  const [year, month, day] = value.split('-').map(Number)
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
  }).format(new Date(year, month - 1, day, 12))
}

function money(subscription: Subscription, value = subscription.amount) {
  return new Intl.NumberFormat(undefined, {
    currency: subscription.currency,
    maximumFractionDigits: 2,
    style: 'currency',
  }).format(value)
}

const categoryKeys: SubscriptionCategory[] = [
  'software',
  'entertainment',
  'productivity',
  'fitness',
  'education',
  'cloud',
  'finance',
  'utilities',
  'membership',
  'other',
]

const categoryColors = [
  'var(--chakra-colors-brand-400)',
  'var(--chakra-colors-warning-500)',
  'var(--chakra-colors-success-500)',
  'var(--chakra-colors-danger-500)',
  'var(--chakra-colors-neutral-500)',
]

const statusFilters: Array<SubscriptionStatus | 'all'> = [
  'all',
  'active',
  'paused',
  'cancelled',
]

export function SubscriptionsPage() {
  const { subscriptionId } = useSearch({ from: APP_ROUTES.subscriptions })
  if (subscriptionId)
    return <SubscriptionDetail subscriptionId={subscriptionId} />
  return <SubscriptionsList />
}

function SubscriptionsList() {
  const { i18n, t } = useTranslation()
  const [status, setStatus] = useState<SubscriptionStatus | 'all'>('all')
  const [category, setCategory] = useState<SubscriptionCategory | 'all'>('all')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('renewal')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editingSubscription, setEditingSubscription] =
    useState<Subscription | null>(null)
  const [panelTab, setPanelTab] = useState<'overview' | 'timeline' | 'notes'>(
    'overview',
  )
  const [formOpen, setFormOpen] = useState(false)
  const query = useSubscriptions({ search })
  const create = useCreateSubscription()
  const update = useUpdateSubscription()
  const cancel = useCancelSubscription()
  if (query.isPending) return <SubscriptionsListSkeleton />
  if (query.isError) return <ErrorState onRetry={() => void query.refetch()} />
  const subscriptions = query.data ?? []
  const activeSubscriptions = subscriptions.filter(
    (item) => item.status === 'active',
  )
  const renewingSoon = getUpcomingRenewals(subscriptions, 30)
  const matchingStatus = subscriptions.filter(
    (item) => status === 'all' || item.status === status,
  )
  const filtered = matchingStatus
    .filter((item) => category === 'all' || item.category === category)
    .sort((left, right) => {
      if (sort === 'name') return left.name.localeCompare(right.name)
      if (sort === 'amount') return right.amount - left.amount
      return left.nextBillingDate.localeCompare(right.nextBillingDate)
    })
  const selected =
    filtered.find((item) => item.id === selectedId) ?? filtered[0] ?? null
  const monthlyByCurrency = totalsByCurrency(activeSubscriptions, false)
  const annualByCurrency = totalsByCurrency(activeSubscriptions, true)
  const categoryCounts = subscriptions.reduce<Record<string, number>>(
    (counts, item) => {
      const key = item.category ?? 'other'
      counts[key] = (counts[key] ?? 0) + 1
      return counts
    },
    {},
  )
  const categoryEntries = Object.entries(categoryCounts).map(
    ([key, count], index) => ({
      count,
      key: key as SubscriptionCategory,
      color: categoryColors[index % categoryColors.length],
    }),
  )
  const totalCategoryCount = categoryEntries.reduce(
    (sum, entry) => sum + entry.count,
    0,
  )
  const donutBackground = createDonutGradient(
    categoryEntries,
    totalCategoryCount,
  )

  function save(input: CreateSubscriptionInput) {
    create.mutate(input, {
      onError: () => toast.error({ title: t('subscriptions.createError') }),
      onSuccess: () => {
        setFormOpen(false)
        toast.success({ title: t('subscriptions.created') })
      },
    })
  }

  function changeStatus(item: Subscription, nextStatus: SubscriptionStatus) {
    update.mutate(
      { status: nextStatus, subscriptionId: item.id },
      {
        onError: () => toast.error({ title: t('subscriptions.updateError') }),
      },
    )
  }

  function cancelSubscription(item: Subscription) {
    cancel.mutate(item.id, {
      onError: () => toast.error({ title: t('subscriptions.updateError') }),
      onSuccess: () =>
        toast.success({ title: t('subscriptions.cancelledSuccess') }),
    })
  }

  return (
    <Container maxW="full" px={{ base: '4', md: '6', xl: '8' }} py="6">
      <Stack gap="5">
        <PageHeader
          actions={
            <Button
              colorPalette="brand"
              onClick={() => {
                setEditingSubscription(null)
                setFormOpen(true)
              }}
              size="sm"
            >
              <Plus aria-hidden="true" size={18} /> {t('subscriptions.add')}
            </Button>
          }
          description={t('subscriptions.descriptionPage')}
          title={t('subscriptions.title')}
        />
        <SimpleGrid columns={{ base: 2, xl: 4 }} gap="3">
          <Summary
            icon={Layers3}
            label={t('subscriptions.active')}
            value={String(activeSubscriptions.length)}
          />
          <Summary
            icon={CircleDollarSign}
            label={t('subscriptions.monthlyCost')}
            values={monthlyByCurrency}
          />
          <Summary
            icon={CalendarClock}
            label={t('subscriptions.annualCost')}
            values={annualByCurrency}
          />
          <Summary
            icon={CalendarClock}
            label={t('subscriptions.renewingSoon')}
            value={String(renewingSoon.length)}
            detail={t('subscriptions.nextThirtyDays')}
          />
        </SimpleGrid>
        <Flex align="center" gap="2" overflowX="auto" pb="1">
          {statusFilters.map((filter) => (
            <Button
              aria-pressed={status === filter}
              colorPalette={status === filter ? 'brand' : undefined}
              key={filter}
              onClick={() => setStatus(filter)}
              size="xs"
              variant={status === filter ? 'subtle' : 'ghost'}
              whiteSpace="nowrap"
            >
              {filter === 'all'
                ? t('subscriptions.all')
                : t(`subscriptions.statuses.${filter}`)}
              <Badge colorPalette="gray" variant="subtle">
                {filter === 'all'
                  ? matchingStatus.length
                  : subscriptions.filter((item) => item.status === filter)
                      .length}
              </Badge>
            </Button>
          ))}
        </Flex>
        <Flex align={{ base: 'stretch', md: 'center' }} gap="2" wrap="wrap">
          <Box
            flex="1"
            minW={{ base: 'full', md: '15rem' }}
            position="relative"
          >
            <Box
              left="3"
              pointerEvents="none"
              position="absolute"
              top="50%"
              transform="translateY(-50%)"
              zIndex="1"
            >
              <Search
                aria-hidden="true"
                color="var(--chakra-colors-fg-muted)"
                size={16}
              />
            </Box>
            <Input
              aria-label={t('subscriptions.search')}
              onChange={(event) => setSearch(event.target.value)}
              pl="9"
              placeholder={t('subscriptions.searchPlaceholder')}
              size="sm"
              value={search}
            />
          </Box>
          <NativeSelect.Root maxW={{ base: 'full', sm: '12rem' }} size="sm">
            <NativeSelect.Field
              aria-label={t('subscriptions.categoryFilter')}
              onChange={(event) =>
                setCategory(event.target.value as SubscriptionCategory | 'all')
              }
              value={category}
            >
              <option value="all">{t('subscriptions.allCategories')}</option>
              {categoryKeys.map((key) => (
                <option key={key} value={key}>
                  {t(`subscriptions.categories.${key}`)}
                </option>
              ))}
            </NativeSelect.Field>
          </NativeSelect.Root>
          <NativeSelect.Root maxW={{ base: 'full', sm: '12rem' }} size="sm">
            <NativeSelect.Field
              aria-label={t('subscriptions.sort')}
              onChange={(event) => setSort(event.target.value)}
              value={sort}
            >
              <option value="renewal">{t('subscriptions.sortRenewal')}</option>
              <option value="name">{t('subscriptions.sortName')}</option>
              <option value="amount">{t('subscriptions.sortAmount')}</option>
            </NativeSelect.Field>
          </NativeSelect.Root>
        </Flex>
        {subscriptions.length === 0 ? (
          <EmptyState
            description={
              search
                ? t('subscriptions.noSearchResults')
                : t('subscriptions.emptyDescription')
            }
            title={t('subscriptions.emptyTitle')}
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            description={t('subscriptions.noSearchResults')}
            title={t('subscriptions.emptyTitle')}
          />
        ) : (
          <Grid
            alignItems="start"
            gap="4"
            templateColumns={{
              base: 'minmax(0, 1fr)',
              xl: 'minmax(0, 1.75fr) minmax(17rem, 0.8fr)',
            }}
          >
            <Stack gap="3" minW="0">
              <Box
                bg="bg.panel"
                borderColor="border.subtle"
                borderWidth="1px"
                overflow="hidden"
                rounded="l2"
              >
                <Table.ScrollArea>
                  <Table.Root minW="42rem" size="sm" variant="outline">
                    <Table.Header>
                      <Table.Row>
                        <Table.ColumnHeader>
                          {t('subscriptions.name')}
                        </Table.ColumnHeader>
                        <Table.ColumnHeader>
                          {t('subscriptions.amount')}
                        </Table.ColumnHeader>
                        <Table.ColumnHeader>
                          {t('subscriptions.billingCycle')}
                        </Table.ColumnHeader>
                        <Table.ColumnHeader>
                          {t('subscriptions.nextBillingDate')}
                        </Table.ColumnHeader>
                        <Table.ColumnHeader>
                          {t('subscriptions.status')}
                        </Table.ColumnHeader>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {filtered.map((item, index) => {
                        const urgency = getRenewalUrgency(item.nextBillingDate)
                        const isSelected = selected?.id === item.id
                        return (
                          <Table.Row
                            aria-selected={isSelected}
                            bg={isSelected ? 'bg.subtle' : undefined}
                            key={item.id}
                            onClick={() => setSelectedId(item.id)}
                            tabIndex={0}
                            onKeyDown={(event) => {
                              if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault()
                                setSelectedId(item.id)
                              }
                            }}
                            _hover={{ bg: 'bg.hover', cursor: 'pointer' }}
                          >
                            <Table.Cell>
                              <HStack gap="2.5" minW="10rem">
                                <Flex
                                  align="center"
                                  bg={
                                    categoryColors[
                                      index % categoryColors.length
                                    ]
                                  }
                                  color="white"
                                  flexShrink="0"
                                  h="8"
                                  justify="center"
                                  rounded="control"
                                  w="8"
                                  fontSize="sm"
                                  fontWeight="bold"
                                >
                                  {item.name.slice(0, 1).toUpperCase()}
                                </Flex>
                                <Stack gap="0" minW="0">
                                  <Text fontWeight="semibold" lineClamp={1}>
                                    {item.name}
                                  </Text>
                                  <Text
                                    color="fg.muted"
                                    fontSize="xs"
                                    lineClamp={1}
                                  >
                                    {t(
                                      `subscriptions.categories.${item.category ?? 'other'}`,
                                    )}
                                  </Text>
                                </Stack>
                              </HStack>
                            </Table.Cell>
                            <Table.Cell whiteSpace="nowrap">
                              {money(item)}
                            </Table.Cell>
                            <Table.Cell color="fg.muted" whiteSpace="nowrap">
                              {t(`subscriptions.cycles.${item.billingCycle}`)}
                            </Table.Cell>
                            <Table.Cell whiteSpace="nowrap">
                              <Text fontSize="sm">
                                {formatDate(
                                  item.nextBillingDate,
                                  i18n.language,
                                )}
                              </Text>
                              <Text
                                color={
                                  urgency === 'today' || urgency === 'tomorrow'
                                    ? 'warning.fg'
                                    : 'fg.muted'
                                }
                                fontSize="xs"
                              >
                                {t(`subscriptions.renewal.${urgency}`, {
                                  date: formatDate(
                                    item.nextBillingDate,
                                    i18n.language,
                                  ),
                                })}
                              </Text>
                            </Table.Cell>
                            <Table.Cell>
                              <StatusBadge status={item.status} />
                            </Table.Cell>
                          </Table.Row>
                        )
                      })}
                    </Table.Body>
                  </Table.Root>
                </Table.ScrollArea>
              </Box>
              <SimpleGrid columns={{ base: 1, md: 2 }} gap="3">
                <CategorySummary
                  entries={categoryEntries}
                  total={totalCategoryCount}
                  donutBackground={donutBackground}
                />
                <RenewalSummary subscriptions={renewingSoon} />
              </SimpleGrid>
            </Stack>
            {selected ? (
              <SubscriptionOverview
                item={selected}
                i18nLanguage={i18n.language}
                panelTab={panelTab}
                onCancel={() => cancelSubscription(selected)}
                onEdit={() => {
                  setEditingSubscription(selected)
                  setFormOpen(true)
                }}
                onPause={() =>
                  changeStatus(
                    selected,
                    selected.status === 'paused' ? 'active' : 'paused',
                  )
                }
                onSelectTab={setPanelTab}
              />
            ) : null}
          </Grid>
        )}
      </Stack>
      <SubscriptionFormDialog
        isSubmitting={create.isPending || update.isPending}
        onOpenChange={setFormOpen}
        onSubmit={(input) =>
          editingSubscription
            ? update.mutate(
                { ...input, subscriptionId: editingSubscription.id },
                {
                  onError: () =>
                    toast.error({ title: t('subscriptions.updateError') }),
                  onSuccess: () => setFormOpen(false),
                },
              )
            : save(input)
        }
        open={formOpen}
        subscription={editingSubscription ?? undefined}
      />
    </Container>
  )
}

function totalsByCurrency(subscriptions: Subscription[], annual: boolean) {
  const totals = new Map<string, number>()
  for (const item of subscriptions) {
    const amount = getAnnualCost(
      item.amount,
      item.billingCycle,
      item.customBillingInterval,
    )
    const normalizedAmount = annual ? amount : amount / 12
    totals.set(
      item.currency,
      (totals.get(item.currency) ?? 0) + normalizedAmount,
    )
  }
  return [...totals.entries()].map(([currency, amount]) =>
    new Intl.NumberFormat(undefined, {
      currency,
      maximumFractionDigits: 2,
      style: 'currency',
    }).format(amount),
  )
}

function createDonutGradient(
  entries: Array<{ count: number; color: string }>,
  total: number,
) {
  if (total === 0) return 'var(--chakra-colors-bg-muted)'
  let offset = 0
  const segments = entries.map((entry) => {
    const start = offset
    offset += (entry.count / total) * 100
    return `${entry.color} ${start}% ${offset}%`
  })
  return `conic-gradient(${segments.join(', ')})`
}

function Summary({
  detail,
  icon: Icon,
  label,
  value,
  values,
}: {
  detail?: string
  icon: typeof Layers3
  label: string
  value?: string
  values?: string[]
}) {
  return (
    <Flex
      align="center"
      bg="bg.panel"
      borderColor="border.subtle"
      borderWidth="1px"
      gap="3"
      justify="space-between"
      minH="16"
      p="3"
      rounded="l2"
    >
      <Stack gap="1" minW="0">
        <Text color="fg.muted" fontSize="xs" lineClamp={1}>
          {label}
        </Text>
        {values ? (
          <Stack gap="0">
            {values.length > 0 ? (
              values.map((amount) => (
                <Text
                  fontSize="sm"
                  fontWeight="semibold"
                  key={amount}
                  lineClamp={1}
                >
                  {amount}
                </Text>
              ))
            ) : (
              <Text fontSize="sm" fontWeight="semibold">
                --
              </Text>
            )}
          </Stack>
        ) : (
          <Text fontSize="lg" fontWeight="semibold">
            {value}
          </Text>
        )}
        {detail ? (
          <Text color="fg.muted" fontSize="xs">
            {detail}
          </Text>
        ) : null}
      </Stack>
      <Flex
        align="center"
        bg="bg.subtle"
        color="brand.fg"
        flexShrink="0"
        h="9"
        justify="center"
        rounded="control"
        w="9"
      >
        <Icon aria-hidden="true" size={17} />
      </Flex>
    </Flex>
  )
}

function StatusBadge({ status }: { status: SubscriptionStatus }) {
  const { t } = useTranslation()
  const palette =
    status === 'active' || status === 'trial'
      ? 'success'
      : status === 'paused'
        ? 'warning'
        : 'gray'
  return (
    <Badge colorPalette={palette} variant="subtle">
      {t(`subscriptions.statuses.${status}`)}
    </Badge>
  )
}

function CategorySummary({
  entries,
  total,
  donutBackground,
}: {
  entries: Array<{ count: number; key: SubscriptionCategory; color: string }>
  total: number
  donutBackground: string
}) {
  const { t } = useTranslation()
  return (
    <Box
      bg="bg.panel"
      borderColor="border.subtle"
      borderWidth="1px"
      minW="0"
      p="4"
      rounded="l2"
    >
      <Text fontSize="sm" fontWeight="semibold">
        {t('subscriptions.byCategory')}
      </Text>
      <Flex align="center" gap="4" justify="space-between" mt="4">
        <Box
          alignItems="center"
          aria-label={t('subscriptions.categoryDistribution', { count: total })}
          background={donutBackground}
          borderRadius="full"
          display="flex"
          flexShrink="0"
          h="5rem"
          justifyContent="center"
          role="img"
          w="5rem"
        >
          <Flex
            align="center"
            bg="bg.panel"
            borderRadius="full"
            h="3.35rem"
            justify="center"
            w="3.35rem"
          >
            <Stack align="center" gap="0">
              <Text fontSize="sm" fontWeight="bold">
                {total}
              </Text>
              <Text color="fg.muted" fontSize="2xs">
                {t('subscriptions.total')}
              </Text>
            </Stack>
          </Flex>
        </Box>
        <Stack flex="1" gap="1.5" minW="0">
          {entries.slice(0, 4).map((entry) => (
            <Flex
              align="center"
              gap="2"
              justify="space-between"
              key={entry.key}
            >
              <HStack gap="2" minW="0">
                <Box
                  bg={entry.color}
                  borderRadius="full"
                  flexShrink="0"
                  h="2"
                  w="2"
                />
                <Text color="fg.muted" fontSize="xs" lineClamp={1}>
                  {t(`subscriptions.categories.${entry.key}`)}
                </Text>
              </HStack>
              <Text color="fg.muted" fontSize="xs">
                {entry.count}
              </Text>
            </Flex>
          ))}
          {entries.length === 0 ? (
            <Text color="fg.muted" fontSize="xs">
              {t('subscriptions.noCategoryData')}
            </Text>
          ) : null}
        </Stack>
      </Flex>
    </Box>
  )
}

function RenewalSummary({ subscriptions }: { subscriptions: Subscription[] }) {
  const { i18n, t } = useTranslation()
  const upcoming = [...subscriptions]
    .sort((left, right) =>
      left.nextBillingDate.localeCompare(right.nextBillingDate),
    )
    .slice(0, 3)
  return (
    <Box
      bg="bg.panel"
      borderColor="border.subtle"
      borderWidth="1px"
      p="4"
      rounded="l2"
    >
      <Text fontSize="sm" fontWeight="semibold">
        {t('subscriptions.upcomingRenewals')}
      </Text>
      {upcoming.length > 0 ? (
        <Stack gap="2" mt="3">
          {upcoming.map((item) => (
            <Flex align="center" gap="3" justify="space-between" key={item.id}>
              <HStack gap="2" minW="0">
                <Box bg="bg.subtle" color="brand.fg" p="1.5" rounded="control">
                  <CalendarClock aria-hidden="true" size={14} />
                </Box>
                <Text fontSize="xs" fontWeight="medium" lineClamp={1}>
                  {item.name}
                </Text>
              </HStack>
              <Text color="fg.muted" fontSize="xs" whiteSpace="nowrap">
                {formatDate(item.nextBillingDate, i18n.language)}
              </Text>
            </Flex>
          ))}
        </Stack>
      ) : (
        <Text color="fg.muted" fontSize="xs" mt="3">
          {t('subscriptions.noUpcomingRenewals')}
        </Text>
      )}
    </Box>
  )
}

function SubscriptionOverview({
  item,
  i18nLanguage,
  panelTab,
  onCancel,
  onEdit,
  onPause,
  onSelectTab,
}: {
  item: Subscription
  i18nLanguage: string
  panelTab: 'overview' | 'timeline' | 'notes'
  onCancel: () => void
  onEdit: () => void
  onPause: () => void
  onSelectTab: (tab: 'overview' | 'timeline' | 'notes') => void
}) {
  const { t } = useTranslation()
  const monthlyTotal = getRecurringCostSummary([item]).monthly
  const tabLabels = ['overview', 'timeline', 'notes'] as const
  return (
    <Stack
      bg="bg.panel"
      borderColor="border.subtle"
      borderWidth="1px"
      gap="0"
      overflow="hidden"
      rounded="l2"
    >
      <Flex align="center" gap="3" justify="space-between" p="4">
        <HStack gap="3" minW="0">
          <Flex
            align="center"
            bg="brand.subtle"
            color="brand.fg"
            flexShrink="0"
            h="10"
            justify="center"
            rounded="control"
            w="10"
            fontSize="md"
            fontWeight="bold"
          >
            {item.name.slice(0, 1).toUpperCase()}
          </Flex>
          <Stack gap="0" minW="0">
            <Text fontWeight="semibold" lineClamp={1}>
              {item.name}
            </Text>
            <Text color="fg.muted" fontSize="xs" lineClamp={1}>
              {t(`subscriptions.categories.${item.category ?? 'other'}`)}
            </Text>
          </Stack>
        </HStack>
        <StatusBadge status={item.status} />
      </Flex>
      <HStack
        borderBottomWidth="1px"
        borderColor="border.subtle"
        gap="1"
        px="3"
      >
        {tabLabels.map((tab) => (
          <Button
            aria-pressed={panelTab === tab}
            borderBottom={
              panelTab === tab ? '2px solid' : '2px solid transparent'
            }
            borderColor={panelTab === tab ? 'brand.solid' : 'transparent'}
            color={panelTab === tab ? 'brand.fg' : 'fg.muted'}
            key={tab}
            onClick={() => onSelectTab(tab)}
            rounded="none"
            size="xs"
            variant="ghost"
          >
            {t(`subscriptions.panelTabs.${tab}`)}
          </Button>
        ))}
      </HStack>
      <Stack gap="3" p="4">
        {panelTab === 'overview' ? (
          <>
            <SimpleGrid columns={2} gap="3">
              <DetailValue
                label={t('subscriptions.amount')}
                value={money(item)}
              />
              <DetailValue
                label={t('subscriptions.billingCycle')}
                value={t(`subscriptions.cycles.${item.billingCycle}`)}
              />
              <DetailValue
                label={t('subscriptions.nextBillingDate')}
                value={formatDate(item.nextBillingDate, i18nLanguage)}
              />
              <DetailValue
                label={t('subscriptions.annualCost')}
                value={money(item, getRecurringCostSummary([item]).annual)}
              />
            </SimpleGrid>
            <Box bg="bg.subtle" p="3" rounded="control">
              <HStack justify="space-between">
                <Text color="fg.muted" fontSize="xs">
                  {t('subscriptions.monthlyCost')}
                </Text>
                <Text fontSize="sm" fontWeight="semibold">
                  {money(item, monthlyTotal)}
                </Text>
              </HStack>
            </Box>
            {item.websiteUrl ? (
              <Button
                asChild
                justifyContent="space-between"
                size="sm"
                variant="outline"
              >
                <a href={item.websiteUrl} rel="noreferrer" target="_blank">
                  {t('subscriptions.openWebsite')}
                  <ExternalLink aria-hidden="true" size={14} />
                </a>
              </Button>
            ) : null}
            <Text color="fg.muted" fontSize="xs">
              {item.autoRenew
                ? t('subscriptions.autoRenew')
                : t('subscriptions.manualRenewal')}
            </Text>
          </>
        ) : panelTab === 'timeline' ? (
          <Stack gap="3">
            <DetailValue
              label={t('subscriptions.startDate')}
              value={
                item.startDate
                  ? formatDate(item.startDate, i18nLanguage)
                  : t('common.notAvailable')
              }
            />
            <DetailValue
              label={t('subscriptions.createdAt')}
              value={new Intl.DateTimeFormat(i18nLanguage, {
                dateStyle: 'medium',
              }).format(new Date(item.createdAt))}
            />
            <DetailValue
              label={t('subscriptions.updatedAt')}
              value={new Intl.DateTimeFormat(i18nLanguage, {
                dateStyle: 'medium',
              }).format(new Date(item.updatedAt))}
            />
          </Stack>
        ) : (
          <Text
            color={item.notes ? 'fg' : 'fg.muted'}
            fontSize="sm"
            whiteSpace="pre-wrap"
          >
            {item.notes || t('subscriptions.noNotes')}
          </Text>
        )}
      </Stack>
      <Stack borderTopWidth="1px" borderColor="border.subtle" gap="2" p="3">
        <Button colorPalette="brand" onClick={onEdit} size="sm">
          <Pencil aria-hidden="true" size={15} /> {t('subscriptions.editTitle')}
        </Button>
        {item.status !== 'cancelled' && item.status !== 'expired' ? (
          <Button onClick={onPause} size="sm" variant="outline">
            {item.status === 'paused' ? (
              <Play aria-hidden="true" size={15} />
            ) : (
              <Pause aria-hidden="true" size={15} />
            )}
            {item.status === 'paused'
              ? t('subscriptions.resume')
              : t('subscriptions.pause')}
          </Button>
        ) : null}
        {item.status !== 'cancelled' ? (
          <Button
            colorPalette="danger"
            onClick={onCancel}
            size="sm"
            variant="outline"
          >
            <X aria-hidden="true" size={15} /> {t('subscriptions.cancel')}
          </Button>
        ) : null}
      </Stack>
    </Stack>
  )
}

function DetailValue({ label, value }: { label: string; value: string }) {
  return (
    <Stack gap="1" minW="0">
      <Text color="fg.muted" fontSize="xs">
        {label}
      </Text>
      <Text fontSize="sm" fontWeight="medium" lineClamp={2}>
        {value}
      </Text>
    </Stack>
  )
}

function SubscriptionDetail({ subscriptionId }: { subscriptionId: string }) {
  const { i18n, t } = useTranslation()
  const navigate = useNavigate()
  const query = useSubscription(subscriptionId)
  const update = useUpdateSubscription()
  const cancel = useCancelSubscription()
  const [formOpen, setFormOpen] = useState(false)
  if (query.isPending) return <SubscriptionDetailSkeleton />
  if (query.isError || !query.data)
    return <ErrorState onRetry={() => void query.refetch()} />
  const item = query.data
  const togglePause = () =>
    update.mutate({
      status: item.status === 'paused' ? 'active' : 'paused',
      subscriptionId,
    })
  return (
    <Container maxW="3xl" py={{ base: '6', md: '10' }}>
      <Stack gap="6">
        <Button
          alignSelf="start"
          onClick={() =>
            void navigate({ to: APP_ROUTES.subscriptions, search: {} })
          }
          variant="ghost"
        >
          ← {t('subscriptions.back')}
        </Button>
        <PageHeader
          actions={
            <>
              <Button
                onClick={() => setFormOpen(true)}
                size="sm"
                variant="outline"
              >
                <Pencil size={15} /> {t('subscriptions.editTitle')}
              </Button>
              {item.status !== 'cancelled' ? (
                <Button
                  onClick={() => cancel.mutate(subscriptionId)}
                  size="sm"
                  variant="outline"
                >
                  <X size={15} /> {t('subscriptions.cancel')}
                </Button>
              ) : null}
              {item.status !== 'cancelled' && item.status !== 'expired' ? (
                <Button onClick={togglePause} size="sm" variant="outline">
                  {item.status === 'paused' ? (
                    <Play size={15} />
                  ) : (
                    <Pause size={15} />
                  )}{' '}
                  {item.status === 'paused'
                    ? t('subscriptions.resume')
                    : t('subscriptions.pause')}
                </Button>
              ) : null}
            </>
          }
          title={item.name}
        />
        <Stack bg="bg.panel" borderWidth="1px" gap="4" p="5" rounded="l2">
          <Text fontSize="2xl" fontWeight="bold">
            {money(item)} / {t(`subscriptions.cycles.${item.billingCycle}`)}
          </Text>
          <Text>
            {t('subscriptions.renewsOn', {
              date: formatDate(item.nextBillingDate, i18n.language),
            })}
          </Text>
          <Text color="fg.muted">
            {t(`subscriptions.statuses.${item.status}`)} ·{' '}
            {item.autoRenew
              ? t('subscriptions.autoRenew')
              : t('subscriptions.manualRenewal')}
          </Text>
          {item.description ? (
            <Text color="fg.muted">{item.description}</Text>
          ) : null}
          <HStack>
            <Text color="fg.muted">{t('subscriptions.monthlyCost')}</Text>
            <Text>{money(item, getRecurringCostSummary([item]).monthly)}</Text>
          </HStack>
          <HStack>
            <Text color="fg.muted">{t('subscriptions.annualCost')}</Text>
            <Text>{money(item, getRecurringCostSummary([item]).annual)}</Text>
          </HStack>
        </Stack>
      </Stack>
      <SubscriptionFormDialog
        isSubmitting={update.isPending}
        onOpenChange={setFormOpen}
        onSubmit={(input) =>
          update.mutate(
            { ...input, subscriptionId },
            { onSuccess: () => setFormOpen(false) },
          )
        }
        open={formOpen}
        subscription={item}
      />
    </Container>
  )
}
