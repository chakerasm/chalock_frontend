import type { Meta, StoryObj } from '@storybook/react-vite'
import { useForm } from 'react-hook-form'
import { FieldSwitch } from './FieldSwitch'

const meta = {
  title: 'Fields/FieldSwitch',
  tags: ['autodocs'],
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

function FieldSwitchExample() {
  const { control } = useForm({ defaultValues: { notifications: true } })

  return (
    <FieldSwitch
      control={control}
      description="Receive updates about activity in your account."
      label="Email notifications"
      name="notifications"
    />
  )
}

export const Default: Story = {
  render: () => <FieldSwitchExample />,
}
