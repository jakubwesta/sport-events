import { api } from '@/lib/api'
import { parseApiError, parseResponse, parseResponseArray } from '@/lib/api-error'
import {
  eventCreateSchema,
  eventSchema,
  eventUpdateSchema,
  participationCreateSchema,
  participationSchema,
  type Event,
  type EventCreate,
  type EventFilters,
  type EventUpdate,
  type Participation,
  type ParticipationCreate,
} from '@/schemas'

export const eventsApi = {
  async list(filters?: EventFilters): Promise<Event[]> {
    try {
      const response = await api.get('/events/', { params: filters })
      return parseResponseArray(eventSchema, response.data)
    } catch (error) {
      throw parseApiError(error)
    }
  },

  async getById(eventId: number): Promise<Event> {
    try {
      const response = await api.get(`/events/${eventId}`)
      return parseResponse(eventSchema, response.data)
    } catch (error) {
      throw parseApiError(error)
    }
  },

  async create(data: EventCreate): Promise<Event> {
    eventCreateSchema.parse(data)
    try {
      const response = await api.post('/events/', data)
      return parseResponse(eventSchema, response.data)
    } catch (error) {
      throw parseApiError(error)
    }
  },

  async update(eventId: number, data: EventUpdate): Promise<Event> {
    eventUpdateSchema.parse(data)
    try {
      const response = await api.patch(`/events/${eventId}`, data)
      return parseResponse(eventSchema, response.data)
    } catch (error) {
      throw parseApiError(error)
    }
  },

  async remove(eventId: number): Promise<void> {
    try {
      await api.delete(`/events/${eventId}`)
    } catch (error) {
      throw parseApiError(error)
    }
  },

  async participate(eventId: number, data: ParticipationCreate): Promise<Participation> {
    participationCreateSchema.parse(data)
    try {
      const response = await api.post(`/events/${eventId}/participate`, data)
      return parseResponse(participationSchema, response.data)
    } catch (error) {
      throw parseApiError(error)
    }
  },

  async getParticipations(eventId: number): Promise<Participation[]> {
    try {
      const response = await api.get(`/events/${eventId}/participations`)
      return parseResponseArray(participationSchema, response.data)
    } catch (error) {
      throw parseApiError(error)
    }
  },
}
