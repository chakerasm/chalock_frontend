import {
  createAccountFromAPI,
  createCategoryFromAPI,
  createRecurringTransactionFromAPI,
  createSavingsGoalFromAPI,
  createTransactionFromAPI,
  deleteTransactionFromAPI,
  getFinanceSnapshotFromAPI,
  getFinanceSummaryFromAPI,
  updateAccountFromAPI,
  updateCategoryFromAPI,
  updateRecurringTransactionFromAPI,
  updateSavingsGoalFromAPI,
  updateTransactionFromAPI,
} from '@/features/finance/api/finance.api'
import {
  mapAccountFromAPI,
  mapFinanceCategoryFromAPI,
  mapFinanceSnapshotFromAPI,
  mapRecurringTransactionFromAPI,
  mapSavingsGoalFromAPI,
  mapTransactionFromAPI,
} from '@/features/finance/mappers/finance.mapper'
import {
  accountInputSchema,
  categoryInputSchema,
  recurringTransactionInputSchema,
  savingsGoalInputSchema,
  transactionInputSchema,
} from '@/features/finance/schemas/finance.schemas'
import type {
  Account,
  CreateAccountInput,
  CreateCategoryInput,
  CreateRecurringTransactionInput,
  CreateSavingsGoalInput,
  CreateTransactionInput,
  FinanceCategory,
  FinanceSnapshot,
  FinanceSummary,
  RecurringTransaction,
  SavingsGoal,
  Transaction,
  UpdateAccountInput,
  UpdateCategoryInput,
  UpdateRecurringTransactionInput,
  UpdateSavingsGoalInput,
  UpdateTransactionInput,
} from '@/features/finance/types/finance.types'

export async function getFinanceSnapshot(): Promise<FinanceSnapshot> {
  return mapFinanceSnapshotFromAPI(await getFinanceSnapshotFromAPI())
}

export function getFinanceSummary(
  from: string,
  to: string,
): Promise<FinanceSummary> {
  return getFinanceSummaryFromAPI(from, to)
}
export async function createAccount(
  input: CreateAccountInput,
): Promise<Account> {
  return mapAccountFromAPI(
    await createAccountFromAPI(accountInputSchema.parse(input)),
  )
}

export async function updateAccount({
  accountId,
  isArchived,
  ...input
}: UpdateAccountInput): Promise<Account> {
  const snapshot = await getFinanceSnapshot()
  const current = snapshot.accounts.find((item) => item.id === accountId)
  if (!current) throw new Error('Account not found.')
  accountInputSchema.parse({ ...current, ...input })
  return mapAccountFromAPI(
    await updateAccountFromAPI({ accountId, isArchived, ...input }),
  )
}

export async function createTransaction(
  input: CreateTransactionInput,
): Promise<Transaction> {
  const request = transactionInputSchema.parse(input)
  const normalized =
    request.type === 'transfer'
      ? request
      : { ...request, destinationAccountId: undefined }
  return mapTransactionFromAPI(await createTransactionFromAPI(normalized))
}

export async function updateTransaction({
  transactionId,
  ...input
}: UpdateTransactionInput): Promise<Transaction> {
  const snapshot = await getFinanceSnapshot()
  const current = snapshot.transactions.find(
    (item) => item.id === transactionId,
  )
  if (!current) throw new Error('Transaction not found.')
  const request = transactionInputSchema.parse({ ...current, ...input })
  const normalized =
    request.type === 'transfer'
      ? request
      : { ...request, destinationAccountId: undefined }
  return mapTransactionFromAPI(
    await updateTransactionFromAPI({ transactionId, ...normalized }),
  )
}

export async function deleteTransaction(transactionId: string) {
  await deleteTransactionFromAPI(transactionId)
}

export async function createCategory(
  input: CreateCategoryInput,
): Promise<FinanceCategory> {
  return mapFinanceCategoryFromAPI(
    await createCategoryFromAPI(categoryInputSchema.parse(input)),
  )
}

export async function updateCategory({
  categoryId,
  ...input
}: UpdateCategoryInput): Promise<FinanceCategory> {
  const snapshot = await getFinanceSnapshot()
  const current = snapshot.categories.find((item) => item.id === categoryId)
  if (!current) throw new Error('Category not found.')
  if (current.isSystem) throw new Error('System categories cannot be changed.')
  categoryInputSchema.parse({ ...current, ...input })
  return mapFinanceCategoryFromAPI(
    await updateCategoryFromAPI({ categoryId, ...input }),
  )
}

export async function createRecurringTransaction(
  input: CreateRecurringTransactionInput,
): Promise<RecurringTransaction> {
  return mapRecurringTransactionFromAPI(
    await createRecurringTransactionFromAPI(
      recurringTransactionInputSchema.parse(input),
    ),
  )
}

export async function updateRecurringTransaction({
  recurringTransactionId,
  ...input
}: UpdateRecurringTransactionInput): Promise<RecurringTransaction> {
  const snapshot = await getFinanceSnapshot()
  const current = snapshot.recurringTransactions.find(
    (item) => item.id === recurringTransactionId,
  )
  if (!current) throw new Error('Recurring transaction not found.')
  const request = recurringTransactionInputSchema.parse({
    ...current,
    ...input,
  })
  return mapRecurringTransactionFromAPI(
    await updateRecurringTransactionFromAPI({
      recurringTransactionId,
      ...request,
    }),
  )
}

export async function createSavingsGoal(
  input: CreateSavingsGoalInput,
): Promise<SavingsGoal> {
  return mapSavingsGoalFromAPI(
    await createSavingsGoalFromAPI(savingsGoalInputSchema.parse(input)),
  )
}

export async function updateSavingsGoal({
  savingsGoalId,
  ...input
}: UpdateSavingsGoalInput): Promise<SavingsGoal> {
  const snapshot = await getFinanceSnapshot()
  const current = snapshot.savingsGoals.find(
    (item) => item.id === savingsGoalId,
  )
  if (!current) throw new Error('Savings goal not found.')
  const request = savingsGoalInputSchema.parse({ ...current, ...input })
  return mapSavingsGoalFromAPI(
    await updateSavingsGoalFromAPI({ savingsGoalId, ...request }),
  )
}
