import { eventsApi, usersApi } from '@/api'
import { useAsync, useMutation } from '@/hooks/use-async'
import type {
  EventCreate,
  EventFilters,
  EventUpdate,
  ParticipationCreate,
} from '@/schemas'

export function useEvents(filters?: EventFilters) {
  const status = filters?.status
  const categoryId = filters?.category_id

  return useAsync(
    () => eventsApi.list(filters),
    [status, categoryId],
  )
}

export function useEvent(eventId: number | null) {
  return useAsync(
    () => {
      if (eventId == null) return Promise.reject(new Error('Missing event id'))
      return eventsApi.getById(eventId)
    },
    [eventId],
    { enabled: eventId != null },
  )
}

export function useMyEvents() {
  return useAsync(() => usersApi.getMyEvents(), [])
}

export function useEventMutations() {
  const createMutation = useMutation((data: EventCreate) => eventsApi.create(data))
  const updateMutation = useMutation(
    ({ eventId, data }: { eventId: number; data: EventUpdate }) =>
      eventsApi.update(eventId, data),
  )
  const deleteMutation = useMutation((eventId: number) => eventsApi.remove(eventId))
  const participateMutation = useMutation(
    ({ eventId, data }: { eventId: number; data: ParticipationCreate }) =>
      eventsApi.participate(eventId, data),
  )

  return {
    createEvent: createMutation.mutate,
    updateEvent: updateMutation.mutate,
    deleteEvent: deleteMutation.mutate,
    participate: participateMutation.mutate,
    isCreating: createMutation.isLoading,
    isUpdating: updateMutation.isLoading,
    isDeleting: deleteMutation.isLoading,
    isParticipating: participateMutation.isLoading,
    createError: createMutation.error,
    updateError: updateMutation.error,
    deleteError: deleteMutation.error,
    participateError: participateMutation.error,
  }
}

export function useEventParticipations(eventId: number | null) {
  return useAsync(
    () => {
      if (eventId == null) return Promise.reject(new Error('Missing event id'))
      return eventsApi.getParticipations(eventId)
    },
    [eventId],
    { enabled: eventId != null },
  )
}
