import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { Pagination } from './Pagination'

const meta = {
  title: 'Shared/Pagination',
  component: Pagination,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Pagination>

export default meta
type Story = StoryObj<typeof meta>

function PaginationExample() {
  const [page, setPage] = useState(4)

  return <Pagination onPageChange={setPage} page={page} totalPages={12} />
}

export const Default: Story = {
  args: {
    onPageChange: () => undefined,
    page: 4,
    totalPages: 12,
  },
  render: () => <PaginationExample />,
}
