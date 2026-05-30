import type { ReactNode } from 'react'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { RouterProvider } from 'react-router-dom'
import { ThemeProvider } from '@/utils/theme-provider'
import { googleClientId } from '@/lib/env'
import { router } from '@/router'

function AppProviders({ children }: { children: ReactNode }) {
  if (!googleClientId) return children

  return <GoogleOAuthProvider clientId={googleClientId}>{children}</GoogleOAuthProvider>
}

export default function App() {
  return (
    <ThemeProvider>
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>
    </ThemeProvider>
  )
}
