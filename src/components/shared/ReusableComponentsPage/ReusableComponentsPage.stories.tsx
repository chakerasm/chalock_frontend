import { Button, HStack, Stack, Table, Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { DataList } from '../DataList/DataList'
import { DataListCell } from '../DataList/DataListCell'
import { DataListContent } from '../DataList/DataListContent'
import { DataListFooter } from '../DataList/DataListFooter'
import { DataListHeader } from '../DataList/DataListHeader'
import { EmptyState } from '../EmptyState/EmptyState'
import { ErrorState } from '../ErrorState/ErrorState'
import { Listing } from '../Listing/Listing'
import { LoadingState } from '../LoadingState/LoadingState'
import { PageHeader } from '../PageHeader/PageHeader'
import { Pagination } from '../Pagination/Pagination'

const meta = {
  title: 'Pages/Reusable components',
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const projects = [
  { name: 'Apollo', owner: 'Ada Lovelace', status: 'Active' },
  { name: 'Atlas', owner: 'Grace Hopper', status: 'Active' },
  { name: 'Orbit', owner: 'Linus Torvalds', status: 'Paused' },
]

function ReusableComponentsPage() {
  const [page, setPage] = useState(2)

  return (
    <Stack gap="10" maxW="4xl">
      <PageHeader
        actions={<Button colorPalette="brand">Create item</Button>}
        description="Application-wide building blocks ready for feature use."
        eyebrow="Shared UI"
        title="Reusable components"
      />
      <Listing
        actions={
          <Button colorPalette="brand" size="sm">
            Add project
          </Button>
        }
        description="Use for a titled collection with controls and content."
        title="Projects"
        toolbar={<Text fontSize="sm">Showing 3 of 36 projects</Text>}
      >
        <Stack divideY="1px" gap="0">
          {projects.map((project) => (
            <HStack justify="space-between" key={project.name} p="4">
              <Text fontWeight="medium">{project.name}</Text>
              <Text color="fg.muted" fontSize="sm">
                {project.status}
              </Text>
            </HStack>
          ))}
        </Stack>
      </Listing>
      <DataList caption="Project directory">
        <DataListHeader>
          <Table.Row>
            <DataListCell header>Project</DataListCell>
            <DataListCell header>Owner</DataListCell>
            <DataListCell header>Status</DataListCell>
          </Table.Row>
        </DataListHeader>
        <DataListContent>
          {projects.map((project) => (
            <Table.Row key={project.name}>
              <DataListCell>{project.name}</DataListCell>
              <DataListCell>{project.owner}</DataListCell>
              <DataListCell>{project.status}</DataListCell>
            </Table.Row>
          ))}
        </DataListContent>
        <DataListFooter>
          <Table.Row>
            <DataListCell colSpan={3}>3 projects</DataListCell>
          </Table.Row>
        </DataListFooter>
      </DataList>
      <Pagination onPageChange={setPage} page={page} totalPages={12} />
      <LoadingState label="Loading account data..." />
      <EmptyState
        description="Adjust your filters or create a new item."
        title="No results found"
      />
      <ErrorState description="Your request could not be completed." />
    </Stack>
  )
}

export const Default: Story = {
  render: () => <ReusableComponentsPage />,
}
