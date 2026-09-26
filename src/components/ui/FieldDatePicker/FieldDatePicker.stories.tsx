import type { Meta, StoryObj } from '@storybook/react-vite'
import { useForm } from 'react-hook-form'
import { FieldDatePicker } from './FieldDatePicker'

const meta = {
  title: 'Fields/FieldDatePicker',
  tags: ['autodocs'],
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

function FieldDatePickerExample() {
  const { control } = useForm({ defaultValues: { dueDate: '' } })

  return (
    <FieldDatePicker
      control={control}
      disabledFuture
      label="Due date"
      name="dueDate"
    />
  )
}

export const Default: Story = {
  render: () => <FieldDatePickerExample />,
}
