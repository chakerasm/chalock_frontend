import { describe, expect, it } from 'vitest'
import type {
  Account,
  FinanceCategory,
  RecurringTransaction,
  SavingsGoal,
  Transaction,
} from '@/features/finance/types/finance.types'
import {
  getAccountBalances,
  getCategorySummaries,
  getMonthlyRecurringCost,
  getMonthlySummaries,
  getSavingsGoalProgress,
  getTotalBalancesByCurrency,
} from './finance-calculations'

const account = (
  id: string,
  currency = 'MAD',
  openingBalance = 0,
): Account => ({
  createdAt: '2026-09-01T00:00:00.000Z',
  currency,
  id,
  isArchived: false,
  name: id,
  openingBalance,
  type: 'checking',
  updatedAt: '2026-09-01T00:00:00.000Z',
})

const transaction = (overrides: Partial<Transaction>): Transaction => ({
  accountId: 'checking',
  amount: 100,
  createdAt: '2026-09-01T00:00:00.000Z',
  currency: 'MAD',
  id: 'transaction',
  title: 'Example',
  transactionDate: '2026-09-10',
  type: 'expense',
  updatedAt: '2026-09-01T00:00:00.000Z',
  ...overrides,
})

describe('finance calculations', () => {
  it('derives account balances and keeps transfers out of total net worth', () => {
    const accounts = [
      account('checking', 'MAD', 1_000),
      account('savings', 'MAD', 500),
    ]
    const transactions = [
      transaction({ type: 'income', amount: 800 }),
      transaction({ type: 'expense', amount: 250 }),
      transaction({
        type: 'transfer',
        amount: 400,
        destinationAccountId: 'savings',
      }),
    ]

    expect(
      getAccountBalances(accounts, transactions).map(
        (item) => item.currentBalance,
      ),
    ).toEqual([1_150, 900])
    expect(getTotalBalancesByCurrency(accounts, transactions)).toEqual([
      { currency: 'MAD', value: 2_050 },
    ])
  })

  it('summarizes only income and expenses within the selected month', () => {
    const summaries = getMonthlySummaries(
      [
        transaction({
          type: 'income',
          amount: 8_500,
          transactionDate: '2026-09-01',
        }),
        transaction({
          type: 'expense',
          amount: 5_420,
          transactionDate: '2026-09-10',
        }),
        transaction({
          type: 'transfer',
          amount: 1_000,
          transactionDate: '2026-09-11',
        }),
        transaction({
          type: 'expense',
          amount: 900,
          transactionDate: '2026-08-30',
        }),
      ],
      '2026-09',
    )

    expect(summaries).toEqual([
      {
        currency: 'MAD',
        expenses: 5_420,
        income: 8_500,
        net: 3_080,
        savings: 3_080,
      },
    ])
  })

  it('ranks categories and includes uncategorized expenses', () => {
    const categories: FinanceCategory[] = [
      { id: 'groceries', isSystem: true, name: 'Groceries', type: 'expense' },
    ]
    const summary = getCategorySummaries(
      [
        transaction({ amount: 950, categoryId: 'groceries' }),
        transaction({ amount: 50, categoryId: undefined }),
      ],
      categories,
      '2026-09',
      'MAD',
    )

    expect(summary).toEqual([
      {
        categoryId: 'groceries',
        name: 'Groceries',
        percentage: 95,
        total: 950,
      },
      {
        categoryId: undefined,
        name: 'Uncategorized',
        percentage: 5,
        total: 50,
      },
    ])
  })

  it('normalizes active recurring schedules into monthly costs', () => {
    const recurring: RecurringTransaction = {
      accountId: 'checking',
      amount: 100,
      createdAt: '2026-09-01T00:00:00.000Z',
      currency: 'MAD',
      frequency: 'weekly',
      id: 'rent',
      isActive: true,
      nextOccurrenceDate: '2026-09-20',
      title: 'Rent',
      type: 'expense',
      updatedAt: '2026-09-01T00:00:00.000Z',
    }
    expect(getMonthlyRecurringCost(recurring)).toBeCloseTo((100 * 52) / 12)
    expect(
      getMonthlyRecurringCost({ ...recurring, frequency: 'monthly' }),
    ).toBe(100)
    expect(
      getMonthlyRecurringCost({ ...recurring, frequency: 'annual' }),
    ).toBeCloseTo(100 / 12)
    expect(
      getMonthlyRecurringCost({
        ...recurring,
        frequency: 'custom',
        customInterval: { unit: 'month', value: 2 },
      }),
    ).toBeCloseTo(50)
  })

  it('calculates savings goal completion without exceeding 100 percent', () => {
    const goal: SavingsGoal = {
      createdAt: '2026-09-01T00:00:00.000Z',
      currency: 'MAD',
      currentAmount: 120,
      id: 'goal',
      name: 'Emergency fund',
      status: 'active',
      targetAmount: 100,
      updatedAt: '2026-09-01T00:00:00.000Z',
    }
    expect(getSavingsGoalProgress(goal)).toEqual({
      isComplete: true,
      percentage: 100,
      remaining: 0,
    })
  })

  it('keeps incompatible currencies separate', () => {
    expect(
      getTotalBalancesByCurrency(
        [account('mad', 'MAD', 100), account('usd', 'USD', 20)],
        [],
      ),
    ).toEqual([
      { currency: 'MAD', value: 100 },
      { currency: 'USD', value: 20 },
    ])
  })
})
