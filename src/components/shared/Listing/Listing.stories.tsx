import { Button, HStack, Input, Stack, Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Listing } from './Listing'

const meta = {
  title: 'Shared/Listing',
  component: Listing,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Listing>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    actions: <Button size="sm">Create project</Button>,
    children: (
      <Stack divideY="1px" gap="0">
        {['Apollo', 'Atlas', 'Orbit'].map((project) => (
          <HStack justify="space-between" key={project} p="4">
            <Text fontWeight="medium">{project}</Text>
            <Text color="fg.muted" fontSize="sm">
              Active
            </Text>
          </HStack>
        ))}
      </Stack>
    ),
    description: 'A generic header, toolbar, and bounded content area.',
    title: 'Projects',
    toolbar: (
      <Input aria-label="Search projects" placeholder="Search" size="sm" />
    ),
  },
}
