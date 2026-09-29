import {
  getFinanceSnapshotFromStorage,
  saveFinanceSnapshotToStorage,
} from '@/features/finance/api/finance.local-storage'
import {
  mapFinanceSnapshotFromAPI,
  mapFinanceSnapshotToAPI,
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
  RecurringTransaction,
  SavingsGoal,
  Transaction,
  UpdateAccountInput,
  UpdateCategoryInput,
  UpdateRecurringTransactionInput,
  UpdateSavingsGoalInput,
  UpdateTransactionInput,
} from '@/features/finance/types/finance.types'

function id(prefix: string) {
  return `${prefix}-${globalThis.crypto?.randomUUID?.() ?? Date.now().toString(36)}`
}

function now() {
  return new Date().toISOString()
}

function save(snapshot: FinanceSnapshot) {
  saveFinanceSnapshotToStorage(mapFinanceSnapshotToAPI(snapshot))
  return snapshot
}

function requireAccount(snapshot: FinanceSnapshot, accountId: string) {
  const account = snapshot.accounts.find((item) => item.id === accountId)
  if (!account) throw new Error('Account not found.')
  if (account.isArchived)
    throw new Error('Archived accounts cannot receive new transactions.')
  return account
}

function assertTransactionReferences(
  snapshot: FinanceSnapshot,
  transaction: CreateTransactionInput,
) {
  const account = requireAccount(snapshot, transaction.accountId)
  if (account.currency !== transaction.currency)
    throw new Error('Transaction currency must match the account currency.')

  if (transaction.type === 'transfer') {
    const destination = requireAccount(
      snapshot,
      transaction.destinationAccountId ?? '',
    )
    if (destination.currency !== transaction.currency)
      throw new Error('Transfers require accounts in the same currency.')
  }

  if (transaction.categoryId) {
    const category = snapshot.categories.find(
      (item) => item.id === transaction.categoryId,
    )
    if (!category) throw new Error('Category not found.')
    if (transaction.type === 'transfer' || category.type !== transaction.type) {
      throw new Error('Transaction category must match the transaction type.')
    }
  }
}

function assertRecurringReferences(
  snapshot: FinanceSnapshot,
  transaction: CreateRecurringTransactionInput,
) {
  const account = requireAccount(snapshot, transaction.accountId)
  if (account.currency !== transaction.currency)
    throw new Error(
      'Recurring transaction currency must match the account currency.',
    )
  if (!transaction.categoryId) return
  const category = snapshot.categories.find(
    (item) => item.id === transaction.categoryId,
  )
  if (!category || category.type !== transaction.type)
    throw new Error('Recurring category must match the transaction type.')
}

export async function getFinanceSnapshot(): Promise<FinanceSnapshot> {
  return mapFinanceSnapshotFromAPI(getFinanceSnapshotFromStorage())
}

export async function createAccount(
  input: CreateAccountInput,
): Promise<Account> {
  const request = accountInputSchema.parse(input)
  const snapshot = await getFinanceSnapshot()
  const timestamp = now()
  const account: Account = {
    ...request,
    createdAt: timestamp,
    id: id('account'),
    isArchived: false,
    updatedAt: timestamp,
  }
  save({ ...snapshot, accounts: [account, ...snapshot.accounts] })
  return account
}

export async function updateAccount({
  accountId,
  isArchived,
  ...input
}: UpdateAccountInput): Promise<Account> {
  const snapshot = await getFinanceSnapshot()
  const current = snapshot.accounts.find((item) => item.id === accountId)
  if (!current) throw new Error('Account not found.')
  const request = accountInputSchema.parse({ ...current, ...input })
  const account = {
    ...current,
    ...request,
    isArchived: isArchived ?? current.isArchived,
    updatedAt: now(),
  }
  save({
    ...snapshot,
    accounts: snapshot.accounts.map((item) =>
      item.id === accountId ? account : item,
    ),
  })
  return account
}

