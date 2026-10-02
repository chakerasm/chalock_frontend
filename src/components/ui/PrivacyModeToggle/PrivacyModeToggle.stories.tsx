import type { Meta, StoryObj } from '@storybook/react-vite'
import { PrivacyModeToggle } from './PrivacyModeToggle'

const meta = {
  title: 'UI/PrivacyModeToggle',
  component: PrivacyModeToggle,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof PrivacyModeToggle>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
