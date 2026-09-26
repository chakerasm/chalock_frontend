import { Field, SimpleGrid, Stack, Text } from '@chakra-ui/react'
import type { Control, FieldPath, FieldValues } from 'react-hook-form'
import { Controller, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { DatePickerInput } from '@/components/ui/FieldDatePicker/DatePickerInput'

type FieldDatePickerIntervalProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>
  endName: FieldPath<TFieldValues>
  label: string
  startName: FieldPath<TFieldValues>
  description?: string
  disabled?: boolean
  disabledFuture?: boolean
  endLabel?: string
  max?: string
  min?: string
  required?: boolean
  startLabel?: string
}

function getTodayDateValue() {
  const date = new Date()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${date.getFullYear()}-${month}-${day}`
}

function getMaxDate(max: string | undefined, disabledFuture: boolean) {
  if (!disabledFuture) {
    return max
  }

  const today = getTodayDateValue()
  return max && max < today ? max : today
}

export function FieldDatePickerInterval<TFieldValues extends FieldValues>({
  control,
  endName,
  label,
  startName,
  description,
  disabled = false,
  disabledFuture = false,
  endLabel,
  max,
  min,
  required = false,
  startLabel,
}: FieldDatePickerIntervalProps<TFieldValues>) {
  const { t } = useTranslation()
  const [startValue, endValue] = useWatch({
    control,
    name: [startName, endName],
  })
  const resolvedStartLabel = startLabel ?? t('dateFields.start')
  const resolvedEndLabel = endLabel ?? t('dateFields.end')
  const startId = `field-${String(startName)}`
  const endId = `field-${String(endName)}`
  const maxDate = getMaxDate(max, disabledFuture)
  const hasInvalidInterval =
    typeof startValue === 'string' &&
    typeof endValue === 'string' &&
    startValue.length > 0 &&
    endValue.length > 0 &&
    startValue > endValue
  const endMin = typeof startValue === 'string' && startValue ? startValue : min

  return (
    <Stack as="fieldset" gap="3">
      <Stack gap="1">
        <Text as="legend" fontWeight="medium">
          {label}
        </Text>
        {description ? (
          <Text color="fg.muted" fontSize="sm">
            {description}
          </Text>
        ) : null}
      </Stack>
      <SimpleGrid columns={{ base: 1, md: 2 }} gap="3">
        <Controller
          control={control}
          name={startName}
          rules={{ required: required ? t('dateFields.required') : false }}
          render={({ field, fieldState }) => (
            <Field.Root
              disabled={disabled}
              invalid={Boolean(fieldState.error) || hasInvalidInterval}
              required={required}
            >
              <Field.Label htmlFor={startId}>{resolvedStartLabel}</Field.Label>
              <DatePickerInput
                disabled={disabled}
                id={startId}
                inputRef={field.ref}
                max={maxDate}
                min={min}
                name={field.name}
                onBlur={field.onBlur}
                onChange={field.onChange}
                value={field.value ?? ''}
              />
              {fieldState.error ? (
                <Field.ErrorText>{fieldState.error.message}</Field.ErrorText>
              ) : null}
            </Field.Root>
          )}
        />
        <Controller
          control={control}
          name={endName}
          rules={{
            required: required ? t('dateFields.required') : false,
            validate: (value) => {
              if (!startValue || !value || typeof startValue !== 'string') {
                return true
              }

              return value >= startValue || t('dateFields.invalidInterval')
            },
          }}
          render={({ field, fieldState }) => {
            const errorMessage =
              fieldState.error?.message ??
              (hasInvalidInterval ? t('dateFields.invalidInterval') : undefined)

            return (
              <Field.Root
                disabled={disabled}
                invalid={Boolean(errorMessage)}
                required={required}
              >
                <Field.Label htmlFor={endId}>{resolvedEndLabel}</Field.Label>
                <DatePickerInput
                  disabled={disabled}
                  id={endId}
                  inputRef={field.ref}
                  max={maxDate}
                  min={endMin}
                  name={field.name}
                  onBlur={field.onBlur}
                  onChange={field.onChange}
                  value={field.value ?? ''}
                />
                {errorMessage ? (
                  <Field.ErrorText>{errorMessage}</Field.ErrorText>
                ) : null}
              </Field.Root>
            )
          }}
        />
      </SimpleGrid>
    </Stack>
  )
}
