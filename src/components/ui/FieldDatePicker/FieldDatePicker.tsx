import { Field } from '@chakra-ui/react'
import type {
  Control,
  FieldPath,
  FieldValues,
  RegisterOptions,
} from 'react-hook-form'
import { Controller } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { DatePickerInput } from './DatePickerInput'

type FieldDatePickerProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>
  name: FieldPath<TFieldValues>
  label: string
  description?: string
  disabled?: boolean
  disabledFuture?: boolean
  max?: string
  min?: string
  required?: boolean
  rules?: RegisterOptions<TFieldValues, FieldPath<TFieldValues>>
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

export function FieldDatePicker<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  description,
  disabled = false,
  disabledFuture = false,
  max,
  min,
  required = false,
  rules,
}: FieldDatePickerProps<TFieldValues>) {
  const { t } = useTranslation()
  const id = `field-${String(name)}`
  const maxDate = getMaxDate(max, disabledFuture)

  return (
    <Controller
      control={control}
      name={name}
      rules={{
        required: required ? t('dateFields.required') : false,
        ...rules,
      }}
      render={({ field, fieldState }) => (
        <Field.Root
          disabled={disabled}
          invalid={Boolean(fieldState.error)}
          required={required}
        >
          <Field.Label htmlFor={id}>{label}</Field.Label>
          <DatePickerInput
            disabled={disabled}
            id={id}
            inputRef={field.ref}
            max={maxDate}
            min={min}
            name={field.name}
            onBlur={field.onBlur}
            onChange={field.onChange}
            value={field.value ?? ''}
          />
          {description ? (
            <Field.HelperText>{description}</Field.HelperText>
          ) : null}
          {fieldState.error ? (
            <Field.ErrorText>{fieldState.error.message}</Field.ErrorText>
          ) : null}
        </Field.Root>
      )}
    />
  )
}
