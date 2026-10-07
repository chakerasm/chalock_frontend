import type { Meta, StoryObj } from '@storybook/react-vite'
import { PrivateText } from './PrivateText'

const meta = {
  component: PrivateText,
  title: 'UI/PrivateText',
} satisfies Meta<typeof PrivateText>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { args: { children: 'Private project title' } }
