import {
  Box,
  Button,
  Container,
  Flex,
  HStack,
  Input,
  NativeSelect,
  SimpleGrid,
  Stack,
  Text,
} from '@chakra-ui/react'
import { ListFilter, Pencil, Plus, WalletCards } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog/ConfirmDialog'
import { EmptyState } from '@/components/shared/EmptyState/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState/ErrorState'
import { FilterPopover } from '@/components/shared/FilterPopover/FilterPopover'
import { PageHeader } from '@/components/shared/PageHeader/PageHeader'
import { toast } from '@/components/ui/Toaster/Toaster'
import { AccountFormDialog } from '@/features/finance/components/AccountFormDialog'
import { CategoryFormDialog } from '@/features/finance/components/CategoryFormDialog'
import { FinancePageSkeleton } from '@/features/finance/components/FinancePageSkeleton'
import { RecurringTransactionFormDialog } from '@/features/finance/components/RecurringTransactionFormDialog'
import { SavingsGoalFormDialog } from '@/features/finance/components/SavingsGoalFormDialog'
import { TransactionFormDialog } from '@/features/finance/components/TransactionFormDialog'
import { TransactionList } from '@/features/finance/components/TransactionList'
import {
  useCreateAccount,
  useCreateCategory,
  useCreateRecurringTransaction,
  useCreateSavingsGoal,
  useCreateTransaction,
  useDeleteTransaction,
  useFinanceSnapshot,
  useUpdateAccount,
  useUpdateCategory,
  useUpdateRecurringTransaction,
  useUpdateSavingsGoal,
  useUpdateTransaction,
} from '@/features/finance/hooks/use-finance'
import {
  filterTransactions,
  getAccountBalances,
  getCategorySummaries,
  getMonthlyRecurringCost,
  getMonthlySummaries,
  getRecurringExpensesByCurrency,
  getSavingsGoalProgress,
  getTotalBalancesByCurrency,
  getUpcomingPayments,
} from '@/features/finance/services/finance-calculations'
import type {
  Account,
  FinanceCategory,
  RecurringTransaction,
  SavingsGoal,
  Transaction,
  TransactionListFilters,
} from '@/features/finance/types/finance.types'
import { useSubscriptions } from '@/features/subscriptions/hooks/use-subscriptions'

const sections = [
  'overview',
  'transactions',
  'recurring',
  'savings',
  'accounts',
] as const
type FinanceSection = (typeof sections)[number]

function money(value: number, currency: string) {
  return new Intl.NumberFormat(undefined, {
    currency,
    maximumFractionDigits: 2,
    style: 'currency',
  }).format(value)
}

function dateLabel(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
  }).format(new Date(`${value}T12:00:00`))
}

function MoneyList({
  totals,
}: {
  totals: { currency: string; value: number }[]
}) {
  if (!totals.length)
    return (
      <Text fontSize="lg" fontWeight="semibold">
        —
      </Text>
    )
  return (
    <Stack align="start" gap="0">
      {totals.map((total) => (
        <Text fontSize="lg" fontWeight="semibold" key={total.currency}>
          {money(total.value, total.currency)}
        </Text>
      ))}
    </Stack>
  )
}

function SummaryCard({
  label,
  totals,
}: {
  label: string
  totals: { currency: string; value: number }[]
}) {
  return (
    <Box bg="bg.panel" borderWidth="1px" p="4" rounded="l2">
      <Text color="fg.muted" fontSize="sm">
        {label}
      </Text>
      <Box mt="2">
        <MoneyList totals={totals} />
      </Box>
    </Box>
  )
}

