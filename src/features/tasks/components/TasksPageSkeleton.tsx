import { Box, Container, Flex, HStack, Skeleton, Stack } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'

export function TasksPageSkeleton() {
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
          <Skeleton height="4" width="24%" />
          <Skeleton height="8" width="32%" />
          <Skeleton height="4" width="62%" />
        </Stack>
        <Box
          bg="bg.panel"
          borderWidth="1px"
          p={{ base: '4', md: '5' }}
          rounded="l2"
        >
          <Flex gap="2">
            <Skeleton height="10" flex="1" />
            <Skeleton height="10" width="24" />
          </Flex>
        </Box>
        <Stack gap="4">
          <Flex justify="space-between" wrap="wrap">
            <HStack gap="2">
              <Skeleton height="8" width="16" />
              <Skeleton height="8" width="20" />
              <Skeleton height="8" width="14" />
            </HStack>
            <HStack gap="2">
              <Skeleton height="10" width="48" />
              <Skeleton height="10" width="10" />
            </HStack>
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
                gap="3"
                key={index}
                py="4"
              >
                <Skeleton borderRadius="sm" boxSize="5" />
                <Stack flex="1" gap="2">
                  <Skeleton
                    height="4"
                    width={index % 2 === 0 ? '58%' : '72%'}
                  />
                  <Skeleton height="3" width="35%" />
                </Stack>
                <Skeleton height="7" width="12" />
              </Flex>
            ))}
          </Stack>
        </Stack>
      </Stack>
    </Container>
  )
}
