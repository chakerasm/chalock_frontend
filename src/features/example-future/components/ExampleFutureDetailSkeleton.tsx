import { Box, SimpleGrid, Skeleton, Stack } from '@chakra-ui/react'

const detailCards = Array.from({ length: 6 }, (_, index) => index)

export function ExampleFutureDetailSkeleton() {
  return (
    <Stack aria-busy="true" gap="8">
      <Stack gap="3">
        <Skeleton height="4" width="36" />
        <Skeleton height="10" maxW="lg" />
        <Skeleton height="5" maxW="2xl" />
      </Stack>
      <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
        {detailCards.map((card) => (
          <Box bg="bg.panel" borderWidth="1px" key={card} p="5" rounded="l2">
            <Stack gap="3">
              <Skeleton height="4" width="24" />
              <Skeleton height="6" width="32" />
            </Stack>
          </Box>
        ))}
      </SimpleGrid>
      <Box bg="bg.subtle" p={{ base: '4', md: '5' }} rounded="l2">
        <Skeleton height="5" maxW="4xl" />
      </Box>
    </Stack>
  )
}
