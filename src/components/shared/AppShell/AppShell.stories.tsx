import { Box, Stack, Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { AppShell } from './AppShell'

const meta = {
  title: 'Shared/AppShell',
  component: AppShell,
} satisfies Meta<typeof AppShell>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: (
      <Box p={{ base: '4', md: '8' }}>
        <Stack gap="2">
          <Text as="h1" fontSize="2xl" fontWeight="bold">
            Workspace content
          </Text>
          <Text color="fg.muted">
            Resize the preview to inspect the responsive sidebar and mobile
            drawer.
          </Text>
        </Stack>
      </Box>
    ),
  },
}
