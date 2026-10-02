import { Button, HStack, Table, Text } from '@chakra-ui/react'
import { Pencil, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
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
  return (
    <Table.ScrollArea
      borderColor="border.subtle"
      borderWidth="1px"
      rounded="l2"
    >
      <Table.Root minW="48rem" size="sm">
        <Table.Header>
          <Table.Row bg="bg.subtle">
            <Table.ColumnHeader>{t('finance.date')}</Table.ColumnHeader>
            <Table.ColumnHeader>{t('finance.titleLabel')}</Table.ColumnHeader>
            <Table.ColumnHeader>{t('finance.category')}</Table.ColumnHeader>
            <Table.ColumnHeader>{t('finance.account')}</Table.ColumnHeader>
            <Table.ColumnHeader textAlign="end">
              {t('finance.amount')}
            </Table.ColumnHeader>
            <Table.ColumnHeader aria-label={t('finance.actions')} />
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {transactions.map((transaction) => {
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
            return (
              <Table.Row key={transaction.id}>
                <Table.Cell color="fg.muted" whiteSpace="nowrap">
                  {dateLabel(transaction.transactionDate, i18n.language)}
                </Table.Cell>
                <Table.Cell>
                  <Text fontWeight="medium" lineClamp="1" maxW="15rem">
                    {transaction.title}
                  </Text>
                </Table.Cell>
                <Table.Cell>
                  {transaction.type === 'transfer'
                    ? t('finance.types.transfer')
                    : (category?.name ?? t('finance.uncategorized'))}
                </Table.Cell>
                <Table.Cell color="fg.muted" whiteSpace="nowrap">
                  {transaction.type === 'transfer'
                    ? `${account?.name ?? t('common.notAvailable')} → ${destination?.name ?? t('common.notAvailable')}`
                    : (account?.name ?? t('common.notAvailable'))}
                </Table.Cell>
                <Table.Cell
                  color={
                    transaction.type === 'income'
                      ? 'success.fg'
                      : transaction.type === 'expense'
                        ? 'danger.fg'
                        : 'fg'
                  }
                  fontWeight="semibold"
                  textAlign="end"
                  whiteSpace="nowrap"
                >
                  {amountPrefix}
                  {money(transaction.amount, transaction.currency)}
                </Table.Cell>
                <Table.Cell>
                  <HStack justify="end" gap="1">
                    <Button
                      aria-label={t('finance.editTransaction')}
                      onClick={() => onEdit(transaction)}
                      size="xs"
                      variant="ghost"
                    >
                      <Pencil aria-hidden="true" size={14} />
                    </Button>
                    <Button
                      aria-label={t('finance.deleteTransaction')}
                      onClick={() => onDelete(transaction)}
                      size="xs"
                      variant="ghost"
                    >
                      <Trash2 aria-hidden="true" size={14} />
                    </Button>
                  </HStack>
                </Table.Cell>
              </Table.Row>
            )
          })}
        </Table.Body>
      </Table.Root>
    </Table.ScrollArea>
  )
}
