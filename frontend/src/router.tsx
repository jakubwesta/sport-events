import { createBrowserRouter } from 'react-router-dom'
import { AuthPageLayout } from '@/components/auth/auth-page-layout'
import { RootLayout } from '@/layouts/root-layout'
import Home from '@/pages/Home'
import {
  CreateEventPage,
  EventDetailsPage,
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
      { path: '/events/new', element: <CreateEventPage /> },
      { path: '/events/:eventId', element: <EventDetailsPage /> },
      { path: '/map', element: <MapPage /> },
      { path: '/results', element: <ResultsPage /> },
      {
        element: <AuthPageLayout />,
        children: [
          { path: '/login', element: <LoginPage /> },
          { path: '/register', element: <RegisterPage /> },
        ],
      },
    ],
  },
])
