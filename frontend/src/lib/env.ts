import { z } from 'zod'

const envSchema = z.object({
  VITE_API_URL: z.url(),
  VITE_GOOGLE_CLIENT_ID: z.string().optional(),
})

const parsed = envSchema.safeParse(import.meta.env)

if (!parsed.success) {
  throw new Error(
    'Missing or invalid VITE_API_URL. Copy frontend/.env.example to frontend/.env and set the API URL.',
  )
}

export const env = parsed.data

export const googleClientId = env.VITE_GOOGLE_CLIENT_ID?.trim() || undefined
