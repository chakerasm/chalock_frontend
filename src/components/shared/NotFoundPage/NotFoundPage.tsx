import { Button, Container, Stack, Text } from '@chakra-ui/react'
import type { NotFoundRouteProps } from '@tanstack/react-router'
import { Link as RouterLink } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { APP_ROUTES } from '@/lib/routes'

type NotFoundPageProps = NotFoundRouteProps & {
  returnAction?: ReactNode
}

export function NotFoundPage({ returnAction }: NotFoundPageProps) {
  const { t } = useTranslation()

  return (
    <Container maxW="4xl" py={{ base: '16', md: '24' }}>
      <Stack align="flex-start" gap="4">
        <Text color="fg.muted" fontSize="sm" fontWeight="semibold">
          404
        </Text>
        <Stack gap="2">
          <Text as="h1" fontSize={{ base: '3xl', md: '4xl' }} fontWeight="bold">
            {t('notFound.title')}
          </Text>
          <Text color="fg.muted">{t('notFound.description')}</Text>
        </Stack>
        {returnAction ?? (
          <Button asChild>
            <RouterLink to={APP_ROUTES.home}>{t('notFound.returnHome')}</RouterLink>
          </Button>
        )}
      </Stack>
    </Container>
  )
}
