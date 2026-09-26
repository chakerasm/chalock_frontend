import { Button, CloseButton, Dialog, Portal, Stack } from '@chakra-ui/react'
import type { FormEventHandler, ReactNode } from 'react'
import { useId } from 'react'
import { useTranslation } from 'react-i18next'

type FormDialogProps = {
  children: ReactNode
  title: ReactNode
  onOpenChange: (open: boolean) => void
  onSubmit: FormEventHandler<HTMLFormElement>
  open: boolean
  description?: ReactNode
  footer?: ReactNode
  isSubmitting?: boolean
  submitDisabled?: boolean
  submitLabel?: ReactNode
}

export function FormDialog({
  children,
  title,
  onOpenChange,
  onSubmit,
  open,
  description,
  footer,
  isSubmitting = false,
  submitDisabled = false,
  submitLabel,
}: FormDialogProps) {
  const { t } = useTranslation()
  const formId = useId()

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(details) => onOpenChange(details.open)}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <form id={formId} onSubmit={onSubmit}>
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
              <Dialog.Body>{children}</Dialog.Body>
              <Dialog.Footer>
                {footer ?? (
                  <>
                    <Button
                      onClick={() => onOpenChange(false)}
                      type="button"
                      variant="outline"
                    >
                      {t('form.cancel')}
                    </Button>
                    <Button
                      colorPalette="brand"
                      disabled={submitDisabled}
                      form={formId}
                      loading={isSubmitting}
                      type="submit"
                    >
                      {submitLabel ?? t('form.save')}
                    </Button>
                  </>
                )}
              </Dialog.Footer>
            </form>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}
