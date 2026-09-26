import { z } from 'zod'

export const exampleFutureItemFromAPISchema = z.object({
  createdAt: z.string().datetime(),
  id: z.string().min(1),
  memberCount: z.number().int().nonnegative(),
  name: z.string().min(1),
  status: z.enum(['active', 'paused']),
})

export const exampleFutureItemsFromAPISchema = z.array(
  exampleFutureItemFromAPISchema,
)

export const exampleFutureDetailFromAPISchema = z.object({
  createdAt: z.string().datetime(),
  description: z.string().min(1),
  id: z.string().min(1),
  memberCount: z.number().int().nonnegative(),
  name: z.string().min(1),
  ownerName: z.string().min(1),
  plan: z.enum(['starter', 'pro', 'enterprise']),
  status: z.enum(['active', 'paused']),
  updatedAt: z.string().datetime(),
})
