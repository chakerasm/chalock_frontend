export type SubscriptionBillingCycle =
  | 'weekly'
  | 'monthly'
  | 'quarterly'
  | 'semiannual'
  | 'annual'
  | 'custom'

export type SubscriptionIntervalUnit = 'day' | 'week' | 'month' | 'year'

export type SubscriptionStatus =
  | 'active'
  | 'trial'
  | 'paused'
  | 'cancelled'
  | 'expired'

export type SubscriptionCategory =
  | 'software'
  | 'entertainment'
  | 'productivity'
  | 'fitness'
  | 'education'
  | 'cloud'
  | 'finance'
  | 'utilities'
  | 'membership'
  | 'other'

export type PaymentMethod = {
  brand?: string
  id: string
  label: string
  last4?: string
  type: 'card' | 'bank' | 'cash' | 'other'
}

export type SubscriptionFromAPI = {
  amount: number
  autoRenew: boolean
  billingCycle: SubscriptionBillingCycle
  cancellationDate?: string
  category?: SubscriptionCategory
  createdAt: string
  currency: string
  customBillingInterval?: {
    unit: SubscriptionIntervalUnit
    value: number
  }
  description?: string
  id: string
  name: string
  nextBillingDate: string
  notes?: string
  paymentMethodId?: string
  startDate?: string
  status: SubscriptionStatus
  trialEndDate?: string
  updatedAt: string
  websiteUrl?: string
}

export type Subscription = SubscriptionFromAPI
export type CreateSubscriptionInput = Omit<
  SubscriptionFromAPI,
  'createdAt' | 'id' | 'updatedAt'
>
export type UpdateSubscriptionInput = Partial<CreateSubscriptionInput> & {
  subscriptionId: string
}

export type SubscriptionListFilter = {
  category?: SubscriptionCategory
  search?: string
  status?: SubscriptionStatus
}
