import { Box, Container, Flex, Skeleton, Stack } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'

export function RemindersPageSkeleton() {
  const { t } = useTranslation()
  return (
    <Container maxW="6xl" py={{ base: '6', md: '10' }}>
      <Stack aria-busy="true" aria-label={t('loading')} gap="6" role="status">
        <Flex justify="space-between">
          <Stack gap="2">
            <Skeleton height="4" width="24" />
            <Skeleton height="8" width="44" />
          </Stack>
          <Skeleton height="10" width="28" />
        </Flex>
        <Box bg="bg.panel" borderWidth="1px" p="5" rounded="l2">
          <Stack gap="4">
            {['first', 'second', 'third', 'fourth'].map((row) => (
              <Flex gap="3" key={row}>
                <Skeleton boxSize="9" />
                <Stack flex="1" gap="2">
                  <Skeleton height="4" width="40%" />
                  <Skeleton height="3" width="24%" />
                </Stack>
              </Flex>
            ))}
          </Stack>
        </Box>
      </Stack>
    </Container>
  )
}
