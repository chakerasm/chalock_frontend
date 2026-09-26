import type { Meta, StoryObj } from '@storybook/react-vite'
import { useForm } from 'react-hook-form'
import { FieldSelect } from './FieldSelect'

const meta = {
  title: 'Fields/FieldSelect',
  tags: ['autodocs'],
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

function FieldSelectExample() {
  const { control } = useForm({ defaultValues: { role: '' } })

  return (
    <FieldSelect
      control={control}
      label="Role"
      name="role"
      options={[
        { label: 'Administrator', value: 'administrator' },
        { label: 'Editor', value: 'editor' },
        { label: 'Viewer', value: 'viewer' },
      ]}
      placeholder="Choose a role"
      required
    />
  )
}

export const Default: Story = {
  render: () => <FieldSelectExample />,
}
