import { Button, CloseButton, Dialog, Portal, Stack } from '@chakra-ui/react'
import type { ReactNode } from 'react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

type ConfirmDialogProps = {
  onConfirm: () => Promise<void> | void
  onOpenChange: (open: boolean) => void
  open: boolean
  title: ReactNode
  confirmLabel?: ReactNode
  description?: ReactNode
  isConfirming?: boolean
  isDestructive?: boolean
}

export function ConfirmDialog({
  onConfirm,
  onOpenChange,
  open,
  title,
  confirmLabel,
  description,
  isConfirming = false,
  isDestructive = false,
}: ConfirmDialogProps) {
  const { t } = useTranslation()
  const [isConfirmingInternally, setIsConfirmingInternally] = useState(false)
  const isSubmitting = isConfirming || isConfirmingInternally

  async function handleConfirm() {
    setIsConfirmingInternally(true)

    try {
      await onConfirm()
    } finally {
      setIsConfirmingInternally(false)
    }
  }

  return (
    <Dialog.Root
      onOpenChange={(details) => onOpenChange(details.open)}
      open={open}
    >
      <Portal>
        <Dialog.Backdrop backdropFilter="blur(4px)" bg="bg.overlay" />
        <Dialog.Positioner>
          <Dialog.Content bg="bg.elevated" borderColor="border.subtle" borderWidth="1px" rounded="l3" shadow="lg">
            <Dialog.Header>
              <Stack gap="1">
                <Dialog.Title>{title}</Dialog.Title>
                {description ? (
                  <Dialog.Description>{description}</Dialog.Description>
                ) : null}
              </Stack>
              <Dialog.CloseTrigger asChild>
                <CloseButton aria-label={t('common.close')} size="sm" />
              </Dialog.CloseTrigger>
            </Dialog.Header>
            <Dialog.Footer>
              <Button
                disabled={isSubmitting}
                onClick={() => onOpenChange(false)}
                type="button"
                variant="outline"
              >
                {t('form.cancel')}
              </Button>
              <Button
                bg={isDestructive ? 'danger.solid' : undefined}
                color={isDestructive ? 'brand.contrast' : undefined}
                colorPalette={isDestructive ? undefined : 'brand'}
                loading={isSubmitting}
                onClick={() => void handleConfirm()}
                type="button"
              >
                {confirmLabel ?? t('confirmDialog.confirm')}
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}
