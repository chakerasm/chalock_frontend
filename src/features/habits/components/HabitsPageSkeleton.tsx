import { Box, Container, Flex, HStack, Skeleton, Stack } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'

export function HabitsPageSkeleton() {
  const { t } = useTranslation()

  return (
    <Container maxW="6xl" py={{ base: '6', md: '10' }}>
      <Stack
        aria-busy="true"
        aria-label={t('loading')}
        gap={{ base: '5', md: '7' }}
        role="status"
      >
        <Stack gap="2">
          <Skeleton height="4" width="22%" />
          <Skeleton height="8" width="30%" />
          <Skeleton height="4" width="60%" />
        </Stack>
        <Flex justify="space-between" wrap="wrap">
          <HStack gap="2">
            <Skeleton height="8" width="16" />
            <Skeleton height="8" width="16" />
          </HStack>
          <HStack gap="2">
            <Skeleton height="8" width="16" />
            <Skeleton height="8" width="18" />
          </HStack>
        </Flex>
        <Box
          bg="bg.panel"
          borderWidth="1px"
          p={{ base: '4', md: '5' }}
          rounded="l2"
        >
          <Stack gap="4">
            <Stack gap="2">
              <Skeleton height="5" width="34%" />
              <Skeleton height="3" width="48%" />
            </Stack>
            {Array.from({ length: 4 }, (_, index) => (
              <Flex
                align="center"
                borderTopWidth="1px"
                gap="3"
                key={index}
                pt="3"
              >
                <Skeleton borderRadius="full" boxSize="9" />
                <Stack flex="1" gap="2">
                  <Skeleton
                    height="4"
                    width={index % 2 === 0 ? '46%' : '62%'}
                  />
                  <Skeleton height="3" width="30%" />
                </Stack>
                <Skeleton height="8" width="14" />
              </Flex>
            ))}
          </Stack>
        </Box>
      </Stack>
    </Container>
  )
}
