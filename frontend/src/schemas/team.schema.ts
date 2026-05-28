import { z } from 'zod'

import { teamMemberStatusSchema } from '@/schemas/enums'

export const teamSchema = z.object({
  id: z.number(),
  name: z.string(),
  owner_id: z.number(),
})

export const teamCreateSchema = z.object({
  name: z.string().min(1),
  event_id: z.number().optional(),
})

export const teamMemberSchema = z.object({
  id: z.number(),
  status: teamMemberStatusSchema,
  user_id: z.number().nullable().optional(),
  first_name: z.string().nullable().optional(),
  last_name: z.string().nullable().optional(),
  user: z.object({
    id: z.number(),
    first_name: z.string().nullable().optional(),
    last_name: z.string().nullable().optional(),
    email: z.string(),
  }).nullable().optional(),
  is_ghost: z.boolean().optional(),
  display_first_name: z.string().nullable().optional(),
  display_last_name: z.string().nullable().optional(),
  display_email: z.string().nullable().optional(),
})

export const teamMemberCreateSchema = z
  .object({
    user_id: z.number().optional(),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
  })
  .refine(
    (data) =>
      data.user_id != null || (Boolean(data.first_name) && Boolean(data.last_name)),
    { message: 'Provide user_id or both first_name and last_name.' },
  )

export type Team = z.infer<typeof teamSchema>
export type TeamCreate = z.infer<typeof teamCreateSchema>
export type TeamMember = z.infer<typeof teamMemberSchema>
export type TeamMemberCreate = z.infer<typeof teamMemberCreateSchema>
