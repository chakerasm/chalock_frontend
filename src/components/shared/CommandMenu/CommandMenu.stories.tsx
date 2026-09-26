import type { Meta, StoryObj } from '@storybook/react-vite'
import { CommandMenu } from './CommandMenu'

const meta = {
  title: 'Shared/CommandMenu',
  component: CommandMenu,
} satisfies Meta<typeof CommandMenu>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
