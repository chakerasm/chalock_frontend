import {
  getMonthlyCost,
  isIncludedInRecurringTotals,
} from '@/features/subscriptions/services/subscription-calculations'
import type { Subscription } from '@/features/subscriptions/types/subscriptions.types'
import type {
  Account,
  FinanceCategory,
  RecurringTransaction,
  SavingsGoal,
  Transaction,
  TransactionListFilters,
} from '@/features/finance/types/finance.types'

const daysPerYear = 365
const weeksPerYear = 52

export type CurrencyTotal = { currency: string; value: number }

export type MonthlySummary = {
  currency: string
  expenses: number
  income: number
  net: number
  savings: number
}

export type CategorySummary = {
  categoryId?: string
  name: string
  percentage: number
  total: number
}

export type UpcomingPayment = {
  amount: number
  currency: string
  date: string
  id: string
  source: 'recurring' | 'subscription'
  title: string
}

function dateAtNoon(value: string) {
  return new Date(`${value}T12:00:00`)
}

function toCurrencyTotals(
  values: Iterable<{ currency: string; value: number }>,
) {
  const totals = new Map<string, number>()
  for (const value of values) {
    totals.set(value.currency, (totals.get(value.currency) ?? 0) + value.value)
  }
  return [...totals.entries()]
    .map(([currency, value]) => ({ currency, value }))
    .sort((left, right) => left.currency.localeCompare(right.currency))
}

export function getAccountBalances(
  accounts: Account[],
  transactions: Transaction[],
) {
  const accountById = new Map(accounts.map((account) => [account.id, account]))
  const balances = new Map(
    accounts.map((account) => [account.id, account.openingBalance]),
  )

  for (const transaction of transactions) {
    if (transaction.type === 'income') {
      balances.set(
        transaction.accountId,
        (balances.get(transaction.accountId) ?? 0) + transaction.amount,
      )
    }
    if (transaction.type === 'expense') {
      balances.set(
        transaction.accountId,
        (balances.get(transaction.accountId) ?? 0) - transaction.amount,
      )
    }
    if (transaction.type === 'transfer') {
      balances.set(
        transaction.accountId,
        (balances.get(transaction.accountId) ?? 0) - transaction.amount,
      )
      if (transaction.destinationAccountId) {
        balances.set(
          transaction.destinationAccountId,
          (balances.get(transaction.destinationAccountId) ?? 0) +
            transaction.amount,
        )
      }
    }
  }

  return accounts.map((account) => ({
    ...account,
    currentBalance: balances.get(account.id) ?? account.openingBalance,
    hasTransactionCurrencyMismatch: transactions.some(
      (transaction) =>
        (transaction.accountId === account.id ||
          transaction.destinationAccountId === account.id) &&
        transaction.currency !== account.currency &&
        accountById.has(account.id),
    ),
  }))
}

export function getTotalBalancesByCurrency(
  accounts: Account[],
  transactions: Transaction[],
): CurrencyTotal[] {
  return toCurrencyTotals(
    getAccountBalances(accounts, transactions)
      .filter((account) => !account.isArchived)
      .map((account) => ({
        currency: account.currency,
        value: account.currentBalance,
      })),
  )
}

export function getMonthKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export function getMonthlySummaries(
  transactions: Transaction[],
  month = getMonthKey(),
): MonthlySummary[] {
  const values = new Map<string, { expenses: number; income: number }>()
  for (const transaction of transactions) {
    if (
      !transaction.transactionDate.startsWith(month) ||
      transaction.type === 'transfer'
    )
      continue
    const summary = values.get(transaction.currency) ?? {
      expenses: 0,
      income: 0,
    }
    if (transaction.type === 'income') summary.income += transaction.amount
    if (transaction.type === 'expense') summary.expenses += transaction.amount
    values.set(transaction.currency, summary)
  }
  return [...values.entries()]
    .map(([currency, summary]) => ({
      currency,
      expenses: summary.expenses,
      income: summary.income,
      net: summary.income - summary.expenses,
      savings: Math.max(0, summary.income - summary.expenses),
    }))
    .sort((left, right) => left.currency.localeCompare(right.currency))
}

export function getCategorySummaries(
  transactions: Transaction[],
  categories: FinanceCategory[],
  month = getMonthKey(),
  currency?: string,
): CategorySummary[] {
  const categoryById = new Map(
    categories.map((category) => [category.id, category]),
  )
  const totals = new Map<string, number>()
  for (const transaction of transactions) {
    if (
      transaction.type !== 'expense' ||
      !transaction.transactionDate.startsWith(month) ||
      (currency && transaction.currency !== currency)
    )
      continue
    const id = transaction.categoryId ?? 'uncategorized'
    totals.set(id, (totals.get(id) ?? 0) + transaction.amount)
  }
  const total = [...totals.values()].reduce((sum, value) => sum + value, 0)
  return [...totals.entries()]
    .map(([categoryId, value]) => ({
      categoryId: categoryId === 'uncategorized' ? undefined : categoryId,
      name:
        categoryId === 'uncategorized'
          ? 'Uncategorized'
          : (categoryById.get(categoryId)?.name ?? 'Uncategorized'),
      percentage: total ? Math.round((value / total) * 100) : 0,
      total: value,
    }))
    .sort((left, right) => right.total - left.total)
}

