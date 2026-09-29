import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  cancelSubscription,
  createSubscription,
  getSubscription,
  getSubscriptions,
  updateSubscription,
} from '@/features/subscriptions/services/subscriptions.service'
import type {
  CreateSubscriptionInput,
  SubscriptionListFilter,
  UpdateSubscriptionInput,
} from '@/features/subscriptions/types/subscriptions.types'

export const subscriptionQueryKeys = {
  all: ['subscriptions'] as const,
  detail: (id: string) => ['subscriptions', 'detail', id] as const,
  list: (filters: SubscriptionListFilter) =>
    ['subscriptions', 'list', filters] as const,
}

export function useSubscriptions(filters: SubscriptionListFilter = {}) {
  return useQuery({
    queryFn: () => getSubscriptions(filters),
    queryKey: subscriptionQueryKeys.list(filters),
  })
}

export function useSubscription(id: string) {
  return useQuery({
    enabled: Boolean(id),
    queryFn: () => getSubscription(id),
    queryKey: subscriptionQueryKeys.detail(id),
  })
}

function useSubscriptionMutation<T>(
  mutationFn: (value: T) => Promise<unknown>,
) {
  const client = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () =>
      client.invalidateQueries({ queryKey: subscriptionQueryKeys.all }),
  })
}

export const useCreateSubscription = () =>
  useSubscriptionMutation((input: CreateSubscriptionInput) =>
    createSubscription(input),
  )
export const useUpdateSubscription = () =>
  useSubscriptionMutation((input: UpdateSubscriptionInput) =>
    updateSubscription(input),
  )
export const useCancelSubscription = () =>
  useSubscriptionMutation((id: string) => cancelSubscription(id))
