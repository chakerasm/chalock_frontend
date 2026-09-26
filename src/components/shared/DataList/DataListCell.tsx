import { Table } from '@chakra-ui/react'
import type { ReactNode } from 'react'

type DataListCellProps = {
  children: ReactNode
  colSpan?: number
  header?: boolean
  width?: string | number
}

export function DataListCell({
  children,
  colSpan,
  header = false,
  width,
}: DataListCellProps) {
  if (header) {
    return (
      <Table.ColumnHeader colSpan={colSpan} width={width}>
        {children}
      </Table.ColumnHeader>
    )
  }

  return (
    <Table.Cell colSpan={colSpan} width={width}>
      {children}
    </Table.Cell>
  )
}
