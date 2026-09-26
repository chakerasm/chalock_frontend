import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { AppSidebar } from './AppSidebar'

const meta = {
  title: 'Shared/AppSidebar',
  component: AppSidebar,
  decorators: [
    (Story) => (
      <Box borderRightWidth="1px" h="100dvh" maxW="64">
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof AppSidebar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
