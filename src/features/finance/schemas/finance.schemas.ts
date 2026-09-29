import { z } from 'zod'

const identifierSchema = z.string().trim().min(1)
const currencySchema = z
  .string()
  .trim()
  .regex(/^[A-Za-z]{3}$/)
  .transform((value) => value.toUpperCase())
const dateSchema = z.string().date()
const optionalIdentifierSchema = z
  .union([identifierSchema, z.literal('')])
  .optional()
  .transform((value) => value || undefined)
const optionalTextSchema = z
  .string()
  .trim()
  .max(2_000)
  .optional()
  .transform((value) => value || undefined)
const optionalDateSchema = z
  .union([dateSchema, z.literal('')])
  .optional()
  .transform((value) => value || undefined)

export const accountTypeSchema = z.enum([
  'checking',
  'savings',
  'cash',
  'credit_card',
  'wallet',
  'other',
])
export const transactionTypeSchema = z.enum(['expense', 'income', 'transfer'])
export const categoryTypeSchema = z.enum(['expense', 'income'])
export const recurringFrequencySchema = z.enum([
  'weekly',
  'monthly',
  'quarterly',
  'semiannual',
  'annual',
  'custom',
])
export const savingsGoalStatusSchema = z.enum([
  'active',
  'completed',
  'paused',
  'archived',
])

export const accountInputSchema = z.object({
  currency: currencySchema,
  name: z.string().trim().min(1).max(100),
  openingBalance: z.number().finite(),
  type: accountTypeSchema,
})

export const transactionInputSchema = z
  .object({
    accountId: identifierSchema,
    amount: z.number().finite().positive(),
    categoryId: optionalIdentifierSchema,
    currency: currencySchema,
    description: optionalTextSchema,
    destinationAccountId: optionalIdentifierSchema,
    recurringTransactionId: identifierSchema.optional(),
    title: z.string().trim().min(1).max(160),
    transactionDate: dateSchema,
    type: transactionTypeSchema,
  })
  .superRefine((value, context) => {
    if (value.type === 'transfer' && !value.destinationAccountId) {
      context.addIssue({
        code: 'custom',
        message: 'A transfer needs a destination account.',
        path: ['destinationAccountId'],
      })
    }
    if (
      value.type === 'transfer' &&
      value.destinationAccountId === value.accountId
    ) {
      context.addIssue({
        code: 'custom',
        message: 'A transfer must use two different accounts.',
        path: ['destinationAccountId'],
      })
    }
  })

export const categoryInputSchema = z.object({
  icon: z.string().trim().max(40).optional(),
  name: z.string().trim().min(1).max(80),
  type: categoryTypeSchema,
})

const customIntervalSchema = z.object({
  unit: z.enum(['day', 'week', 'month', 'year']),
  value: z.number().int().positive().max(365),
})

export const recurringTransactionInputSchema = z
  .object({
    accountId: identifierSchema,
    amount: z.number().finite().positive(),
    categoryId: optionalIdentifierSchema,
    currency: currencySchema,
    customInterval: customIntervalSchema.optional(),
    endDate: optionalDateSchema,
    frequency: recurringFrequencySchema,
    isActive: z.boolean(),
    nextOccurrenceDate: dateSchema,
    title: z.string().trim().min(1).max(160),
    type: categoryTypeSchema,
  })
  .superRefine((value, context) => {
    if (value.frequency === 'custom' && !value.customInterval) {
      context.addIssue({
        code: 'custom',
        message: 'A custom schedule needs an interval.',
        path: ['customInterval'],
      })
    }
  })

export const savingsGoalInputSchema = z.object({
  currency: currencySchema,
  currentAmount: z.number().finite().min(0),
  name: z.string().trim().min(1).max(120),
  status: savingsGoalStatusSchema,
  targetAmount: z.number().finite().positive(),
  targetDate: optionalDateSchema,
})

export const updateAccountInputSchema = accountInputSchema.partial()
export const updateCategoryInputSchema = categoryInputSchema.partial()
export const updateSavingsGoalInputSchema = savingsGoalInputSchema.partial()
