import type {
  Subscription,
  SubscriptionBillingCycle,
} from '@/features/subscriptions/types/subscriptions.types'

const weeksPerYear = 52
const daysPerYear = 365

export function getAnnualCost(
  amount: number,
  cycle: SubscriptionBillingCycle,
  customInterval?: Subscription['customBillingInterval'],
) {
  if (cycle === 'weekly') return amount * weeksPerYear
  if (cycle === 'monthly') return amount * 12
  if (cycle === 'quarterly') return amount * 4
  if (cycle === 'semiannual') return amount * 2
  if (cycle === 'annual') return amount
  if (!customInterval) return 0
  const days =
    customInterval.unit === 'day'
      ? customInterval.value
      : customInterval.unit === 'week'
        ? customInterval.value * 7
        : customInterval.unit === 'month'
          ? (customInterval.value * 365) / 12
          : customInterval.value * daysPerYear
  return amount * (daysPerYear / days)
}

export function getMonthlyCost(
  amount: number,
  cycle: SubscriptionBillingCycle,
  customInterval?: Subscription['customBillingInterval'],
) {
  return getAnnualCost(amount, cycle, customInterval) / 12
}

export function isIncludedInRecurringTotals(subscription: Subscription) {
  return subscription.status === 'active'
}

export function getRecurringCostSummary(subscriptions: Subscription[]) {
  const included = subscriptions.filter(isIncludedInRecurringTotals)
  const annual = included.reduce(
    (sum, item) =>
      sum +
      getAnnualCost(item.amount, item.billingCycle, item.customBillingInterval),
    0,
  )
  return { annual, monthly: annual / 12 }
}

export type RenewalUrgency = 'today' | 'tomorrow' | 'week' | 'month' | 'later'

export function getRenewalUrgency(
  date: string,
  today = new Date(),
): RenewalUrgency {
  const renewal = new Date(`${date}T12:00:00`)
  const start = new Date(today)
  start.setHours(12, 0, 0, 0)
  const days = Math.ceil((renewal.getTime() - start.getTime()) / 86_400_000)
  if (days <= 0) return 'today'
  if (days === 1) return 'tomorrow'
  if (days <= 7) return 'week'
  if (days <= 30) return 'month'
  return 'later'
}

export function getUpcomingRenewals(
  subscriptions: Subscription[],
  days = 30,
  today = new Date(),
) {
  const start = today.toISOString().slice(0, 10)
  const end = new Date(today.getTime() + days * 86_400_000)
    .toISOString()
    .slice(0, 10)
  return subscriptions.filter(
    (item) =>
      item.status === 'active' &&
      item.nextBillingDate >= start &&
      item.nextBillingDate <= end,
  )
}
