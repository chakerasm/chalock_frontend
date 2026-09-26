import { Table } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { DataList } from './DataList'
import { DataListCell } from './DataListCell'
import { DataListContent } from './DataListContent'
import { DataListFooter } from './DataListFooter'
import { DataListHeader } from './DataListHeader'

const meta = {
  title: 'Shared/DataList',
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const projects = [
  { name: 'Apollo', owner: 'Ada Lovelace', status: 'Active' },
  { name: 'Atlas', owner: 'Grace Hopper', status: 'Active' },
  { name: 'Orbit', owner: 'Linus Torvalds', status: 'Paused' },
]

export const Default: Story = {
  render: () => (
    <DataList caption="Projects">
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
  ),
}
