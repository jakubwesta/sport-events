import { z } from 'zod'

const envSchema = z.object({
  VITE_API_URL: z.url(),
})

const parsed = envSchema.safeParse(import.meta.env)

if (!parsed.success) {
  throw new Error(
    'Missing or invalid VITE_API_URL. Copy frontend/.env.example to frontend/.env and set the API URL.',
  )
}

export const env = parsed.data
