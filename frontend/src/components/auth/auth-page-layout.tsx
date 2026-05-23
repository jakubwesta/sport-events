import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'

import { AuthModeSwitch } from '@/components/auth/auth-mode-switch'

export function AuthPageLayout() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <main className="flex flex-1 flex-col bg-muted">
      <div className="mx-auto w-full max-w-md px-4 pt-10 pb-14 sm:pt-14">
        <AuthModeSwitch />
        <div className="mt-6">
          <Outlet />
        </div>
      </div>
    </main>
  )
}
