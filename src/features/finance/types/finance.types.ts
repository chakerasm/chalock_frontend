export type AccountType =
  | 'checking'
  | 'savings'
  | 'cash'
  | 'credit_card'
  | 'wallet'
  | 'other'

export type TransactionType = 'expense' | 'income' | 'transfer'

export type CategoryType = Exclude<TransactionType, 'transfer'>

export type RecurringFrequency =
  | 'weekly'
  | 'monthly'
  | 'quarterly'
  | 'semiannual'
  | 'annual'
  | 'custom'

export type RecurringIntervalUnit = 'day' | 'week' | 'month' | 'year'

export type SavingsGoalStatus = 'active' | 'completed' | 'paused' | 'archived'

export type AccountFromAPI = {
  createdAt: string
  currency: string
  id: string
  isArchived: boolean
  name: string
  openingBalance: number
  type: AccountType
  updatedAt: string
}

export type TransactionFromAPI = {
  accountId: string
  amount: number
  categoryId?: string
  createdAt: string
  currency: string
  description?: string
  destinationAccountId?: string
  id: string
  recurringTransactionId?: string
  title: string
  transactionDate: string
  type: TransactionType
  updatedAt: string
}

export type FinanceCategoryFromAPI = {
  icon?: string
  id: string
  isSystem: boolean
  name: string
  type: CategoryType
}

export type RecurringTransactionFromAPI = {
  accountId: string
  amount: number
  categoryId?: string
  createdAt: string
  currency: string
  customInterval?: {
    unit: RecurringIntervalUnit
    value: number
  }
  endDate?: string
  frequency: RecurringFrequency
  id: string
  isActive: boolean
  nextOccurrenceDate: string
  title: string
  type: CategoryType
  updatedAt: string
}

export type SavingsGoalFromAPI = {
  createdAt: string
  currency: string
  currentAmount: number
  id: string
  name: string
  status: SavingsGoalStatus
  targetAmount: number
  targetDate?: string
  updatedAt: string
}

export type FinanceSnapshotFromAPI = {
  accounts: AccountFromAPI[]
  categories: FinanceCategoryFromAPI[]
  recurringTransactions: RecurringTransactionFromAPI[]
  savingsGoals: SavingsGoalFromAPI[]
  transactions: TransactionFromAPI[]
}

export type Account = AccountFromAPI
export type Transaction = TransactionFromAPI
export type FinanceCategory = FinanceCategoryFromAPI
export type RecurringTransaction = RecurringTransactionFromAPI
export type SavingsGoal = SavingsGoalFromAPI
export type FinanceSnapshot = FinanceSnapshotFromAPI

export type CreateAccountInput = Pick<
  Account,
  'currency' | 'name' | 'openingBalance' | 'type'
>

export type UpdateAccountInput = Partial<CreateAccountInput> & {
  accountId: string
  isArchived?: boolean
}

export type CreateTransactionInput = Pick<
  Transaction,
  | 'accountId'
  | 'amount'
  | 'categoryId'
  | 'currency'
  | 'description'
  | 'destinationAccountId'
  | 'recurringTransactionId'
  | 'title'
  | 'transactionDate'
  | 'type'
>

export type UpdateTransactionInput = Partial<CreateTransactionInput> & {
  transactionId: string
}

export type CreateCategoryInput = Pick<
  FinanceCategory,
  'icon' | 'name' | 'type'
>

export type UpdateCategoryInput = Partial<CreateCategoryInput> & {
  categoryId: string
}

export type CreateRecurringTransactionInput = Pick<
  RecurringTransaction,
  | 'accountId'
  | 'amount'
  | 'categoryId'
  | 'currency'
  | 'customInterval'
  | 'endDate'
  | 'frequency'
  | 'isActive'
  | 'nextOccurrenceDate'
  | 'title'
  | 'type'
>

export type UpdateRecurringTransactionInput =
  Partial<CreateRecurringTransactionInput> & {
    recurringTransactionId: string
  }

export type CreateSavingsGoalInput = Pick<
  SavingsGoal,
  | 'currency'
  | 'currentAmount'
  | 'name'
  | 'status'
  | 'targetAmount'
  | 'targetDate'
>

export type UpdateSavingsGoalInput = Partial<CreateSavingsGoalInput> & {
  savingsGoalId: string
}

export type TransactionListFilters = {
  accountId?: string
  categoryId?: string
  from?: string
  search?: string
  to?: string
  type?: TransactionType
}

export type FinanceSummaryByCurrency = {
  currency: string
  expenses: number
  income: number
  net: number
  recurringExpenses: number
  topExpenseCategories: Array<{
    amount: number
    categoryId: string
    name: string
  }>
}

export type FinanceSummary = {
  byCurrency: FinanceSummaryByCurrency[]
  from: string
  to: string
  upcomingPayments: Array<{
    amount: number
    currency: string
    date: string
    id: string
    source: 'recurring' | 'subscription'
    title: string
  }>
}
