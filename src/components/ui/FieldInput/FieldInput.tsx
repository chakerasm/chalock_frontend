import { Field, Input } from '@chakra-ui/react'
import type { Control, FieldPath, FieldValues } from 'react-hook-form'
import { Controller } from 'react-hook-form'

type FieldInputProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>
  name: FieldPath<TFieldValues>
  label: string
  description?: string
  placeholder?: string
  type?: 'email' | 'search' | 'tel' | 'text' | 'url'
  disabled?: boolean
  required?: boolean
}

export function FieldInput<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  description,
  placeholder,
  type = 'text',
  disabled = false,
  required = false,
}: FieldInputProps<TFieldValues>) {
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
          <Input id={id} placeholder={placeholder} type={type} {...field} />
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
