import {
  Toaster as ChakraToaster,
  CloseButton,
  createToaster,
  Portal,
  Stack,
  Toast,
} from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'

type ToastOptions = {
  title: string
  description?: string
}

export const appToaster = createToaster({
  pauseOnPageIdle: true,
  placement: 'top-end',
})

function createToast(
  type: 'error' | 'success' | 'warning',
  options: ToastOptions,
) {
  appToaster.create({
    description: options.description,
    title: options.title,
    type,
  })
}

export const toast = {
  error: (options: ToastOptions) => createToast('error', options),
  success: (options: ToastOptions) => createToast('success', options),
  warning: (options: ToastOptions) => createToast('warning', options),
}

function getToastStyles(type: string | undefined) {
  switch (type) {
    case 'error':
      return {
        bg: 'danger.solid',
        borderColor: 'danger.solid',
        color: 'brand.contrast',
      }
    case 'success':
      return {
        bg: 'success.solid',
        borderColor: 'success.solid',
        color: 'brand.contrast',
      }
    case 'warning':
      return {
        bg: 'warning.solid',
        borderColor: 'warning.solid',
        color: 'brand.contrast',
      }
    default:
      return { bg: 'bg.elevated', borderColor: 'border.subtle', color: 'fg' }
  }
}

export function Toaster() {
  const { t } = useTranslation()

  return (
    <Portal>
      <ChakraToaster toaster={appToaster}>
        {(toast) => {
          const styles = getToastStyles(toast.type)

          return (
            <Toast.Root
              bg={styles.bg}
              borderColor={styles.borderColor}
              borderWidth="1px"
              color={styles.color}
              rounded="l2"
              shadow="lg"
              width={{ base: 'calc(100vw - 2rem)', sm: 'sm' }}
            >
              <Toast.Indicator />
              <Stack flex="1" gap="1" maxW="100%">
                <Toast.Title>{toast.title}</Toast.Title>
                {toast.description ? (
                  <Toast.Description>{toast.description}</Toast.Description>
                ) : null}
              </Stack>
              <Toast.CloseTrigger asChild>
                <CloseButton aria-label={t('common.close')} size="sm" />
              </Toast.CloseTrigger>
            </Toast.Root>
          )
        }}
      </ChakraToaster>
    </Portal>
  )
}
