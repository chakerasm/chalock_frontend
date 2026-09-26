import { HStack, Spinner, Text } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'

type LoadingStateProps = {
  label?: string
}

export function LoadingState({ label }: LoadingStateProps) {
  const { t } = useTranslation()

  return (
    <HStack
      aria-live="polite"
      color="fg.muted"
      gap="3"
      justify="center"
      py="12"
    >
      <Spinner size="sm" />
      <Text>{label ?? t('loading')}</Text>
    </HStack>
  )
}
