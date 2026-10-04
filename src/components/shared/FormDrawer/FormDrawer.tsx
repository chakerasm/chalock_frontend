import { Button, CloseButton, Drawer, Portal, Stack } from '@chakra-ui/react'
import type { FormEventHandler, ReactNode } from 'react'
import { useId } from 'react'
import { useTranslation } from 'react-i18next'

type FormDrawerProps = {
  children: ReactNode
  title: ReactNode
  onOpenChange: (open: boolean) => void
  onSubmit: FormEventHandler<HTMLFormElement>
  open: boolean
  description?: ReactNode
  footer?: ReactNode
  isSubmitting?: boolean
  placement?: 'bottom' | 'end' | 'start' | 'top'
  submitDisabled?: boolean
  submitLabel?: ReactNode
}

export function FormDrawer({
  children,
  title,
  onOpenChange,
  onSubmit,
  open,
  description,
  footer,
  isSubmitting = false,
  placement = 'end',
  submitDisabled = false,
  submitLabel,
}: FormDrawerProps) {
  const { t } = useTranslation()
  const formId = useId()

  return (
    <Drawer.Root
      open={open}
      onOpenChange={(details) => onOpenChange(details.open)}
      placement={placement}
    >
      <Portal>
        <Drawer.Backdrop backdropFilter="blur(4px)" bg="bg.overlay" />
        <Drawer.Positioner>
          <Drawer.Content bg="bg.elevated" borderColor="border.subtle" borderWidth="1px" shadow="lg">
            <form id={formId} onSubmit={onSubmit}>
              <Drawer.Header>
                <Stack gap="1">
                  <Drawer.Title>{title}</Drawer.Title>
                  {description ? (
                    <Drawer.Description>{description}</Drawer.Description>
                  ) : null}
                </Stack>
                <Drawer.CloseTrigger asChild>
                  <CloseButton aria-label={t('common.close')} size="sm" />
                </Drawer.CloseTrigger>
              </Drawer.Header>
              <Drawer.Body>{children}</Drawer.Body>
              <Drawer.Footer>
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
              </Drawer.Footer>
            </form>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  )
}
