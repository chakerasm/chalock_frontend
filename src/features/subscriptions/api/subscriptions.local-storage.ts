import { subscriptionsFromAPISchema } from '@/features/subscriptions/schemas/subscriptions.schemas'
import type { SubscriptionFromAPI } from '@/features/subscriptions/types/subscriptions.types'

const storageKey = 'chalock.subscriptions.v1'

export function getSubscriptionsFromStorage(): SubscriptionFromAPI[] {
  if (typeof window === 'undefined') return []
  const value = window.localStorage.getItem(storageKey)
  if (!value) return []
  try {
    return subscriptionsFromAPISchema.parse(JSON.parse(value))
  } catch {
    window.localStorage.removeItem(storageKey)
    return []
  }
}

export function saveSubscriptionsToStorage(
  subscriptions: SubscriptionFromAPI[],
) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(storageKey, JSON.stringify(subscriptions))
  }
}
