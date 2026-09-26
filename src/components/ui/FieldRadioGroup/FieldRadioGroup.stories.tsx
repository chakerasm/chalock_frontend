import type { Meta, StoryObj } from '@storybook/react-vite'
import { useForm } from 'react-hook-form'
import { FieldRadioGroup } from './FieldRadioGroup'

const meta = {
  title: 'Fields/FieldRadioGroup',
  tags: ['autodocs'],
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

function FieldRadioGroupExample() {
  const { control } = useForm({ defaultValues: { plan: 'starter' } })

  return (
    <FieldRadioGroup
      control={control}
      label="Plan"
      name="plan"
      options={[
        { label: 'Starter', value: 'starter' },
        { label: 'Professional', value: 'professional' },
      ]}
    />
  )
}

export const Default: Story = {
  render: () => <FieldRadioGroupExample />,
}
