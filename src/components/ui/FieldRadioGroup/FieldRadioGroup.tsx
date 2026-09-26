import { Field, RadioGroup, Stack } from '@chakra-ui/react'
import type { Control, FieldPath, FieldValues } from 'react-hook-form'
import { Controller } from 'react-hook-form'

type FieldRadioGroupOption = {
  label: string
  value: string
}

type FieldRadioGroupProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>
  name: FieldPath<TFieldValues>
  label: string
  options: readonly FieldRadioGroupOption[]
  description?: string
  disabled?: boolean
  required?: boolean
}

export function FieldRadioGroup<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  options,
  description,
  disabled = false,
  required = false,
}: FieldRadioGroupProps<TFieldValues>) {
  const labelId = `field-${String(name)}-label`

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
          <Field.Label id={labelId}>{label}</Field.Label>
          <RadioGroup.Root
            aria-labelledby={labelId}
            disabled={disabled}
            name={field.name}
            onValueChange={({ value }) => field.onChange(value)}
            value={field.value ?? ''}
          >
            <Stack gap="2">
              {options.map((option) => (
                <RadioGroup.Item key={option.value} value={option.value}>
                  <RadioGroup.ItemHiddenInput
                    onBlur={field.onBlur}
                    ref={field.ref}
                  />
                  <RadioGroup.ItemControl />
                  <RadioGroup.ItemText>{option.label}</RadioGroup.ItemText>
                </RadioGroup.Item>
              ))}
            </Stack>
          </RadioGroup.Root>
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
