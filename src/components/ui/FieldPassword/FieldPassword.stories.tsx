import type { Meta, StoryObj } from '@storybook/react-vite'
import { useForm } from 'react-hook-form'
import { FieldPassword } from './FieldPassword'

const meta = {
  title: 'Fields/FieldPassword',
  tags: ['autodocs'],
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

function FieldPasswordExample() {
  const { control } = useForm({ defaultValues: { password: '' } })

  return (
    <FieldPassword
      control={control}
      description="Use at least 12 characters."
      label="Password"
      name="password"
      placeholder="Enter a password"
      required
    />
  )
}

export const Default: Story = {
  render: () => <FieldPasswordExample />,
}
