import {
  Button,
  Field,
  Input,
  Popover,
  Portal,
  SimpleGrid,
  Stack,
  Text,
} from '@chakra-ui/react'
import { CalendarDays } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  getQuickRescheduleDate,
  type QuickRescheduleOption,
} from '@/features/tasks/services/task-reschedule.service'

type TaskDateActionsProps = {
  disabled?: boolean
  onSelect: (dueDate: string | null) => void
  size?: 'xs' | 'sm'
}

const quickOptions: QuickRescheduleOption[] = [
  'today',
  'tomorrow',
  'weekend',
  'next-week',
  'no-date',
]

/** A compact, reusable set of date choices for task rescheduling. */
export function TaskDateActions({
  disabled = false,
  onSelect,
  size = 'xs',
}: TaskDateActionsProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  function selectDate(dueDate: string | null) {
    onSelect(dueDate)
    setOpen(false)
  }

  return (
    <Popover.Root
      onOpenChange={(details) => setOpen(details.open)}
      open={open}
      positioning={{ placement: 'bottom-end' }}
    >
      <Popover.Trigger asChild>
        <Button disabled={disabled} size={size} variant="outline">
          <CalendarDays aria-hidden="true" size={14} />
          {t('tasks.reschedule.trigger')}
        </Button>
      </Popover.Trigger>
      <Portal>
        <Popover.Positioner>
          <Popover.Content w={{ base: 'calc(100vw - 2rem)', sm: 'sm' }}>
            <Popover.Header fontWeight="semibold">
              {t('tasks.reschedule.title')}
            </Popover.Header>
            <Popover.Body>
              <Stack gap="3">
                <Text color="fg.muted" fontSize="sm">
                  {t('tasks.reschedule.description')}
                </Text>
                <SimpleGrid columns={2} gap="2">
                  {quickOptions.map((option) => (
                    <Button
                      justifyContent="start"
                      key={option}
                      onClick={() =>
                        selectDate(
                          option === 'no-date'
                            ? null
                            : getQuickRescheduleDate(option),
                        )
                      }
                      size="sm"
                      variant={option === 'no-date' ? 'outline' : 'subtle'}
                    >
                      {t(`tasks.reschedule.${option}`)}
                    </Button>
                  ))}
                </SimpleGrid>
                <Field.Root>
                  <Field.Label>{t('tasks.reschedule.pickDate')}</Field.Label>
                  <Input
                    min={getQuickRescheduleDate('today')}
                    onChange={(event) => {
                      if (event.target.value) selectDate(event.target.value)
                    }}
                    type="date"
                  />
                </Field.Root>
              </Stack>
            </Popover.Body>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  )
}
