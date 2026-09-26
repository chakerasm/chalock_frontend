import type { Meta, StoryObj } from '@storybook/react-vite'
import { useForm } from 'react-hook-form'
import { FieldInput } from './FieldInput'

const meta = {
  title: 'Fields/FieldInput',
  tags: ['autodocs'],
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

function FieldInputExample() {
  const { control } = useForm({ defaultValues: { email: '' } })

  return (
    <FieldInput
      control={control}
      description="We will only use this to contact you."
      label="Email address"
      name="email"
      placeholder="you@example.com"
      required
      type="email"
    />
  )
}

export const Default: Story = {
  render: () => <FieldInputExample />,
}
