import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AuthPageLayout } from '@/components/auth/auth-page-layout'
import { RootLayout } from '@/layouts/root-layout'
import {
  AdminPage,
  CreateEventPage,
  EventDetailsPage,
  EventParticipantsPage,
  EventsPage,
  LoginPage,
  MapPage,
  MyEventsPage,
  NotFoundPage,
  ProfilePage,
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
      { path: '/my-events', element: <MyEventsPage /> },
      { path: '/profile', element: <ProfilePage /> },
      { path: '/results', element: <ResultsPage /> },
      { path: '/admin', element: <AdminPage /> },
      {
        element: <AuthPageLayout />,
        children: [
          { path: '/login', element: <LoginPage /> },
          { path: '/register', element: <RegisterPage /> },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
