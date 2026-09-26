import { Table } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { DataList } from '@/components/shared/DataList/DataList'
import { DataListCell } from '@/components/shared/DataList/DataListCell'
import { DataListContent } from '@/components/shared/DataList/DataListContent'
import { DataListHeader } from '@/components/shared/DataList/DataListHeader'
import { ExampleFutureDataListItem } from '@/features/example-future/components/ExampleFutureDataListItem'
import type { ExampleFutureItem } from '@/features/example-future/types/example-future.types'

type ExampleFutureDataListProps = {
  items: ExampleFutureItem[]
}

export function ExampleFutureDataList({ items }: ExampleFutureDataListProps) {
  const { t } = useTranslation()

  return (
    <DataList caption={t('exampleFuture.tableCaption')}>
      <DataListHeader>
        <Table.Row>
          <DataListCell header width="40%">
            {t('exampleFuture.name')}
          </DataListCell>
          <DataListCell header width="20%">
            {t('exampleFuture.status')}
          </DataListCell>
          <DataListCell header width="20%">
            {t('exampleFuture.members')}
          </DataListCell>
          <DataListCell header width="20%">
            {t('exampleFuture.created')}
          </DataListCell>
        </Table.Row>
      </DataListHeader>
      <DataListContent>
        {items.map((item) => (
          <ExampleFutureDataListItem item={item} key={item.id} />
        ))}
      </DataListContent>
    </DataList>
  )
}
