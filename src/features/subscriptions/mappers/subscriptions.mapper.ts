import type {
  CreateSubscriptionInput,
  Subscription,
  SubscriptionFromAPI,
} from '@/features/subscriptions/types/subscriptions.types'

export function mapSubscriptionFromAPI(
  subscription: SubscriptionFromAPI,
): Subscription {
  return {
    ...subscription,
    customBillingInterval: subscription.customBillingInterval
      ? { ...subscription.customBillingInterval }
      : undefined,
  }
}

export function mapSubscriptionToAPI(
  input: CreateSubscriptionInput,
): CreateSubscriptionInput {
  return {
    ...input,
    customBillingInterval: input.customBillingInterval
      ? { ...input.customBillingInterval }
      : undefined,
  }
}
