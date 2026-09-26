import { Button } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { ConfirmDialog } from './ConfirmDialog'

const meta = {
  title: 'Shared/ConfirmDialog',
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

function ConfirmDialogExample() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button colorPalette="red" onClick={() => setOpen(true)}>
        Delete project
      </Button>
      <ConfirmDialog
        confirmLabel="Delete project"
        description="This action cannot be undone."
        isDestructive
        onConfirm={() => setOpen(false)}
        onOpenChange={setOpen}
        open={open}
        title="Delete project?"
      />
    </>
  )
}

export const Destructive: Story = {
  render: () => <ConfirmDialogExample />,
}
