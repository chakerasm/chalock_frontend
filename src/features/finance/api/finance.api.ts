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
import { parseApiJson } from '@/lib/api/response'

async function parseResponse<T>(
  response: Response | Promise<Response>,
  schema: { parse: (data: unknown) => T },
): Promise<T> {
  return parseApiJson(response, schema)
}

function jsonRequest(method: 'PATCH' | 'POST', body: unknown) {
  return {
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
    method,
  }
}

export type FinanceSnapshotResources = {
  accounts?: boolean
  categories?: boolean
  recurringTransactions?: boolean
  savingsGoals?: boolean
  transactions?: boolean
}

const allResources: Required<FinanceSnapshotResources> = {
  accounts: true,
  categories: true,
  recurringTransactions: true,
  savingsGoals: true,
  transactions: true,
}

export async function getFinanceSnapshotFromAPI(
  resources: FinanceSnapshotResources = allResources,
) {
  const enabled = { ...allResources, ...resources }
  const [
    accounts,
    categories,
    recurringTransactions,
    savingsGoals,
    transactions,
  ] = await Promise.all([
    enabled.accounts
      ? parseResponse(apiFetch('/api/accounts'), accountsListResponseSchema)
      : Promise.resolve({ data: [] }),
    enabled.categories
      ? parseResponse(
          apiFetch('/api/finance/categories'),
          financeCategoriesListResponseSchema,
        )
      : Promise.resolve({ data: [] }),
    enabled.recurringTransactions
      ? parseResponse(
          apiFetch('/api/recurring-transactions'),
          recurringTransactionsListResponseSchema,
        )
      : Promise.resolve({ data: [] }),
    enabled.savingsGoals
      ? parseResponse(
          apiFetch('/api/savings-goals'),
          savingsGoalsListResponseSchema,
        )
      : Promise.resolve({ data: [] }),
    enabled.transactions
      ? parseResponse(
          apiFetch('/api/transactions'),
          transactionsListResponseSchema,
        )
      : Promise.resolve({ data: [] }),
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

const upcomingPaymentFromAPISchema = z
  .object({
    amount: z.number().optional(),
    currency: z.string().length(3).optional(),
    date: z.string().date().optional(),
    dueDate: z.string().date().optional(),
    id: z.string().optional(),
    nextBillingDate: z.string().date().optional(),
    nextOccurrenceDate: z.string().date().optional(),
    source: z.enum(['recurring', 'subscription']).optional(),
    title: z.string().optional(),
    type: z.string().optional(),
  })
  .passthrough()

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
          categoryId: z.string().optional().default('uncategorized'),
          name: z.string(),
          amount: z.number(),
        }),
      ),
    }),
  ),
  // The summary contract guarantees this collection, but does not prescribe
  // the projection shape of an individual upcoming payment.
  upcomingPayments: z.array(upcomingPaymentFromAPISchema).default([]),
})

const financeSummaryResponseSchema = z.union([
  financeSummarySchema,
  z.object({ data: financeSummarySchema }).transform(({ data }) => data),
])

function mapFinanceSummaryFromAPI(
  summary: z.infer<typeof financeSummarySchema>,
): FinanceSummary {
  return {
    ...summary,
    upcomingPayments: summary.upcomingPayments.flatMap((payment) => {
      const date =
        payment.date ??
        payment.dueDate ??
        payment.nextBillingDate ??
        payment.nextOccurrenceDate

      if (
        !payment.id ||
        !payment.title ||
        payment.amount === undefined ||
        !payment.currency ||
        !date
      ) {
        return []
      }

      return [
        {
          amount: payment.amount,
          currency: payment.currency,
          date,
          id: payment.id,
          source:
            payment.source ??
            (payment.type === 'subscription' ? 'subscription' : 'recurring'),
          title: payment.title,
        },
      ]
    }),
  }
}

export async function getFinanceSummaryFromAPI(
  from: string,
  to: string,
): Promise<FinanceSummary> {
  const query = new URLSearchParams({ from, to })
  const summary = await parseResponse(
    apiFetch(`/api/finance/summary?${query}`),
    financeSummaryResponseSchema,
  )

  return mapFinanceSummaryFromAPI(summary)
}