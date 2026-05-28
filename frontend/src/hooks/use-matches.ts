import { matchesApi } from '@/api/matches.api'
import { useAsync, useMutation } from '@/hooks/use-async'
import type { MatchCreate, MatchUpdateScore } from '@/schemas'

export function useMatchesForEvent(eventId: number | null) {
  return useAsync(
    () => {
      if (eventId == null) return Promise.reject(new Error('Missing event id'))
      return matchesApi.getForEvent(eventId)
    },
    [eventId],
    { enabled: eventId != null },
  )
}

export function useMatchMutations() {
  const createMutation = useMutation((data: MatchCreate) => matchesApi.create(data))
  const updateScoreMutation = useMutation(
    ({ matchId, data }: { matchId: number; data: MatchUpdateScore }) =>
      matchesApi.updateScore(matchId, data),
  )
  const deleteMutation = useMutation((matchId: number) => matchesApi.delete(matchId))

  return {
    createMatch: createMutation.mutate,
    updateScore: updateScoreMutation.mutate,
    deleteMatch: deleteMutation.mutate,
    isCreating: createMutation.isLoading,
    isUpdating: updateScoreMutation.isLoading,
    isDeleting: deleteMutation.isLoading,
    createError: createMutation.error,
    updateError: updateScoreMutation.error,
    deleteError: deleteMutation.error,
    resetCreate: createMutation.reset,
    resetUpdate: updateScoreMutation.reset,
  }
}
