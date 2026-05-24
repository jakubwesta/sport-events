import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { authApi, usersApi } from '@/api'
import { setStoredToken, setUnauthorizedHandler } from '@/lib/api'
import { parseApiError } from '@/lib/api-error'
import type { LoginRequest, RegisterRequest, User } from '@/schemas'

type AuthState = {
  token: string | null
  user: User | null
  isInitialized: boolean
  isInitializing: boolean
  isSubmitting: boolean
  error: string | null
  setUser: (user: User | null) => void
  initialize: () => Promise<void>
  login: (data: LoginRequest) => Promise<void>
  register: (data: RegisterRequest) => Promise<User>
  logout: () => void
  refreshUser: () => Promise<User | null>
  clearError: () => void
}

function toErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && 'detail' in error && typeof error.detail === 'string') {
    return error.detail
  }
  return parseApiError(error).detail || fallback
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => {
      const logout = () => {
        setStoredToken(null)
        set({ token: null, user: null, error: null })
      }

      setUnauthorizedHandler(() => {
        if (get().token) logout()
      })

      return {
        token: null,
        user: null,
        isInitialized: false,
        isInitializing: false,
        isSubmitting: false,
        error: null,

        setUser: (user) => set({ user }),

        clearError: () => set({ error: null }),

        logout,

        initialize: async () => {
          if (get().isInitializing) return

          const { token, user } = get()

          if (token && user) {
            setStoredToken(token)
            if (!get().isInitialized) {
              set({ isInitialized: true })
            }
            return
          }

          if (get().isInitialized && !token) return

          set({ isInitializing: true, error: null })

          try {
            if (token) {
              setStoredToken(token)
              const fetchedUser = await usersApi.getMe()
              set({ user: fetchedUser, isInitialized: true })
            } else {
              set({ isInitialized: true })
            }
          } catch {
            logout()
            set({ isInitialized: true })
          } finally {
            set({ isInitializing: false })
          }
        },

        login: async (data) => {
          set({ isSubmitting: true, error: null })
          try {
            const { access_token } = await authApi.login(data)
            setStoredToken(access_token)
            const fetchedUser = await usersApi.getMe()
            set({
              token: access_token,
              user: fetchedUser,
              isInitialized: true,
            })
          } catch (error) {
            const message = toErrorMessage(error, 'Login failed')
            set({ error: message })
            throw error
          } finally {
            set({ isSubmitting: false })
          }
        },

        register: async (data) => {
          set({ isSubmitting: true, error: null })
          try {
            return await authApi.register(data)
          } catch (error) {
            const message = toErrorMessage(error, 'Registration failed')
            set({ error: message })
            throw error
          } finally {
            set({ isSubmitting: false })
          }
        },

        refreshUser: async () => {
          const { token } = get()
          if (!token) return null

          try {
            const fetchedUser = await usersApi.getMe()
            set({ user: fetchedUser })
            return fetchedUser
          } catch (error) {
            logout()
            throw error
          }
        },
      }
    },
    {
      name: 'auth-store',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
      }),
    },
  ),
)

export const selectIsAuthenticated = (state: AuthState) => Boolean(state.token && state.user)
