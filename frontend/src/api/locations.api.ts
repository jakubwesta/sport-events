import { api } from '@/lib/api'
import { parseApiError, parseResponse, parseResponseArray } from '@/lib/api-error'
import {
  locationCreateSchema,
  locationSchema,
  type Location,
  type LocationCreate,
} from '@/schemas'

export const locationsApi = {
  async list(): Promise<Location[]> {
    try {
      const response = await api.get('/locations/')
      return parseResponseArray(locationSchema, response.data)
    } catch (error) {
      throw parseApiError(error)
    }
  },

  async getById(locationId: number): Promise<Location> {
    try {
      const response = await api.get(`/locations/${locationId}`)
      return parseResponse(locationSchema, response.data)
    } catch (error) {
      throw parseApiError(error)
    }
  },

  async create(data: LocationCreate): Promise<Location> {
    locationCreateSchema.parse(data)
    try {
      const response = await api.post('/locations/', data)
      return parseResponse(locationSchema, response.data)
    } catch (error) {
      throw parseApiError(error)
    }
  },

  async remove(locationId: number): Promise<void> {
    try {
      await api.delete(`/locations/${locationId}`)
    } catch (error) {
      throw parseApiError(error)
    }
  },
}
