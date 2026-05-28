import { api } from '@/lib/api'
import { parseApiError, parseResponse, parseResponseArray } from '@/lib/api-error'
import {
  matchSchema,
  matchWithParticipationsSchema,
  type Match,
  type MatchCreate,
  type MatchUpdateScore,
  type MatchWithParticipations,
} from '@/schemas'

export const matchesApi = {
  async getForEvent(eventId: number): Promise<MatchWithParticipations[]> {
    try {
      const response = await api.get(`/matches/event/${eventId}`)
      return parseResponseArray(matchWithParticipationsSchema, response.data)
    } catch (error) {
      throw parseApiError(error)
    }
  },

  async create(data: MatchCreate): Promise<Match> {
    try {
      const response = await api.post('/matches/', data)
      return parseResponse(matchSchema, response.data)
    } catch (error) {
      throw parseApiError(error)
    }
  },

  async updateScore(matchId: number, data: MatchUpdateScore): Promise<Match> {
    try {
      const response = await api.patch(`/matches/${matchId}/score`, data)
      return parseResponse(matchSchema, response.data)
    } catch (error) {
      throw parseApiError(error)
    }
  },

  async delete(matchId: number): Promise<void> {
    try {
      await api.delete(`/matches/${matchId}`)
    } catch (error) {
      throw parseApiError(error)
    }
  },
}
