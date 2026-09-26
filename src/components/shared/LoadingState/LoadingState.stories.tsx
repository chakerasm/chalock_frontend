import type { Meta, StoryObj } from '@storybook/react-vite'
import { LoadingState } from './LoadingState'

const meta = {
  title: 'Shared/LoadingState',
  component: LoadingState,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof LoadingState>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    label: 'Loading account data...',
  },
}
