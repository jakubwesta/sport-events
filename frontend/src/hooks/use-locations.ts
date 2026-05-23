import { locationsApi } from '@/api'
import { useAsync, useMutation } from '@/hooks/use-async'
import type { LocationCreate } from '@/schemas'

export function useLocations() {
  return useAsync(() => locationsApi.list(), [])
}

export function useLocation(locationId: number | null) {
  return useAsync(
    () => {
      if (locationId == null) return Promise.reject(new Error('Missing location id'))
      return locationsApi.getById(locationId)
    },
    [locationId],
    { enabled: locationId != null },
  )
}

export function useLocationMutations() {
  const createMutation = useMutation((data: LocationCreate) => locationsApi.create(data))
  const deleteMutation = useMutation((locationId: number) => locationsApi.remove(locationId))

  return {
    createLocation: createMutation.mutate,
    deleteLocation: deleteMutation.mutate,
    isCreating: createMutation.isLoading,
    isDeleting: deleteMutation.isLoading,
    createError: createMutation.error,
    deleteError: deleteMutation.error,
  }
}
