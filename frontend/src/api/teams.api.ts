import { api } from '@/lib/api'
import { parseApiError, parseResponse, parseResponseArray } from '@/lib/api-error'
import {
  participationSchema,
  teamCreateSchema,
  teamMemberCreateSchema,
  teamMemberSchema,
  teamSchema,
  type Participation,
  type Team,
  type TeamCreate,
  type TeamMember,
  type TeamMemberCreate,
} from '@/schemas'

export const teamsApi = {
  async list(): Promise<Team[]> {
    try {
      const response = await api.get('/teams/')
      return parseResponseArray(teamSchema, response.data)
    } catch (error) {
      throw parseApiError(error)
    }
  },

  async create(data: TeamCreate): Promise<Team> {
    teamCreateSchema.parse(data)
    try {
      const response = await api.post('/teams/', data)
      return parseResponse(teamSchema, response.data)
    } catch (error) {
      throw parseApiError(error)
    }
  },

  async addMember(teamId: number, data: TeamMemberCreate): Promise<TeamMember> {
    teamMemberCreateSchema.parse(data)
    try {
      const response = await api.post(`/teams/${teamId}/members`, data)
      return parseResponse(teamMemberSchema, response.data)
    } catch (error) {
      throw parseApiError(error)
    }
  },

  async getMembers(teamId: number): Promise<TeamMember[]> {
    try {
      const response = await api.get(`/teams/${teamId}/members`)
      return parseResponseArray(teamMemberSchema, response.data)
    } catch (error) {
      throw parseApiError(error)
    }
  },

  async removeMember(teamId: number, memberId: number): Promise<void> {
    try {
      await api.delete(`/teams/${teamId}/members/${memberId}`)
    } catch (error) {
      throw parseApiError(error)
    }
  },
}

export const participationsApi = {
  async markAsPaid(participationId: number): Promise<Participation> {
    try {
      const response = await api.patch(`/participations/${participationId}/pay`)
      return parseResponse(participationSchema, response.data)
    } catch (error) {
      throw parseApiError(error)
    }
  },
}
