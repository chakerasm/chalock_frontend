import {
  Box,
  Container,
  Flex,
  SimpleGrid,
  Skeleton,
  Stack,
} from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'

export function SubscriptionsListSkeleton() {
  const { t } = useTranslation()

  return (
    <Container maxW="5xl" py={{ base: '6', md: '10' }}>
      <Stack
        aria-busy="true"
        aria-label={t('loading')}
        gap={{ base: '5', md: '7' }}
        role="status"
      >
        <Stack gap="2">
          <Skeleton height="8" width="34%" />
          <Skeleton height="4" width="62%" />
        </Stack>
        <SimpleGrid columns={{ base: 2, md: 4 }} gap="3">
          {Array.from({ length: 4 }, (_, index) => (
            <Box
              bg="bg.subtle"
              borderWidth="1px"
              key={index}
              p="3"
              rounded="l1"
            >
              <Skeleton height="3" width="66%" />
              <Skeleton height="6" mt="2" width="48%" />
            </Box>
          ))}
        </SimpleGrid>
        <Flex gap="3" wrap="wrap">
          <Skeleton height="10" minW="220px" flex="1" />
          <Skeleton height="10" width={{ base: 'full', md: '45' }} />
        </Flex>
        <Stack
          bg="bg.panel"
          borderWidth="1px"
          gap="0"
          px={{ base: '4', md: '5' }}
          rounded="l2"
        >
          {Array.from({ length: 5 }, (_, index) => (
            <Flex
              align="center"
              borderBottomWidth={index === 4 ? '0' : '1px'}
              gap="4"
              key={index}
              py="4"
            >
              <Stack flex="1" gap="2">
                <Skeleton height="4" width={index % 2 === 0 ? '46%' : '60%'} />
                <Skeleton height="3" width="34%" />
              </Stack>
              <Stack align="end" gap="2">
                <Skeleton height="3" width="20" />
                <Skeleton height="5" width="14" />
              </Stack>
            </Flex>
          ))}
        </Stack>
      </Stack>
    </Container>
  )
}
