import { Container, Skeleton, Stack } from '@chakra-ui/react'

export function ActivityTimelineSkeleton() {
  return (
    <Container maxW="4xl" py={{ base: '6', md: '10' }}>
      <Stack gap="7">
        <Skeleton h="24" />
        <Skeleton h="9" w="sm" />
        <Stack gap="3">
          {[0, 1, 2, 3, 4].map((item) => (
            <Skeleton h="18" key={item} rounded="l2" />
          ))}
        </Stack>
      </Stack>
    </Container>
  )
}
