import { Box, Button, Stack, Text } from '@chakra-ui/react'
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
      <Box alignItems="center" bg="danger.subtle" color="danger.fg" display="flex" h="12" justifyContent="center" rounded="l2" w="12">
        <AlertCircle aria-hidden="true" size={24} />
      </Box>
      <Text fontWeight="semibold">{title ?? t('error.title')}</Text>
      <Text color="fg.muted" maxW="md">{description ?? t('error.description')}</Text>
      {onRetry ? (
        <Button onClick={onRetry} size="sm" variant="outline">
          {t('error.retry')}
        </Button>
      ) : null}
    </Stack>
  )
}
