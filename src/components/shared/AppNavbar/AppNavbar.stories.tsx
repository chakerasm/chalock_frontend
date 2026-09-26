import type { Meta, StoryObj } from '@storybook/react-vite'
import { AppNavbar } from './AppNavbar'

const meta = {
  title: 'Shared/AppNavbar',
  component: AppNavbar,
} satisfies Meta<typeof AppNavbar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    onOpenNavigation: () => undefined,
  },
}
