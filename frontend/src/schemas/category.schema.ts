import { z } from 'zod'

export const categorySchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
})

export const categoryCreateSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
})

export type Category = z.infer<typeof categorySchema>
export type CategoryCreate = z.infer<typeof categoryCreateSchema>
