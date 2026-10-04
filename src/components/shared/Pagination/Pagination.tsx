import { Button, HStack, Text } from '@chakra-ui/react'
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'
import { useTranslation } from 'react-i18next'

type PaginationProps = {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  siblingCount?: number
}

type PageItem = number | 'start-ellipsis' | 'end-ellipsis'

function getPageItems(
  currentPage: number,
  totalPages: number,
  siblingCount: number,
): PageItem[] {
  const visiblePageCount = siblingCount * 2 + 5

  if (totalPages <= visiblePageCount) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const rangeStart = Math.max(2, currentPage - siblingCount)
  const rangeEnd = Math.min(totalPages - 1, currentPage + siblingCount)
  const items: PageItem[] = [1]

  if (rangeStart > 2) {
    items.push('start-ellipsis')
  }

  for (let page = rangeStart; page <= rangeEnd; page += 1) {
    items.push(page)
  }

  if (rangeEnd < totalPages - 1) {
    items.push('end-ellipsis')
  }

  items.push(totalPages)
  return items
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  siblingCount = 1,
}: PaginationProps) {
  const { t } = useTranslation()

  if (totalPages <= 1) {
    return null
  }

  const currentPage = Math.min(Math.max(page, 1), totalPages)
  const pageItems = getPageItems(currentPage, totalPages, siblingCount)

  return (
    <HStack
      aria-label={t('pagination.summary', { page: currentPage, totalPages })}
      as="nav"
      gap="2"
      justify="space-between"
      wrap="wrap"
    >
      <Button
        aria-label={t('pagination.previous')}
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        size="sm"
        variant="outline"
      >
        <ChevronLeft aria-hidden="true" size={16} />
        {t('pagination.previous')}
      </Button>
      <HStack gap="1">
        {pageItems.map((item) => {
          if (typeof item !== 'number') {
            return <MoreHorizontal aria-hidden="true" key={item} size={16} />
          }

          const isCurrentPage = item === currentPage

          return (
            <Button
              aria-current={isCurrentPage ? 'page' : undefined}
              aria-label={t('pagination.goToPage', { page: item })}
              key={item}
              onClick={() => onPageChange(item)}
              size="sm"
              colorPalette={isCurrentPage ? 'brand' : undefined}
              rounded="l1"
              variant={isCurrentPage ? 'solid' : 'ghost'}
            >
              {item}
            </Button>
          )
        })}
      </HStack>
      <Button
        aria-label={t('pagination.next')}
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        size="sm"
        variant="outline"
      >
        {t('pagination.next')}
        <ChevronRight aria-hidden="true" size={16} />
      </Button>
      <Text color="fg.muted" fontSize="sm" width="full">
        {t('pagination.summary', { page: currentPage, totalPages })}
      </Text>
    </HStack>
  )
}
