import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createAccount,
  createCategory,
  createRecurringTransaction,
  createSavingsGoal,
  createTransaction,
  deleteTransaction,
  getFinanceSnapshot,
  getFinanceSummary,
  updateAccount,
  updateCategory,
  updateRecurringTransaction,
  updateSavingsGoal,
  updateTransaction,
} from '@/features/finance/services/finance.service'
import type { FinanceSnapshotResources } from '@/features/finance/api/finance.api'
import type {
  CreateAccountInput,
  CreateCategoryInput,
  CreateRecurringTransactionInput,
  CreateSavingsGoalInput,
  CreateTransactionInput,
  UpdateAccountInput,
  UpdateCategoryInput,
  UpdateRecurringTransactionInput,
  UpdateSavingsGoalInput,
  UpdateTransactionInput,
} from '@/features/finance/types/finance.types'

export const financeQueryKeys = {
  all: ['finance'] as const,
  snapshot: (resources: FinanceSnapshotResources) =>
    ['finance', 'snapshot', resources] as const,
  summary: (from: string, to: string) =>
    ['finance', 'summary', from, to] as const,
}

export function useFinanceSnapshot(
  resources: FinanceSnapshotResources = {},
  enabled = true,
) {
  return useQuery({
    enabled,
    queryFn: () => getFinanceSnapshot(resources),
    queryKey: financeQueryKeys.snapshot(resources),
  })
}

export function useFinanceSummary(from: string, to: string, enabled = true) {
  return useQuery({
    enabled,
    queryKey: financeQueryKeys.summary(from, to),
    queryFn: () => getFinanceSummary(from, to),
  })
}

function useFinanceMutation<T>(mutationFn: (input: T) => Promise<unknown>) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: financeQueryKeys.all }),
  })
}

export const useCreateAccount = () =>
  useFinanceMutation<CreateAccountInput>(createAccount)
export const useUpdateAccount = () =>
  useFinanceMutation<UpdateAccountInput>(updateAccount)
export const useCreateTransaction = () =>
  useFinanceMutation<CreateTransactionInput>(createTransaction)
export const useUpdateTransaction = () =>
  useFinanceMutation<UpdateTransactionInput>(updateTransaction)
export const useDeleteTransaction = () =>
  useFinanceMutation<string>(deleteTransaction)
export const useCreateCategory = () =>
  useFinanceMutation<CreateCategoryInput>(createCategory)
export const useUpdateCategory = () =>
  useFinanceMutation<UpdateCategoryInput>(updateCategory)
export const useCreateRecurringTransaction = () =>
  useFinanceMutation<CreateRecurringTransactionInput>(
    createRecurringTransaction,
  )
export const useUpdateRecurringTransaction = () =>
  useFinanceMutation<UpdateRecurringTransactionInput>(
    updateRecurringTransaction,
  )
export const useCreateSavingsGoal = () =>
  useFinanceMutation<CreateSavingsGoalInput>(createSavingsGoal)
export const useUpdateSavingsGoal = () =>
  useFinanceMutation<UpdateSavingsGoalInput>(updateSavingsGoal)
