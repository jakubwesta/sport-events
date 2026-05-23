import { api } from '@/lib/api'
import { parseApiError, parseResponse, parseResponseArray } from '@/lib/api-error'
import {
  categoryCreateSchema,
  categorySchema,
  type Category,
  type CategoryCreate,
} from '@/schemas'

export const categoriesApi = {
  async list(): Promise<Category[]> {
    try {
      const response = await api.get('/categories/')
      return parseResponseArray(categorySchema, response.data)
    } catch (error) {
      throw parseApiError(error)
    }
  },

  async getById(categoryId: number): Promise<Category> {
    try {
      const response = await api.get(`/categories/${categoryId}`)
      return parseResponse(categorySchema, response.data)
    } catch (error) {
      throw parseApiError(error)
    }
  },

  async create(data: CategoryCreate): Promise<Category> {
    categoryCreateSchema.parse(data)
    try {
      const response = await api.post('/categories/', data)
      return parseResponse(categorySchema, response.data)
    } catch (error) {
      throw parseApiError(error)
    }
  },

  async remove(categoryId: number): Promise<void> {
    try {
      await api.delete(`/categories/${categoryId}`)
    } catch (error) {
      throw parseApiError(error)
    }
  },
}
