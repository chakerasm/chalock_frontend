import {
  Badge,
  Box,
  Button,
  Container,
  SimpleGrid,
  Stack,
  Text,
} from '@chakra-ui/react'
import { Link as RouterLink } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ErrorState } from '@/components/shared/ErrorState/ErrorState'
import { LabelValue } from '@/components/shared/LabelValue/LabelValue'
import { PageHeader } from '@/components/shared/PageHeader/PageHeader'
import { ExampleFutureDetailSkeleton } from '@/features/example-future/components/ExampleFutureDetailSkeleton'
import { useExampleFutureDetail } from '@/features/example-future/services/example-future.service'

type ExampleFutureDetailPageProps = {
  itemId: string
}

export function ExampleFutureDetailPage({
  itemId,
}: ExampleFutureDetailPageProps) {
  const { t } = useTranslation()
  const detailQuery = useExampleFutureDetail(itemId)
  const detail = detailQuery.data

  return (
    <Container maxW="5xl" py={{ base: '8', md: '12' }}>
      <Stack gap="8">
        <Button alignSelf="flex-start" asChild size="sm" variant="ghost">
          <RouterLink to="/example-future">
            <ArrowLeft aria-hidden="true" size={16} />
            {t('exampleFuture.backToList')}
          </RouterLink>
        </Button>
        {detailQuery.isPending ? <ExampleFutureDetailSkeleton /> : null}
        {detailQuery.isError ? (
          <ErrorState onRetry={() => void detailQuery.refetch()} />
        ) : null}
        {detail ? (
          <Stack gap="8">
            <PageHeader
              description={detail.description}
              eyebrow={t('exampleFuture.detailEyebrow')}
              title={detail.name}
            />
            <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
              <Box as="dl" bg="bg.panel" borderWidth="1px" p="5" rounded="l2">
                <LabelValue
                  label={t('exampleFuture.status')}
                  value={
                    <Badge
                      colorPalette={
                        detail.status === 'active' ? 'green' : 'orange'
                      }
                    >
                      {detail.status}
                    </Badge>
                  }
                />
              </Box>
              <Box as="dl" bg="bg.panel" borderWidth="1px" p="5" rounded="l2">
                <LabelValue
                  label={t('exampleFuture.owner')}
                  value={detail.ownerName}
                />
              </Box>
              <Box as="dl" bg="bg.panel" borderWidth="1px" p="5" rounded="l2">
                <LabelValue
                  label={t('exampleFuture.plan')}
                  value={detail.plan}
                />
              </Box>
              <Box as="dl" bg="bg.panel" borderWidth="1px" p="5" rounded="l2">
                <LabelValue
                  label={t('exampleFuture.members')}
                  value={detail.memberCount}
                />
              </Box>
              <Box as="dl" bg="bg.panel" borderWidth="1px" p="5" rounded="l2">
                <LabelValue
                  label={t('exampleFuture.created')}
                  value={detail.createdAt.slice(0, 10)}
                />
              </Box>
              <Box as="dl" bg="bg.panel" borderWidth="1px" p="5" rounded="l2">
                <LabelValue
                  label={t('exampleFuture.updated')}
                  value={detail.updatedAt.slice(0, 10)}
                />
              </Box>
            </SimpleGrid>
            <Box bg="bg.subtle" borderRadius="l2" p={{ base: '4', md: '5' }}>
              <Text color="fg.muted" fontSize="sm">
                {t('exampleFuture.detailServiceNote')}
              </Text>
            </Box>
          </Stack>
        ) : null}
      </Stack>
    </Container>
  )
}
