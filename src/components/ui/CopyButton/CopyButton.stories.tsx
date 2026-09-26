import { Code, Stack, Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { CopyButton } from './CopyButton'

const meta = {
  title: 'UI/CopyButton',
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Stack align="start" gap="3">
      <Text color="fg.muted">Copy a value to the system clipboard.</Text>
      <Code p="3">project_2b4d9a</Code>
      <CopyButton value="project_2b4d9a" />
    </Stack>
  ),
}
