import { Field, Textarea } from '@chakra-ui/react'
import type { Control, FieldPath, FieldValues } from 'react-hook-form'
import { Controller } from 'react-hook-form'

type FieldTextareaProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>
  name: FieldPath<TFieldValues>
  label: string
  description?: string
  placeholder?: string
  rows?: number
  disabled?: boolean
  required?: boolean
}

export function FieldTextarea<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  description,
  placeholder,
  rows = 4,
  disabled = false,
  required = false,
}: FieldTextareaProps<TFieldValues>) {
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
          <Textarea id={id} placeholder={placeholder} rows={rows} {...field} />
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
