import { createBrowserRouter } from 'react-router-dom'
import { RootLayout } from '@/layouts/root-layout'
import Home from '@/pages/Home'
import {
  EventsPage,
  LoginPage,
  MapPage,
  RegisterPage,
  ResultsPage,
} from '@/pages/routes-pages'

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/events', element: <EventsPage /> },
      { path: '/map', element: <MapPage /> },
      { path: '/results', element: <ResultsPage /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
    ],
  },
])
