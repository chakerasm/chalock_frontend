export type ExampleFutureItemFromAPI = {
  createdAt: string
  id: string
  memberCount: number
  name: string
  status: 'active' | 'paused'
}

export type ExampleFutureItem = {
  createdAt: string
  id: string
  memberCount: number
  name: string
  status: 'active' | 'paused'
}

export type ExampleFutureDetailFromAPI = {
  createdAt: string
  description: string
  id: string
  memberCount: number
  name: string
  ownerName: string
  plan: 'enterprise' | 'pro' | 'starter'
  status: 'active' | 'paused'
  updatedAt: string
}

export type ExampleFutureDetail = {
  createdAt: string
  description: string
  id: string
  memberCount: number
  name: string
  ownerName: string
  plan: 'enterprise' | 'pro' | 'starter'
  status: 'active' | 'paused'
  updatedAt: string
}
