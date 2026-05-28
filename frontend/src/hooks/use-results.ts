import { resultsApi } from '@/api/results.api'
import { useAsync, useMutation } from '@/hooks/use-async'
import type { IndividualScoreResultCreate, TeamScoreResultCreate, TimedResultCreate } from '@/schemas'

export function useResultsForEvent(eventId: number | null) {
  return useAsync(
    () => {
      if (eventId == null) return Promise.reject(new Error('Missing event id'))
      return resultsApi.getForEvent(eventId)
    },
    [eventId],
    { enabled: eventId != null },
  )
}

export function useResultMutations() {
  const createIndividualScoreMutation = useMutation(
    (data: IndividualScoreResultCreate) => resultsApi.createIndividualScore(data),
  )
  const createTimedMutation = useMutation(
    (data: TimedResultCreate) => resultsApi.createTimed(data),
  )
  const createTeamScoreMutation = useMutation(
    (data: TeamScoreResultCreate) => resultsApi.createTeamScore(data),
  )
  const deleteMutation = useMutation((resultId: number) => resultsApi.delete(resultId))

  return {
    createIndividualScore: createIndividualScoreMutation.mutate,
    createTimed: createTimedMutation.mutate,
    createTeamScore: createTeamScoreMutation.mutate,
    deleteResult: deleteMutation.mutate,
    isCreating:
      createIndividualScoreMutation.isLoading ||
      createTimedMutation.isLoading ||
      createTeamScoreMutation.isLoading,
    isDeleting: deleteMutation.isLoading,
    createError:
      createIndividualScoreMutation.error ??
      createTimedMutation.error ??
      createTeamScoreMutation.error,
    deleteError: deleteMutation.error,
    resetCreate: () => {
      createIndividualScoreMutation.reset()
      createTimedMutation.reset()
      createTeamScoreMutation.reset()
    },
  }
}
