import { z } from 'zod'

import { participationSchema } from '@/schemas/event.schema'

export const matchStatusSchema = z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])
export type MatchStatus = z.infer<typeof matchStatusSchema>

export const matchSchema = z.object({
  id: z.number(),
  event_id: z.number(),
  participation_a_id: z.number(),
  participation_b_id: z.number(),
  start_time: z.coerce.date().nullable().optional(),
  status: matchStatusSchema,
  team_a_score: z.number().nullable().optional(),
  team_b_score: z.number().nullable().optional(),
  details: z.record(z.string(), z.unknown()).nullable().optional(),
})

export const matchWithParticipationsSchema = matchSchema.extend({
  participation_a: participationSchema,
  participation_b: participationSchema,
})

export const matchCreateSchema = z.object({
  event_id: z.number(),
  participation_a_id: z.number(),
  participation_b_id: z.number(),
  start_time: z.coerce.date().optional(),
})

export const matchUpdateScoreSchema = z.object({
  team_a_score: z.number().int().min(0).nullable().optional(),
  team_b_score: z.number().int().min(0).nullable().optional(),
  status: matchStatusSchema.optional(),
})

export type Match = z.infer<typeof matchSchema>
export type MatchWithParticipations = z.infer<typeof matchWithParticipationsSchema>
export type MatchCreate = z.infer<typeof matchCreateSchema>
export type MatchUpdateScore = z.infer<typeof matchUpdateScoreSchema>
