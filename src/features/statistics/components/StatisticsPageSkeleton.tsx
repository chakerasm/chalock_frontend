import {
  Box,
  Container,
  Flex,
  SimpleGrid,
  Skeleton,
  Stack,
} from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'

export function StatisticsPageSkeleton() {
  const { t } = useTranslation()

  return (
    <Container maxW="6xl" py={{ base: '6', md: '10' }}>
      <Stack
        aria-busy="true"
        aria-label={t('loading')}
        gap={{ base: '6', md: '8' }}
        role="status"
      >
        <Flex justify="space-between" wrap="wrap">
          <Stack gap="2">
            <Skeleton height="4" width="24%" />
            <Skeleton height="8" width="36%" />
            <Skeleton height="4" width="64%" />
          </Stack>
          <Skeleton height="8" width="52" />
        </Flex>
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap="4">
          {Array.from({ length: 4 }, (_, index) => (
            <Box
              bg="bg.panel"
              borderWidth="1px"
              key={index}
              p={{ base: '4', md: '5' }}
              rounded="l2"
            >
              <Skeleton height="4" width="62%" />
              <Skeleton height="8" mt="3" width="42%" />
            </Box>
          ))}
        </SimpleGrid>
        <SimpleGrid columns={{ base: 1, lg: 2 }} gap="5">
          {Array.from({ length: 4 }, (_, index) => (
            <Box
              bg="bg.panel"
              borderWidth="1px"
              key={index}
              p={{ base: '4', md: '5' }}
              rounded="l2"
            >
              <Stack gap="5">
                <Stack gap="2">
                  <Skeleton height="5" width="42%" />
                  <Skeleton height="3" width="72%" />
                </Stack>
                <Skeleton height={index % 2 === 0 ? '36' : '24'} />
              </Stack>
            </Box>
          ))}
        </SimpleGrid>
      </Stack>
    </Container>
  )
}
