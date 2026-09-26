import { Skeleton, Table } from '@chakra-ui/react'
import { DataList } from '@/components/shared/DataList/DataList'
import { DataListCell } from '@/components/shared/DataList/DataListCell'
import { DataListContent } from '@/components/shared/DataList/DataListContent'
import { DataListHeader } from '@/components/shared/DataList/DataListHeader'

const skeletonRows = Array.from({ length: 4 }, (_, index) => index)

export function ExampleFutureDataListSkeleton() {
  return (
    <DataList>
      <DataListHeader>
        <Table.Row>
          <DataListCell header width="40%">
            <Skeleton height="4" width="24" />
          </DataListCell>
          <DataListCell header width="20%">
            <Skeleton height="4" width="16" />
          </DataListCell>
          <DataListCell header width="20%">
            <Skeleton height="4" width="12" />
          </DataListCell>
          <DataListCell header width="20%">
            <Skeleton height="4" width="16" />
          </DataListCell>
        </Table.Row>
      </DataListHeader>
      <DataListContent>
        {skeletonRows.map((row) => (
          <Table.Row key={row}>
            <DataListCell>
              <Skeleton height="5" maxW="52" />
            </DataListCell>
            <DataListCell>
              <Skeleton height="5" rounded="full" width="16" />
            </DataListCell>
            <DataListCell>
              <Skeleton height="5" width="10" />
            </DataListCell>
            <DataListCell>
              <Skeleton height="5" width="24" />
            </DataListCell>
          </Table.Row>
        ))}
      </DataListContent>
    </DataList>
  )
}
