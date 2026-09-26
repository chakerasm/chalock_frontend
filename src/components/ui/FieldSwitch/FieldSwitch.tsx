import { Field, Switch } from '@chakra-ui/react'
import type { Control, FieldPath, FieldValues } from 'react-hook-form'
import { Controller } from 'react-hook-form'

type FieldSwitchProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>
  name: FieldPath<TFieldValues>
  label: string
  description?: string
  disabled?: boolean
}

export function FieldSwitch<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  description,
  disabled = false,
}: FieldSwitchProps<TFieldValues>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field.Root disabled={disabled} invalid={Boolean(fieldState.error)}>
          <Switch.Root
            checked={Boolean(field.value)}
            disabled={disabled}
            name={field.name}
            onCheckedChange={({ checked }) => field.onChange(checked === true)}
          >
            <Switch.HiddenInput onBlur={field.onBlur} ref={field.ref} />
            <Switch.Control>
              <Switch.Thumb />
            </Switch.Control>
            <Switch.Label>{label}</Switch.Label>
          </Switch.Root>
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
