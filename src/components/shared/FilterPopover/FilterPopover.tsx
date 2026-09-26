import { Button, HStack, Popover, Portal, Stack } from '@chakra-ui/react'
import { ListFilter } from 'lucide-react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

type FilterPopoverProps = {
  children: ReactNode
  trigger?: ReactNode
  onApply?: () => void
  onClear?: () => void
  onOpenChange?: (open: boolean) => void
  open?: boolean
  title?: ReactNode
  applyLabel?: ReactNode
  clearLabel?: ReactNode
}

export function FilterPopover({
  children,
  trigger,
  onApply,
  onClear,
  onOpenChange,
  open,
  title,
  applyLabel,
  clearLabel,
}: FilterPopoverProps) {
  const { t } = useTranslation()

  return (
    <Popover.Root
      onOpenChange={(details) => onOpenChange?.(details.open)}
      open={open}
      positioning={{ placement: 'bottom-start' }}
    >
      <Popover.Trigger asChild>
        {trigger ?? (
          <Button type="button" variant="outline">
            <ListFilter aria-hidden="true" />
            {t('filterPopover.open')}
          </Button>
        )}
      </Popover.Trigger>
      <Portal>
        <Popover.Positioner>
          <Popover.Content minW="xs">
            {title ? (
              <Popover.Header fontWeight="semibold">{title}</Popover.Header>
            ) : null}
            <Popover.Body>
              <Stack gap="4">{children}</Stack>
            </Popover.Body>
            {onApply || onClear ? (
              <Popover.Footer>
                <HStack justify="flex-end">
                  {onClear ? (
                    <Button onClick={onClear} type="button" variant="ghost">
                      {clearLabel ?? t('filterPopover.clear')}
                    </Button>
                  ) : null}
                  {onApply ? (
                    <Popover.CloseTrigger asChild>
                      <Button
                        colorPalette="brand"
                        onClick={onApply}
                        type="button"
                      >
                        {applyLabel ?? t('filterPopover.apply')}
                      </Button>
                    </Popover.CloseTrigger>
                  ) : null}
                </HStack>
              </Popover.Footer>
            ) : null}
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  )
}
