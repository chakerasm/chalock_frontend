import type { Meta, StoryObj } from '@storybook/react-vite'
import { PrivateAmount } from './PrivateAmount'

const meta = {
  title: 'UI/PrivateAmount',
  component: PrivateAmount,
  parameters: { layout: 'centered' },
} satisfies Meta<typeof PrivateAmount>
export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = { args: { children: '$1,234.56' } }
