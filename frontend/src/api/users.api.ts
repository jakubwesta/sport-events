import { api } from '@/lib/api'
import { parseApiError, parseResponse, parseResponseArray } from '@/lib/api-error'
import {
  eventSchema,
  userRoleSchema,
  userSchema,
  userUpdateSchema,
  type Event,
  type User,
  type UserRole,
  type UserUpdate,
} from '@/schemas'

export const usersApi = {
  async getMe(): Promise<User> {
    try {
      const response = await api.get('/users/me')
      return parseResponse(userSchema, response.data)
    } catch (error) {
      throw parseApiError(error)
    }
  },

  async list(): Promise<User[]> {
    try {
      const response = await api.get('/users/')
      return parseResponseArray(userSchema, response.data)
    } catch (error) {
      throw parseApiError(error)
    }
  },

  async getById(userId: number): Promise<User> {
    try {
      const response = await api.get(`/users/${userId}`)
      return parseResponse(userSchema, response.data)
    } catch (error) {
      throw parseApiError(error)
    }
  },

  async getMyEvents(): Promise<Event[]> {
    try {
      const response = await api.get('/users/me/events')
      return parseResponseArray(eventSchema, response.data)
    } catch (error) {
      throw parseApiError(error)
    }
  },

  async update(userId: number, data: UserUpdate): Promise<User> {
    userUpdateSchema.parse(data)
    try {
      const response = await api.patch(`/users/${userId}`, data)
      return parseResponse(userSchema, response.data)
    } catch (error) {
      throw parseApiError(error)
    }
  },

  async changeRole(userId: number, role: UserRole): Promise<User> {
    userRoleSchema.parse(role)
    try {
      const response = await api.patch(`/users/${userId}/role`, null, {
        params: { role },
      })
      return parseResponse(userSchema, response.data)
    } catch (error) {
      throw parseApiError(error)
    }
  },

  async remove(userId: number): Promise<void> {
    try {
      await api.delete(`/users/${userId}`)
    } catch (error) {
      throw parseApiError(error)
    }
  },
}
