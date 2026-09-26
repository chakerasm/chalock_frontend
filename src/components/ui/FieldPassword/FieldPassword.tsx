import { Button, Field, HStack, Input } from '@chakra-ui/react'
import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import type { Control, FieldPath, FieldValues } from 'react-hook-form'
import { Controller } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

type FieldPasswordProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>
  name: FieldPath<TFieldValues>
  label: string
  description?: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
}

export function FieldPassword<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  description,
  placeholder,
  disabled = false,
  required = false,
}: FieldPasswordProps<TFieldValues>) {
  const { t } = useTranslation()
  const [isVisible, setIsVisible] = useState(false)
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
          <HStack align="stretch" gap="2">
            <Input
              id={id}
              placeholder={placeholder}
              type={isVisible ? 'text' : 'password'}
              {...field}
            />
            <Button
              aria-label={t(
                isVisible ? 'fieldControls.hide' : 'fieldControls.show',
                { label },
              )}
              disabled={disabled}
              onClick={() => setIsVisible((visible) => !visible)}
              type="button"
              variant="outline"
            >
              {isVisible ? (
                <EyeOff aria-hidden="true" />
              ) : (
                <Eye aria-hidden="true" />
              )}
            </Button>
          </HStack>
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
