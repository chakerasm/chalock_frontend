import { Button, Stack, Text } from '@chakra-ui/react'
import { AlertCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'

type ErrorStateProps = {
  title?: string
  description?: string
  onRetry?: () => void
}

export function ErrorState({ title, description, onRetry }: ErrorStateProps) {
  const { t } = useTranslation()

  return (
    <Stack align="center" gap="3" py="12" textAlign="center">
      <AlertCircle aria-hidden="true" size={28} />
      <Text fontWeight="semibold">{title ?? t('error.title')}</Text>
      <Text color="fg.muted">{description ?? t('error.description')}</Text>
      {onRetry ? (
        <Button onClick={onRetry} size="sm" variant="outline">
          {t('error.retry')}
        </Button>
      ) : null}
    </Stack>
  )
}
