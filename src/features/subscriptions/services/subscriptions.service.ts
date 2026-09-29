import {
  getSubscriptionsFromStorage,
  saveSubscriptionsToStorage,
} from '@/features/subscriptions/api/subscriptions.local-storage'
import { mapSubscriptionFromAPI } from '@/features/subscriptions/mappers/subscriptions.mapper'
import {
  createSubscriptionInputSchema,
  subscriptionInputSchema,
  updateSubscriptionInputSchema,
} from '@/features/subscriptions/schemas/subscriptions.schemas'
import type {
  CreateSubscriptionInput,
  Subscription,
  SubscriptionListFilter,
  UpdateSubscriptionInput,
} from '@/features/subscriptions/types/subscriptions.types'

function withDates(input: CreateSubscriptionInput, id: string): Subscription {
  const now = new Date().toISOString()
  return { ...input, createdAt: now, id, updatedAt: now }
}

export async function getSubscriptions(
  filters: SubscriptionListFilter = {},
): Promise<Subscription[]> {
  return getSubscriptionsFromStorage()
    .map(mapSubscriptionFromAPI)
    .filter((item) => !filters.status || item.status === filters.status)
    .filter((item) => !filters.category || item.category === filters.category)
    .filter(
      (item) =>
        !filters.search ||
        item.name.toLowerCase().includes(filters.search.toLowerCase()),
    )
    .sort((a, b) => a.nextBillingDate.localeCompare(b.nextBillingDate))
}

export async function getSubscription(id: string) {
  const subscription = getSubscriptionsFromStorage().find(
    (item) => item.id === id,
  )
  if (!subscription) throw new Error('Subscription not found.')
  return mapSubscriptionFromAPI(subscription)
}

export async function createSubscription(
  input: CreateSubscriptionInput,
): Promise<Subscription> {
  const parsed = createSubscriptionInputSchema.parse(input)
  const subscription = withDates(parsed, crypto.randomUUID())
  const subscriptions = getSubscriptionsFromStorage()
  saveSubscriptionsToStorage([subscription, ...subscriptions])
  return subscription
}

export async function updateSubscription({
  subscriptionId,
  ...input
}: UpdateSubscriptionInput): Promise<Subscription> {
  const parsed = updateSubscriptionInputSchema.parse(input)
  const subscriptions = getSubscriptionsFromStorage()
  const index = subscriptions.findIndex((item) => item.id === subscriptionId)
  if (index < 0) throw new Error('Subscription not found.')
  const nextInput = subscriptionInputSchema.parse({
    ...subscriptions[index],
    ...parsed,
  })
  const subscription = {
    ...subscriptions[index],
    ...nextInput,
    updatedAt: new Date().toISOString(),
  }
  subscriptions[index] = subscription
  saveSubscriptionsToStorage(subscriptions)
  return mapSubscriptionFromAPI(subscription)
}

export async function cancelSubscription(id: string) {
  return updateSubscription({
    cancellationDate: new Date().toISOString().slice(0, 10),
    status: 'cancelled',
    subscriptionId: id,
  })
}
