import { Field, NumberInput } from '@chakra-ui/react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import type { Control, FieldPath, FieldValues } from 'react-hook-form'
import { Controller } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

type FieldInputNumberProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>
  name: FieldPath<TFieldValues>
  label: string
  description?: string
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  required?: boolean
}

export function FieldInputNumber<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  description,
  min,
  max,
  step = 1,
  disabled = false,
  required = false,
}: FieldInputNumberProps<TFieldValues>) {
  const { t } = useTranslation()
  const id = `field-${String(name)}`

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field.Root
          disabled={disabled}
          invalid={Boolean(fieldState.error)}
          required={required}
        >
          <Field.Label htmlFor={id}>{label}</Field.Label>
          <NumberInput.Root
            disabled={disabled}
            id={id}
            max={max}
            min={min}
            name={field.name}
            onValueChange={({ value, valueAsNumber }) =>
              field.onChange(value === '' ? undefined : valueAsNumber)
            }
            step={step}
            value={field.value == null ? '' : String(field.value)}
          >
            <NumberInput.Input id={id} onBlur={field.onBlur} ref={field.ref} />
            <NumberInput.Control>
              <NumberInput.IncrementTrigger
                aria-label={t('fieldControls.increase', { label })}
              >
                <ChevronUp size={14} />
              </NumberInput.IncrementTrigger>
              <NumberInput.DecrementTrigger
                aria-label={t('fieldControls.decrease', { label })}
              >
                <ChevronDown size={14} />
              </NumberInput.DecrementTrigger>
            </NumberInput.Control>
          </NumberInput.Root>
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
