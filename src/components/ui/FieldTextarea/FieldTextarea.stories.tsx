import type { Meta, StoryObj } from '@storybook/react-vite'
import { useForm } from 'react-hook-form'
import { FieldTextarea } from './FieldTextarea'

const meta = {
  title: 'Fields/FieldTextarea',
  tags: ['autodocs'],
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

function FieldTextareaExample() {
  const { control } = useForm({ defaultValues: { message: '' } })

  return (
    <FieldTextarea
      control={control}
      description="Keep your message concise and useful."
      label="Message"
      name="message"
      placeholder="Write a message"
      required
    />
  )
}

export const Default: Story = {
  render: () => <FieldTextareaExample />,
}
