import { Breadcrumb } from '@chakra-ui/react'
import { ChevronRight } from 'lucide-react'

type BreadcrumbItem = {
  id: string
  label: string
  href?: string
}

type BreadcrumbsProps = {
  items: readonly BreadcrumbItem[]
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <Breadcrumb.Root>
      <Breadcrumb.List>
        {items.map((item, index) => {
          const isCurrentPage = index === items.length - 1

          return (
            <Breadcrumb.Item key={item.id}>
              {isCurrentPage ? (
                <Breadcrumb.CurrentLink>{item.label}</Breadcrumb.CurrentLink>
              ) : (
                <Breadcrumb.Link href={item.href}>{item.label}</Breadcrumb.Link>
              )}
              {!isCurrentPage ? (
                <Breadcrumb.Separator>
                  <ChevronRight aria-hidden="true" size={14} />
                </Breadcrumb.Separator>
              ) : null}
            </Breadcrumb.Item>
          )
        })}
      </Breadcrumb.List>
    </Breadcrumb.Root>
  )
}
