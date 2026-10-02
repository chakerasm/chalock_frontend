import { z } from 'zod'
import {
  accountFromAPISchema,
  accountsListResponseSchema,
  financeCategoriesListResponseSchema,
  financeCategoryFromAPISchema,
  recurringTransactionFromAPISchema,
  recurringTransactionsListResponseSchema,
  savingsGoalFromAPISchema,
  savingsGoalsListResponseSchema,
  transactionFromAPISchema,
  transactionsListResponseSchema,
} from '@/features/finance/schemas/finance.schemas'
import type {
  CreateAccountInput,
  CreateCategoryInput,
  CreateRecurringTransactionInput,
  CreateSavingsGoalInput,
  CreateTransactionInput,
  FinanceSummary,
  UpdateAccountInput,
  UpdateCategoryInput,
  UpdateRecurringTransactionInput,
  UpdateSavingsGoalInput,
  UpdateTransactionInput,
} from '@/features/finance/types/finance.types'
import { apiFetch } from '@/lib/api/client'

async function parseResponse<T>(
  response: Response | Promise<Response>,
  schema: { parse: (data: unknown) => T },
): Promise<T> {
  return schema.parse(await (await response).json())
}

function jsonRequest(method: 'PATCH' | 'POST', body: unknown) {
  return {
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
    method,
  }
}

export async function getFinanceSnapshotFromAPI() {
  const [
    accounts,
    categories,
    recurringTransactions,
    savingsGoals,
    transactions,
  ] = await Promise.all([
    parseResponse(await apiFetch('/api/accounts'), accountsListResponseSchema),
    parseResponse(
      await apiFetch('/api/finance/categories'),
      financeCategoriesListResponseSchema,
    ),
    parseResponse(
      await apiFetch('/api/recurring-transactions'),
      recurringTransactionsListResponseSchema,
    ),
    parseResponse(
      await apiFetch('/api/savings-goals'),
      savingsGoalsListResponseSchema,
    ),
    parseResponse(
      await apiFetch('/api/transactions'),
      transactionsListResponseSchema,
    ),
  ])

  return {
    accounts: accounts.data,
    categories: categories.data,
    recurringTransactions: recurringTransactions.data,
    savingsGoals: savingsGoals.data,
    transactions: transactions.data,
  }
}

export function createAccountFromAPI(input: CreateAccountInput) {
  return parseResponse(
    apiFetch('/api/accounts', jsonRequest('POST', input)),
    accountFromAPISchema,
  )
}

export function updateAccountFromAPI({
  accountId,
  ...input
}: UpdateAccountInput) {
  return parseResponse(
    apiFetch(
      `/api/accounts/${encodeURIComponent(accountId)}`,
      jsonRequest('PATCH', input),
    ),
    accountFromAPISchema,
  )
}

export function createTransactionFromAPI(input: CreateTransactionInput) {
  return parseResponse(
    apiFetch('/api/transactions', jsonRequest('POST', input)),
    transactionFromAPISchema,
  )
}

export function updateTransactionFromAPI({
  transactionId,
  ...input
}: UpdateTransactionInput) {
  return parseResponse(
    apiFetch(
      `/api/transactions/${encodeURIComponent(transactionId)}`,
      jsonRequest('PATCH', input),
    ),
    transactionFromAPISchema,
  )
}

export async function deleteTransactionFromAPI(transactionId: string) {
  await apiFetch(`/api/transactions/${encodeURIComponent(transactionId)}`, {
    method: 'DELETE',
  })
}

export function createCategoryFromAPI(input: CreateCategoryInput) {
  return parseResponse(
    apiFetch('/api/finance/categories', jsonRequest('POST', input)),
    financeCategoryFromAPISchema,
  )
}

export function updateCategoryFromAPI({
  categoryId,
  ...input
}: UpdateCategoryInput) {
  return parseResponse(
    apiFetch(
      `/api/finance/categories/${encodeURIComponent(categoryId)}`,
      jsonRequest('PATCH', input),
    ),
    financeCategoryFromAPISchema,
  )
}

export function createRecurringTransactionFromAPI(
  input: CreateRecurringTransactionInput,
) {
  return parseResponse(
    apiFetch('/api/recurring-transactions', jsonRequest('POST', input)),
    recurringTransactionFromAPISchema,
  )
}

export function updateRecurringTransactionFromAPI({
  recurringTransactionId,
  ...input
}: UpdateRecurringTransactionInput) {
  return parseResponse(
    apiFetch(
      `/api/recurring-transactions/${encodeURIComponent(recurringTransactionId)}`,
      jsonRequest('PATCH', input),
    ),
    recurringTransactionFromAPISchema,
  )
}

export function createSavingsGoalFromAPI(input: CreateSavingsGoalInput) {
  return parseResponse(
    apiFetch('/api/savings-goals', jsonRequest('POST', input)),
    savingsGoalFromAPISchema,
  )
}

export function updateSavingsGoalFromAPI({
  savingsGoalId,
  ...input
}: UpdateSavingsGoalInput) {
  return parseResponse(
    apiFetch(
      `/api/savings-goals/${encodeURIComponent(savingsGoalId)}`,
      jsonRequest('PATCH', input),
    ),
    savingsGoalFromAPISchema,
  )
}

const financeSummarySchema = z.object({
  from: z.string().date(),
  to: z.string().date(),
  byCurrency: z.array(
    z.object({
      currency: z.string().length(3),
      income: z.number(),
      expenses: z.number(),
      net: z.number(),
      recurringExpenses: z.number(),
      topExpenseCategories: z.array(
        z.object({
          categoryId: z.string(),
          name: z.string(),
          amount: z.number(),
        }),
      ),
    }),
  ),
  upcomingPayments: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      amount: z.number(),
      currency: z.string().length(3),
      date: z.string().date(),
      source: z.enum(['recurring', 'subscription']),
    }),
  ),
})

export function getFinanceSummaryFromAPI(
  from: string,
  to: string,
): Promise<FinanceSummary> {
  const query = new URLSearchParams({ from, to })
  return parseResponse(
    apiFetch(`/api/finance/summary?${query}`),
    financeSummarySchema,
  )
}
