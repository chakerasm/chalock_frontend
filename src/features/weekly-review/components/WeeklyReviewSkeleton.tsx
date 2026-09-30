import { Container, SimpleGrid, Skeleton, Stack } from '@chakra-ui/react'

export function WeeklyReviewSkeleton() {
  return (
    <Container maxW="6xl" py={{ base: '6', md: '10' }}>
      <Stack gap="7">
        <Skeleton h="16" />
        <SimpleGrid columns={{ base: 1, lg: 2 }} gap="5">
          {[0, 1, 2, 3, 4, 5].map((item) => (
            <Skeleton h="15rem" key={item} rounded="l2" />
          ))}
        </SimpleGrid>
      </Stack>
    </Container>
  )
}
