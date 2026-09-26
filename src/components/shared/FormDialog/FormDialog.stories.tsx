import { Stack, Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { FormDialog } from './FormDialog'

const meta = {
  title: 'Shared/FormDialog',
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

function FormDialogExample() {
  const [open, setOpen] = useState(true)

  return (
    <FormDialog
      description="Collect form content while preserving the native submit flow."
      onOpenChange={setOpen}
      onSubmit={(event) => {
        event.preventDefault()
        setOpen(false)
      }}
      open={open}
      title="Create project"
    >
      <Stack gap="2">
        <Text>Place React Hook Form fields here.</Text>
        <Text color="fg.muted" fontSize="sm">
          The default footer provides localized cancel and save actions.
        </Text>
      </Stack>
    </FormDialog>
  )
}

export const Default: Story = {
  render: () => <FormDialogExample />,
}
