import { Table } from '@chakra-ui/react'
import type { ReactNode } from 'react'

type DataListContentProps = {
  children: ReactNode
}

export function DataListContent({ children }: DataListContentProps) {
  return <Table.Body>{children}</Table.Body>
}
