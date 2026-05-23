import { usersApi } from '@/api'
import { useAsync, useMutation } from '@/hooks/use-async'
import type { UserRole, UserUpdate } from '@/schemas'

export function useUsers() {
  return useAsync(() => usersApi.list(), [])
}

export function useUser(userId: number | null) {
  return useAsync(
    () => {
      if (userId == null) return Promise.reject(new Error('Missing user id'))
      return usersApi.getById(userId)
    },
    [userId],
    { enabled: userId != null },
  )
}

export function useUserMutations() {
  const updateMutation = useMutation(
    ({ userId, data }: { userId: number; data: UserUpdate }) =>
      usersApi.update(userId, data),
  )
  const changeRoleMutation = useMutation(
    ({ userId, role }: { userId: number; role: UserRole }) =>
      usersApi.changeRole(userId, role),
  )
  const deleteMutation = useMutation((userId: number) => usersApi.remove(userId))

  return {
    updateUser: updateMutation.mutate,
    changeRole: changeRoleMutation.mutate,
    deleteUser: deleteMutation.mutate,
    isUpdating: updateMutation.isLoading,
    isChangingRole: changeRoleMutation.isLoading,
    isDeleting: deleteMutation.isLoading,
    updateError: updateMutation.error,
    changeRoleError: changeRoleMutation.error,
    deleteError: deleteMutation.error,
  }
}
