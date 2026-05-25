import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AuthPageLayout } from '@/components/auth/auth-page-layout'
import { RootLayout } from '@/layouts/root-layout'
import {
  CreateEventPage,
  EventDetailsPage,
  EventParticipantsPage,
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
      { path: '/', element: <EventsPage /> },
      { path: '/events', element: <Navigate to="/" replace /> },
      { path: '/events/new', element: <CreateEventPage /> },
      { path: '/events/:eventId/participants', element: <EventParticipantsPage /> },
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
