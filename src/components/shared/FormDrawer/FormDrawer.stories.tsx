import { Stack, Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { FormDrawer } from './FormDrawer'

const meta = {
  title: 'Shared/FormDrawer',
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

function FormDrawerExample() {
  const [open, setOpen] = useState(true)

  return (
    <FormDrawer
      description="A form shell for tasks that benefit from side-by-side context."
      onOpenChange={setOpen}
      onSubmit={(event) => {
        event.preventDefault()
        setOpen(false)
      }}
      open={open}
      title="Edit project"
    >
      <Stack gap="2">
        <Text>Place React Hook Form fields here.</Text>
        <Text color="fg.muted" fontSize="sm">
          The drawer keeps the surrounding page visible.
        </Text>
      </Stack>
    </FormDrawer>
  )
}

export const Default: Story = {
  render: () => <FormDrawerExample />,
}
