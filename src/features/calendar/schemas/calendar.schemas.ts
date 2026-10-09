import { z } from 'zod'

export const calendarSourceTypeSchema = z.enum([
  'planner',
  'task',
  'reminder',
  'goal',
  'subscription',
  'finance',
])

const calendarEventSourceTypeSchema = z.enum([
  'task',
  'time_block',
  'reminder',
  'goal',
  'subscription',
  'finance',
])

const calendarEventFromAPISchema = z.object({
  date: z.string().date(),
  endTime: z
    .string()
    .regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/)
    .optional(),
  id: z.string().min(1),
  sourceId: z.string().min(1),
  sourceType: calendarEventSourceTypeSchema,
  startTime: z
    .string()
    .regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/)
    .optional(),
  status: z.string().min(1).optional(),
  title: z.string().trim().min(1).max(120),
})

export const calendarItemFromAPISchema = calendarEventFromAPISchema.transform(
  (event) => ({
    allDay: !event.startTime,
    end: event.endTime ? `${event.date}T${event.endTime}:00` : undefined,
    id: event.id,
    sourceId: event.sourceId,
    sourceType: calendarSourceTypeSchema.parse(
      event.sourceType === 'time_block' ? 'planner' : event.sourceType,
    ),
    start: `${event.date}T${event.startTime ?? '00:00'}:00`,
    status: event.status,
    title: event.title,
  }),
)

export const calendarItemsFromAPISchema = z.union([
  z.array(calendarItemFromAPISchema),
  z
    .object({ data: z.array(calendarItemFromAPISchema) })
    .transform(({ data }) => data),
  z
    .object({ items: z.array(calendarItemFromAPISchema) })
    .transform(({ items }) => items),
  z
    .object({ events: z.array(calendarItemFromAPISchema) })
    .transform(({ events }) => events),
])
