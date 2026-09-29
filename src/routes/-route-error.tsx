import { Container } from '@chakra-ui/react'
import { useRouter } from '@tanstack/react-router'
import { ErrorState } from '@/components/shared/ErrorState/ErrorState'

export function RouteError() {
  const router = useRouter()

  return (
    <Container maxW="6xl" py={{ base: '8', md: '12' }}>
      <ErrorState onRetry={() => void router.invalidate()} />
    </Container>
  )
}
