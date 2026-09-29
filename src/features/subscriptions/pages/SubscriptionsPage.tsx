import {
  Badge,
  Box,
  Button,
  Container,
  Flex,
  HStack,
  Input,
  NativeSelect,
  SimpleGrid,
  Stack,
  Text,
} from '@chakra-ui/react'
import {
  Link as RouterLink,
  useNavigate,
  useSearch,
} from '@tanstack/react-router'
import { Pause, Pencil, Play, Plus, X } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { EmptyState } from '@/components/shared/EmptyState/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState/ErrorState'
import { LoadingState } from '@/components/shared/LoadingState/LoadingState'
import { PageHeader } from '@/components/shared/PageHeader/PageHeader'
import { toast } from '@/components/ui/Toaster/Toaster'
import { SubscriptionFormDialog } from '@/features/subscriptions/components/SubscriptionFormDialog'
import {
  useCancelSubscription,
  useCreateSubscription,
  useSubscription,
  useSubscriptions,
  useUpdateSubscription,
} from '@/features/subscriptions/hooks/use-subscriptions'
import {
  getRecurringCostSummary,
  getRenewalUrgency,
} from '@/features/subscriptions/services/subscription-calculations'
import type {
  CreateSubscriptionInput,
  Subscription,
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

export function SubscriptionsPage() {
  const { subscriptionId } = useSearch({ from: APP_ROUTES.subscriptions })
  if (subscriptionId)
    return <SubscriptionDetail subscriptionId={subscriptionId} />
  return <SubscriptionsList />
}

function SubscriptionsList() {
  const { i18n, t } = useTranslation()
  const [status, setStatus] = useState<SubscriptionStatus | 'all'>('all')
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const query = useSubscriptions(
    status === 'all' ? { search } : { search, status },
  )
  const create = useCreateSubscription()
  if (query.isPending) return <LoadingState />
  if (query.isError) return <ErrorState onRetry={() => void query.refetch()} />
  const subscriptions = query.data ?? []
  const summary = getRecurringCostSummary(subscriptions)
  const renewingSoon = subscriptions.filter(
    (item) =>
      item.status === 'active' &&
      ['today', 'tomorrow', 'week'].includes(
        getRenewalUrgency(item.nextBillingDate),
      ),
  ).length

  function save(input: CreateSubscriptionInput) {
    create.mutate(input, {
      onError: () => toast.error({ title: t('subscriptions.createError') }),
      onSuccess: () => {
        setFormOpen(false)
        toast.success({ title: t('subscriptions.created') })
      },
    })
  }

  return (
    <Container maxW="5xl" py={{ base: '6', md: '10' }}>
      <Stack gap={{ base: '5', md: '7' }}>
        <PageHeader
          actions={
            <Button colorPalette="brand" onClick={() => setFormOpen(true)}>
              <Plus aria-hidden="true" size={18} /> {t('subscriptions.add')}
            </Button>
          }
          description={t('subscriptions.descriptionPage')}
          title={t('subscriptions.title')}
        />
        <SimpleGrid columns={{ base: 2, md: 4 }} gap="3">
          <Summary
            label={t('subscriptions.active')}
            value={String(
              subscriptions.filter((item) => item.status === 'active').length,
            )}
          />
          <Summary
            label={t('subscriptions.monthlyCost')}
            value={summary.monthly.toFixed(2)}
          />
          <Summary
            label={t('subscriptions.annualCost')}
            value={summary.annual.toFixed(2)}
          />
          <Summary
            label={t('subscriptions.renewingSoon')}
            value={String(renewingSoon)}
          />
        </SimpleGrid>
        <Flex gap="3" wrap="wrap">
          <Input
            aria-label={t('subscriptions.search')}
            flex="1"
            minW="220px"
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t('subscriptions.searchPlaceholder')}
            value={search}
          />
          <NativeSelect.Root maxW={{ md: '180px' }}>
            <NativeSelect.Field
              aria-label={t('subscriptions.statusFilter')}
              onChange={(event) =>
                setStatus(event.target.value as SubscriptionStatus | 'all')
              }
              value={status}
            >
              <option value="all">{t('subscriptions.all')}</option>
              <option value="active">
                {t('subscriptions.statuses.active')}
              </option>
              <option value="trial">{t('subscriptions.statuses.trial')}</option>
              <option value="paused">
                {t('subscriptions.statuses.paused')}
              </option>
              <option value="cancelled">
                {t('subscriptions.statuses.cancelled')}
              </option>
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
        ) : (
          <Stack
            bg="bg.panel"
            borderWidth="1px"
            px={{ base: '4', md: '5' }}
            rounded="l2"
          >
            {subscriptions.map((item) => {
              const urgency = getRenewalUrgency(item.nextBillingDate)
              return (
                <RouterLink
                  key={item.id}
                  search={{ subscriptionId: item.id }}
                  style={{ color: 'inherit', textDecoration: 'none' }}
                  to={APP_ROUTES.subscriptions}
                >
                  <Flex
                    align="center"
                    borderBottomWidth="1px"
                    gap="4"
                    py="4"
                    _hover={{ bg: 'bg.subtle' }}
                    _last={{ borderBottomWidth: 0 }}
                  >
                    <Box flex="1" minW="0">
                      <Text fontWeight="semibold" lineClamp={1}>
                        {item.name}
                      </Text>
                      <Text color="fg.muted" fontSize="sm">
                        {money(item)} /{' '}
                        {t(`subscriptions.cycles.${item.billingCycle}`)}
                      </Text>
                    </Box>
                    <Stack align="end" gap="1">
                      <Text fontSize="sm">
                        {t(`subscriptions.renewal.${urgency}`, {
                          date: formatDate(item.nextBillingDate, i18n.language),
                        })}
                      </Text>
                      <Badge variant="subtle">
                        {t(`subscriptions.statuses.${item.status}`)}
                      </Badge>
                    </Stack>
                  </Flex>
                </RouterLink>
              )
            })}
          </Stack>
        )}
      </Stack>
      <SubscriptionFormDialog
        isSubmitting={create.isPending}
        onOpenChange={setFormOpen}
        onSubmit={save}
        open={formOpen}
      />
    </Container>
  )
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <Box bg="bg.subtle" borderWidth="1px" p="3" rounded="l1">
      <Text color="fg.muted" fontSize="xs">
        {label}
      </Text>
      <Text fontSize="lg" fontWeight="semibold">
        {value}
      </Text>
    </Box>
  )
}

function SubscriptionDetail({ subscriptionId }: { subscriptionId: string }) {
  const { i18n, t } = useTranslation()
  const navigate = useNavigate()
  const query = useSubscription(subscriptionId)
  const update = useUpdateSubscription()
  const cancel = useCancelSubscription()
  const [formOpen, setFormOpen] = useState(false)
  if (query.isPending) return <LoadingState />
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
