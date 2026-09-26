import type { Meta, StoryObj } from '@storybook/react-vite'
import { EmptyState } from './EmptyState'

const meta = {
  title: 'Shared/EmptyState',
  component: EmptyState,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof EmptyState>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    description: 'Adjust your filters or create a new item.',
    title: 'No results found',
  },
}
