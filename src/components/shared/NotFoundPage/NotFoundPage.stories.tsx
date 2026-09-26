import { Button } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { NotFoundPage } from './NotFoundPage'

const meta = {
  title: 'Shared/NotFoundPage',
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <NotFoundPage
      isNotFound
      returnAction={<Button>Return home</Button>}
      routeId="__root__"
    />
  ),
}
