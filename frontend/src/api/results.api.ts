import { api } from '@/lib/api'
import { parseApiError, parseResponse, parseResponseArray } from '@/lib/api-error'
import {
  anyResultSchema,
  type AnyResult,
  type IndividualScoreResultCreate,
  type TeamScoreResultCreate,
  type TimedResultCreate,
} from '@/schemas'

export const resultsApi = {
  async getForEvent(eventId: number): Promise<AnyResult[]> {
    try {
      const response = await api.get(`/results/event/${eventId}`)
      return parseResponseArray(anyResultSchema, response.data)
    } catch (error) {
      throw parseApiError(error)
    }
  },

  async createIndividualScore(data: IndividualScoreResultCreate): Promise<AnyResult> {
    try {
      const response = await api.post('/results/individual-score', data)
      return parseResponse(anyResultSchema, response.data)
    } catch (error) {
      throw parseApiError(error)
    }
  },

  async createTeamScore(data: TeamScoreResultCreate): Promise<AnyResult> {
    try {
      const response = await api.post('/results/team-score', data)
      return parseResponse(anyResultSchema, response.data)
    } catch (error) {
      throw parseApiError(error)
    }
  },

  async createTimed(data: TimedResultCreate): Promise<AnyResult> {
    try {
      const response = await api.post('/results/timed', data)
      return parseResponse(anyResultSchema, response.data)
    } catch (error) {
      throw parseApiError(error)
    }
  },

  async delete(resultId: number): Promise<void> {
    try {
      await api.delete(`/results/${resultId}`)
    } catch (error) {
      throw parseApiError(error)
    }
  },
}
