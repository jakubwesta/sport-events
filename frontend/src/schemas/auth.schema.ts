import { z } from 'zod'

import { userSchema } from '@/schemas/user.schema'

export const registerRoleSchema = z.enum(['USER', 'ORGANIZER'])

export const registerRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  birth_year: z.number().int().gt(1900).lt(2026),
  phone_number: z.string().regex(/^[0-9]{9}$/),
  role: registerRoleSchema.default('USER'),
})

export const loginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const googleLoginRequestSchema = z.object({
  id_token: z.string().min(1),
})

export const tokenResponseSchema = z.object({
  access_token: z.string(),
  token_type: z.string().default('bearer'),
})

export const registerFormSchema = registerRequestSchema
  .extend({
    passwordRepeat: z.string().min(1, 'Repeat your password'),
  })
  .refine((data) => data.password === data.passwordRepeat, {
    message: 'Passwords do not match',
    path: ['passwordRepeat'],
  })

export type RegisterRequest = z.infer<typeof registerRequestSchema>
export type RegisterRole = z.infer<typeof registerRoleSchema>
export type RegisterFormValues = z.infer<typeof registerFormSchema>
export type LoginRequest = z.infer<typeof loginRequestSchema>
export type GoogleLoginRequest = z.infer<typeof googleLoginRequestSchema>
export type TokenResponse = z.infer<typeof tokenResponseSchema>
export type RegisterResponse = z.infer<typeof userSchema>
