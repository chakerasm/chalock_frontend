import { Box, Container, Flex, Skeleton, Stack } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'

export function SubscriptionDetailSkeleton() {
  const { t } = useTranslation()

  return (
    <Container maxW="3xl" py={{ base: '6', md: '10' }}>
      <Stack aria-busy="true" aria-label={t('loading')} gap="6" role="status">
        <Skeleton height="8" width="24" />
        <Flex justify="space-between" wrap="wrap">
          <Stack gap="2">
            <Skeleton height="8" width="48" />
            <Skeleton height="4" width="32" />
          </Stack>
          <Skeleton height="9" width="20" />
        </Flex>
        <Box bg="bg.panel" borderWidth="1px" p="5" rounded="l2">
          <Stack gap="5">
            <Skeleton height="8" width="40%" />
            <Skeleton height="4" width="68%" />
            <Skeleton height="4" width="54%" />
            <Skeleton height="4" width="82%" />
            <Skeleton height="4" width="44%" />
          </Stack>
        </Box>
      </Stack>
    </Container>
  )
}
