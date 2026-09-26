import type { Meta, StoryObj } from '@storybook/react-vite'
import { AppInfoMenu } from './AppInfoMenu'

const meta = {
  title: 'Shared/AppInfoMenu',
  component: AppInfoMenu,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof AppInfoMenu>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
