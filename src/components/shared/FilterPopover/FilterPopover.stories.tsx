import { Field, Input } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { FilterPopover } from './FilterPopover'

const meta = {
  title: 'Shared/FilterPopover',
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

function FilterPopoverExample() {
  const [owner, setOwner] = useState('')

  return (
    <FilterPopover
      onApply={() => undefined}
      onClear={() => setOwner('')}
      title="Filter projects"
    >
      <Field.Root>
        <Field.Label htmlFor="project-owner">Owner</Field.Label>
        <Input
          id="project-owner"
          onChange={(event) => setOwner(event.target.value)}
          placeholder="Search by owner"
          value={owner}
        />
      </Field.Root>
    </FilterPopover>
  )
}

export const Default: Story = {
  render: () => <FilterPopoverExample />,
}
