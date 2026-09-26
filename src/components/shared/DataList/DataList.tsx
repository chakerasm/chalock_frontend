import { Table } from '@chakra-ui/react'
import type { ReactNode } from 'react'

type DataListProps = {
  children: ReactNode
  caption?: ReactNode
  size?: 'lg' | 'md' | 'sm'
}

export function DataList({ children, caption, size = 'md' }: DataListProps) {
  return (
    <Table.ScrollArea borderWidth="1px" rounded="l2">
      <Table.Root size={size} variant="outline">
        {caption ? <Table.Caption>{caption}</Table.Caption> : null}
        {children}
      </Table.Root>
    </Table.ScrollArea>
  )
}
