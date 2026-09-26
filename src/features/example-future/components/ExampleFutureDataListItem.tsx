import { Badge, Link, Table } from '@chakra-ui/react'
import { Link as RouterLink } from '@tanstack/react-router'
import { DataListCell } from '@/components/shared/DataList/DataListCell'
import type { ExampleFutureItem } from '@/features/example-future/types/example-future.types'
import { mapDateToUI } from '@/lib/mappers/date.mapper'

type ExampleFutureDataListItemProps = {
  item: ExampleFutureItem
}

export function ExampleFutureDataListItem({
  item,
}: ExampleFutureDataListItemProps) {
  return (
    <Table.Row>
      <DataListCell>
        <Link asChild fontWeight="semibold">
          <RouterLink params={{ itemId: item.id }} to="/example-future/$itemId">
            {item.name}
          </RouterLink>
        </Link>
      </DataListCell>
      <DataListCell>
        <Badge colorPalette={item.status === 'active' ? 'green' : 'orange'}>
          {item.status}
        </Badge>
      </DataListCell>
      <DataListCell>{item.memberCount}</DataListCell>
      <DataListCell>{mapDateToUI(item.createdAt).slice(0, 10)}</DataListCell>
    </Table.Row>
  )
}
