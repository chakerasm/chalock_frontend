import { Box, Stack, Text } from '@chakra-ui/react'
import { Lottie } from 'lottie-react'
import { useTranslation } from 'react-i18next'

type LoadingStateProps = {
  fullScreen?: boolean
  label?: string
}

export function LoadingState({ fullScreen = false, label }: LoadingStateProps) {
  const { t } = useTranslation()

  return (
    <Stack
      align="center"
      aria-busy="true"
      aria-live="polite"
      color="fg.muted"
      gap="3"
      justify="center"
      minH={fullScreen ? '100dvh' : undefined}
      py={fullScreen ? '6' : '12'}
      role="status"
      textAlign="center"
    >
      <Box aria-hidden="true" bg="bg.subtle" borderColor="border.subtle" borderWidth="1px" h="20" p="2" rounded="l2" w="20">
        <Lottie autoplay src="/loading-animation.json" />
      </Box>
      <Text>{label ?? t('loading')}</Text>
    </Stack>
  )
}
