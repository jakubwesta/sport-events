import { Outlet } from 'react-router-dom'

import { Navbar } from '@/components/navbar'

export function RootLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <Outlet />
    </div>
  )
}
