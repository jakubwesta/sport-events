import { useEffect } from 'react'

import { useAuthStore } from '@/stores/auth.store'

export function AuthInitializer() {
  const initialize = useAuthStore((s) => s.initialize)

  useEffect(() => {
    const runInitialize = () => {
      void initialize()
    }

    if (useAuthStore.persist.hasHydrated()) {
      runInitialize()
      return
    }

    return useAuthStore.persist.onFinishHydration(runInitialize)
  }, [initialize])

  return null
}
