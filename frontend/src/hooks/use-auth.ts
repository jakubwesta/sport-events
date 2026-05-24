import { useEffect, useState } from 'react'

import {
  selectIsAuthenticated,
  useAuthStore,
} from '@/stores/auth.store'
import type { LoginRequest, RegisterRequest } from '@/schemas'

export function useAuth() {
  const [hasHydrated, setHasHydrated] = useState(() => useAuthStore.persist.hasHydrated())

  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)
  const isInitialized = useAuthStore((s) => s.isInitialized)
  const isInitializing = useAuthStore((s) => s.isInitializing)
  const isSubmitting = useAuthStore((s) => s.isSubmitting)
  const error = useAuthStore((s) => s.error)
  const isAuthenticated = useAuthStore(selectIsAuthenticated)
  const initialize = useAuthStore((s) => s.initialize)
  const login = useAuthStore((s) => s.login)
  const register = useAuthStore((s) => s.register)
  const logout = useAuthStore((s) => s.logout)
  const refreshUser = useAuthStore((s) => s.refreshUser)
  const clearError = useAuthStore((s) => s.clearError)

  useEffect(() => {
    const runInitialize = () => {
      setHasHydrated(true)
      void initialize()
    }

    if (useAuthStore.persist.hasHydrated()) {
      runInitialize()
      return
    }

    return useAuthStore.persist.onFinishHydration(runInitialize)
  }, [initialize])

  const isReady = hasHydrated && isInitialized && !isInitializing

  return {
    token,
    user,
    hasHydrated,
    isInitialized,
    isInitializing,
    isSubmitting,
    isReady,
    error,
    isAuthenticated,
    login: (data: LoginRequest) => login(data),
    register: (data: RegisterRequest) => register(data),
    logout,
    refreshUser,
    clearError,
  }
}

export function useIsOrganizer() {
  const user = useAuthStore((s) => s.user)
  return user?.role === 'ORGANIZER' || user?.role === 'ADMIN'
}

export function useRequireAuth() {
  const auth = useAuth()
  return {
    ...auth,
    isReady: auth.isReady,
  }
}
