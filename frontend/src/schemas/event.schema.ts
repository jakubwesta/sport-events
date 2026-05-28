import { z } from 'zod'

import { categorySchema } from '@/schemas/category.schema'
import { eventStatusSchema, eventTypeSchema, participationStatusSchema } from '@/schemas/enums'
import { locationSchema } from '@/schemas/location.schema'

const dateTimeSchema = z.coerce.date()

export const participationUserInfoSchema = z.object({
  id: z.number(),
  first_name: z.string().nullable().optional(),
  last_name: z.string().nullable().optional(),
  email: z.string(),
})

export const participationTeamInfoSchema = z.object({
  id: z.number(),
  name: z.string(),
})

export const participationSchema = z.object({
  id: z.number(),
  user_id: z.number().nullable().optional(),
  team_id: z.number().nullable().optional(),
  status: participationStatusSchema,
  created_at: dateTimeSchema,
  user: participationUserInfoSchema.nullable().optional(),
  team: participationTeamInfoSchema.nullable().optional(),
})

export const participationCreateSchema = z
  .object({
    user_id: z.number().optional(),
    team_id: z.number().optional(),
  })
  .refine((data) => Boolean(data.user_id) !== Boolean(data.team_id), {
    message: 'Provide either user_id or team_id, not both.',
  })

export type Participation = z.infer<typeof participationSchema>
export type ParticipationCreate = z.infer<typeof participationCreateSchema>

export const eventSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string().nullable().optional(),
  event_type: eventTypeSchema,
  status: eventStatusSchema,
  price: z.number(),
  start_date: dateTimeSchema,
  duration: z.number().nullable().optional(),
  registration_deadline: dateTimeSchema,
  max_participants: z.number().nullable().optional(),
  min_team_size: z.number(),
  max_team_size: z.number(),
  is_published: z.boolean(),
  owner_id: z.number(),
  category: categorySchema,
  location: locationSchema.nullable().optional(),
})

export const eventCreateSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  event_type: eventTypeSchema.default('INDIVIDUAL'),
  status: eventStatusSchema.default('PLANNING'),
  price: z.number().min(0).default(0),
  start_date: dateTimeSchema,
  duration: z.number().optional(),
  registration_deadline: dateTimeSchema,
  max_participants: z.number().optional(),
  min_team_size: z.number().min(1).default(1),
  max_team_size: z.number().min(1).default(1),
  is_published: z.boolean().default(false),
  category_id: z.number(),
  location_id: z.number().nullable().optional(),
})

export const eventUpdateSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  status: eventStatusSchema.optional(),
  start_date: dateTimeSchema.optional(),
  registration_deadline: dateTimeSchema.optional(),
  price: z.number().min(0).optional(),
  is_published: z.boolean().optional(),
  location_id: z.number().nullable().optional(),
})

export const eventDetailsSchema = eventSchema.extend({
  participations: z.array(participationSchema).default([]),
})

export type Event = z.infer<typeof eventSchema>
export type EventCreate = z.infer<typeof eventCreateSchema>
export type EventUpdate = z.infer<typeof eventUpdateSchema>
export type EventDetails = z.infer<typeof eventDetailsSchema>

export type EventFilters = {
  status?: z.infer<typeof eventStatusSchema>
  category_id?: number
}

export const eventCreateFormSchema = z
  .object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    event_type: eventTypeSchema,
    status: eventStatusSchema,
    price: z.coerce.number().min(0, 'Price must be 0 or greater'),
    start_date: z.string().min(1, 'Start date is required'),
    duration: z.string().optional(),
    registration_deadline: z.string().min(1, 'Registration deadline is required'),
    max_participants: z.string().optional(),
    min_team_size: z.coerce.number().int().min(1),
    max_team_size: z.coerce.number().int().min(1),
    is_published: z.boolean(),
    category_id: z.string().min(1, 'Category is required'),
  })
  .refine((data) => data.max_team_size >= data.min_team_size, {
    message: 'Max team size must be greater than or equal to min team size',
    path: ['max_team_size'],
  })
  .refine(
    (data) => new Date(data.registration_deadline) <= new Date(data.start_date),
    {
      message: 'Registration deadline must be before the start date',
      path: ['registration_deadline'],
    },
  )

export type EventCreateFormValues = z.infer<typeof eventCreateFormSchema>

export function toEventCreatePayload(
  data: EventCreateFormValues,
  locationId?: number,
): EventCreate {
  return {
    title: data.title,
    description: data.description?.trim() || undefined,
    event_type: data.event_type,
    status: data.status,
    price: data.price,
    start_date: new Date(data.start_date),
    duration: data.duration?.trim() ? Number(data.duration) : undefined,
    registration_deadline: new Date(data.registration_deadline),
    max_participants: data.max_participants?.trim()
      ? Number(data.max_participants)
      : undefined,
    min_team_size: data.min_team_size,
    max_team_size: data.max_team_size,
    is_published: data.is_published,
    category_id: Number(data.category_id),
    location_id: locationId,
  }
}

export const eventUpdateFormSchema = z
  .object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    status: eventStatusSchema,
    price: z.coerce.number().min(0, 'Price must be 0 or greater'),
    start_date: z.string().min(1, 'Start date is required'),
    registration_deadline: z.string().min(1, 'Registration deadline is required'),
    is_published: z.boolean(),
  })
  .refine(
    (data) => new Date(data.registration_deadline) <= new Date(data.start_date),
    {
      message: 'Registration deadline must be before the start date',
      path: ['registration_deadline'],
    },
  )

export type EventUpdateFormValues = z.infer<typeof eventUpdateFormSchema>

export function toEventUpdatePayload(
  data: EventUpdateFormValues,
  locationId?: number | null,
): EventUpdate {
  return {
    title: data.title,
    description: data.description?.trim() || undefined,
    status: data.status,
    price: data.price,
    start_date: new Date(data.start_date),
    registration_deadline: new Date(data.registration_deadline),
    is_published: data.is_published,
    location_id: locationId,
  }
}

export function toDatetimeLocalValue(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}
