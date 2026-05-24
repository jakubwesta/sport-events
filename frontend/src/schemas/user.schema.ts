import { z } from 'zod'

import { userRoleSchema } from '@/schemas/enums'

export const userSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  role: userRoleSchema,
  first_name: z.string().nullable().optional(),
  last_name: z.string().nullable().optional(),
  birth_year: z.number().nullable().optional(),
  phone_number: z.string().nullable().optional(),
})

export const userUpdateSchema = z.object({
  email: z.string().email().optional(),
  password: z.string().min(1).optional(),
  role: userRoleSchema.optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  birth_year: z.number().optional(),
  phone_number: z.string().regex(/^[0-9]{9}$/).optional(),
})

export type User = z.infer<typeof userSchema>
export type UserUpdate = z.infer<typeof userUpdateSchema>
