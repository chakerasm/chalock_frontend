import type { Meta, StoryObj } from '@storybook/react-vite'
import { Breadcrumbs } from './Breadcrumbs'

const meta = {
  title: 'Shared/Breadcrumbs',
  component: Breadcrumbs,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Breadcrumbs>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    items: [
      { href: '/', id: 'home', label: 'Home' },
      { href: '/projects', id: 'projects', label: 'Projects' },
      { id: 'apollo', label: 'Apollo' },
    ],
  },
}
