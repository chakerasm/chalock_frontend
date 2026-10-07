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
  Table,
  Text,
} from "@chakra-ui/react";
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarClock,
  ChartNoAxesCombined,
  CircleDollarSign,
  ListFilter,
  Pencil,
  Plus,
  WalletCards,
} from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { usePrivacyMode } from "@/app/privacy-mode";
import { PrivateAmount } from "@/components/ui/PrivateAmount/PrivateAmount";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog/ConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState/ErrorState";
import { FilterPopover } from "@/components/shared/FilterPopover/FilterPopover";
import { PageHeader } from "@/components/shared/PageHeader/PageHeader";
import { toast } from "@/components/ui/Toaster/Toaster";
import { AccountFormDialog } from "@/features/finance/components/AccountFormDialog";
import { CategoryFormDialog } from "@/features/finance/components/CategoryFormDialog";
import { FinancePageSkeleton } from "@/features/finance/components/FinancePageSkeleton";
import { RecurringTransactionFormDialog } from "@/features/finance/components/RecurringTransactionFormDialog";
import { SavingsGoalFormDialog } from "@/features/finance/components/SavingsGoalFormDialog";
import { TransactionFormDialog } from "@/features/finance/components/TransactionFormDialog";
import { TransactionList } from "@/features/finance/components/TransactionList";
import {
  useCreateAccount,
  useCreateCategory,
  useCreateRecurringTransaction,
  useCreateSavingsGoal,
  useCreateTransaction,
  useDeleteTransaction,
  useFinanceSnapshot,
  useFinanceSummary,
  useUpdateAccount,
  useUpdateCategory,
  useUpdateRecurringTransaction,
  useUpdateSavingsGoal,
  useUpdateTransaction,
} from "@/features/finance/hooks/use-finance";
import {
  filterTransactions,
  getAccountBalances,
  getMonthlyRecurringCost,
  getMonthlySummaries,
  getSavingsGoalProgress,
  getTotalBalancesByCurrency,
} from "@/features/finance/services/finance-calculations";
import type {
  Account,
  FinanceCategory,
  RecurringTransaction,
  SavingsGoal,
  Transaction,
  TransactionListFilters,
} from "@/features/finance/types/finance.types";
import { useSubscriptions } from "@/features/subscriptions/hooks/use-subscriptions";
import { formatCurrency } from "@/lib/formatters/currency";

const sections = [
  "overview",
  "transactions",
  "recurring",
  "savings",
  "accounts",
] as const;
type FinanceSection = (typeof sections)[number];

const financeSectionRoutes: Record<
  FinanceSection,
  | "/finance"
  | "/finance/transactions"
  | "/finance/recurring"
  | "/finance/savings"
  | "/finance/account"
> = {
  overview: "/finance",
  transactions: "/finance/transactions",
  recurring: "/finance/recurring",
  savings: "/finance/savings",
  accounts: "/finance/account",
};

function money(value: number, currency: string) {
  return formatCurrency(value, currency);
}

function dateLabel(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
  }).format(new Date(`${value}T12:00:00`));
}

function MoneyList({
  totals,
}: {
  totals: { currency: string; value: number }[];
}) {
  if (!totals.length)
    return (
      <Text fontSize="lg" fontWeight="semibold">
        —
      </Text>
    );
  if (totals.length === 0)
    return (
      <Text fontSize="lg" fontWeight="semibold">
        ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â
      </Text>
    );
  return (
    <Stack align="start" gap="0">
      {totals.map((total) => (
        <Text fontSize="lg" fontWeight="semibold" key={total.currency}>
          <PrivateAmount>{money(total.value, total.currency)}</PrivateAmount>
        </Text>
      ))}
    </Stack>
  );
}

function SummaryCard({
  icon,
  iconColor,
  label,
  totals,
}: {
  icon: React.ReactNode;
  iconColor: string;
  label: string;
  totals: { currency: string; value: number }[];
}) {
  return (
    <Box
      bg="bg.panel"
      borderWidth="1px"
      minW="0"
      p={{ base: "3", md: "4" }}
      rounded="l2"
    >
      <HStack align="start" justify="space-between" gap="2">
        <Stack gap="1" minW="0">
          <Text color="fg.muted" fontSize="xs" lineClamp="1">
            {label}
          </Text>
          <MoneyList totals={totals} />
        </Stack>
        <Box bg={iconColor} color="white" p="2" rounded="l1">
          {icon}
        </Box>
      </HStack>
    </Box>
  );
}

type FinancePageProps = { initialSection?: FinanceSection };