export async function createTransaction(
  input: CreateTransactionInput,
): Promise<Transaction> {
  const request = transactionInputSchema.parse(input)
  const snapshot = await getFinanceSnapshot()
  const normalized =
    request.type === 'transfer'
      ? request
      : { ...request, destinationAccountId: undefined }
  assertTransactionReferences(snapshot, normalized)
  const timestamp = now()
  const transaction: Transaction = {
    ...normalized,
    createdAt: timestamp,
    id: id('transaction'),
    updatedAt: timestamp,
  }
  save({ ...snapshot, transactions: [transaction, ...snapshot.transactions] })
  return transaction
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
  assertTransactionReferences(snapshot, normalized)
  const transaction = { ...current, ...normalized, updatedAt: now() }
  save({
    ...snapshot,
    transactions: snapshot.transactions.map((item) =>
      item.id === transactionId ? transaction : item,
    ),
  })
  return transaction
}

export async function deleteTransaction(transactionId: string) {
  const snapshot = await getFinanceSnapshot()
  if (!snapshot.transactions.some((item) => item.id === transactionId))
    throw new Error('Transaction not found.')
  save({
    ...snapshot,
    transactions: snapshot.transactions.filter(
      (item) => item.id !== transactionId,
    ),
  })
}

export async function createCategory(
  input: CreateCategoryInput,
): Promise<FinanceCategory> {
  const request = categoryInputSchema.parse(input)
  const snapshot = await getFinanceSnapshot()
  const category: FinanceCategory = {
    ...request,
    id: id('category'),
    isSystem: false,
  }
  save({ ...snapshot, categories: [...snapshot.categories, category] })
  return category
}

export async function updateCategory({
  categoryId,
  ...input
}: UpdateCategoryInput): Promise<FinanceCategory> {
  const snapshot = await getFinanceSnapshot()
  const current = snapshot.categories.find((item) => item.id === categoryId)
  if (!current) throw new Error('Category not found.')
  if (current.isSystem) throw new Error('System categories cannot be changed.')
  const category = {
    ...current,
    ...categoryInputSchema.parse({ ...current, ...input }),
  }
  save({
    ...snapshot,
    categories: snapshot.categories.map((item) =>
      item.id === categoryId ? category : item,
    ),
  })
  return category
}

export async function createRecurringTransaction(
  input: CreateRecurringTransactionInput,
): Promise<RecurringTransaction> {
  const request = recurringTransactionInputSchema.parse(input)
  const snapshot = await getFinanceSnapshot()
  assertRecurringReferences(snapshot, request)
  const timestamp = now()
  const transaction: RecurringTransaction = {
    ...request,
    createdAt: timestamp,
    id: id('recurring'),
    updatedAt: timestamp,
  }
  save({
    ...snapshot,
    recurringTransactions: [transaction, ...snapshot.recurringTransactions],
  })
  return transaction
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
  assertRecurringReferences(snapshot, request)
  const transaction = { ...current, ...request, updatedAt: now() }
  save({
    ...snapshot,
    recurringTransactions: snapshot.recurringTransactions.map((item) =>
      item.id === recurringTransactionId ? transaction : item,
    ),
  })
  return transaction
}

export async function createSavingsGoal(
  input: CreateSavingsGoalInput,
): Promise<SavingsGoal> {
  const request = savingsGoalInputSchema.parse(input)
  const timestamp = now()
  const goal: SavingsGoal = {
    ...request,
    createdAt: timestamp,
    id: id('savings-goal'),
    status:
      request.currentAmount >= request.targetAmount &&
      request.status === 'active'
        ? 'completed'
        : request.status,
    updatedAt: timestamp,
  }
  const snapshot = await getFinanceSnapshot()
  save({ ...snapshot, savingsGoals: [goal, ...snapshot.savingsGoals] })
  return goal
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
  const goal = {
    ...current,
    ...request,
    status:
      request.currentAmount >= request.targetAmount &&
      request.status === 'active'
        ? 'completed'
        : request.status,
    updatedAt: now(),
  }
  save({
    ...snapshot,
    savingsGoals: snapshot.savingsGoals.map((item) =>
      item.id === savingsGoalId ? goal : item,
    ),
  })
  return goal
}
