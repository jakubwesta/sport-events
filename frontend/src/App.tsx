import { RouterProvider } from 'react-router-dom'
import { ThemeProvider } from '@/utils/theme-provider'
import { router } from '@/router'

export default function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  )
}
