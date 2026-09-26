import { Button } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { PageHeader } from './PageHeader'

const meta = {
  title: 'Shared/PageHeader',
  component: PageHeader,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof PageHeader>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    actions: <Button>New item</Button>,
    description: 'Introduce a screen and provide its primary action.',
    eyebrow: 'Workspace',
    title: 'Projects',
  },
}
