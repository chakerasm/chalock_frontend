import type {
  Account,
  AccountFromAPI,
  FinanceCategory,
  FinanceCategoryFromAPI,
  FinanceSnapshot,
  FinanceSnapshotFromAPI,
  RecurringTransaction,
  RecurringTransactionFromAPI,
  SavingsGoal,
  SavingsGoalFromAPI,
  Transaction,
  TransactionFromAPI,
} from '@/features/finance/types/finance.types'

export const mapAccountFromAPI = (account: AccountFromAPI): Account => ({
  ...account,
})
export const mapAccountToAPI = (account: Account): AccountFromAPI => ({
  ...account,
})
export const mapTransactionFromAPI = (
  transaction: TransactionFromAPI,
): Transaction => ({ ...transaction })
export const mapTransactionToAPI = (
  transaction: Transaction,
): TransactionFromAPI => ({ ...transaction })
export const mapFinanceCategoryFromAPI = (
  category: FinanceCategoryFromAPI,
): FinanceCategory => ({ ...category })
export const mapFinanceCategoryToAPI = (
  category: FinanceCategory,
): FinanceCategoryFromAPI => ({ ...category })
export const mapRecurringTransactionFromAPI = (
  transaction: RecurringTransactionFromAPI,
): RecurringTransaction => ({ ...transaction })
export const mapRecurringTransactionToAPI = (
  transaction: RecurringTransaction,
): RecurringTransactionFromAPI => ({ ...transaction })
export const mapSavingsGoalFromAPI = (
  goal: SavingsGoalFromAPI,
): SavingsGoal => ({ ...goal })
export const mapSavingsGoalToAPI = (goal: SavingsGoal): SavingsGoalFromAPI => ({
  ...goal,
})

export function mapFinanceSnapshotFromAPI(
  snapshot: FinanceSnapshotFromAPI,
): FinanceSnapshot {
  return {
    accounts: snapshot.accounts.map(mapAccountFromAPI),
    categories: snapshot.categories.map(mapFinanceCategoryFromAPI),
    recurringTransactions: snapshot.recurringTransactions.map(
      mapRecurringTransactionFromAPI,
    ),
    savingsGoals: snapshot.savingsGoals.map(mapSavingsGoalFromAPI),
    transactions: snapshot.transactions.map(mapTransactionFromAPI),
  }
}

export function mapFinanceSnapshotToAPI(
  snapshot: FinanceSnapshot,
): FinanceSnapshotFromAPI {
  return {
    accounts: snapshot.accounts.map(mapAccountToAPI),
    categories: snapshot.categories.map(mapFinanceCategoryToAPI),
    recurringTransactions: snapshot.recurringTransactions.map(
      mapRecurringTransactionToAPI,
    ),
    savingsGoals: snapshot.savingsGoals.map(mapSavingsGoalToAPI),
    transactions: snapshot.transactions.map(mapTransactionToAPI),
  }
}
