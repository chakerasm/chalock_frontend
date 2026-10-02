import { z } from 'zod'

export const loginInputSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(320),
  password: z.string().min(8).max(128),
})

export const registerInputSchema = loginInputSchema

export const authUserSchema = z.object({
  email: z.string().email(),
  id: z.string().min(1),
  createdAt: z.string().datetime(),
})

export const authenticationResponseSchema = z.object({
  accessToken: z.string().min(1),
  expiresIn: z.string().min(1),
  tokenType: z.literal('Bearer'),
  user: authUserSchema,
})
