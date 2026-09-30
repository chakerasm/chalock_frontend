import { Box, Container, Flex, Skeleton, Stack } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'

export function PlannerPageSkeleton() {
  const { t } = useTranslation()
  return (
    <Container maxW="6xl" py={{ base: '6', md: '10' }}>
      <Stack aria-busy="true" aria-label={t('loading')} gap="6" role="status">
        <Flex justify="space-between">
          <Stack gap="2">
            <Skeleton height="4" width="24" />
            <Skeleton height="8" width="56" />
          </Stack>
          <Skeleton height="10" width="28" />
        </Flex>
        <Box
          bg="bg.panel"
          borderWidth="1px"
          p={{ base: '4', md: '5' }}
          rounded="l2"
        >
          <Stack gap="4">
            {[0, 1, 2, 3, 4, 5, 6].map((row) => (
              <Flex gap="4" key={`planner-skeleton-${row}`}>
                <Skeleton height="4" width="12" />
                <Skeleton height={row % 2 ? '18' : '24'} flex="1" />
              </Flex>
            ))}
          </Stack>
        </Box>
      </Stack>
    </Container>
  )
}
