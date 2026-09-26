import { Checkbox, Field } from '@chakra-ui/react'
import type { Control, FieldPath, FieldValues } from 'react-hook-form'
import { Controller } from 'react-hook-form'

type FieldCheckboxProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>
  name: FieldPath<TFieldValues>
  label: string
  description?: string
  disabled?: boolean
  required?: boolean
}

export function FieldCheckbox<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  description,
  disabled = false,
  required = false,
}: FieldCheckboxProps<TFieldValues>) {
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
          <Checkbox.Root
            checked={Boolean(field.value)}
            disabled={disabled}
            name={field.name}
            onCheckedChange={({ checked }) => field.onChange(checked === true)}
          >
            <Checkbox.HiddenInput onBlur={field.onBlur} ref={field.ref} />
            <Checkbox.Control />
            <Checkbox.Label>{label}</Checkbox.Label>
          </Checkbox.Root>
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
