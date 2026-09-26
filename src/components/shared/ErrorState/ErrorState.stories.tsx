import type { Meta, StoryObj } from '@storybook/react-vite'
import { ErrorState } from './ErrorState'

const meta = {
  title: 'Shared/ErrorState',
  component: ErrorState,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ErrorState>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    description: 'Your request could not be completed.',
    onRetry: () => undefined,
  },
}
