import { z } from 'zod'

export const userRoleSchema = z.enum(['ADMIN', 'GUEST', 'USER', 'ORGANIZER'])
export type UserRole = z.infer<typeof userRoleSchema>

export const eventTypeSchema = z.enum(['INDIVIDUAL', 'TEAM'])
export type EventType = z.infer<typeof eventTypeSchema>

export const eventStatusSchema = z.enum([
  'PLANNING',
  'REGISTRATION',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
  'POSTPONED',
])
export type EventStatus = z.infer<typeof eventStatusSchema>

export const participationStatusSchema = z.enum(['pending', 'accepted', 'rejected'])
export type ParticipationStatus = z.infer<typeof participationStatusSchema>

export const teamMemberStatusSchema = z.enum(['pending', 'accepted', 'rejected'])
export type TeamMemberStatus = z.infer<typeof teamMemberStatusSchema>