export function FinancePage({ initialSection = "overview" }: FinancePageProps) {
  const { i18n, t } = useTranslation();
  const { isPrivacyMode } = usePrivacyMode();
  const defaultCurrency = "MAD";
  const privateAmount = (value: number, currency: string) =>
    isPrivacyMode ? t("app.privacyMode.hiddenAmount") : money(value, currency);
  const navigate = useNavigate();
  const [section, setSection] = useState<FinanceSection>(initialSection);
  function selectSection(nextSection: FinanceSection) {
    setSection(nextSection);
    void navigate({ to: financeSectionRoutes[nextSection] });
  }
  const isOverview = section === "overview";
  const financeQuery = useFinanceSnapshot({
    accounts:
      isOverview ||
      section === "transactions" ||
      section === "recurring" ||
      section === "accounts",
    categories: section === "transactions" || section === "recurring",
    recurringTransactions: section === "recurring",
    savingsGoals: section === "savings",
    transactions: isOverview || section === "transactions",
  });
  const summaryDate = new Date();
  const summaryYear = String(summaryDate.getFullYear());
  const summaryMonth = String(summaryDate.getMonth() + 1).padStart(2, "0");
  const summaryFrom = `${summaryYear}-${summaryMonth}-01`;
  const summaryLastDay = String(
    new Date(
      summaryDate.getFullYear(),
      summaryDate.getMonth() + 1,
      0,
    ).getDate(),
  ).padStart(2, "0");
  const summaryTo = `${summaryYear}-${summaryMonth}-${summaryLastDay}`;
  const financeSummaryQuery = useFinanceSummary(
    summaryFrom,
    summaryTo,
    isOverview,
  );
  const subscriptionsQuery = useSubscriptions({}, section === "recurring");
  const createAccount = useCreateAccount();
  const updateAccount = useUpdateAccount();
  const createTransaction = useCreateTransaction();
  const updateTransaction = useUpdateTransaction();
  const deleteTransaction = useDeleteTransaction();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const createRecurring = useCreateRecurringTransaction();
  const updateRecurring = useUpdateRecurringTransaction();
  const createSavingsGoal = useCreateSavingsGoal();
  const updateSavingsGoal = useUpdateSavingsGoal();
  const [transactionFilters, setTransactionFilters] =
    useState<TransactionListFilters>({});
  const [accountFormOpen, setAccountFormOpen] = useState(false);
  const [categoryFormOpen, setCategoryFormOpen] = useState(false);
  const [transactionFormOpen, setTransactionFormOpen] = useState(false);
  const [recurringFormOpen, setRecurringFormOpen] = useState(false);
  const [savingsGoalFormOpen, setSavingsGoalFormOpen] = useState(false);
  const [accountToEdit, setAccountToEdit] = useState<Account>();
  const [categoryToEdit, setCategoryToEdit] = useState<FinanceCategory>();
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction>();
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction>();
  const [recurringToEdit, setRecurringToEdit] =
    useState<RecurringTransaction>();
  const [savingsGoalToEdit, setSavingsGoalToEdit] = useState<SavingsGoal>();

  if (
    financeQuery.isPending ||
    (isOverview && financeSummaryQuery.isPending) ||
    (section === "recurring" && subscriptionsQuery.isPending)
  )
    return <FinancePageSkeleton />;
  if (
    financeQuery.isError ||
    subscriptionsQuery.isError ||
    (isOverview && financeSummaryQuery.isError) ||
    !financeQuery.data ||
    (isOverview && !financeSummaryQuery.data)
  ) {
    return (
      <Container maxW="6xl" py={{ base: "8", md: "12" }}>
        <ErrorState
          onRetry={() => {
            void financeQuery.refetch();
            void subscriptionsQuery.refetch();
            void financeSummaryQuery.refetch();
          }}
        />
      </Container>
    );
  }

  const financeSummary = financeSummaryQuery.data ?? {
    byCurrency: [],
    from: summaryFrom,
    to: summaryTo,
    upcomingPayments: [],
  };
  const {
    accounts,
    categories,
    recurringTransactions,
    savingsGoals,
    transactions,
  } = financeQuery.data;
  const subscriptions = subscriptionsQuery.data ?? [];
  const accountBalances = getAccountBalances(accounts, transactions);
  const totalBalances = getTotalBalancesByCurrency(accounts, transactions);
  const monthlySummaries = financeSummary.byCurrency.map((item) => ({
    ...item,
    savings: Math.max(0, item.net),
  }));
  const upcomingPayments = financeSummary.upcomingPayments;
  const visibleTransactions = filterTransactions(
    transactions,
    transactionFilters,
  );
  const overviewCurrency =
    monthlySummaries[0]?.currency ?? totalBalances[0]?.currency;
  const monthFormatter = new Intl.DateTimeFormat(i18n.language, {
    month: "short",
  });
  const monthlyChart = Array.from({ length: 6 }, (_, index) => {
    const date = new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() - (5 - index));
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const summary = getMonthlySummaries(transactions, month).find(
      (item) => item.currency === overviewCurrency,
    );
    return {
      expenses: summary?.expenses ?? 0,
      income: summary?.income ?? 0,
      label: monthFormatter.format(date),
    };
  });
  const chartMaximum = Math.max(
    1,
    ...monthlyChart.flatMap((item) => [item.income, item.expenses]),
  );
  const categorySource =
    financeSummary.byCurrency.find((item) => item.currency === overviewCurrency)
      ?.topExpenseCategories ?? [];
  const categoryTotal = categorySource.reduce(
    (total, item) => total + item.amount,
    0,
  );
  const categorySummaries = categorySource.map((item) => ({
    categoryId: item.categoryId,
    name: item.name,
    total: item.amount,
    percentage: categoryTotal ? (item.amount / categoryTotal) * 100 : 0,
  }));
  const latestMonth = new Intl.DateTimeFormat(i18n.language, {
    month: "long",
    year: "numeric",
  }).format(new Date());
  const totalBalanceLabel =
    totalBalances.length > 1
      ? t("finance.balanceByCurrency")
      : t("finance.totalBalance");
  const openTransactionForm = () => {
    setTransactionToEdit(undefined);
    setTransactionFormOpen(true);
  };

  const categoryColors = [
    "var(--chakra-colors-green-500)",
    "var(--chakra-colors-orange-500)",
    "var(--chakra-colors-cyan-500)",
    "var(--chakra-colors-purple-500)",
    "var(--chakra-colors-red-500)",
    "var(--chakra-colors-blue-500)",
  ];
  let categoryOffset = 0;
  const categoryGradient = categorySummaries.length
    ? categorySummaries
        .map((category, index) => {
          const start = categoryOffset;
          categoryOffset += category.percentage;
          return `${categoryColors[index % categoryColors.length]} ${start}% ${categoryOffset}%`;
        })
        .join(", ")
    : "var(--chakra-colors-bg-muted) 0% 100%";

  function handleDeleteTransaction() {
    if (!transactionToDelete) return;
    deleteTransaction.mutate(transactionToDelete.id, {
      onError: () => toast.error({ title: t("finance.deleteError") }),
      onSuccess: () => {
        setTransactionToDelete(undefined);
        toast.success({ title: t("finance.transactionDeleted") });
      },
    });
  }

  function renderOverview() {
    const recentTransactions = filterTransactions(transactions, {}).slice(0, 5);
    const categoryTotal = categorySummaries.reduce(
      (total, category) => total + category.total,
      0,
    );

    return (
      <Stack gap="3">
        <SimpleGrid columns={{ base: 2, lg: 4 }} gap="3">
          <SummaryCard
            icon={<WalletCards aria-hidden="true" size={17} />}
            iconColor="green.600"
            label={totalBalanceLabel}
            totals={totalBalances}
          />
          <SummaryCard
            icon={<ArrowUpRight aria-hidden="true" size={17} />}
            iconColor="teal.600"
            label={t("finance.incomeThisMonth")}
            totals={monthlySummaries.map((item) => ({
              currency: item.currency,
              value: item.income,
            }))}
          />
          <SummaryCard
            icon={<ArrowDownRight aria-hidden="true" size={17} />}
            iconColor="red.600"
            label={t("finance.expensesThisMonth")}
            totals={monthlySummaries.map((item) => ({
              currency: item.currency,
              value: item.expenses,
            }))}
          />
          <SummaryCard
            icon={<CircleDollarSign aria-hidden="true" size={17} />}
            iconColor="purple.600"
            label={t("finance.netThisMonth")}
            totals={monthlySummaries.map((item) => ({
              currency: item.currency,
              value: item.net,
            }))}
          />
        </SimpleGrid>
        <SimpleGrid columns={{ base: 1, xl: 12 }} gap="3">
          <Box
            bg="bg.panel"
            borderWidth="1px"
            gridColumn={{ base: "span 1", xl: "span 7" }}
            minW="0"
            p="4"
            rounded="l2"
          >
            <Flex align="center" justify="space-between" mb="4">
              <Stack gap="0">
                <Text fontSize="sm" fontWeight="semibold">
                  {t("finance.incomeVsExpenses")}
                </Text>
                <Text color="fg.muted" fontSize="xs">
                  {latestMonth} Ãƒâ€šÃ‚Â· {overviewCurrency ?? defaultCurrency}
                </Text>
              </Stack>
              <HStack gap="3">
                <HStack gap="1.5">
                  <Box bg="green.500" boxSize="2" rounded="full" />
                  <Text color="fg.muted" fontSize="xs">
                    {t("finance.types.income")}
                  </Text>
                </HStack>
                <HStack gap="1.5">
                  <Box bg="red.500" boxSize="2" rounded="full" />
                  <Text color="fg.muted" fontSize="xs">
                    {t("finance.types.expense")}
                  </Text>
                </HStack>
              </HStack>
            </Flex>
            {monthlyChart.some((item) => item.income || item.expenses) ? (
              <Flex
                aria-label={t("finance.incomeVsExpenses")}
                as="figure"
                gap="2"
                h="10rem"
                justify="space-between"
                m="0"
                role="img"
              >
                {monthlyChart.map((month) => (
                  <Stack
                    align="center"
                    flex="1"
                    gap="2"
                    h="full"
                    key={month.label}
                  >
                    <HStack align="end" flex="1" gap="1" w="full">
                      <Box
                        aria-label={`${t("finance.types.income")}: ${privateAmount(month.income, overviewCurrency ?? "MAD")}`}
                        bg="green.500"
                        h={`${Math.max(2, (month.income / chartMaximum) * 100)}%`}
                        minH="1px"
                        roundedTop="sm"
                        title={`${t("finance.types.income")}: ${privateAmount(month.income, overviewCurrency ?? "MAD")}`}
                        w="50%"
                      />
                      <Box
                        aria-label={`${t("finance.types.expense")}: ${privateAmount(month.expenses, overviewCurrency ?? "MAD")}`}
                        bg="red.500"
                        h={`${Math.max(2, (month.expenses / chartMaximum) * 100)}%`}
                        minH="1px"
                        roundedTop="sm"
                        title={`${t("finance.types.expense")}: ${privateAmount(month.expenses, overviewCurrency ?? "MAD")}`}
                        w="50%"
                      />
                    </HStack>
                    <Text color="fg.muted" fontSize="2xs">
                      {month.label}
                    </Text>
                  </Stack>
                ))}
              </Flex>
            ) : (
              <EmptyState
                illustrationSrc="/icons/finance.png"
                description={t("finance.noRecentMonthActivityDescription")}
                title={t("finance.noRecentMonthActivity")}
              />
            )}
          </Box>
          <Box
            bg="bg.panel"
            borderWidth="1px"
            gridColumn={{ base: "span 1", xl: "span 5" }}
            minW="0"
            p="4"
            rounded="l2"
          >
            <Text fontSize="sm" fontWeight="semibold">
              {t("finance.spendingByCategory")}
            </Text>
            {categorySummaries.length ? (
              <Flex align="center" gap="4" mt="3" wrap="wrap">
                <Box
                  aria-label={t("finance.spendingByCategory")}
                  aspectRatio="1"
                  background={`conic-gradient(${categoryGradient})`}
                  display="grid"
                  flex="0 0 auto"
                  placeItems="center"
                  role="img"
                  rounded="full"
                  w={{ base: "7rem", md: "8rem" }}
                >
                  <Stack
                    align="center"
                    bg="bg.panel"
                    boxSize={{ base: "5rem", md: "5.75rem" }}
                    gap="0"
                    justify="center"
                    rounded="full"
                  >
                    <Text fontSize="xs" fontWeight="bold">
                      <PrivateAmount>
                        {money(categoryTotal, overviewCurrency ?? "MAD")}
                      </PrivateAmount>
                    </Text>
                    <Text color="fg.muted" fontSize="2xs">
                      {t("finance.types.expense")}
                    </Text>
                  </Stack>
                </Box>
                <Stack flex="1" gap="2" minW="10rem">
                  {categorySummaries.slice(0, 5).map((category, index) => (
                    <Flex
                      align="center"
                      gap="2"
                      justify="space-between"
                      key={category.categoryId ?? "uncategorized"}
                    >
                      <HStack gap="2" minW="0">
                        <Box
                          bg={categoryColors[index % categoryColors.length]}
                          boxSize="2"
                          flex="0 0 auto"
                          rounded="full"
                        />
                        <Text fontSize="xs" lineClamp="1">
                          {category.name}
                        </Text>
                      </HStack>
                      <Text color="fg.muted" fontSize="xs">
                        {category.percentage}%
                      </Text>
                    </Flex>
                  ))}
                </Stack>
              </Flex>
            ) : (
              <EmptyState
                illustrationSrc="/icons/finance.png"
                description={t("finance.noCategorySummaryDescription")}
                title={t("finance.noCategorySummary")}
              />
            )}
          </Box>
        </SimpleGrid>
        <SimpleGrid columns={{ base: 1, xl: 12 }} gap="3">
          <Box
            bg="bg.panel"
            borderWidth="1px"
            gridColumn={{ base: "span 1", xl: "span 7" }}
            minW="0"
            p="4"
            rounded="l2"
          >
            <Flex align="center" justify="space-between" mb="3">
              <Text fontSize="sm" fontWeight="semibold">
                {t("finance.recentTransactions")}
              </Text>
              <Button
                onClick={() => selectSection("transactions")}
                size="xs"
                variant="ghost"
              >
                {t("finance.viewTransactions")}
              </Button>
            </Flex>
            {recentTransactions.length ? (
              <TransactionList
                accounts={accounts}
                categories={categories}
                onDelete={setTransactionToDelete}
                onEdit={(transaction) => {
                  setTransactionToEdit(transaction);
                  setTransactionFormOpen(true);
                }}
                transactions={recentTransactions}
              />
            ) : (
              <EmptyState
                illustrationSrc="/icons/finance.png"
                description={t("finance.noTransactionsDescription")}
                title={t("finance.noTransactions")}
              />
            )}
          </Box>
          <Box
            bg="bg.panel"
            borderWidth="1px"
            gridColumn={{ base: "span 1", xl: "span 5" }}
            minW="0"
            p="4"
            rounded="l2"
          >
            <Flex align="center" justify="space-between" mb="3">
              <HStack gap="2">
                <CalendarClock aria-hidden="true" size={16} />
                <Text fontSize="sm" fontWeight="semibold">
                  {t("finance.upcomingPayments")}
                </Text>
              </HStack>
              <Button
                onClick={() => selectSection("recurring")}
                size="xs"
                variant="ghost"
              >
                {t("finance.viewRecurring")}
              </Button>
            </Flex>
            {upcomingPayments.length ? (
              <Stack divideY="1px" gap="0">
                {upcomingPayments.slice(0, 5).map((payment) => (
                  <Flex
                    align="center"
                    gap="3"
                    justify="space-between"
                    key={payment.id}
                    py="2.5"
                  >
                    <Stack gap="0" minW="0">
                      <Text fontSize="sm" fontWeight="medium" lineClamp="1">
                        {payment.title}
                      </Text>
                      <Text color="fg.muted" fontSize="xs">
                        {dateLabel(payment.date, i18n.language)} Ãƒâ€šÃ‚Â·{" "}
                        {t(`finance.paymentSources.${payment.source}`)}
                      </Text>
                    </Stack>
                    <Text
                      fontSize="sm"
                      fontWeight="semibold"
                      whiteSpace="nowrap"
                    >
                      <PrivateAmount>
                        {money(payment.amount, payment.currency)}
                      </PrivateAmount>
                    </Text>
                  </Flex>
                ))}
              </Stack>
            ) : (
              <EmptyState
                illustrationSrc="/icons/finance.png"
                description={t("finance.noUpcomingPaymentsDescription")}
                title={t("finance.noUpcomingPayments")}
              />
            )}
          </Box>
        </SimpleGrid>
      </Stack>
    );
  }

  function renderTransactions() {
    return (
      <Stack gap="4">
        <Flex
          align={{ base: "stretch", md: "center" }}
          direction={{ base: "column", md: "row" }}
          gap="3"
          justify="space-between"
        >
          <Input
            aria-label={t("finance.searchTransactions")}
            maxW="sm"
            onChange={(event) =>
              setTransactionFilters((current) => ({
                ...current,
                search: event.target.value,
              }))
            }
            placeholder={t("finance.searchPlaceholder")}
            value={transactionFilters.search ?? ""}
          />
          <FilterPopover
            clearLabel={t("finance.clearFilters")}
            onClear={() => setTransactionFilters({})}
            title={t("finance.filters")}
            trigger={
              <Button
                aria-label={t("finance.filters")}
                size="sm"
                variant="outline"
              >
                <ListFilter aria-hidden="true" size={16} />
                {t("finance.filters")}
              </Button>
            }
          >
            <FieldSelect
              label={t("finance.account")}
              onChange={(value) =>
                setTransactionFilters((current) => ({
                  ...current,
                  accountId: value || undefined,
                }))
              }
              value={transactionFilters.accountId ?? ""}
            >
              <option value="">{t("finance.allAccounts")}</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </FieldSelect>
            <FieldSelect
              label={t("finance.category")}
              onChange={(value) =>
                setTransactionFilters((current) => ({
                  ...current,
                  categoryId: value || undefined,
                }))
              }
              value={transactionFilters.categoryId ?? ""}
            >
              <option value="">{t("finance.allCategories")}</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </FieldSelect>
            <FieldSelect
              label={t("finance.transactionType")}
              onChange={(value) =>
                setTransactionFilters((current) => ({
                  ...current,
                  type: (value || undefined) as TransactionListFilters["type"],
                }))
              }
              value={transactionFilters.type ?? ""}
            >
              <option value="">{t("finance.allTypes")}</option>
              {["expense", "income", "transfer"].map((type) => (
                <option key={type} value={type}>
                  {t(`finance.types.${type}`)}
                </option>
              ))}
            </FieldSelect>
            <Input
              aria-label={t("finance.fromDate")}
              onChange={(event) =>
                setTransactionFilters((current) => ({
                  ...current,
                  from: event.target.value || undefined,
                }))
              }
              type="date"
              value={transactionFilters.from ?? ""}
            />
            <Input
              aria-label={t("finance.toDate")}
              onChange={(event) =>
                setTransactionFilters((current) => ({
                  ...current,
                  to: event.target.value || undefined,
                }))
              }
              type="date"
              value={transactionFilters.to ?? ""}
            />
          </FilterPopover>
        </Flex>
        {visibleTransactions.length ? (
          <TransactionList
            accounts={accounts}
            categories={categories}
            onDelete={setTransactionToDelete}
            onEdit={(transaction) => {
              setTransactionToEdit(transaction);
              setTransactionFormOpen(true);
            }}
            transactions={visibleTransactions}
          />
        ) : (
          <Box bg="bg.panel" borderWidth="1px" rounded="l2">
            <EmptyState
              illustrationSrc="/icons/finance.png"
              description={
                transactions.length
                  ? t("finance.noTransactionsFilterDescription")
                  : t("finance.noTransactionsDescription")
              }
              title={
                transactions.length
                  ? t("finance.noTransactionsFilter")
                  : t("finance.noTransactions")
              }
            />
          </Box>
        )}
      </Stack>
    );
  }

  function renderRecurring() {
    return (
      <Stack gap="4">
        <Flex align="center" justify="space-between">
          <Stack gap="0">
            <Text fontWeight="semibold">
              {t("finance.recurringTransactions")}
            </Text>
            <Text color="fg.muted" fontSize="sm">
              {t("finance.subscriptionsIncluded")}
            </Text>
          </Stack>
        </Flex>
        {recurringTransactions.length || subscriptions.length ? (
          <Table.ScrollArea
            borderColor="border.subtle"
            borderWidth="1px"
            rounded="l2"
          >
            <Table.Root minW="54rem" size="sm">
              <Table.Header>
                <Table.Row bg="bg.subtle">
                  <Table.ColumnHeader>
                    {t("finance.titleLabel")}
                  </Table.ColumnHeader>
                  <Table.ColumnHeader>
                    {t("finance.category")}
                  </Table.ColumnHeader>
                  <Table.ColumnHeader>
                    {t("finance.frequency")}
                  </Table.ColumnHeader>
                  <Table.ColumnHeader>
                    {t("finance.nextOccurrence")}
                  </Table.ColumnHeader>
                  <Table.ColumnHeader textAlign="end">
                    {t("finance.amount")}
                  </Table.ColumnHeader>
                  <Table.ColumnHeader>{t("finance.status")}</Table.ColumnHeader>
                  <Table.ColumnHeader aria-label={t("finance.actions")} />
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {recurringTransactions.map((item) => (
                  <Table.Row key={item.id}>
                    <Table.Cell fontWeight="medium">{item.title}</Table.Cell>
                    <Table.Cell color="fg.muted">
                      {t(`finance.types.${item.type}`)} Ãƒâ€šÃ‚Â·{" "}
                      {t("finance.paymentSources.recurring")}
                    </Table.Cell>
                    <Table.Cell>
                      {t(`finance.frequencies.${item.frequency}`)}
                    </Table.Cell>
                    <Table.Cell whiteSpace="nowrap">
                      {dateLabel(item.nextOccurrenceDate, i18n.language)}
                    </Table.Cell>
                    <Table.Cell textAlign="end" whiteSpace="nowrap">
                      <Stack align="end" gap="0">
                        <Text fontWeight="semibold">
                          <PrivateAmount>
                            {money(item.amount, item.currency)}
                          </PrivateAmount>
                        </Text>
                        <Text color="fg.muted" fontSize="2xs">
                          {t("finance.monthlyEstimate", {
                            amount: privateAmount(
                              getMonthlyRecurringCost(item),
                              item.currency,
                            ),
                          })}
                        </Text>
                      </Stack>
                    </Table.Cell>
                    <Table.Cell>
                      <Text
                        color={item.isActive ? "success.fg" : "fg.muted"}
                        fontSize="xs"
                      >
                        {item.isActive
                          ? t("finance.recurringActive")
                          : t("finance.paused")}
                      </Text>
                    </Table.Cell>
                    <Table.Cell>
                      <HStack justify="end" gap="1">
                        <Button
                          aria-label={t("finance.editRecurring")}
                          onClick={() => {
                            setRecurringToEdit(item);
                            setRecurringFormOpen(true);
                          }}
                          size="xs"
                          variant="ghost"
                        >
                          <Pencil aria-hidden="true" size={14} />
                        </Button>
                        <Button
                          onClick={() =>
                            updateRecurring.mutate({
                              isActive: !item.isActive,
                              recurringTransactionId: item.id,
                            })
                          }
                          size="xs"
                          variant="outline"
                        >
                          {item.isActive
                            ? t("finance.pause")
                            : t("finance.resume")}
                        </Button>
                      </HStack>
                    </Table.Cell>
                  </Table.Row>
                ))}
                {subscriptions.map((item) => (
                  <Table.Row key={`subscription-${item.id}`}>
                    <Table.Cell fontWeight="medium">{item.name}</Table.Cell>
                    <Table.Cell color="fg.muted">
                      {t("finance.paymentSources.subscription")}
                    </Table.Cell>
                    <Table.Cell>
                      {t(`finance.frequencies.${item.billingCycle}`)}
                    </Table.Cell>
                    <Table.Cell whiteSpace="nowrap">
                      {dateLabel(item.nextBillingDate, i18n.language)}
                    </Table.Cell>
                    <Table.Cell textAlign="end" whiteSpace="nowrap">
                      <PrivateAmount>
                        {money(item.amount, item.currency)}
                      </PrivateAmount>
                    </Table.Cell>
                    <Table.Cell>
                      <Text
                        color={
                          item.status === "active" ? "success.fg" : "fg.muted"
                        }
                        fontSize="xs"
                      >
                        {t(`subscriptions.statuses.${item.status}`, {
                          defaultValue: item.status,
                        })}
                      </Text>
                    </Table.Cell>
                    <Table.Cell color="fg.muted" fontSize="xs" textAlign="end">
                      {t("finance.subscriptionManaged")}
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Table.ScrollArea>
        ) : (
          <Box bg="bg.panel" borderWidth="1px" rounded="l2">
            <EmptyState
              illustrationSrc="/icons/finance.png"
              description={t("finance.noRecurringDescription")}
              title={t("finance.noRecurring")}
            />
          </Box>
        )}
      </Stack>
    );
  }

  function renderSavings() {
    const savingsByCurrency = new Map<
      string,
      { current: number; target: number }
    >();
    for (const goal of savingsGoals) {
      if (goal.status === "archived") continue;
      const totals = savingsByCurrency.get(goal.currency) ?? {
        current: 0,
        target: 0,
      };
      totals.current += goal.currentAmount;
      totals.target += goal.targetAmount;
      savingsByCurrency.set(goal.currency, totals);
    }
    const currentSavings = [...savingsByCurrency.entries()].map(
      ([currency, totals]) => ({ currency, value: totals.current }),
    );
    const targetSavings = [...savingsByCurrency.entries()].map(
      ([currency, totals]) => ({ currency, value: totals.target }),
    );
    const activeGoalCount = savingsGoals.filter(
      (goal) => goal.status === "active",
    ).length;

    return (
      <Stack gap="4">
        <SimpleGrid columns={{ base: 1, md: 3 }} gap="3">
          <SummaryCard
            icon={<CircleDollarSign aria-hidden="true" size={17} />}
            iconColor="green.600"
            label={t("finance.totalSaved")}
            totals={currentSavings}
          />
          <SummaryCard
            icon={<ChartNoAxesCombined aria-hidden="true" size={17} />}
            iconColor="cyan.700"
            label={t("finance.targetTotal")}
            totals={targetSavings}
          />
          <Box
            bg="bg.panel"
            borderWidth="1px"
            p={{ base: "3", md: "4" }}
            rounded="l2"
          >
            <HStack align="start" justify="space-between" gap="2">
              <Stack gap="1">
                <Text color="fg.muted" fontSize="xs">
                  {t("finance.activeGoals")}
                </Text>
                <Text fontSize="lg" fontWeight="semibold">
                  {activeGoalCount}
                </Text>
              </Stack>
              <Box bg="purple.600" color="white" p="2" rounded="l1">
                <WalletCards aria-hidden="true" size={17} />
              </Box>
            </HStack>
          </Box>
        </SimpleGrid>
        <Flex align="center" justify="space-between">
          <Text fontWeight="semibold">{t("finance.savingsGoals")}</Text>
        </Flex>
        {savingsGoals.length ? (
          <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
            {savingsGoals.map((goal) => {
              const progress = getSavingsGoalProgress(goal);
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
                          `finance.goalStatuses.${progress.isComplete ? "completed" : goal.status}`,
                        )}
                      </Text>
                    </Stack>
                    <Button
                      aria-label={t("finance.editSavingsGoal")}
                      onClick={() => {
                        setSavingsGoalToEdit(goal);
                        setSavingsGoalFormOpen(true);
                      }}
                      size="sm"
                      variant="ghost"
                    >
                      <Pencil aria-hidden="true" size={16} />
                    </Button>
                  </Flex>
                  <Box
                    aria-label={t("finance.savingsProgressLabel", {
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
                      bg={progress.isComplete ? "success.solid" : "brand.solid"}
                      h="full"
                      w={`${progress.percentage}%`}
                    />
                  </Box>
                  <Flex mt="2" justify="space-between">
                    <Text color="fg.muted" fontSize="sm">
                      <PrivateAmount>
                        {money(goal.currentAmount, goal.currency)} /{" "}
                        {money(goal.targetAmount, goal.currency)}
                      </PrivateAmount>
                    </Text>
                    <Text fontSize="sm" fontWeight="semibold">
                      {progress.percentage}%
                    </Text>
                  </Flex>
                  {goal.targetDate ? (
                    <Text color="fg.muted" fontSize="xs" mt="2">
                      {t("finance.targetOn", {
                        date: dateLabel(goal.targetDate, i18n.language),
                      })}
                    </Text>
                  ) : null}
                </Box>
              );
            })}
          </SimpleGrid>
        ) : (
          <Box bg="bg.panel" borderWidth="1px" rounded="l2">
            <EmptyState
              illustrationSrc="/icons/finance.png"
              description={t("finance.noSavingsDescription")}
              title={t("finance.noSavings")}
            />
          </Box>
        )}
      </Stack>
    );
  }

  function renderAccounts() {
    const expenseCategories = categories.filter(
      (category) => category.type === "expense",
    );
    const incomeCategories = categories.filter(
      (category) => category.type === "income",
    );
    return (
      <Stack gap="6">
        <Flex align="center" justify="space-between">
          <Text fontWeight="semibold">{t("finance.accounts")}</Text>
        </Flex>
        {accountBalances.length ? (
          <Table.ScrollArea
            borderColor="border.subtle"
            borderWidth="1px"
            rounded="l2"
          >
            <Table.Root minW="42rem" size="sm">
              <Table.Header>
                <Table.Row bg="bg.subtle">
                  <Table.ColumnHeader>
                    {t("finance.accountName")}
                  </Table.ColumnHeader>
                  <Table.ColumnHeader>
                    {t("finance.accountType")}
                  </Table.ColumnHeader>
                  <Table.ColumnHeader>
                    {t("finance.currency")}
                  </Table.ColumnHeader>
                  <Table.ColumnHeader textAlign="end">
                    {t("finance.totalBalance")}
                  </Table.ColumnHeader>
                  <Table.ColumnHeader>{t("finance.status")}</Table.ColumnHeader>
                  <Table.ColumnHeader aria-label={t("finance.actions")} />
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {accountBalances.map((account) => (
                  <Table.Row key={account.id}>
                    <Table.Cell>
                      <HStack gap="2">
                        <Box
                          bg="bg.subtle"
                          color="brand.fg"
                          p="1.5"
                          rounded="l1"
                        >
                          <WalletCards aria-hidden="true" size={15} />
                        </Box>
                        <Text fontWeight="medium">{account.name}</Text>
                      </HStack>
                    </Table.Cell>
                    <Table.Cell>
                      {t(`finance.accountTypes.${account.type}`)}
                    </Table.Cell>
                    <Table.Cell color="fg.muted">{account.currency}</Table.Cell>
                    <Table.Cell
                      fontWeight="semibold"
                      textAlign="end"
                      whiteSpace="nowrap"
                    >
                      <PrivateAmount>
                        {money(account.currentBalance, account.currency)}
                      </PrivateAmount>
                    </Table.Cell>
                    <Table.Cell>
                      <Text
                        color={account.isArchived ? "fg.muted" : "success.fg"}
                        fontSize="xs"
                      >
                        {account.isArchived
                          ? t("finance.archived")
                          : t("finance.active")}
                      </Text>
                    </Table.Cell>
                    <Table.Cell>
                      <HStack justify="end" gap="1">
                        <Button
                          aria-label={t("finance.editAccount")}
                          onClick={() => {
                            setAccountToEdit(account);
                            setAccountFormOpen(true);
                          }}
                          size="xs"
                          variant="ghost"
                        >
                          <Pencil aria-hidden="true" size={14} />
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
                                  toast.error({
                                    title: t("finance.updateError"),
                                  }),
                              },
                            )
                          }
                          size="xs"
                          variant="outline"
                        >
                          {account.isArchived
                            ? t("finance.restore")
                            : t("finance.archive")}
                        </Button>
                      </HStack>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Table.ScrollArea>
        ) : (
          <Box bg="bg.panel" borderWidth="1px" rounded="l2">
            <EmptyState
              illustrationSrc="/icons/finance.png"
              description={t("finance.noAccountsDescription")}
              title={t("finance.noAccounts")}
            />
          </Box>
        )}
        <Flex align="center" justify="space-between">
          <Stack gap="0">
            <Text fontWeight="semibold">{t("finance.categories")}</Text>
            <Text color="fg.muted" fontSize="sm">
              {t("finance.categoriesDescription")}
            </Text>
          </Stack>
          <Button
            onClick={() => {
              setCategoryToEdit(undefined);
              setCategoryFormOpen(true);
            }}
            size="sm"
            variant="outline"
          >
            <Plus aria-hidden="true" size={16} />
            {t("finance.addCategory")}
          </Button>
        </Flex>
        <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
          {(
            [
              { label: t("finance.types.expense"), items: expenseCategories },
              { label: t("finance.types.income"), items: incomeCategories },
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
                        aria-label={t("finance.editCategory")}
                        onClick={() => {
                          setCategoryToEdit(category);
                          setCategoryFormOpen(true);
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
    );
  }

  function openRecurringForm() {
    setRecurringToEdit(undefined);
    setRecurringFormOpen(true);
  }

  function openSavingsGoalForm() {
    setSavingsGoalToEdit(undefined);
    setSavingsGoalFormOpen(true);
  }

  function openAccountForm() {
    setAccountToEdit(undefined);
    setAccountFormOpen(true);
  }

  function renderPrimaryAction() {
    if (section === "overview" || section === "transactions") {
      return (
        <Button
          colorPalette="brand"
          disabled={!accounts.some((account) => !account.isArchived)}
          onClick={openTransactionForm}
        >
          <Plus aria-hidden="true" size={17} />
          {t("finance.addTransaction")}
        </Button>
      );
    }
    if (section === "recurring") {
      return (
        <Button colorPalette="brand" onClick={openRecurringForm}>
          <Plus aria-hidden="true" size={17} />
          {t("finance.addRecurring")}
        </Button>
      );
    }
    if (section === "savings") {
      return (
        <Button colorPalette="brand" onClick={openSavingsGoalForm}>
          <Plus aria-hidden="true" size={17} />
          {t("finance.addSavingsGoal")}
        </Button>
      );
    }
    return (
      <Button colorPalette="brand" onClick={openAccountForm}>
        <Plus aria-hidden="true" size={17} />
        {t("finance.addAccount")}
      </Button>
    );
  }

  return (
    <Container maxW="7xl" py={{ base: "5", md: "7" }}>
      <Stack gap="5">
        <PageHeader
          actions={renderPrimaryAction()}
          description={
            section === "overview"
              ? t("finance.description")
              : t(`finance.sectionDescriptions.${section}`)
          }
          eyebrow={t("finance.eyebrow")}
          title={
            section === "overview"
              ? t("finance.title")
              : t(`finance.sections.${section}`)
          }
        />
        <HStack
          bg="bg.subtle"
          borderColor="border.subtle"
          borderWidth="1px"
          gap="1"
          overflowX="auto"
          p="1"
          rounded="l2"
          role="group"
          aria-label={t("finance.sectionsLabel")}
        >
          {sections.map((item) => (
            <Button
              aria-pressed={section === item}
              colorPalette={section === item ? "brand" : undefined}
              key={item}
              onClick={() => selectSection(item)}
              size="sm"
              variant={section === item ? "solid" : "ghost"}
            >
              {t(`finance.sections.${item}`)}
            </Button>
          ))}
        </HStack>
        {section === "overview" ? renderOverview() : null}
        {section === "transactions" ? renderTransactions() : null}
        {section === "recurring" ? renderRecurring() : null}
        {section === "savings" ? renderSavings() : null}
        {section === "accounts" ? renderAccounts() : null}
      </Stack>
      <AccountFormDialog
        account={accountToEdit}
        isSubmitting={createAccount.isPending || updateAccount.isPending}
        onOpenChange={(open) => {
          setAccountFormOpen(open);
          if (!open) setAccountToEdit(undefined);
        }}
        onSubmit={(input) => {
          const complete = () => {
            setAccountFormOpen(false);
            setAccountToEdit(undefined);
          };
          if (accountToEdit)
            updateAccount.mutate(
              { ...input, accountId: accountToEdit.id },
              {
                onError: () => toast.error({ title: t("finance.updateError") }),
                onSuccess: complete,
              },
            );
          else
            createAccount.mutate(input, {
              onError: () => toast.error({ title: t("finance.createError") }),
              onSuccess: complete,
            });
        }}
        open={accountFormOpen}
      />
      <CategoryFormDialog
        category={categoryToEdit}
        isSubmitting={createCategory.isPending || updateCategory.isPending}
        onOpenChange={(open) => {
          setCategoryFormOpen(open);
          if (!open) setCategoryToEdit(undefined);
        }}
        onSubmit={(input) => {
          const complete = () => {
            setCategoryFormOpen(false);
            setCategoryToEdit(undefined);
          };
          if (categoryToEdit)
            updateCategory.mutate(
              { ...input, categoryId: categoryToEdit.id },
              {
                onError: () => toast.error({ title: t("finance.updateError") }),
                onSuccess: complete,
              },
            );
          else
            createCategory.mutate(input, {
              onError: () => toast.error({ title: t("finance.createError") }),
              onSuccess: complete,
            });
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
          setTransactionFormOpen(open);
          if (!open) setTransactionToEdit(undefined);
        }}
        onSubmit={(input) => {
          const complete = () => {
            setTransactionFormOpen(false);
            setTransactionToEdit(undefined);
          };
          if (transactionToEdit)
            updateTransaction.mutate(
              { ...input, transactionId: transactionToEdit.id },
              {
                onError: () => toast.error({ title: t("finance.updateError") }),
                onSuccess: complete,
              },
            );
          else
            createTransaction.mutate(input, {
              onError: () => toast.error({ title: t("finance.createError") }),
              onSuccess: complete,
            });
        }}
        open={transactionFormOpen}
        transaction={transactionToEdit}
      />
      <RecurringTransactionFormDialog
        accounts={accounts}
        categories={categories}
        isSubmitting={createRecurring.isPending || updateRecurring.isPending}
        onOpenChange={(open) => {
          setRecurringFormOpen(open);
          if (!open) setRecurringToEdit(undefined);
        }}
        onSubmit={(input) => {
          const complete = () => {
            setRecurringFormOpen(false);
            setRecurringToEdit(undefined);
          };
          if (recurringToEdit)
            updateRecurring.mutate(
              { ...input, recurringTransactionId: recurringToEdit.id },
              {
                onError: () => toast.error({ title: t("finance.updateError") }),
                onSuccess: complete,
              },
            );
          else
            createRecurring.mutate(input, {
              onError: () => toast.error({ title: t("finance.createError") }),
              onSuccess: complete,
            });
        }}
        open={recurringFormOpen}
        recurringTransaction={recurringToEdit}
      />
      <SavingsGoalFormDialog
        isSubmitting={
          createSavingsGoal.isPending || updateSavingsGoal.isPending
        }
        onOpenChange={(open) => {
          setSavingsGoalFormOpen(open);
          if (!open) setSavingsGoalToEdit(undefined);
        }}
        onSubmit={(input) => {
          const complete = () => {
            setSavingsGoalFormOpen(false);
            setSavingsGoalToEdit(undefined);
          };
          if (savingsGoalToEdit)
            updateSavingsGoal.mutate(
              { ...input, savingsGoalId: savingsGoalToEdit.id },
              {
                onError: () => toast.error({ title: t("finance.updateError") }),
                onSuccess: complete,
              },
            );
          else
            createSavingsGoal.mutate(input, {
              onError: () => toast.error({ title: t("finance.createError") }),
              onSuccess: complete,
            });
        }}
        open={savingsGoalFormOpen}
        savingsGoal={savingsGoalToEdit}
      />
      <ConfirmDialog
        confirmLabel={t("finance.deleteTransaction")}
        description={t("finance.deleteTransactionDescription", {
          title: transactionToDelete?.title ?? "",
        })}
        isConfirming={deleteTransaction.isPending}
        isDestructive
        onConfirm={handleDeleteTransaction}
        onOpenChange={(open) => {
          if (!open) setTransactionToDelete(undefined);
        }}
        open={Boolean(transactionToDelete)}
        title={t("finance.deleteTransaction")}
      />
    </Container>
  );
}

function FieldSelect({
  children,
  label,
  onChange,
  value,
}: {
  children: React.ReactNode;
  label: string;
  onChange: (value: string) => void;
  value: string;
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
  );
}
