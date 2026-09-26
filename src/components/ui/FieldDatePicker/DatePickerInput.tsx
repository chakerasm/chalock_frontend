import { Box, Input } from '@chakra-ui/react'
import { CalendarDays } from 'lucide-react'
import type { ChangeEventHandler, FocusEventHandler, Ref } from 'react'

type DatePickerInputProps = {
  disabled?: boolean
  id: string
  inputRef?: Ref<HTMLInputElement>
  max?: string
  min?: string
  name?: string
  onBlur: FocusEventHandler<HTMLInputElement>
  onChange: ChangeEventHandler<HTMLInputElement>
  value: string
}

export function DatePickerInput({
  disabled = false,
  id,
  inputRef,
  max,
  min,
  name,
  onBlur,
  onChange,
  value,
}: DatePickerInputProps) {
  return (
    <Box
      _focusWithin={{
        borderColor: 'brand.focusRing',
        boxShadow: '0 0 0 1px var(--chakra-colors-brand-focus-ring)',
      }}
      bg="bg.panel"
      borderWidth="1px"
      opacity={disabled ? 0.6 : 1}
      position="relative"
      rounded="l2"
      transition="border-color 0.2s, box-shadow 0.2s"
    >
      <Input
        _focusVisible={{ boxShadow: 'none' }}
        borderWidth="0"
        cursor={disabled ? 'not-allowed' : 'pointer'}
        disabled={disabled}
        id={id}
        max={max}
        min={min}
        name={name}
        onBlur={onBlur}
        onChange={onChange}
        pr="10"
        ref={inputRef}
        type="date"
        value={value}
        css={{
          '&::-webkit-calendar-picker-indicator': {
            cursor: disabled ? 'not-allowed' : 'pointer',
            height: '100%',
            inset: '0',
            opacity: 0,
            position: 'absolute',
            width: '100%',
          },
        }}
      />
      <Box
        aria-hidden="true"
        color="fg.muted"
        pointerEvents="none"
        position="absolute"
        right="3"
        top="50%"
        transform="translateY(-50%)"
      >
        <CalendarDays size={18} />
      </Box>
    </Box>
  )
}
