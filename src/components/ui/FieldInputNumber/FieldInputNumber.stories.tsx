import type { Meta, StoryObj } from '@storybook/react-vite'
import { useForm } from 'react-hook-form'
import { FieldInputNumber } from './FieldInputNumber'

const meta = {
  title: 'Fields/FieldInputNumber',
  tags: ['autodocs'],
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

function FieldInputNumberExample() {
  const { control } = useForm({ defaultValues: { quantity: 1 } })

  return (
    <FieldInputNumber
      control={control}
      description="Choose between 1 and 10 items."
      label="Quantity"
      max={10}
      min={1}
      name="quantity"
    />
  )
}

export const Default: Story = {
  render: () => <FieldInputNumberExample />,
}
