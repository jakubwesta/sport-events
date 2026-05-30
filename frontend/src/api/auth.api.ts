import { api } from '@/lib/api'
import { parseApiError, parseResponse } from '@/lib/api-error'
import {
  googleLoginRequestSchema,
  registerRequestSchema,
  tokenResponseSchema,
  userSchema,
  type LoginRequest,
  type RegisterRequest,
  type TokenResponse,
  type User,
} from '@/schemas'

export const authApi = {
  async register(data: RegisterRequest): Promise<User> {
    registerRequestSchema.parse(data)
    try {
      const response = await api.post('/auth/register', data)
      return parseResponse(userSchema, response.data)
    } catch (error) {
      throw parseApiError(error)
    }
  },

  async login(data: LoginRequest): Promise<TokenResponse> {
    try {
      const body = new URLSearchParams({
        username: data.email,
        password: data.password,
      })
      const response = await api.post('/auth/login', body, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
      return parseResponse(tokenResponseSchema, response.data)
    } catch (error) {
      throw parseApiError(error)
    }
  },

  async loginWithGoogle(idToken: string): Promise<TokenResponse> {
    googleLoginRequestSchema.parse({ id_token: idToken })
    try {
      const response = await api.post('/auth/google', { id_token: idToken })
      return parseResponse(tokenResponseSchema, response.data)
    } catch (error) {
      throw parseApiError(error)
    }
  },
}
