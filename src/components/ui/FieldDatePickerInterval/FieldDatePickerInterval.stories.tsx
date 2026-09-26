import type { Meta, StoryObj } from '@storybook/react-vite'
import { useForm } from 'react-hook-form'
import { FieldDatePickerInterval } from './FieldDatePickerInterval'

const meta = {
  title: 'Fields/FieldDatePickerInterval',
  tags: ['autodocs'],
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

function FieldDatePickerIntervalExample() {
  const { control } = useForm({
    defaultValues: { endDate: '', startDate: '' },
  })

  return (
    <FieldDatePickerInterval
      control={control}
      disabledFuture
      label="Project dates"
      endName="endDate"
      startName="startDate"
    />
  )
}

export const Default: Story = {
  render: () => <FieldDatePickerIntervalExample />,
}
