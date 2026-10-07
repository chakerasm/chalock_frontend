import { Box, Skeleton, Stack, Text } from '@chakra-ui/react'
import type { ReactNode } from 'react'

type ChartContainerProps = {
  ariaLabel: string
  children?: ReactNode
  description?: string
  emptyDescription?: string
  emptyTitle?: string
  error?: boolean
  height?: string | { base: string; md: string }
  isEmpty?: boolean
  isLoading?: boolean
  title: string
}

export function ChartContainer({
  ariaLabel,
  children,
  description,
  emptyDescription,
  emptyTitle = 'No data yet',
  error = false,
  height = { base: '13rem', md: '17.5rem' },
  isEmpty = false,
  isLoading = false,
  title,
}: ChartContainerProps) {
  return (
    <Stack aria-label={ariaLabel} as="section" gap="3">
      <Stack gap="0">
        <Text fontSize="sm" fontWeight="semibold">{title}</Text>
        {description ? <Text color="fg.muted" fontSize="xs">{description}</Text> : null}
      </Stack>
      {isLoading ? <Skeleton h={height} rounded="l1" /> : null}
      {!isLoading && (isEmpty || error) ? (
        <Stack align="center" bg="bg.subtle" h={height} justify="center" px="4" rounded="l1" textAlign="center">
          <Text fontSize="sm" fontWeight="medium">{error ? "We couldn't load this trend." : emptyTitle}</Text>
          {emptyDescription ? <Text color="fg.muted" fontSize="xs">{emptyDescription}</Text> : null}
        </Stack>
      ) : null}
      {!isLoading && !isEmpty && !error ? <Box h={height} minW="0">{children}</Box> : null}
    </Stack>
  )
}
