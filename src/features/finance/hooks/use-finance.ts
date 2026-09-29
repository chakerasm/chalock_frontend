import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createAccount,
  createCategory,
  createRecurringTransaction,
  createSavingsGoal,
  createTransaction,
  deleteTransaction,
  getFinanceSnapshot,
  updateAccount,
  updateCategory,
  updateRecurringTransaction,
  updateSavingsGoal,
  updateTransaction,
} from '@/features/finance/services/finance.service'
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
  snapshot: ['finance', 'snapshot'] as const,
}

export function useFinanceSnapshot() {
  return useQuery({
    queryFn: getFinanceSnapshot,
    queryKey: financeQueryKeys.snapshot,
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
