import { z } from 'zod'

export const subscriptionBillingCycleSchema = z.enum([
  'weekly',
  'monthly',
  'quarterly',
  'semiannual',
  'annual',
  'custom',
])
export const subscriptionStatusSchema = z.enum([
  'active',
  'trial',
  'paused',
  'cancelled',
  'expired',
])
export const subscriptionCategorySchema = z.enum([
  'software',
  'entertainment',
  'productivity',
  'fitness',
  'education',
  'cloud',
  'finance',
  'utilities',
  'membership',
  'other',
])
export const subscriptionIntervalUnitSchema = z.enum([
  'day',
  'week',
  'month',
  'year',
])

const customIntervalSchema = z.object({
  unit: subscriptionIntervalUnitSchema,
  value: z.number().int().positive(),
})

export const subscriptionInputSchema = z
  .object({
    amount: z.number().min(0),
    autoRenew: z.boolean(),
    billingCycle: subscriptionBillingCycleSchema,
    cancellationDate: z.string().date().optional(),
    category: subscriptionCategorySchema.optional(),
    currency: z
      .string()
      .trim()
      .regex(/^[A-Za-z]{3}$/),
    customBillingInterval: customIntervalSchema.optional(),
    description: z.string().trim().max(2_000).optional(),
    name: z.string().trim().min(1).max(120),
    nextBillingDate: z.string().date(),
    notes: z.string().trim().max(5_000).optional(),
    paymentMethodId: z.string().min(1).optional(),
    startDate: z.string().date().optional(),
    status: subscriptionStatusSchema,
    trialEndDate: z.string().date().optional(),
    websiteUrl: z.string().url().optional(),
  })
  .superRefine((value, context) => {
    if (value.billingCycle === 'custom' && !value.customBillingInterval) {
      context.addIssue({
        code: 'custom',
        message: 'A custom billing interval is required.',
        path: ['customBillingInterval'],
      })
    }
    if (value.status === 'trial' && !value.trialEndDate) {
      context.addIssue({
        code: 'custom',
        message: 'A trial end date is required for trial subscriptions.',
        path: ['trialEndDate'],
      })
    }
  })

export const subscriptionFromAPISchema = subscriptionInputSchema.extend({
  createdAt: z.string().datetime(),
  id: z.string().min(1),
  updatedAt: z.string().datetime(),
})
export const subscriptionsFromAPISchema = z.array(subscriptionFromAPISchema)
export const createSubscriptionInputSchema = subscriptionInputSchema.omit({
  cancellationDate: true,
})
export const updateSubscriptionInputSchema = subscriptionInputSchema.partial()
