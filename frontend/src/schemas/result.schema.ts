import { z } from 'zod'

export const resultTypeSchema = z.enum(['team_score', 'individual_score', 'timed'])
export type ResultType = z.infer<typeof resultTypeSchema>

const resultBaseSchema = z.object({
  id: z.number(),
  participation_id: z.number(),
  place: z.number().nullable().optional(),
  type: resultTypeSchema,
})

export const teamScoreResultSchema = resultBaseSchema.extend({
  type: z.literal('team_score'),
  result: z.string(),
  goals_scored: z.number().int(),
  goals_conceded: z.number().int(),
  details: z.record(z.string(), z.unknown()).nullable().optional(),
})

export const individualScoreResultSchema = resultBaseSchema.extend({
  type: z.literal('individual_score'),
  score: z.number(),
  unit: z.string(),
})

export const timedResultSchema = resultBaseSchema.extend({
  type: z.literal('timed'),
  total_time_ms: z.number(),
  splits: z.array(z.record(z.string(), z.unknown())).default([]),
})

export const anyResultSchema = z.discriminatedUnion('type', [
  teamScoreResultSchema,
  individualScoreResultSchema,
  timedResultSchema,
])

export type TeamScoreResult = z.infer<typeof teamScoreResultSchema>
export type IndividualScoreResult = z.infer<typeof individualScoreResultSchema>
export type TimedResult = z.infer<typeof timedResultSchema>
export type AnyResult = z.infer<typeof anyResultSchema>

export const individualScoreResultCreateSchema = z.object({
  participation_id: z.number(),
  score: z.number(),
  unit: z.string().min(1),
  place: z.number().int().min(1).optional(),
})

export const timedResultCreateSchema = z.object({
  participation_id: z.number(),
  total_time_ms: z.number().int().min(0),
  place: z.number().int().min(1).optional(),
})

export const teamScoreResultCreateSchema = z.object({
  participation_id: z.number(),
  result: z.enum(['win', 'loss', 'draw']),
  goals_scored: z.number().int().min(0),
  goals_conceded: z.number().int().min(0),
  place: z.number().int().min(1).optional(),
})

export type IndividualScoreResultCreate = z.infer<typeof individualScoreResultCreateSchema>
export type TimedResultCreate = z.infer<typeof timedResultCreateSchema>
export type TeamScoreResultCreate = z.infer<typeof teamScoreResultCreateSchema>
