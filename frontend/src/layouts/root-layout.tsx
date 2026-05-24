import { Outlet } from 'react-router-dom'

import { AuthInitializer } from '@/components/auth/auth-initializer'
import { Navbar } from '@/components/navbar'

export function RootLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <AuthInitializer />
      <Navbar />
      <Outlet />
    </div>
  )
}
