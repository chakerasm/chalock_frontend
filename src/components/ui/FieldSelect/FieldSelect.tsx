import { Field, NativeSelect } from '@chakra-ui/react'
import type { Control, FieldPath, FieldValues } from 'react-hook-form'
import { Controller } from 'react-hook-form'

type FieldSelectOption = {
  label: string
  value: string
}

type FieldSelectProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>
  name: FieldPath<TFieldValues>
  label: string
  options: readonly FieldSelectOption[]
  description?: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
  valueAsNumber?: boolean
}

export function FieldSelect<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  options,
  description,
  placeholder,
  disabled = false,
  required = false,
  valueAsNumber = false,
}: FieldSelectProps<TFieldValues>) {
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
          <NativeSelect.Root
            disabled={disabled}
            invalid={Boolean(fieldState.error)}
          >
            <NativeSelect.Field
              id={id}
              {...field}
              onChange={(event) =>
                field.onChange(
                  valueAsNumber
                    ? Number(event.target.value)
                    : event.target.value,
                )
              }
              placeholder={placeholder}
            >
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
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
