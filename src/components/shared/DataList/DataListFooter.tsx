import { Table } from '@chakra-ui/react'
import type { ReactNode } from 'react'

type DataListFooterProps = {
  children: ReactNode
}

export function DataListFooter({ children }: DataListFooterProps) {
  return <Table.Footer>{children}</Table.Footer>
}
