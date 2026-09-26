import type {
  ExampleFutureDetailFromAPI,
  ExampleFutureItemFromAPI,
} from '@/features/example-future/types/example-future.types'
import {
  buildArrayItemFromType,
  buildItemFromType,
} from '@/lib/test-utils/builders'

const names = ['Northstar', 'Launchpad', 'Keystone', 'Atlas']
const owners = ['Alex Morgan', 'Jordan Lee', 'Taylor Kim', 'Morgan Reed']
const plans = ['starter', 'pro', 'enterprise', 'pro'] as const

export const exampleFutureItemsMock = buildArrayItemFromType(4, (index) =>
  buildItemFromType<ExampleFutureItemFromAPI>({
    createdAt: new Date(Date.UTC(2026, index, index + 2)).toISOString(),
    id: `example-${index + 1}`,
    memberCount: (index + 1) * 8,
    name: names[index] ?? `Workspace ${index + 1}`,
    status: index === 2 ? 'paused' : 'active',
  }),
)

export const exampleFutureDetailsMock = exampleFutureItemsMock.map(
  (item, index) =>
    buildItemFromType<ExampleFutureDetailFromAPI>({
      ...item,
      description: `${item.name} is a reference workspace used to demonstrate a feature-owned detail flow.`,
      ownerName: owners[index] ?? 'Alex Morgan',
      plan: plans[index] ?? 'starter',
      updatedAt: new Date(Date.UTC(2026, index + 1, index + 10)).toISOString(),
    }),
)
