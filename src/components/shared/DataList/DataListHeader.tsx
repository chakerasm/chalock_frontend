import { Table } from '@chakra-ui/react'
import type { ReactNode } from 'react'

type DataListHeaderProps = {
  children: ReactNode
}

export function DataListHeader({ children }: DataListHeaderProps) {
  return <Table.Header>{children}</Table.Header>
}
