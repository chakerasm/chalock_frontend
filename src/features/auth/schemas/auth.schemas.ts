import { z } from 'zod'

export const loginInputSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8).max(256),
})

export const authUserSchema = z.object({
  displayName: z.string().trim().min(1).max(80),
  email: z.string().email(),
  id: z.string().min(1),
})

export const authSessionSchema = z.object({
  expiresAt: z.string().datetime(),
  user: authUserSchema,
})
