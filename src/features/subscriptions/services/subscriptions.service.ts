import {
  createSubscriptionFromAPI,
  deleteSubscriptionFromAPI,
  getSubscriptionFromAPI,
  getSubscriptionsFromAPI,
  updateSubscriptionFromAPI,
} from '@/features/subscriptions/api/subscriptions.api'
import {
  mapSubscriptionFromAPI,
  mapSubscriptionToAPI,
} from '@/features/subscriptions/mappers/subscriptions.mapper'
import {
  createSubscriptionInputSchema,
  updateSubscriptionInputSchema,
} from '@/features/subscriptions/schemas/subscriptions.schemas'
import type {
  CreateSubscriptionInput,
  Subscription,
  SubscriptionListFilter,
  UpdateSubscriptionInput,
} from '@/features/subscriptions/types/subscriptions.types'

export async function getSubscriptions(
  filters: SubscriptionListFilter = {},
): Promise<Subscription[]> {
  return (await getSubscriptionsFromAPI(filters))
    .map(mapSubscriptionFromAPI)
    .sort((a, b) => a.nextBillingDate.localeCompare(b.nextBillingDate))
}

export async function getSubscription(id: string) {
  return mapSubscriptionFromAPI(await getSubscriptionFromAPI(id))
}

export async function createSubscription(
  input: CreateSubscriptionInput,
): Promise<Subscription> {
  const request = createSubscriptionInputSchema.parse(input)
  return mapSubscriptionFromAPI(
    await createSubscriptionFromAPI(mapSubscriptionToAPI(request)),
  )
}

export async function updateSubscription({
  subscriptionId,
  ...input
}: UpdateSubscriptionInput): Promise<Subscription> {
  const request = updateSubscriptionInputSchema.parse(input)
  return mapSubscriptionFromAPI(
    await updateSubscriptionFromAPI({ subscriptionId, ...request }),
  )
}

export async function cancelSubscription(id: string) {
  return updateSubscription({
    cancellationDate: new Date().toISOString().slice(0, 10),
    status: 'cancelled',
    subscriptionId: id,
  })
}

export async function deleteSubscription(id: string) {
  await deleteSubscriptionFromAPI(id)
}
