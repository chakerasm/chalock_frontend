import type { Meta, StoryObj } from '@storybook/react-vite'
import { ProfileMenu } from './ProfileMenu'

const meta = {
  title: 'Shared/ProfileMenu',
  component: ProfileMenu,
} satisfies Meta<typeof ProfileMenu>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
