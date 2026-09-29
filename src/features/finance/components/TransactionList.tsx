import { Box, Button, Flex, HStack, Stack, Text } from '@chakra-ui/react'
import { Pencil, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { groupTransactionsByDate } from '@/features/finance/services/finance-calculations'
import type {
  Account,
  FinanceCategory,
  Transaction,
} from '@/features/finance/types/finance.types'

type Props = {
  accounts: Account[]
  categories: FinanceCategory[]
  onDelete: (transaction: Transaction) => void
  onEdit: (transaction: Transaction) => void
  transactions: Transaction[]
}

function money(value: number, currency: string) {
  return new Intl.NumberFormat(undefined, {
    currency,
    maximumFractionDigits: 2,
    style: 'currency',
  }).format(value)
}
function dateLabel(date: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    weekday: 'long',
  }).format(new Date(`${date}T12:00:00`))
}

export function TransactionList({
  accounts,
  categories,
  onDelete,
  onEdit,
  transactions,
}: Props) {
  const { i18n, t } = useTranslation()
  const accountById = new Map(accounts.map((account) => [account.id, account]))
  const categoryById = new Map(
    categories.map((category) => [category.id, category]),
  )
  const groups = groupTransactionsByDate(transactions)
  return (
    <Stack gap="5">
      {Object.entries(groups).map(([date, items]) => (
        <Stack gap="2" key={date}>
          <Text color="fg.muted" fontSize="sm" fontWeight="semibold">
            {dateLabel(date, i18n.language)}
          </Text>
          <Stack bg="bg.panel" borderWidth="1px" divideY="1px" rounded="l2">
            {items.map((transaction) => {
              const category = transaction.categoryId
                ? categoryById.get(transaction.categoryId)
                : undefined
              const account = accountById.get(transaction.accountId)
              const destination = transaction.destinationAccountId
                ? accountById.get(transaction.destinationAccountId)
                : undefined
              const amountPrefix =
                transaction.type === 'income'
                  ? '+'
                  : transaction.type === 'expense'
                    ? '−'
                    : '↔'
              const stateLabel = t(`finance.types.${transaction.type}`)
              return (
                <Flex
                  align="center"
                  gap="3"
                  key={transaction.id}
                  p={{ base: '3', md: '4' }}
                >
                  <Box
                    bg="bg.subtle"
                    color="fg.muted"
                    flex="0 0 auto"
                    fontSize="xs"
                    fontWeight="semibold"
                    p="2"
                    rounded="l1"
                  >
                    {stateLabel}
                  </Box>
                  <Stack flex="1" gap="0" minW="0">
                    <Text fontWeight="medium" truncate>
                      {transaction.title}
                    </Text>
                    <Text color="fg.muted" fontSize="sm" truncate>
                      {transaction.type === 'transfer'
                        ? `${account?.name ?? t('common.notAvailable')} → ${destination?.name ?? t('common.notAvailable')}`
                        : `${category?.name ?? t('finance.uncategorized')} · ${account?.name ?? t('common.notAvailable')}`}
                    </Text>
                  </Stack>
                  <Stack align="end" gap="1">
                    <Text
                      color={
                        transaction.type === 'income'
                          ? 'success.fg'
                          : transaction.type === 'expense'
                            ? 'danger.fg'
                            : 'fg'
                      }
                      fontWeight="semibold"
                    >
                      {amountPrefix}
                      {money(transaction.amount, transaction.currency)}
                    </Text>
                    <Text color="fg.muted" fontSize="xs">
                      {stateLabel}
                    </Text>
                  </Stack>
                  <HStack gap="1">
                    <Button
                      aria-label={t('finance.editTransaction')}
                      onClick={() => onEdit(transaction)}
                      size="xs"
                      variant="ghost"
                    >
                      <Pencil aria-hidden="true" size={15} />
                    </Button>
                    <Button
                      aria-label={t('finance.deleteTransaction')}
                      onClick={() => onDelete(transaction)}
                      size="xs"
                      variant="ghost"
                    >
                      <Trash2 aria-hidden="true" size={15} />
                    </Button>
                  </HStack>
                </Flex>
              )
            })}
          </Stack>
        </Stack>
      ))}
    </Stack>
  )
}
