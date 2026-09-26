import { Button, HStack, Stack, Text } from '@chakra-ui/react'
import { Pause, Play } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { FormDialog } from '@/components/shared/FormDialog/FormDialog'
import { formatFocusDuration } from '@/features/today/components/FocusCard'
import type { ActiveFocusSession } from '@/features/today/types/today.types'

type ActiveFocusSessionDialogProps = {
  elapsedSeconds: number
  isUpdating: boolean
  onOpenChange: (open: boolean) => void
  onUpdateSession: (
    session: ActiveFocusSession,
    elapsedSeconds: number,
    status: 'paused' | 'running',
  ) => void
  open: boolean
  session: ActiveFocusSession | null
}

export function ActiveFocusSessionDialog({
  elapsedSeconds,
  isUpdating,
  onOpenChange,
  onUpdateSession,
  open,
  session,
}: ActiveFocusSessionDialogProps) {
  const { t } = useTranslation()
  if (!session) return null
  const isRunning = session.status === 'running'
  return (
    <FormDialog
      footer={
        <HStack>
          <Button onClick={() => onOpenChange(false)} variant="outline">
            {t('common.close')}
          </Button>
          <Button
            disabled={isUpdating}
            onClick={() =>
              onUpdateSession(
                session,
                elapsedSeconds,
                isRunning ? 'paused' : 'running',
              )
            }
          >
            {isRunning ? (
              <Pause aria-hidden="true" size={16} />
            ) : (
              <Play aria-hidden="true" size={16} />
            )}
            {isRunning ? t('today.pauseFocus') : t('today.resumeFocus')}
          </Button>
        </HStack>
      }
      onOpenChange={onOpenChange}
      onSubmit={(event) => event.preventDefault()}
      open={open}
      title={t('today.activeFocusSession')}
    >
      <Stack gap="2">
        <Text
          fontSize="4xl"
          fontVariantNumeric="tabular-nums"
          fontWeight="bold"
        >
          {formatFocusDuration(elapsedSeconds)}
        </Text>
        <Text color="fg.muted">
          {session.taskTitle ?? t('today.focusWithoutTask')}
        </Text>
      </Stack>
    </FormDialog>
  )
}
