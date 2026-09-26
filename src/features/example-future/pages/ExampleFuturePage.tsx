import { Box, Container, Stack, Text } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { EmptyState } from '@/components/shared/EmptyState/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState/ErrorState'
import { PageHeader } from '@/components/shared/PageHeader/PageHeader'
import { ExampleFutureDataList } from '@/features/example-future/components/ExampleFutureDataList'
import { ExampleFutureDataListSkeleton } from '@/features/example-future/components/ExampleFutureDataListSkeleton'
import { useExampleFutureItems } from '@/features/example-future/services/example-future.service'

export function ExampleFuturePage() {
  const { t } = useTranslation()
  const itemsQuery = useExampleFutureItems()

  return (
    <Container maxW="7xl" py={{ base: '8', md: '12' }}>
      <Stack gap="8">
        <PageHeader
          description={t('exampleFuture.description')}
          eyebrow={t('exampleFuture.eyebrow')}
          title={t('exampleFuture.title')}
        />
        <Box bg="bg.subtle" borderRadius="l2" p={{ base: '4', md: '5' }}>
          <Text color="fg.muted" fontSize="sm">
            {t('exampleFuture.mockingNote')}
          </Text>
        </Box>
        {itemsQuery.isPending ? <ExampleFutureDataListSkeleton /> : null}
        {itemsQuery.isError ? (
          <ErrorState onRetry={() => void itemsQuery.refetch()} />
        ) : null}
        {itemsQuery.data?.length === 0 ? (
          <EmptyState title={t('exampleFuture.empty')} />
        ) : null}
        {itemsQuery.data?.length ? (
          <ExampleFutureDataList items={itemsQuery.data} />
        ) : null}
      </Stack>
    </Container>
  )
}