export function FinancePage() {
  const { i18n, t } = useTranslation()
  const financeQuery = useFinanceSnapshot()
  const subscriptionsQuery = useSubscriptions()
  const createAccount = useCreateAccount()
  const updateAccount = useUpdateAccount()
  const createTransaction = useCreateTransaction()
  const updateTransaction = useUpdateTransaction()
  const deleteTransaction = useDeleteTransaction()
  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()
  const createRecurring = useCreateRecurringTransaction()
  const updateRecurring = useUpdateRecurringTransaction()
  const createSavingsGoal = useCreateSavingsGoal()
  const updateSavingsGoal = useUpdateSavingsGoal()
  const [section, setSection] = useState<FinanceSection>('overview')
  const [transactionFilters, setTransactionFilters] =
    useState<TransactionListFilters>({})
  const [accountFormOpen, setAccountFormOpen] = useState(false)
  const [categoryFormOpen, setCategoryFormOpen] = useState(false)
  const [transactionFormOpen, setTransactionFormOpen] = useState(false)
  const [recurringFormOpen, setRecurringFormOpen] = useState(false)
  const [savingsGoalFormOpen, setSavingsGoalFormOpen] = useState(false)
  const [accountToEdit, setAccountToEdit] = useState<Account>()
  const [categoryToEdit, setCategoryToEdit] = useState<FinanceCategory>()
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction>()
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction>()
  const [recurringToEdit, setRecurringToEdit] = useState<RecurringTransaction>()
  const [savingsGoalToEdit, setSavingsGoalToEdit] = useState<SavingsGoal>()

  if (financeQuery.isPending || subscriptionsQuery.isPending)
    return <FinancePageSkeleton />
  if (
    financeQuery.isError ||
    subscriptionsQuery.isError ||
    !financeQuery.data
  ) {
    return (
      <Container maxW="6xl" py={{ base: '8', md: '12' }}>
        <ErrorState
          onRetry={() => {
            void financeQuery.refetch()
            void subscriptionsQuery.refetch()
          }}
        />
      </Container>
    )
  }

  const {
    accounts,
    categories,
    recurringTransactions,
    savingsGoals,
    transactions,
  } = financeQuery.data
  const subscriptions = subscriptionsQuery.data ?? []
  const accountBalances = getAccountBalances(accounts, transactions)
  const totalBalances = getTotalBalancesByCurrency(accounts, transactions)
  const monthlySummaries = getMonthlySummaries(transactions)
  const recurringExpenses = getRecurringExpensesByCurrency(
    recurringTransactions,
    subscriptions,
  )
  const upcomingPayments = getUpcomingPayments(
    recurringTransactions,
    subscriptions,
  )
  const visibleTransactions = filterTransactions(
    transactions,
    transactionFilters,
  )
  const overviewCurrency = monthlySummaries[0]?.currency
  const categorySummaries = getCategorySummaries(
    transactions,
    categories,
    undefined,
    overviewCurrency,
  )
  const latestMonth = new Intl.DateTimeFormat(i18n.language, {
    month: 'long',
    year: 'numeric',
  }).format(new Date())
  const totalBalanceLabel =
    totalBalances.length > 1
      ? t('finance.balanceByCurrency')
      : t('finance.totalBalance')
  const openTransactionForm = () => {
    setTransactionToEdit(undefined)
    setTransactionFormOpen(true)
  }

  function handleDeleteTransaction() {
    if (!transactionToDelete) return
    deleteTransaction.mutate(transactionToDelete.id, {
      onError: () => toast.error({ title: t('finance.deleteError') }),
      onSuccess: () => {
        setTransactionToDelete(undefined)
        toast.success({ title: t('finance.transactionDeleted') })
      },
    })
  }

  function renderOverview() {
    return (
      <Stack gap={{ base: '5', md: '6' }}>
        <SimpleGrid columns={{ base: 2, lg: 4 }} gap="3">
          <SummaryCard label={totalBalanceLabel} totals={totalBalances} />
          <SummaryCard
            label={t('finance.incomeThisMonth')}
            totals={monthlySummaries.map((item) => ({
              currency: item.currency,
              value: item.income,
            }))}
          />
          <SummaryCard
            label={t('finance.expensesThisMonth')}
            totals={monthlySummaries.map((item) => ({
              currency: item.currency,
              value: item.expenses,
            }))}
          />
          <SummaryCard
            label={t('finance.netThisMonth')}
            totals={monthlySummaries.map((item) => ({
              currency: item.currency,
              value: item.net,
            }))}
          />
        </SimpleGrid>
        <SimpleGrid columns={{ base: 1, lg: 2 }} gap="4">
          <Box
            bg="bg.panel"
            borderWidth="1px"
            p={{ base: '4', md: '5' }}
            rounded="l2"
          >
            <Flex align="center" justify="space-between">
              <Text fontWeight="semibold">
                {t('finance.monthlySummary', { month: latestMonth })}
              </Text>
              <Button
                onClick={() => setSection('transactions')}
                size="sm"
                variant="ghost"
              >
                {t('finance.viewTransactions')}
              </Button>
            </Flex>
            {monthlySummaries.length ? (
              <Stack gap="3" mt="4">
                {monthlySummaries.map((summary) => (
                  <Flex
                    align="center"
                    justify="space-between"
                    key={summary.currency}
                  >
                    <Stack gap="0">
                      <Text fontWeight="medium">{summary.currency}</Text>
                      <Text color="fg.muted" fontSize="sm">
                        {t('finance.incomeExpenseSummary', {
                          expenses: money(summary.expenses, summary.currency),
                          income: money(summary.income, summary.currency),
                        })}
                      </Text>
                    </Stack>
                    <Text
                      color={summary.net >= 0 ? 'success.fg' : 'danger.fg'}
                      fontWeight="semibold"
                    >
                      {summary.net >= 0 ? '+' : '−'}
                      {money(Math.abs(summary.net), summary.currency)}
                    </Text>
                  </Flex>
                ))}
              </Stack>
            ) : (
              <EmptyState
                description={t('finance.noMonthlySummaryDescription')}
                title={t('finance.noMonthlySummary')}
              />
            )}
          </Box>
          <Box
            bg="bg.panel"
            borderWidth="1px"
            p={{ base: '4', md: '5' }}
            rounded="l2"
          >
            <Flex align="center" justify="space-between">
              <Text fontWeight="semibold">{t('finance.upcomingPayments')}</Text>
              <Button
                onClick={() => setSection('recurring')}
                size="sm"
                variant="ghost"
              >
                {t('finance.viewRecurring')}
              </Button>
            </Flex>
            {upcomingPayments.length ? (
              <Stack gap="3" mt="4">
                {upcomingPayments.slice(0, 5).map((payment) => (
                  <Flex align="center" justify="space-between" key={payment.id}>
                    <Stack gap="0">
                      <Text fontWeight="medium">{payment.title}</Text>
                      <Text color="fg.muted" fontSize="sm">
                        {dateLabel(payment.date, i18n.language)} ·{' '}
                        {t(`finance.paymentSources.${payment.source}`)}
                      </Text>
                    </Stack>
                    <Text fontWeight="semibold">
                      {money(payment.amount, payment.currency)}
                    </Text>
                  </Flex>
                ))}
              </Stack>
            ) : (
              <EmptyState
                description={t('finance.noUpcomingPaymentsDescription')}
                title={t('finance.noUpcomingPayments')}
              />
            )}
          </Box>
        </SimpleGrid>
        <SimpleGrid columns={{ base: 1, lg: 2 }} gap="4">
          <Box
            bg="bg.panel"
            borderWidth="1px"
            p={{ base: '4', md: '5' }}
            rounded="l2"
          >
            <Text fontWeight="semibold">{t('finance.spendingByCategory')}</Text>
            {categorySummaries.length ? (
              <Stack gap="3" mt="4">
                {categorySummaries.slice(0, 5).map((category) => (
                  <Stack gap="1" key={category.categoryId ?? 'uncategorized'}>
                    <Flex fontSize="sm" justify="space-between">
                      <Text>{category.name}</Text>
                      <Text color="fg.muted">
                        {money(category.total, overviewCurrency ?? 'MAD')} ·{' '}
                        {category.percentage}%
                      </Text>
                    </Flex>
                    <Box bg="bg.subtle" h="2" overflow="hidden" rounded="full">
                      <Box
                        bg="brand.solid"
                        h="full"
                        w={`${category.percentage}%`}
                      />
                    </Box>
                  </Stack>
                ))}
              </Stack>
            ) : (
              <EmptyState
                description={t('finance.noCategorySummaryDescription')}
                title={t('finance.noCategorySummary')}
              />
            )}
          </Box>
          <Box
            bg="bg.panel"
            borderWidth="1px"
            p={{ base: '4', md: '5' }}
            rounded="l2"
          >
            <Flex align="center" justify="space-between">
              <Text fontWeight="semibold">{t('finance.savingsProgress')}</Text>
              <Button
                onClick={() => setSection('savings')}
                size="sm"
                variant="ghost"
              >
                {t('finance.viewSavings')}
              </Button>
            </Flex>
            {savingsGoals.length ? (
              <Stack gap="3" mt="4">
                {savingsGoals.slice(0, 4).map((goal) => {
                  const progress = getSavingsGoalProgress(goal)
                  return (
                    <Stack gap="1" key={goal.id}>
                      <Flex fontSize="sm" justify="space-between">
                        <Text>{goal.name}</Text>
                        <Text color="fg.muted">{progress.percentage}%</Text>
                      </Flex>
                      <Box
                        aria-label={t('finance.savingsProgressLabel', {
                          name: goal.name,
                          percentage: progress.percentage,
                        })}
                        bg="bg.subtle"
                        h="2"
                        role="progressbar"
                        rounded="full"
                      >
                        <Box
                          bg={
                            progress.isComplete
                              ? 'success.solid'
                              : 'brand.solid'
                          }
                          h="full"
                          w={`${progress.percentage}%`}
                        />
                      </Box>
                      <Text color="fg.muted" fontSize="xs">
                        {money(goal.currentAmount, goal.currency)} /{' '}
                        {money(goal.targetAmount, goal.currency)}
                      </Text>
                    </Stack>
                  )
                })}
              </Stack>
            ) : (
              <EmptyState
                description={t('finance.noSavingsDescription')}
                title={t('finance.noSavings')}
              />
            )}
          </Box>
        </SimpleGrid>
        <Box bg="bg.subtle" borderWidth="1px" p="4" rounded="l2">
          <Text color="fg.muted" fontSize="sm">
            {recurringExpenses.length
              ? t('finance.recurringInsight', {
                  amount: recurringExpenses
                    .map((item) => money(item.value, item.currency))
                    .join(' · '),
                })
              : t('finance.noRecurringInsight')}
          </Text>
        </Box>
      </Stack>
    )
  }

  function renderTransactions() {
    return (
      <Stack gap="4">
        <Flex
          align={{ base: 'stretch', md: 'center' }}
          direction={{ base: 'column', md: 'row' }}
          gap="3"
          justify="space-between"
        >
          <Input
            aria-label={t('finance.searchTransactions')}
            maxW="sm"
            onChange={(event) =>
              setTransactionFilters((current) => ({
                ...current,
                search: event.target.value,
              }))
            }
            placeholder={t('finance.searchPlaceholder')}
            value={transactionFilters.search ?? ''}
          />
          <FilterPopover
            clearLabel={t('finance.clearFilters')}
            onClear={() => setTransactionFilters({})}
            title={t('finance.filters')}
            trigger={
              <Button
                aria-label={t('finance.filters')}
                size="sm"
                variant="outline"
              >
                <ListFilter aria-hidden="true" size={16} />
                {t('finance.filters')}
              </Button>
            }
          >
            <FieldSelect
              label={t('finance.account')}
              onChange={(value) =>
                setTransactionFilters((current) => ({
                  ...current,
                  accountId: value || undefined,
                }))
              }
              value={transactionFilters.accountId ?? ''}
            >
              <option value="">{t('finance.allAccounts')}</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </FieldSelect>
            <FieldSelect
              label={t('finance.category')}
              onChange={(value) =>
                setTransactionFilters((current) => ({
                  ...current,
                  categoryId: value || undefined,
                }))
              }
              value={transactionFilters.categoryId ?? ''}
            >
              <option value="">{t('finance.allCategories')}</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </FieldSelect>
            <FieldSelect
              label={t('finance.transactionType')}
              onChange={(value) =>
                setTransactionFilters((current) => ({
                  ...current,
                  type: (value || undefined) as TransactionListFilters['type'],
                }))
              }
              value={transactionFilters.type ?? ''}
            >
              <option value="">{t('finance.allTypes')}</option>
              {['expense', 'income', 'transfer'].map((type) => (
                <option key={type} value={type}>
                  {t(`finance.types.${type}`)}
                </option>
              ))}
            </FieldSelect>
            <Input
              aria-label={t('finance.fromDate')}
              onChange={(event) =>
                setTransactionFilters((current) => ({
                  ...current,
                  from: event.target.value || undefined,
                }))
              }
              type="date"
              value={transactionFilters.from ?? ''}
            />
            <Input
              aria-label={t('finance.toDate')}
              onChange={(event) =>
                setTransactionFilters((current) => ({
                  ...current,
                  to: event.target.value || undefined,
                }))
              }
              type="date"
              value={transactionFilters.to ?? ''}
            />
          </FilterPopover>
        </Flex>
        {visibleTransactions.length ? (
          <TransactionList
            accounts={accounts}
            categories={categories}
            onDelete={setTransactionToDelete}
            onEdit={(transaction) => {
              setTransactionToEdit(transaction)
              setTransactionFormOpen(true)
            }}
            transactions={visibleTransactions}
          />
        ) : (
          <Box bg="bg.panel" borderWidth="1px" rounded="l2">
            <EmptyState
              description={
                transactions.length
                  ? t('finance.noTransactionsFilterDescription')
                  : t('finance.noTransactionsDescription')
              }
              title={
                transactions.length
                  ? t('finance.noTransactionsFilter')
                  : t('finance.noTransactions')
              }
            />
          </Box>
        )}
      </Stack>
    )
  }

  function renderRecurring() {
    return (
      <Stack gap="4">
        <Flex align="center" justify="space-between">
          <Stack gap="0">
            <Text fontWeight="semibold">
              {t('finance.recurringTransactions')}
            </Text>
            <Text color="fg.muted" fontSize="sm">
              {t('finance.subscriptionsIncluded')}
            </Text>
          </Stack>
          <Button
            colorPalette="brand"
            onClick={() => {
              setRecurringToEdit(undefined)
              setRecurringFormOpen(true)
            }}
            size="sm"
          >
            <Plus aria-hidden="true" size={16} />
            {t('finance.addRecurring')}
          </Button>
        </Flex>
        {recurringTransactions.length || subscriptions.length ? (
          <Stack bg="bg.panel" borderWidth="1px" divideY="1px" rounded="l2">
            {recurringTransactions.map((item) => (
              <Flex align="center" gap="3" key={item.id} p="4">
                <Stack flex="1" gap="0">
                  <Text fontWeight="medium">{item.title}</Text>
                  <Text color="fg.muted" fontSize="sm">
                    {t(`finance.types.${item.type}`)} ·{' '}
                    {t(`finance.frequencies.${item.frequency}`)} ·{' '}
                    {t('finance.nextOn', {
                      date: dateLabel(item.nextOccurrenceDate, i18n.language),
                    })}
                  </Text>
                </Stack>
                <Stack align="end" gap="0">
                  <Text fontWeight="semibold">
                    {money(item.amount, item.currency)}
                  </Text>
                  <Text color="fg.muted" fontSize="xs">
                    {t('finance.monthlyEstimate', {
                      amount: money(
                        getMonthlyRecurringCost(item),
                        item.currency,
                      ),
                    })}
                  </Text>
                </Stack>
                <Button
                  aria-label={t('finance.editRecurring')}
                  onClick={() => {
                    setRecurringToEdit(item)
                    setRecurringFormOpen(true)
                  }}
                  size="sm"
                  variant="ghost"
                >
                  <Pencil aria-hidden="true" size={16} />
                </Button>
              </Flex>
            ))}
            {subscriptions.map((item) => (
              <Flex align="center" gap="3" key={item.id} p="4">
                <Stack flex="1" gap="0">
                  <Text fontWeight="medium">{item.name}</Text>
                  <Text color="fg.muted" fontSize="sm">
                    {t('finance.paymentSources.subscription')} ·{' '}
                    {t('finance.nextOn', {
                      date: dateLabel(item.nextBillingDate, i18n.language),
                    })}
                  </Text>
                </Stack>
                <Stack align="end" gap="0">
                  <Text fontWeight="semibold">
                    {money(item.amount, item.currency)}
                  </Text>
                  <Text color="fg.muted" fontSize="xs">
                    {t('finance.subscriptionManaged')}
                  </Text>
                </Stack>
              </Flex>
            ))}
          </Stack>
        ) : (
          <Box bg="bg.panel" borderWidth="1px" rounded="l2">
            <EmptyState
              description={t('finance.noRecurringDescription')}
              title={t('finance.noRecurring')}
            />
          </Box>
        )}
      </Stack>
    )
  }

  function renderSavings() {
    return (
      <Stack gap="4">
        <Flex align="center" justify="space-between">
          <Text fontWeight="semibold">{t('finance.savingsGoals')}</Text>
          <Button
            colorPalette="brand"
            onClick={() => {
              setSavingsGoalToEdit(undefined)
              setSavingsGoalFormOpen(true)
            }}
            size="sm"
          >
            <Plus aria-hidden="true" size={16} />
            {t('finance.addSavingsGoal')}
          </Button>
        </Flex>
        {savingsGoals.length ? (
          <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
            {savingsGoals.map((goal) => {
              const progress = getSavingsGoalProgress(goal)
              return (
                <Box
                  bg="bg.panel"
                  borderWidth="1px"
                  key={goal.id}
                  p="4"
                  rounded="l2"
                >
                  <Flex align="start" justify="space-between">
                    <Stack gap="0">
                      <Text fontWeight="semibold">{goal.name}</Text>
                      <Text color="fg.muted" fontSize="sm">
                        {t(
                          `finance.goalStatuses.${progress.isComplete ? 'completed' : goal.status}`,
                        )}
                      </Text>
                    </Stack>
                    <Button
                      aria-label={t('finance.editSavingsGoal')}
                      onClick={() => {
                        setSavingsGoalToEdit(goal)
                        setSavingsGoalFormOpen(true)
                      }}
                      size="sm"
                      variant="ghost"
                    >
                      <Pencil aria-hidden="true" size={16} />
                    </Button>
                  </Flex>
                  <Box
                    aria-label={t('finance.savingsProgressLabel', {
                      name: goal.name,
                      percentage: progress.percentage,
                    })}
                    bg="bg.subtle"
                    h="2"
                    mt="4"
                    role="progressbar"
                    rounded="full"
                  >
                    <Box
                      bg={progress.isComplete ? 'success.solid' : 'brand.solid'}
                      h="full"
                      w={`${progress.percentage}%`}
                    />
                  </Box>
                  <Flex mt="2" justify="space-between">
                    <Text color="fg.muted" fontSize="sm">
                      {money(goal.currentAmount, goal.currency)} /{' '}
                      {money(goal.targetAmount, goal.currency)}
                    </Text>
                    <Text fontSize="sm" fontWeight="semibold">
                      {progress.percentage}%
                    </Text>
                  </Flex>
                  {goal.targetDate ? (
                    <Text color="fg.muted" fontSize="xs" mt="2">
                      {t('finance.targetOn', {
                        date: dateLabel(goal.targetDate, i18n.language),
                      })}
                    </Text>
                  ) : null}
                </Box>
              )
            })}
          </SimpleGrid>
        ) : (
          <Box bg="bg.panel" borderWidth="1px" rounded="l2">
            <EmptyState
              description={t('finance.noSavingsDescription')}
              title={t('finance.noSavings')}
            />
          </Box>
        )}
      </Stack>
    )
  }

  function renderAccounts() {
    const expenseCategories = categories.filter(
      (category) => category.type === 'expense',
    )
    const incomeCategories = categories.filter(
      (category) => category.type === 'income',
    )
    return (
      <Stack gap="6">
        <Flex align="center" justify="space-between">
          <Text fontWeight="semibold">{t('finance.accounts')}</Text>
          <Button
            colorPalette="brand"
            onClick={() => {
              setAccountToEdit(undefined)
              setAccountFormOpen(true)
            }}
            size="sm"
          >
            <Plus aria-hidden="true" size={16} />
            {t('finance.addAccount')}
          </Button>
        </Flex>
        {accountBalances.length ? (
          <Stack bg="bg.panel" borderWidth="1px" divideY="1px" rounded="l2">
            {accountBalances.map((account) => (
              <Flex align="center" gap="3" key={account.id} p="4">
                <Box bg="bg.subtle" color="fg.muted" p="2" rounded="l1">
                  <WalletCards aria-hidden="true" size={18} />
                </Box>
                <Stack flex="1" gap="0">
                  <Text fontWeight="medium">{account.name}</Text>
                  <Text color="fg.muted" fontSize="sm">
                    {t(`finance.accountTypes.${account.type}`)} ·{' '}
                    {account.currency}
                    {account.isArchived ? ` · ${t('finance.archived')}` : ''}
                  </Text>
                </Stack>
                <Text fontWeight="semibold">
                  {money(account.currentBalance, account.currency)}
                </Text>
                <Button
                  aria-label={t('finance.editAccount')}
                  onClick={() => {
                    setAccountToEdit(account)
                    setAccountFormOpen(true)
                  }}
                  size="sm"
                  variant="ghost"
                >
                  <Pencil aria-hidden="true" size={16} />
                </Button>
                <Button
                  onClick={() =>
                    updateAccount.mutate(
                      {
                        accountId: account.id,
                        isArchived: !account.isArchived,
                      },
                      {
                        onError: () =>
                          toast.error({ title: t('finance.updateError') }),
                      },
                    )
                  }
                  size="sm"
                  variant="outline"
                >
                  {account.isArchived
                    ? t('finance.restore')
                    : t('finance.archive')}
                </Button>
              </Flex>
            ))}
          </Stack>
        ) : (
          <Box bg="bg.panel" borderWidth="1px" rounded="l2">
            <EmptyState
              description={t('finance.noAccountsDescription')}
              title={t('finance.noAccounts')}
            />
          </Box>
        )}
        <Flex align="center" justify="space-between">
          <Stack gap="0">
            <Text fontWeight="semibold">{t('finance.categories')}</Text>
            <Text color="fg.muted" fontSize="sm">
              {t('finance.categoriesDescription')}
            </Text>
          </Stack>
          <Button
            onClick={() => {
              setCategoryToEdit(undefined)
              setCategoryFormOpen(true)
            }}
            size="sm"
            variant="outline"
          >
            <Plus aria-hidden="true" size={16} />
            {t('finance.addCategory')}
          </Button>
        </Flex>
        <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
          {(
            [
              { label: t('finance.types.expense'), items: expenseCategories },
              { label: t('finance.types.income'), items: incomeCategories },
            ] as const
          ).map((group) => (
            <Box
              bg="bg.panel"
              borderWidth="1px"
              key={group.label}
              p="4"
              rounded="l2"
            >
              <Text fontWeight="semibold">{group.label}</Text>
              <Stack gap="1" mt="3">
                {group.items.map((category) => (
                  <Flex
                    align="center"
                    justify="space-between"
                    key={category.id}
                  >
                    <Text fontSize="sm">{category.name}</Text>
                    {!category.isSystem ? (
                      <Button
                        aria-label={t('finance.editCategory')}
                        onClick={() => {
                          setCategoryToEdit(category)
                          setCategoryFormOpen(true)
                        }}
                        size="xs"
                        variant="ghost"
                      >
                        <Pencil aria-hidden="true" size={14} />
                      </Button>
                    ) : null}
                  </Flex>
                ))}
              </Stack>
            </Box>
          ))}
        </SimpleGrid>
      </Stack>
    )
  }

  return (
    <Container maxW="6xl" py={{ base: '6', md: '10' }}>
      <Stack gap={{ base: '5', md: '7' }}>
        <PageHeader
          actions={
            <Button
              colorPalette="brand"
              disabled={!accounts.some((account) => !account.isArchived)}
              onClick={openTransactionForm}
            >
              <Plus aria-hidden="true" size={18} />
              {t('finance.addTransaction')}
            </Button>
          }
          description={t('finance.description')}
          eyebrow={t('finance.eyebrow')}
          title={t('finance.title')}
        />
        <HStack gap="1" overflowX="auto" pb="1">
          {sections.map((item) => (
            <Button
              colorPalette={section === item ? 'brand' : undefined}
              key={item}
              onClick={() => setSection(item)}
              size="sm"
              variant={section === item ? 'subtle' : 'ghost'}
            >
              {t(`finance.sections.${item}`)}
            </Button>
          ))}
        </HStack>
        {section === 'overview' ? renderOverview() : null}
        {section === 'transactions' ? renderTransactions() : null}
        {section === 'recurring' ? renderRecurring() : null}
        {section === 'savings' ? renderSavings() : null}
        {section === 'accounts' ? renderAccounts() : null}
      </Stack>
      <AccountFormDialog
        account={accountToEdit}
        isSubmitting={createAccount.isPending || updateAccount.isPending}
        onOpenChange={(open) => {
          setAccountFormOpen(open)
          if (!open) setAccountToEdit(undefined)
        }}
        onSubmit={(input) => {
          const complete = () => {
            setAccountFormOpen(false)
            setAccountToEdit(undefined)
          }
          if (accountToEdit)
            updateAccount.mutate(
              { ...input, accountId: accountToEdit.id },
              {
                onError: () => toast.error({ title: t('finance.updateError') }),
                onSuccess: complete,
              },
            )
          else
            createAccount.mutate(input, {
              onError: () => toast.error({ title: t('finance.createError') }),
              onSuccess: complete,
            })
        }}
        open={accountFormOpen}
      />
      <CategoryFormDialog
        category={categoryToEdit}
        isSubmitting={createCategory.isPending || updateCategory.isPending}
        onOpenChange={(open) => {
          setCategoryFormOpen(open)
          if (!open) setCategoryToEdit(undefined)
        }}
        onSubmit={(input) => {
          const complete = () => {
            setCategoryFormOpen(false)
            setCategoryToEdit(undefined)
          }
          if (categoryToEdit)
            updateCategory.mutate(
              { ...input, categoryId: categoryToEdit.id },
              {
                onError: () => toast.error({ title: t('finance.updateError') }),
                onSuccess: complete,
              },
            )
          else
            createCategory.mutate(input, {
              onError: () => toast.error({ title: t('finance.createError') }),
              onSuccess: complete,
            })
        }}
        open={categoryFormOpen}
      />
      <TransactionFormDialog
        accounts={accounts}
        categories={categories}
        isSubmitting={
          createTransaction.isPending || updateTransaction.isPending
        }
        onOpenChange={(open) => {
          setTransactionFormOpen(open)
          if (!open) setTransactionToEdit(undefined)
        }}
        onSubmit={(input) => {
          const complete = () => {
            setTransactionFormOpen(false)
            setTransactionToEdit(undefined)
          }
          if (transactionToEdit)
            updateTransaction.mutate(
              { ...input, transactionId: transactionToEdit.id },
              {
                onError: () => toast.error({ title: t('finance.updateError') }),
                onSuccess: complete,
              },
            )
          else
            createTransaction.mutate(input, {
              onError: () => toast.error({ title: t('finance.createError') }),
              onSuccess: complete,
            })
        }}
        open={transactionFormOpen}
        transaction={transactionToEdit}
      />
      <RecurringTransactionFormDialog
        accounts={accounts}
        categories={categories}
        isSubmitting={createRecurring.isPending || updateRecurring.isPending}
        onOpenChange={(open) => {
          setRecurringFormOpen(open)
          if (!open) setRecurringToEdit(undefined)
        }}
        onSubmit={(input) => {
          const complete = () => {
            setRecurringFormOpen(false)
            setRecurringToEdit(undefined)
          }
          if (recurringToEdit)
            updateRecurring.mutate(
              { ...input, recurringTransactionId: recurringToEdit.id },
              {
                onError: () => toast.error({ title: t('finance.updateError') }),
                onSuccess: complete,
              },
            )
          else
            createRecurring.mutate(input, {
              onError: () => toast.error({ title: t('finance.createError') }),
              onSuccess: complete,
            })
        }}
        open={recurringFormOpen}
        recurringTransaction={recurringToEdit}
      />
      <SavingsGoalFormDialog
        isSubmitting={
          createSavingsGoal.isPending || updateSavingsGoal.isPending
        }
        onOpenChange={(open) => {
          setSavingsGoalFormOpen(open)
          if (!open) setSavingsGoalToEdit(undefined)
        }}
        onSubmit={(input) => {
          const complete = () => {
            setSavingsGoalFormOpen(false)
            setSavingsGoalToEdit(undefined)
          }
          if (savingsGoalToEdit)
            updateSavingsGoal.mutate(
              { ...input, savingsGoalId: savingsGoalToEdit.id },
              {
                onError: () => toast.error({ title: t('finance.updateError') }),
                onSuccess: complete,
              },
            )
          else
            createSavingsGoal.mutate(input, {
              onError: () => toast.error({ title: t('finance.createError') }),
              onSuccess: complete,
            })
        }}
        open={savingsGoalFormOpen}
        savingsGoal={savingsGoalToEdit}
      />
      <ConfirmDialog
        confirmLabel={t('finance.deleteTransaction')}
        description={t('finance.deleteTransactionDescription', {
          title: transactionToDelete?.title ?? '',
        })}
        isConfirming={deleteTransaction.isPending}
        isDestructive
        onConfirm={handleDeleteTransaction}
        onOpenChange={(open) => {
          if (!open) setTransactionToDelete(undefined)
        }}
        open={Boolean(transactionToDelete)}
        title={t('finance.deleteTransaction')}
      />
    </Container>
  )
}

function FieldSelect({
  children,
  label,
  onChange,
  value,
}: {
  children: React.ReactNode
  label: string
  onChange: (value: string) => void
  value: string
}) {
  return (
    <Stack gap="1">
      <Text fontSize="sm">{label}</Text>
      <NativeSelect.Root>
        <NativeSelect.Field
          onChange={(event) => onChange(event.target.value)}
          value={value}
        >
          {children}
        </NativeSelect.Field>
        <NativeSelect.Indicator />
      </NativeSelect.Root>
    </Stack>
  )
}
