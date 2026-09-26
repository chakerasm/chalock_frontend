import type { Meta, StoryObj } from '@storybook/react-vite'
import { useForm } from 'react-hook-form'
import { FieldCheckbox } from './FieldCheckbox'

const meta = {
  title: 'Fields/FieldCheckbox',
  tags: ['autodocs'],
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

function FieldCheckboxExample() {
  const { control } = useForm({ defaultValues: { termsAccepted: false } })

  return (
    <FieldCheckbox
      control={control}
      description="You can review the terms before accepting."
      label="Accept terms and conditions"
      name="termsAccepted"
      required
    />
  )
}

export const Default: Story = {
  render: () => <FieldCheckboxExample />,
}
