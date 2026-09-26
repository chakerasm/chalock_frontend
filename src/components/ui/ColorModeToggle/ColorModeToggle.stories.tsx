import type { Meta, StoryObj } from '@storybook/react-vite'
import { ColorModeToggle } from './ColorModeToggle'

const meta = {
  title: 'UI/ColorModeToggle',
  component: ColorModeToggle,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof ColorModeToggle>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