export function getMonthlyRecurringCost(
  transaction: Pick<
    RecurringTransaction,
    'amount' | 'customInterval' | 'frequency'
  >,
) {
  if (transaction.frequency === 'weekly')
    return (transaction.amount * weeksPerYear) / 12
  if (transaction.frequency === 'monthly') return transaction.amount
  if (transaction.frequency === 'quarterly') return transaction.amount / 3
  if (transaction.frequency === 'semiannual') return transaction.amount / 6
  if (transaction.frequency === 'annual') return transaction.amount / 12
  if (!transaction.customInterval) return 0
  const days =
    transaction.customInterval.unit === 'day'
      ? transaction.customInterval.value
      : transaction.customInterval.unit === 'week'
        ? transaction.customInterval.value * 7
        : transaction.customInterval.unit === 'month'
          ? (transaction.customInterval.value * daysPerYear) / 12
          : transaction.customInterval.value * daysPerYear
  return (transaction.amount * (daysPerYear / days)) / 12
}

export function getRecurringExpensesByCurrency(
  recurringTransactions: RecurringTransaction[],
  subscriptions: Subscription[],
): CurrencyTotal[] {
  return toCurrencyTotals([
    ...recurringTransactions
      .filter((item) => item.isActive && item.type === 'expense')
      .map((item) => ({
        currency: item.currency,
        value: getMonthlyRecurringCost(item),
      })),
    ...subscriptions.filter(isIncludedInRecurringTotals).map((item) => ({
      currency: item.currency,
      value: getMonthlyCost(
        item.amount,
        item.billingCycle,
        item.customBillingInterval,
      ),
    })),
  ])
}

export function getUpcomingPayments(
  recurringTransactions: RecurringTransaction[],
  subscriptions: Subscription[],
  days = 30,
  today = new Date(),
): UpcomingPayment[] {
  const start = new Date(today)
  start.setHours(12, 0, 0, 0)
  const end = new Date(start)
  end.setDate(end.getDate() + days)
  const isUpcoming = (date: string) => {
    const occurrence = dateAtNoon(date)
    return occurrence >= start && occurrence <= end
  }
  return [
    ...recurringTransactions
      .filter(
        (item) =>
          item.isActive &&
          item.type === 'expense' &&
          isUpcoming(item.nextOccurrenceDate),
      )
      .map((item) => ({
        amount: item.amount,
        currency: item.currency,
        date: item.nextOccurrenceDate,
        id: `recurring-${item.id}`,
        source: 'recurring' as const,
        title: item.title,
      })),
    ...subscriptions
      .filter(
        (item) => item.status === 'active' && isUpcoming(item.nextBillingDate),
      )
      .map((item) => ({
        amount: item.amount,
        currency: item.currency,
        date: item.nextBillingDate,
        id: `subscription-${item.id}`,
        source: 'subscription' as const,
        title: item.name,
      })),
  ].sort((left, right) => left.date.localeCompare(right.date))
}

export function getSavingsGoalProgress(goal: SavingsGoal) {
  const percentage = goal.targetAmount
    ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100))
    : 0
  return {
    isComplete:
      goal.status === 'completed' || goal.currentAmount >= goal.targetAmount,
    percentage,
    remaining: Math.max(0, goal.targetAmount - goal.currentAmount),
  }
}

export function filterTransactions(
  transactions: Transaction[],
  filters: TransactionListFilters,
) {
  const search = filters.search?.trim().toLocaleLowerCase()
  return transactions
    .filter(
      (transaction) =>
        !filters.accountId ||
        transaction.accountId === filters.accountId ||
        transaction.destinationAccountId === filters.accountId,
    )
    .filter(
      (transaction) =>
        !filters.categoryId || transaction.categoryId === filters.categoryId,
    )
    .filter((transaction) => !filters.type || transaction.type === filters.type)
    .filter(
      (transaction) =>
        !filters.from || transaction.transactionDate >= filters.from,
    )
    .filter(
      (transaction) => !filters.to || transaction.transactionDate <= filters.to,
    )
    .filter(
      (transaction) =>
        !search ||
        `${transaction.title} ${transaction.description ?? ''}`
          .toLocaleLowerCase()
          .includes(search),
    )
    .sort(
      (left, right) =>
        right.transactionDate.localeCompare(left.transactionDate) ||
        right.updatedAt.localeCompare(left.updatedAt),
    )
}

export function groupTransactionsByDate(transactions: Transaction[]) {
  return transactions.reduce<Record<string, Transaction[]>>(
    (groups, transaction) => {
      groups[transaction.transactionDate] = [
        ...(groups[transaction.transactionDate] ?? []),
        transaction,
      ]
      return groups
    },
    {},
  )
}
