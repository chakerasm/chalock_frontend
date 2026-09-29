import type {
  FinanceCategoryFromAPI,
  FinanceSnapshotFromAPI,
} from '@/features/finance/types/finance.types'

const storageKey = 'chalock.finance.v1'

const expenseCategoryNames = [
  'Housing',
  'Groceries',
  'Restaurants',
  'Transport',
  'Utilities',
  'Subscriptions',
  'Shopping',
  'Health',
  'Fitness',
  'Education',
  'Entertainment',
  'Travel',
  'Personal',
  'Other',
]
const incomeCategoryNames = [
  'Salary',
  'Freelance',
  'Bonus',
  'Refund',
  'Gift',
  'Other',
]

function defaultCategories(): FinanceCategoryFromAPI[] {
  return [
    ...expenseCategoryNames.map((name) => ({
      id: `expense-${name.toLowerCase()}`,
      isSystem: true,
      name,
      type: 'expense' as const,
    })),
    ...incomeCategoryNames.map((name) => ({
      id: `income-${name.toLowerCase()}`,
      isSystem: true,
      name,
      type: 'income' as const,
    })),
  ]
}

function emptySnapshot(): FinanceSnapshotFromAPI {
  return {
    accounts: [],
    categories: defaultCategories(),
    recurringTransactions: [],
    savingsGoals: [],
    transactions: [],
  }
}

export function getFinanceSnapshotFromStorage(): FinanceSnapshotFromAPI {
  if (typeof window === 'undefined') return emptySnapshot()
  const stored = window.localStorage.getItem(storageKey)
  if (!stored) return emptySnapshot()
  try {
    const snapshot = JSON.parse(stored) as FinanceSnapshotFromAPI
    return {
      ...emptySnapshot(),
      ...snapshot,
      categories: snapshot.categories?.length
        ? snapshot.categories
        : defaultCategories(),
    }
  } catch {
    window.localStorage.removeItem(storageKey)
    return emptySnapshot()
  }
}

export function saveFinanceSnapshotToStorage(snapshot: FinanceSnapshotFromAPI) {
  if (typeof window !== 'undefined')
    window.localStorage.setItem(storageKey, JSON.stringify(snapshot))
}
