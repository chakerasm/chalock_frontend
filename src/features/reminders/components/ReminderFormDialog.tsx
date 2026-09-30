import {
  Button,
  CloseButton,
  Dialog,
  Field,
  Input,
  NativeSelect,
  Portal,
  SimpleGrid,
  Stack,
  Textarea,
} from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type {
  CreateReminderInput,
  Reminder,
  ReminderEntityReference,
  ReminderEntityType,
  ReminderRecurrence,
} from '@/features/reminders/types/reminders.types'

type ReminderFormDialogProps = {
  isSubmitting: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (input: CreateReminderInput) => void
  open: boolean
  references: ReminderEntityReference[]
  reminder?: Reminder
}

const entityTypes: ReminderEntityType[] = [
  'task',
  'subscription',
  'habit',
  'goal',
  'time_block',
  'custom',
]

function dateAndTime(value?: string) {
  if (!value) return { date: '', time: '09:00' }
  const date = new Date(value)
  return {
    date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`,
    time: `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`,
  }
}

export function ReminderFormDialog({
  isSubmitting,
  onOpenChange,
  onSubmit,
  open,
  references,
  reminder,
}: ReminderFormDialogProps) {
  const { t } = useTranslation()
  const [title, setTitle] = useState('')
  const [note, setNote] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('09:00')
  const [entityType, setEntityType] = useState<ReminderEntityType>('custom')
  const [entityId, setEntityId] = useState('')
  const [offset, setOffset] = useState('')
  const [frequency, setFrequency] = useState('none')
  const [weekdays, setWeekdays] = useState<number[]>([])
  const [formError, setFormError] = useState(false)
  const matchingReferences = useMemo(
    () => references.filter((item) => item.type === entityType),
    [entityType, references],
  )

  useEffect(() => {
    if (!open) return
    const trigger = dateAndTime(reminder?.triggerAt)
    setTitle(reminder?.title ?? '')
    setNote(reminder?.note ?? '')
    setDate(trigger.date)
    setTime(trigger.time)
    setEntityType(reminder?.entityType ?? 'custom')
    setEntityId(reminder?.entityId ?? '')
    setOffset(
      reminder?.advanceOffset
        ? `${reminder.advanceOffset.value}-${reminder.advanceOffset.unit}`
        : '',
    )
    setFrequency(reminder?.recurrence?.frequency ?? 'none')
    setWeekdays(reminder?.recurrence?.daysOfWeek ?? [])
    setFormError(false)
  }, [open, reminder])

  function toggleWeekday(day: number) {
    setWeekdays((current) =>
      current.includes(day)
        ? current.filter((item) => item !== day)
        : [...current, day],
    )
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const [offsetValue, offsetUnit] = offset.split('-')
    const recurrence: ReminderRecurrence | undefined =
      frequency === 'none'
        ? undefined
        : {
            daysOfWeek:
              frequency === 'weekly' && weekdays.length ? weekdays : undefined,
            frequency: frequency as ReminderRecurrence['frequency'],
            interval: 1,
          }
    const triggerAt =
      date && time ? new Date(`${date}T${time}`).toISOString() : undefined
    if (!title.trim() || (!triggerAt && !offset) || (offset && !entityId)) {
      setFormError(true)
      return
    }
    setFormError(false)
    onSubmit({
      advanceOffset: offset
        ? {
            unit: offsetUnit as 'minute' | 'hour' | 'day' | 'week',
            value: Number(offsetValue),
          }
        : undefined,
      entityId: entityId || undefined,
      entityType: entityType === 'custom' ? undefined : entityType,
      note: note.trim() || undefined,
      recurrence,
      title: title.trim(),
      triggerAt,
    })
  }

  return (
    <Dialog.Root
      onOpenChange={(details) => onOpenChange(details.open)}
      open={open}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner p="4">
          <Dialog.Content>
            <form onSubmit={submit}>
              <Dialog.Header>
                <Dialog.Title>
                  {t(
                    reminder
                      ? 'reminders.editReminder'
                      : 'reminders.createReminder',
                  )}
                </Dialog.Title>
                <Dialog.CloseTrigger asChild>
                  <CloseButton aria-label={t('common.close')} size="sm" />
                </Dialog.CloseTrigger>
              </Dialog.Header>
              <Dialog.Body>
                <Stack gap="4">
                  <Field.Root required>
                    <Field.Label>{t('reminders.titleLabel')}</Field.Label>
                    <Input
                      autoFocus
                      maxLength={120}
                      onChange={(event) => setTitle(event.target.value)}
                      value={title}
                    />
                  </Field.Root>
                  <SimpleGrid columns={{ base: 1, sm: 2 }} gap="4">
                    <Field.Root>
                      <Field.Label>{t('reminders.date')}</Field.Label>
                      <Input
                        onChange={(event) => setDate(event.target.value)}
                        type="date"
                        value={date}
                      />
                    </Field.Root>
                    <Field.Root>
                      <Field.Label>{t('reminders.time')}</Field.Label>
                      <Input
                        onChange={(event) => setTime(event.target.value)}
                        type="time"
                        value={time}
                      />
                    </Field.Root>
                  </SimpleGrid>
                  <Field.Root>
                    <Field.Label>{t('reminders.repeat')}</Field.Label>
                    <NativeSelect.Root>
                      <NativeSelect.Field
                        onChange={(event) => setFrequency(event.target.value)}
                        value={frequency}
                      >
                        <option value="none">
                          {t('reminders.doesNotRepeat')}
                        </option>
                        <option value="daily">
                          {t('reminders.frequencies.daily')}
                        </option>
                        <option value="weekly">
                          {t('reminders.frequencies.weekly')}
                        </option>
                        <option value="monthly">
                          {t('reminders.frequencies.monthly')}
                        </option>
                        <option value="yearly">
                          {t('reminders.frequencies.yearly')}
                        </option>
                      </NativeSelect.Field>
                      <NativeSelect.Indicator />
                    </NativeSelect.Root>
                  </Field.Root>
                  {frequency === 'weekly' ? (
                    <Field.Root>
                      <Field.Label>{t('reminders.weekdays')}</Field.Label>
                      <Stack direction="row" gap="1" wrap="wrap">
                        {[0, 1, 2, 3, 4, 5, 6].map((day) => (
                          <Button
                            colorPalette={
                              weekdays.includes(day) ? 'brand' : undefined
                            }
                            key={day}
                            onClick={() => toggleWeekday(day)}
                            size="xs"
                            type="button"
                            variant={
                              weekdays.includes(day) ? 'subtle' : 'outline'
                            }
                          >
                            {t(`reminders.weekday.${day}`)}
                          </Button>
                        ))}
                      </Stack>
                    </Field.Root>
                  ) : null}
                  <SimpleGrid columns={{ base: 1, sm: 2 }} gap="4">
                    <Field.Root>
                      <Field.Label>{t('reminders.relatedTo')}</Field.Label>
                      <NativeSelect.Root>
                        <NativeSelect.Field
                          onChange={(event) => {
                            setEntityType(
                              event.target.value as ReminderEntityType,
                            )
                            setEntityId('')
                          }}
                          value={entityType}
                        >
                          <option value="custom">
                            {t('reminders.noRelatedItem')}
                          </option>
                          {entityTypes
                            .filter((type) => type !== 'custom')
                            .map((type) => (
                              <option key={type} value={type}>
                                {t(`reminders.entityTypes.${type}`)}
                              </option>
                            ))}
                        </NativeSelect.Field>
                        <NativeSelect.Indicator />
                      </NativeSelect.Root>
                    </Field.Root>
                    {entityType !== 'custom' ? (
                      <Field.Root>
                        <Field.Label>{t('reminders.relatedItem')}</Field.Label>
                        <NativeSelect.Root>
                          <NativeSelect.Field
                            onChange={(event) =>
                              setEntityId(event.target.value)
                            }
                            value={entityId}
                          >
                            <option value="">
                              {t('reminders.selectItem')}
                            </option>
                            {matchingReferences.map((item) => (
                              <option key={item.id} value={item.id}>
                                {item.label}
                              </option>
                            ))}
                          </NativeSelect.Field>
                          <NativeSelect.Indicator />
                        </NativeSelect.Root>
                      </Field.Root>
                    ) : null}
                  </SimpleGrid>
                  {entityId ? (
                    <Field.Root>
                      <Field.Label>{t('reminders.remindMe')}</Field.Label>
                      <NativeSelect.Root>
                        <NativeSelect.Field
                          onChange={(event) => setOffset(event.target.value)}
                          value={offset}
                        >
                          <option value="">
                            {t('reminders.atChosenTime')}
                          </option>
                          <option value="10-minute">
                            {t('reminders.offsets.tenMinutes')}
                          </option>
                          <option value="30-minute">
                            {t('reminders.offsets.thirtyMinutes')}
                          </option>
                          <option value="1-hour">
                            {t('reminders.offsets.oneHour')}
                          </option>
                          <option value="1-day">
                            {t('reminders.offsets.oneDay')}
                          </option>
                          <option value="3-day">
                            {t('reminders.offsets.threeDays')}
                          </option>
                          <option value="1-week">
                            {t('reminders.offsets.oneWeek')}
                          </option>
                        </NativeSelect.Field>
                        <NativeSelect.Indicator />
                      </NativeSelect.Root>
                    </Field.Root>
                  ) : null}
                  <Field.Root>
                    <Field.Label>{t('reminders.note')}</Field.Label>
                    <Textarea
                      maxLength={2000}
                      onChange={(event) => setNote(event.target.value)}
                      rows={3}
                      value={note}
                    />
                  </Field.Root>
                  {formError ? (
                    <Field.ErrorText>
                      {t('reminders.formError')}
                    </Field.ErrorText>
                  ) : null}
                </Stack>
              </Dialog.Body>
              <Dialog.Footer>
                <Button
                  onClick={() => onOpenChange(false)}
                  type="button"
                  variant="outline"
                >
                  {t('form.cancel')}
                </Button>
                <Button
                  colorPalette="brand"
                  loading={isSubmitting}
                  type="submit"
                >
                  {t(
                    reminder
                      ? 'reminders.saveReminder'
                      : 'reminders.createReminder',
                  )}
                </Button>
              </Dialog.Footer>
            </form>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}
