import { Stack } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { LabelValue } from './LabelValue'

const meta = {
  title: 'Shared/LabelValue',
  component: LabelValue,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof LabelValue>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    label: 'Email address',
    value: 'ada@example.com',
  },
  render: (args) => (
    <Stack as="dl" maxW="md">
      <LabelValue {...args} />
      <LabelValue label="Unassigned value" />
    </Stack>
  ),
}
