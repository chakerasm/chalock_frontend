import { Table } from '@chakra-ui/react'
import type { ReactNode } from 'react'

type DataListProps = {
  children: ReactNode
  caption?: ReactNode
  size?: 'lg' | 'md' | 'sm'
}

export function DataList({ children, caption, size = 'md' }: DataListProps) {
  return (
    <Table.ScrollArea bg="bg.panel" borderColor="border.subtle" borderWidth="1px" rounded="l2" shadow="xs">
      <Table.Root size={size} variant="outline">
        {caption ? <Table.Caption>{caption}</Table.Caption> : null}
        {children}
      </Table.Root>
    </Table.ScrollArea>
  )
}
