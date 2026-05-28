import { participationsApi, teamsApi } from '@/api'
import { useAsync, useMutation } from '@/hooks/use-async'
import type { TeamCreate, TeamMemberCreate } from '@/schemas'

export function useTeams() {
  return useAsync(() => teamsApi.list(), [])
}

export function useTeamMembers(teamId: number | null) {
  return useAsync(
    () => {
      if (teamId == null) return Promise.reject(new Error('Missing team id'))
      return teamsApi.getMembers(teamId)
    },
    [teamId],
    { enabled: teamId != null },
  )
}

export function useTeamMutations() {
  const createMutation = useMutation((data: TeamCreate) => teamsApi.create(data))
  const addMemberMutation = useMutation(
    ({ teamId, data }: { teamId: number; data: TeamMemberCreate }) =>
      teamsApi.addMember(teamId, data),
  )
  const removeMemberMutation = useMutation(
    ({ teamId, memberId }: { teamId: number; memberId: number }) =>
      teamsApi.removeMember(teamId, memberId),
  )
  const deleteTeamMutation = useMutation((teamId: number) => teamsApi.deleteTeam(teamId))

  return {
    createTeam: createMutation.mutate,
    addMember: addMemberMutation.mutate,
    removeMember: removeMemberMutation.mutate,
    deleteTeam: deleteTeamMutation.mutate,
    isCreating: createMutation.isLoading,
    isAddingMember: addMemberMutation.isLoading,
    isRemovingMember: removeMemberMutation.isLoading,
    isDeletingTeam: deleteTeamMutation.isLoading,
    createError: createMutation.error,
    addMemberError: addMemberMutation.error,
    removeMemberError: removeMemberMutation.error,
    deleteTeamError: deleteTeamMutation.error,
  }
}

export function useParticipationMutations() {
  const markAsPaidMutation = useMutation((participationId: number) =>
    participationsApi.markAsPaid(participationId),
  )
  const withdrawMutation = useMutation((participationId: number) =>
    participationsApi.withdraw(participationId),
  )

  return {
    markAsPaid: markAsPaidMutation.mutate,
    withdraw: withdrawMutation.mutate,
    isMarkingAsPaid: markAsPaidMutation.isLoading,
    isWithdrawing: withdrawMutation.isLoading,
    markAsPaidError: markAsPaidMutation.error,
    withdrawError: withdrawMutation.error,
  }
}
