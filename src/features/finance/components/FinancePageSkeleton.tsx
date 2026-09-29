import { Box, SimpleGrid, Skeleton, Stack } from '@chakra-ui/react'

const metricSkeletonKeys = ['balance', 'income', 'expenses', 'net'] as const
const summaryRowSkeletonKeys = ['one', 'two', 'three', 'four'] as const
const upcomingRowSkeletonKeys = ['one', 'two', 'three'] as const
export function FinancePageSkeleton() {
  return (
    <Stack
      gap={{ base: '5', md: '7' }}
      maxW="6xl"
      mx="auto"
      py={{ base: '6', md: '10' }}
      px={{ base: '4', md: '0' }}
      role="status"
      aria-label="Loading finances"
    >
      <Stack gap="2">
        <Skeleton h="7" w="36" />
        <Skeleton h="4" w={{ base: 'full', md: 'lg' }} />
      </Stack>
      <Skeleton h="9" maxW="lg" w="full" />
      <SimpleGrid columns={{ base: 2, lg: 4 }} gap="3">
        {metricSkeletonKeys.map((key) => (
          <Box bg="bg.panel" borderWidth="1px" key={key} p="4" rounded="l2">
            <Skeleton h="3" w="20" />
            <Skeleton h="7" mt="3" w="24" />
          </Box>
        ))}
      </SimpleGrid>
      <SimpleGrid columns={{ base: 1, lg: 2 }} gap="4">
        <Box bg="bg.panel" borderWidth="1px" p="5" rounded="l2">
          <Skeleton h="5" w="32" />
          {summaryRowSkeletonKeys.map((key) => (
            <Skeleton h="12" key={key} mt="4" />
          ))}
        </Box>
        <Box bg="bg.panel" borderWidth="1px" p="5" rounded="l2">
          <Skeleton h="5" w="28" />
          {upcomingRowSkeletonKeys.map((key) => (
            <Skeleton h="7" key={key} mt="4" />
          ))}
        </Box>
      </SimpleGrid>
    </Stack>
  )
}
