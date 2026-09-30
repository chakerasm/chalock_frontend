import { Container, Skeleton, Stack } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'

export function SettingsPageSkeleton() {
  const { t } = useTranslation()
  return (
    <Container
      aria-label={t('settings.loading')}
      maxW="4xl"
      py={{ base: '6', md: '10' }}
    >
      <Stack gap="7">
        <Stack gap="3">
          <Skeleton h="4" w="28" />
          <Skeleton h="10" w="52" />
          <Skeleton h="5" maxW="lg" />
        </Stack>
        <Skeleton h="17rem" rounded="l2" />
        <Skeleton h="18rem" rounded="l2" />
      </Stack>
    </Container>
  )
}
