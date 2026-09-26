import { Button, HStack } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { toast } from './Toaster'

const meta = {
  title: 'UI/Toaster',
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const Variants: Story = {
  render: () => (
    <HStack gap="3" wrap="wrap">
      <Button
        colorPalette="green"
        onClick={() =>
          toast.success({
            description: 'Your project is ready to use.',
            title: 'Project created',
          })
        }
      >
        Show success
      </Button>
      <Button
        colorPalette="orange"
        onClick={() =>
          toast.warning({
            description: 'Review the remaining required fields.',
            title: 'Changes need attention',
          })
        }
      >
        Show warning
      </Button>
      <Button
        colorPalette="red"
        onClick={() =>
          toast.error({
            description: 'Try the request again in a moment.',
            title: 'Unable to save changes',
          })
        }
      >
        Show error
      </Button>
    </HStack>
  ),
}
